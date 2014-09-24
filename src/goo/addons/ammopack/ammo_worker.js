/* global importScripts,Ammo,postMessage,onmessage,performance,self */
/*jshint strict:false */
/*jshint bitwise: false*/

var Module = {
	TOTAL_MEMORY: 256 * 1024 * 1024
};

postMessage = self.webkitPostMessage || self.postMessage;

// performance.now shim
if (typeof performance === 'undefined') {
	performance = {};
}
if (!performance.now) {
	var nowOffset = Date.now();
	if (performance.timing && performance.timing.navigationStart) {
		nowOffset = performance.timing.navigationStart;
	}
	performance.now = function () {
		return Date.now() - nowOffset;
	};
}

var ARRAY_TYPE = typeof(Float32Array) !== 'undefined' ? Float32Array : Array;
var NUM_FLOATS_PER_BODY = 7; // 3 pos, 4 rot
var BUS_RESIZE_STEP = 10;

// from http://bullet.googlecode.com/svn-history/r2171/trunk/src/BulletCollision/CollisionDispatch/btCollisionObject.h
var collisionFlags = {
	STATIC_OBJECT: 1,
	KINEMATIC_OBJECT: 2,
	NO_CONTACT_RESPONSE : 4,
	CUSTOM_MATERIAL_CALLBACK : 8,
	CHARACTER_OBJECT : 16,
	DISABLE_VISUALIZE_OBJECT : 32,
	DISABLE_SPU_COLLISION_PROCESSING : 64
};

var activationStates = {
	ACTIVE_TAG: 1,
	ISLAND_SLEEPING: 2,
	WANTS_DEACTIVATION: 3,
	DISABLE_DEACTIVATION: 4,
	DISABLE_SIMULATION: 5
};

var timeout;
var ammoTransform;
var collisionConfiguration;
var dispatcher;
var overlappingPairCache;
var solver;
var ammoWorld;
var timeStep = 1 / 60;
var maxSubSteps = 3;
var bodies = [];
var bodyConfigs = [];
var idToBodyMap = {};
var ptrToBodyMap = {};
var colliderIdToAmmoShapeMap = {};
var bus = new ARRAY_TYPE(NUM_FLOATS_PER_BODY * BUS_RESIZE_STEP);
var simulationStartTime = 0;
var physicsTime = 0;

// Temp vars
var ammoRayStart;
var ammoRayEnd;
var ammoZeroVector;

var tmpAmmoVec;
function numToTempAmmoVector(x, y, z) {
	if (!tmpAmmoVec) {
		tmpAmmoVec = new Ammo.btVector3();
	}
	tmpAmmoVec.setValue(x, y, z);
	return tmpAmmoVec;
}
function arrayToTempAmmoVector(a) {
	return numToTempAmmoVector(a[0], a[1], a[2]);
}
function arrayToAmmoVector(a) {
	return new Ammo.btVector3(a[0], a[1], a[2]);
}
var tmpAmmoQuat;
function numToTempAmmoQuat(x, y, z, w) {
	if (!tmpAmmoQuat) {
		tmpAmmoQuat = new Ammo.btQuaternion();
	}
	tmpAmmoQuat.setValue(x, y, z, w);
	return tmpAmmoQuat;
}
function arrayToTempAmmoQuat(a) {
	return numToTempAmmoQuat(a[0], a[1], a[2], a[3]);
}

function sendCommand(command) {
	postMessage(command);
}
function fillTerrainHeightBuffer(buffer, heights) {
	var floatByteSize = 4;
	for (var i = 0, il = heights.length; i < il; i ++) {
		Ammo.setValue(buffer + i * floatByteSize, heights[i], 'float');
	}
}

/**
 * Convert a shape config to an instance of Ammo shape.
 * @param  {object} shapeConfig
 * @return {Ammo.btBoxShape|Ammo.btSphereShape}
 */
function getAmmoShape(shapeConfig /*, bodyConfig*/) {
	'use strict';

	var shape;
	switch (shapeConfig.type) {

	case 'box':
		var extents = arrayToTempAmmoVector(shapeConfig.halfExtents);
		shape = new Ammo.btBoxShape(extents);
		break;

	case 'sphere':
		shape = new Ammo.btSphereShape(shapeConfig.radius);
		break;

	case 'cylinder':
		shape = new Ammo.btCylinderShapeZ(arrayToTempAmmoVector(shapeConfig.halfExtents));
		break;

	case 'plane':
		shape = new Ammo.btStaticPlaneShape(arrayToTempAmmoVector(shapeConfig.normal), shapeConfig.planeConstant);
		break;

	case 'terrain':
		var floatByteSize = 4;
		var heightBuffer = Ammo.allocate(floatByteSize * shapeConfig.numWidthPoints * shapeConfig.numLengthPoints, 'float', Ammo.ALLOC_NORMAL);

		fillTerrainHeightBuffer(heightBuffer, shapeConfig.heights);

		var heightDataType = 0;

		shape = new Ammo.btHeightfieldTerrainShape(
			shapeConfig.numWidthPoints,
			shapeConfig.numLengthPoints,
			heightBuffer,
			shapeConfig.heightScale, // 1.0
			shapeConfig.minHeight,
			shapeConfig.maxHeight,
			shapeConfig.upAxis, // 1 == y
			heightDataType,
			shapeConfig.flipQuadEdges // false
		);

		shape.heightBuffer = heightBuffer;

		var sx = shapeConfig.width / (shapeConfig.numWidthPoints - 1);
		var sz = shapeConfig.length / (shapeConfig.numLengthPoints - 1);
		var sy = 1.0;
		var sizeVector = arrayToTempAmmoVector([sx, sy, sz]);
		shape.setLocalScaling(sizeVector);
		break;

	case 'trianglemesh':
		var scale = [1, 1, 1];
		var floatByteSize = 4;
		var use32bitIndices = true;
		var intByteSize = use32bitIndices ? 4 : 2;
		var intType = use32bitIndices ? 'i32' : 'i16';

		var vertices = shapeConfig.vertices; // meshData.dataViews.POSITION;
		var vertexBuffer = Ammo.allocate(floatByteSize * vertices.length, 'float', Ammo.ALLOC_NORMAL);

		for (var i = 0, il = vertices.length; i < il; i ++) {
			Ammo.setValue(vertexBuffer + i * floatByteSize, scale[i % 3] * vertices[i], 'float');
		}

		var indices = shapeConfig.indices; // meshData.indexData.data;
		var indexBuffer = Ammo.allocate(intByteSize * indices.length, intType, Ammo.ALLOC_NORMAL);
		for (var i = 0, il = indices.length; i < il; i++) {
			Ammo.setValue(indexBuffer + i * intByteSize, indices[i], intType);
		}

		var iMesh = new Ammo.btIndexedMesh();
		iMesh.set_m_numTriangles(shapeConfig.indexCount/*meshData.indexCount / 3*/);
		iMesh.set_m_triangleIndexBase(indexBuffer);
		iMesh.set_m_triangleIndexStride(intByteSize * 3);

		iMesh.set_m_numVertices(shapeConfig.vertexCount/*meshData.vertexCount*/);
		iMesh.set_m_vertexBase(vertexBuffer);
		iMesh.set_m_vertexStride(floatByteSize * 3);

		var triangleIndexVertexArray = new Ammo.btTriangleIndexVertexArray();
		triangleIndexVertexArray.addIndexedMesh(iMesh, 2); // indexedMesh, indexType = PHY_INTEGER = 2 seems optional

		// bvh = Bounding Volume Hierarchy
		shape = new Ammo.btBvhTriangleMeshShape(triangleIndexVertexArray, true, true); // btStridingMeshInterface, useQuantizedAabbCompression, buildBvh

		break;

	default:
		throw new Error('Shape type not recognized: ' + shapeConfig.type);
	}

	colliderIdToAmmoShapeMap[shapeConfig.id] = shape;

	return shape;
}

function bodyIsKinematic(body) {
	return body.getCollisionFlags() & collisionFlags.KINEMATIC_OBJECT;
}

function reportCollisions() {
	var dp = ammoWorld.getDispatcher();
	var num = dp.getNumManifolds();

	var pairIds = [];
	for (var i = 0; i < num; i++) {
		var manifold = dp.getManifoldByIndexInternal(i);

		var num_contacts = manifold.getNumContacts();
		if (num_contacts === 0) {
			continue;
		}

		var bodyA = ptrToBodyMap[manifold.getBody0()];
		var bodyB = ptrToBodyMap[manifold.getBody1()];

		if (bodyA && bodyB) {
			var idxA = bodies.indexOf(bodyA);
			var idxB = bodies.indexOf(bodyB);
			if (idxA !== -1 && idxB !== -1) {
				pairIds.push(bodyConfigs[idxA].id, bodyConfigs[idxB].id);
			}
		}

		/*
		// Optional:
		for (var j = 0; j < num_contacts; j++ ) {
			var pt = manifold.getContactPoint( j );
			var normalOnB = pt.get_m_normalWorldOnB();
			break;
		}
		*/
	}
	sendCommand({
		command: 'collision',
		pairIds: pairIds
	});
}

function updateCharacter(body, bodyConfig, currentTransform/*, dt*/) {

	// Check if on ground
	var position = currentTransform.getOrigin();

	ammoRayStart.setValue(position.x(), position.y(), position.z());
	ammoRayEnd.setValue(position.x() + bodyConfig.characterRay[0], position.y() + bodyConfig.characterRay[1], position.z() + bodyConfig.characterRay[2]);

	var rayCallback = new Ammo.ClosestRayResultCallback(ammoRayStart, ammoRayEnd);
	ammoWorld.rayTest(ammoRayStart, ammoRayEnd, rayCallback);
	bodyConfig.characterOnGround = false;
	if (rayCallback.hasHit()) {
		var collisionObjPtr = rayCallback.get_m_collisionObject();
		var collisionObj = Ammo.wrapPointer(collisionObjPtr, Ammo.btCollisionObject); // Needed?
		var hitBody = Ammo.btRigidBody.prototype.upcast(collisionObj);
		bodyConfig.characterOnGround = !!hitBody;
	}
	Ammo.destroy(rayCallback);
	if (bodyConfig.characterOnGround) {
		if (bodyConfig.characterVelocity) {
			var v = body.getLinearVelocity();
			body.activate();
			body.setLinearVelocity(numToTempAmmoVector(
				bodyConfig.characterVelocity[0],
				bodyConfig.characterVelocity[1] + v.y(),
				bodyConfig.characterVelocity[2]
			));
		}

		if (bodyConfig.characterAngularVelocity) {
			//var v = body.getAngularVelocity();
			body.activate();
			body.setAngularVelocity(arrayToTempAmmoVector(bodyConfig.characterAngularVelocity));
		}
	}
}

function updateKinematic(body, bodyConfig, currentTransform, dt) {
	var v = bodyConfig.linearVelocity;
	if (!v) {
		return;
	}
	var position = currentTransform.getOrigin();
	currentTransform.getOrigin().setValue(position.x() + v[0] * dt, position.y() + v[1] * dt, position.z() + v[2] * dt);
	// TODO: Integrate the quaternion, like this:
	/*
	var w = new Quaternion();
	w.set(angularVelo.x, angularVelo.y, angularVelo.z, 0);
	w.mult(quat, wq); // Quaternion multiplication
	quat.x += 0.5 * dt * wq.x;
	quat.y += 0.5 * dt * wq.y;
	quat.z += 0.5 * dt * wq.z;
	quat.w += 0.5 * dt * wq.w;
	quat.normalize();
	*/
	currentTransform.setRotation(numToTempAmmoQuat(0, 0, 0, 1));
	body.getMotionState().setWorldTransform(currentTransform);
	//Ammo.destroy(v);
	/*
	this._displacement.copy(this._linearVelocity).scale(timeStep);
	this.entity.translate(this._displacement);

	this._displacement.copy(this._angularVelocity).scale(timeStep);
	this.entity.rotate(this._displacement.x, this._displacement.y, this._displacement.z);

	if (body.getMotionState()) {
		var pos = this.entity.getPosition();
		var rot = this.entity.getRotation();

		ammoTransform.getOrigin().setValue(pos.x(), pos.y(), pos.z());
		//ammoQuat.setValue(rot.x, rot.y, rot.z, rot.w);
		//ammoTransform.setRotation(ammoQuat);
		body.getMotionState().setWorldTransform(ammoTransform);
	}
	*/
}

function step(dt, subSteps, fixedTimeStep) {
	dt = dt || 1 / 60;
	subSteps = typeof(subSteps) === 'number' ? subSteps : maxSubSteps;

	// Move character bodies
	for (var i = 0; i < bodies.length; i++) {
		var body = bodies[i];
		var bodyConfig = bodyConfigs[i];
		if (bodyConfig.enableCharacterControl) {
			body.getMotionState().getWorldTransform(ammoTransform);
			updateCharacter(body, bodyConfig, ammoTransform, timeStep);
		}
	}

	ammoWorld.stepSimulation(dt, subSteps, fixedTimeStep);//timeStep, 0, timeStep);

	// Move kinematic bodies
	for (var i = 0; i < bodies.length; i++) {
		var body = bodies[i];
		var bodyConfig = bodyConfigs[i];

		body.getMotionState().getWorldTransform(ammoTransform);

		if (body.getCollisionFlags() & collisionFlags.KINEMATIC_OBJECT) {
			updateKinematic(body, bodyConfig, ammoTransform, dt);
		}
	}

	reportCollisions();
}

function manualSubStepsStep(dt, numSubSteps, fixedTimeStep) {
	var subSteps = 0;
	var now = performance.now() / 1000;
	var wallClockTime = now - simulationStartTime;
	while (physicsTime < wallClockTime) {
		step(fixedTimeStep, 0, fixedTimeStep);
		physicsTime += timeStep;
		subSteps++;
		if (subSteps >= numSubSteps) {
			break;
		}
	}
}

function checkResizeBus() {
	if (bodies.length * NUM_FLOATS_PER_BODY > bus.length) {
		bus = new ARRAY_TYPE((bodies.length + BUS_RESIZE_STEP) * NUM_FLOATS_PER_BODY);
	}
}

function sendTransforms() {

	if (!bus || !bus.length) {
		return;
	}

	checkResizeBus();

	// Pack body data into bus
	for (var i = 0; i < bodies.length; i++) {
		var body = bodies[i];
		//var bodyConfig = bodyConfigs[i];

		body.getMotionState().getWorldTransform(ammoTransform);

		var p = NUM_FLOATS_PER_BODY * i;

		var origin = ammoTransform.getOrigin();
		bus[p + 0] = origin.x();
		bus[p + 1] = origin.y();
		bus[p + 2] = origin.z();

		var ammoQuat = ammoTransform.getRotation();
		bus[p + 3] = ammoQuat.x();
		bus[p + 4] = ammoQuat.y();
		bus[p + 5] = ammoQuat.z();
		bus[p + 6] = ammoQuat.w();
	}

	postMessage(bus, [bus.buffer]);
}


function getBodyById(id) {
	return idToBodyMap[id];
}

function VehicleHelper(chassis, wheelRadius, suspensionLength) {
	this.chassis = chassis;
	this.wheelRadius = wheelRadius;
	this.suspension = suspensionLength;
	this.debugTires = [];

	chassis.setActivationState(activationStates.DISABLE_DEACTIVATION); // never deactivate the vehicle
	this.tuning = new Ammo.btVehicleTuning();
	var vehicleRaycaster = new Ammo.btDefaultVehicleRaycaster(ammoWorld);
	this.vehicle = new Ammo.btRaycastVehicle(this.tuning, chassis, vehicleRaycaster);
	ammoWorld.addVehicle(this.vehicle);
	this.vehicle.setCoordinateSystem(0, 1, 2); // choose coordinate system
	this.wheelDir = new Ammo.btVector3(0, -1, 0);
	this.wheelAxle = new Ammo.btVector3(-1, 0, 0);

	//chassis.ammoComponent.body.setAngularFactor(new Ammo.btVector3(0,1,0)); restrict angular movement
}
VehicleHelper.prototype.resetAtPos = function (x, y, z) {
	var b = this.chassis.ammoComponent.body;
	var t = b.getCenterOfMassTransform();
	t.setIdentity();
	t.setOrigin(numToTempAmmoVector(x, y, z));
	b.setCenterOfMassTransform(t);
	b.setAngularVelocity(numToTempAmmoVector(0, 0, 0));
	b.setLinearVelocity(numToTempAmmoVector(0, 0, 0));
};
VehicleHelper.prototype.setSteeringValue = function (steering) {
	for (var i = 0; i < this.vehicle.getNumWheels(); i++) {
		if (this.vehicle.getWheelInfo(i).get_m_bIsFrontWheel()) {
			this.vehicle.setSteeringValue(steering, i);
		}
	}
};
VehicleHelper.prototype.applyEngineForce = function (force, front) {
	for (var i = 0; i < this.vehicle.getNumWheels(); i++) {
		if (front === undefined || this.vehicle.getWheelInfo(i).get_m_bIsFrontWheel() === front) {
			this.vehicle.applyEngineForce(force, i);
		}
	}
};
VehicleHelper.prototype.setBrake = function (force) {
	for (var i = 0; i < this.vehicle.getNumWheels(); i++) {
		this.vehicle.setBrake(force, i);
	}
};
VehicleHelper.prototype.setWheelAxle = function (x, y, z) {
	this.wheelAxle.setValue(x, y, z);
};
VehicleHelper.prototype.addFrontWheel = function (pos) {
	this.addWheel(pos[0], pos[1], pos[2], true);
};
VehicleHelper.prototype.addRearWheel = function (pos) {
	this.addWheel(pos[0], pos[1], pos[2], false);
};
VehicleHelper.prototype.addWheel = function (x, y, z, isFrontWheel) {
	var wheel = this.vehicle.addWheel(numToTempAmmoVector(x, y, z), this.wheelDir, this.wheelAxle, this.suspension, this.wheelRadius, this.tuning, isFrontWheel);
	wheel.set_m_suspensionStiffness(20);
	wheel.set_m_wheelsDampingRelaxation(2.3);
	wheel.set_m_wheelsDampingCompression(4.4);
	wheel.set_m_frictionSlip(1000);
	wheel.set_m_rollInfluence(0.01); // this value controls how easily a vehicle can tipp over. Lower values tipp less :)
};
VehicleHelper.prototype.addWheel2 = function (config) {
	var wheel = this.vehicle.addWheel(
		arrayToAmmoVector(config.position),
		arrayToAmmoVector(config.direction),
		arrayToAmmoVector(config.axle),
		config.suspensionLength,
		config.radius,
		this.tuning,
		config.isFrontWheel
	);
	for (var key in config) {
		if (key.match(/^m_/)) {
			wheel['set_' + key](config[key]);
		}
	}
};

function createVehicle(chassis, config) {
	var vehicleHelper = new VehicleHelper(chassis, 0.5, 0.3, true);

	for (var i = 0; i < config.wheels.length; i++) {
		vehicleHelper.addWheel2(config.wheels[i]);
	}

	return vehicleHelper;
}

var commandHandlers = {
	init: function (params) {
		importScripts(params.ammoUrl);

		// Temp vars
		ammoRayStart = new Ammo.btVector3();
		ammoRayEnd = new Ammo.btVector3();
		ammoZeroVector = new Ammo.btVector3();

		bodies.length = 0;
		collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
		overlappingPairCache = new Ammo.btDbvtBroadphase();
		solver = new Ammo.btSequentialImpulseConstraintSolver();
		ammoWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
		ammoTransform = new Ammo.btTransform();
	},

	destroy: function (/*params*/) {
		bodies.length = bodyConfigs.length = 0;
		idToBodyMap = {};
		ptrToBodyMap = {};
		if (timeout) {
			clearTimeout(timeout);
		}
	},

	setGravity: function (params) {
		ammoWorld.setGravity(arrayToTempAmmoVector(params.gravity));
	},

	setTimeStep: function (params) {
		timeStep = params.timeStep;
		maxSubSteps = params.maxSubSteps;
	},

	addBody: function (bodyConfig) {
		var shape, shapeConfig;

		if (bodyConfig.shapes.length === 1 && !bodyConfig.shapes[0].localPosition) {
			// One collider primitive, no local transform.
			shapeConfig = bodyConfig.shapes[0];
			shape = getAmmoShape(shapeConfig, bodyConfig);
		} else {
			// More than one collider primitive or collider with offset
			shape = new Ammo.btCompoundShape();
			var localTrans = ammoTransform;
			for (var j = 0; j < bodyConfig.shapes.length; j++) {
				shapeConfig = bodyConfig.shapes[j];
				var childAmmoShape = getAmmoShape(shapeConfig, bodyConfig);
				var pos = shapeConfig.localPosition;
				var quat = shapeConfig.localRotation;
				localTrans.setIdentity();
				localTrans.setOrigin(arrayToTempAmmoVector(pos));
				localTrans.setRotation(arrayToTempAmmoQuat(quat));
				shape.addChildShape(localTrans, childAmmoShape);
			}
		}

		if (!shape) {
			return;
		}

		// Get body transform
		ammoTransform.setIdentity();
		ammoTransform.setOrigin(arrayToTempAmmoVector(bodyConfig.position));
		ammoTransform.setRotation(arrayToTempAmmoQuat(bodyConfig.rotation));

		if (bodyConfig.type === 4) {
			bodyConfig.mass = 0;
		}

		var motionState = new Ammo.btDefaultMotionState(ammoTransform);
		var localInertia = numToTempAmmoVector(0, 0, 0); // new Ammo.btVector3(0, 0, 0);

		if (bodyConfig.mass !== 0) {
			shape.calculateLocalInertia(bodyConfig.mass, localInertia);
		}

		var info = new Ammo.btRigidBodyConstructionInfo(bodyConfig.mass, motionState, shape, localInertia);
		if (typeof(bodyConfig.friction) === 'number') {
			info.set_m_friction(bodyConfig.friction);
		}
		if (typeof(bodyConfig.restitution) === 'number') {
			info.set_m_restitution(bodyConfig.restitution);
		}
		var body = new Ammo.btRigidBody(info);
		Ammo.destroy(info);

		if (bodyConfig.type === 4) {
			body.setCollisionFlags(body.getCollisionFlags() | collisionFlags.KINEMATIC_OBJECT);
			body.setActivationState(activationStates.DISABLE_DEACTIVATION);
		}

		if (bodyConfig.collisionFlags) {
			body.setCollisionFlags(bodyConfig.collisionFlags);
		}
		if (bodyConfig.activationState) {
			body.setActivationState(bodyConfig.activationState);
		}

		ammoWorld.addRigidBody(body);

		bodies.push(body);
		bodyConfigs.push(bodyConfig);
		idToBodyMap[bodyConfig.id] = body;
		ptrToBodyMap[body.a || body.ptr] = body;
	},

	removeBody: function (params, body, bodyConfig) {
		var idx = bodies.indexOf(body);
		bodyConfigs.splice(idx, 1);
		bodies.splice(idx, 1);
		delete idToBodyMap[params.id];
		delete ptrToBodyMap[params.id];
		for (var i = 0; i < bodyConfig.shapes.length; i++) {
			var shapeId = bodyConfig.shapes[i].id;
			var ammoShape = colliderIdToAmmoShapeMap[shapeId];
			Ammo.destroy(ammoShape);
			delete colliderIdToAmmoShapeMap[bodyConfig.shapes[i].id];
		}
		ammoWorld.removeRigidBody(body);
		Ammo.destroy(body);
	},

	activateBody: function (params, body) {
		body.activate();
	},

	setBodyActivationState: function (params, body) {
		body.setActivationState(params.activationState);
	},

	setBodyCollisionFlags: function (params, body) {
		body.setCollisionFlags(params.collisionFlags);
	},

	setSleepingThresholds: function (params, body) {
		body.setSleepingThresholds(params.linear, params.angular);
	},

	run: function (/*params*/) {
		var last = performance.now() / 1000;
		simulationStartTime = last;
		physicsTime = 0;

		function mainLoop() {
			var now = performance.now() / 1000;
			var dt = now - last;
			last = now;
			//manualSubStepsStep(dt, maxSubSteps, timeStep);
			step(dt, maxSubSteps, timeStep);
			sendTransforms();
			timeout = setTimeout(mainLoop, timeStep * 1000);
		}
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(mainLoop, timeStep * 1000);
	},

	pause: function (/*params*/) {
		if (timeout) {
			clearTimeout(timeout);
		}
	},

	step: function (/*params*/) {
		// Manual step
		step(timeStep);
	},

	setCenterOfMassTransform: function (params, body) {
		var transform = new Ammo.btTransform();
		transform.setIdentity();
		transform.setOrigin(arrayToTempAmmoVector(params.position));
		transform.setRotation(arrayToTempAmmoQuat(params.quaternion));
		body.setCenterOfMassTransform(transform);
		Ammo.destroy(transform);
	},

	setLinearVelocity: function (params, body) {
		body.setLinearVelocity(arrayToTempAmmoVector(params.velocity));
		if (bodyIsKinematic(body)) {
			var bodyConfig = bodyConfigs[bodies.indexOf(body)];
			bodyConfig.linearVelocity = params.velocity;
		}
	},

	setAngularVelocity: function (params, body) {
		body.setAngularVelocity(arrayToTempAmmoVector(params.velocity));
	},

	rayCast: function (params) {
		ammoRayStart.setValue(params.start[0], params.start[1], params.start[2]);
		ammoRayEnd.setValue(params.end[0], params.end[1], params.end[2]);
		var rayCallback = new Ammo.ClosestRayResultCallback(ammoRayStart, ammoRayEnd);
		ammoWorld.rayTest(ammoRayStart, ammoRayEnd, rayCallback);
		var message = {
			command: 'rayCastResult',
			messageId: params.messageId
		};
		if (rayCallback.hasHit()) {
			var collisionObjPtr = rayCallback.get_m_collisionObject();

			var collisionObj = Ammo.wrapPointer(collisionObjPtr, Ammo.btCollisionObject);
			var body = Ammo.btRigidBody.prototype.upcast(collisionObj);
			if (body) {
				var normal = rayCallback.get_m_hitNormalWorld();
				var point = rayCallback.get_m_hitPointWorld();
				var foundBody;
				for (var i = 0; i < bodies.length; i++) {
					if (bodies[i].a === collisionObjPtr.a) {
						foundBody = bodies[i];
						break;
					}
				}
				if (foundBody) {
					message.normal = [normal.x(), normal.y(), normal.z()];
					message.point = [point.x(), point.y(), point.z()];
					message.bodyId = bodyConfigs[bodies.indexOf(foundBody)].id;
				}
			}
		}
		sendCommand(message);
		Ammo.destroy(rayCallback);
	},

	enableCharacterControl: function (params, body, config) {
		body.setAngularFactor(0);
		config.enableCharacterControl = true;
		config.characterRay = params.ray;
		config.characterOnGround = false;
		config.characterVelocity = [0, 0, 0];
		config.characterAngularVelocity = [0, 0, 0];
	},

	disableCharacterControl: function (params, body, config) {
		body.setAngularFactor(numToTempAmmoVector(1, 1, 1));
		config.enableCharacterControl = false;
		delete config.characterVelocity;
		delete config.characterAngularVelocity;
		body.setLinearVelocity(numToTempAmmoVector(0, 0, 0));
		body.setAngularVelocity(numToTempAmmoVector(0, 0, 0));
	},

	characterJump: function (params, body, config) {
		if (config.characterOnGround) {
			body.applyImpulse(arrayToTempAmmoVector(params.jumpImpulse), ammoZeroVector);
		}
	},

	setCharacterVelocity: function (params, body, config) {
		config.characterVelocity = params.velocity;
		config.characterAngularVelocity = params.angularVelocity;
	},

	enableVehicle: function (params, body) {
		if (!params.vehicleConfig) {
			return;
		}
		var config = bodyConfigs[bodies.indexOf(body)];
		config.enableVehicle = true;
		var vehicleHelper = createVehicle(body, params.vehicleConfig);
		body.vehicleHelper = vehicleHelper;
	},

	setVehicleSteeringValue: function (params) {
		var body = getBodyById(params.id);
		if (!body) {
			return;
		}
		var vehicleHelper = body.vehicleHelper;
		vehicleHelper.setSteeringValue(params.value);
	},

	setVehicleEngineForce: function (params) {
		var body = getBodyById(params.id);
		if (!body) {
			return;
		}
		var vehicleHelper = body.vehicleHelper;
		vehicleHelper.applyEngineForce(params.force, true);
	},

	updateCollider: function (params) {

		// Find the btShape
		var shape = colliderIdToAmmoShapeMap[params.colliderId];

		// Update it
		switch (params.data.type) {
		case 'terrain':
			var heights = params.data.heights;
			//console.log(heights);
			var heightBuffer = shape.heightBuffer;
			// For some reason this does not change anything!
			fillTerrainHeightBuffer(heightBuffer, heights);
		}
	}
};

onmessage = function (event) {
	var data = event.data;

	if (data.length) {
		bus = data;
		return;
	}

	if (data.command) {
		if (commandHandlers[data.command]) {
			//console.log('command: ' + JSON.stringify(data));
			var body, bodyConfig;
			if (data.id) {
				body = getBodyById(data.id);
				bodyConfig = bodyConfigs[bodies.indexOf(body)];
			}
			commandHandlers[data.command](data, body, bodyConfig);
		} else {
			console.warn('No handler for command "' + data.command + '"');
		}
	}
};

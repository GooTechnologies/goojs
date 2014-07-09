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

var interval;
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
var bus = new ARRAY_TYPE(NUM_FLOATS_PER_BODY * BUS_RESIZE_STEP);
var simulationStartTime = 0;
var physicsTime = 0;

// Temp vars
var ammoRayStart;
var ammoRayEnd;
var ammoZeroVector;

/**
 * Convert a shape config to an instance of Ammo shape.
 * @param  {object} shapeConfig
 * @return {Ammo.btBoxShape|Ammo.btSphereShape}
 */
function getAmmoShape(shapeConfig) {
	'use strict';

	var shape;
	switch (shapeConfig.type) {

	case 'box':
		var extents = new Ammo.btVector3(shapeConfig.halfExtents[0], shapeConfig.halfExtents[1], shapeConfig.halfExtents[2]);

		shape = new Ammo.btBoxShape(extents);
		Ammo.destroy(extents);
		break;

	case 'sphere':
		shape = new Ammo.btSphereShape(shapeConfig.radius);
		break;

	case 'plane':
		var n = shapeConfig.normal;
		shape = new Ammo.btStaticPlaneShape(new Ammo.btVector3(n[0], n[1], n[2]), shapeConfig.planeConstant);
		break;

	case 'terrain':
		var floatByteSize = 4;
		var heightBuffer = Ammo.allocate(floatByteSize * shapeConfig.numWidthPoints * shapeConfig.numLengthPoints, "float", Ammo.ALLOC_NORMAL);

		for (var i = 0, il = shapeConfig.heights.length; i < il; i ++) {
			Ammo.setValue(heightBuffer + i * floatByteSize, shapeConfig.heights[i], 'float');
		}

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

		var sx = shapeConfig.width / (shapeConfig.numWidthPoints - 1);
		var sz = shapeConfig.length / (shapeConfig.numLengthPoints - 1);
		var sy = 1.0;
		var sizeVector = new Ammo.btVector3(sx, sy, sz);
		shape.setLocalScaling(sizeVector);
		break;

	default:
		throw new Error('Shape type not recognized: ' + shapeConfig.type);
	}
	return shape;
}

function bodyIsKinematic(body) {
	return body.getCollisionFlags() & collisionFlags.KINEMATIC_OBJECT;
}

function step(dt, subSteps) {
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

	ammoWorld.stepSimulation(timeStep, 0, timeStep);

	// Move kinematic bodies
	for (var i = 0; i < bodies.length; i++) {
		var body = bodies[i];
		var bodyConfig = bodyConfigs[i];

		body.getMotionState().getWorldTransform(ammoTransform);

		if (body.getCollisionFlags() & collisionFlags.KINEMATIC_OBJECT) {
			updateKinematic(body, bodyConfig, ammoTransform, timeStep);
		}
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
		var bodyConfig = bodyConfigs[i];

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

function checkResizeBus() {
	if (bodies.length * NUM_FLOATS_PER_BODY > bus.length) {
		bus = new ARRAY_TYPE((bodies.length + BUS_RESIZE_STEP) * NUM_FLOATS_PER_BODY);
	}
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
	if (bodyConfig.characterVelocity && bodyConfig.characterOnGround) {
		var v = body.getLinearVelocity();
		body.activate();
		body.setLinearVelocity(new Ammo.btVector3(
			bodyConfig.characterVelocity[0],
			bodyConfig.characterVelocity[1] + v.y(),
			bodyConfig.characterVelocity[2]
		));
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
	currentTransform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
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

var tmpAmmoVec;
function arrayToTempAmmoVector(a) {
	if (!tmpAmmoVec) {
		tmpAmmoVec = new Ammo.btVector3();
	}
	tmpAmmoVec.setValue(a[0], a[1], a[2]);
	return tmpAmmoVec;
}
function arrayToAmmoVector(a, target) {
	target.setValue(a[0], a[1], a[2]);
	return target;
}

function sendCommand(command) {
	postMessage(command);
}

function getBodyById(id) {
	return idToBodyMap[id];
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
		if (interval) {
			clearInterval(interval);
		}
	},
	setGravity: function (params) {
		var gravity = new Ammo.btVector3(params.gravity[0], params.gravity[1], params.gravity[2]);
		ammoWorld.setGravity(gravity);
		Ammo.destroy(gravity);
	},
	setTimeStep: function (params) {
		timeStep = params.timeStep;
		maxSubSteps = params.maxSubSteps;
	},
	addBody: function (bodyConfig) {
		var shape, shapeConfig;

		if (bodyConfig.shapes.length === 1 && !bodyConfig.shapes[0].localPosition) {
			// One collider primitive
			shapeConfig = bodyConfig.shapes[0];
			shape = getAmmoShape(shapeConfig);
		} else {
			// More than one collider primitive or collider with offset
			shape = new Ammo.btCompoundShape();
			for (var j = 0; j < bodyConfig.shapes.length; j++) {
				shapeConfig = bodyConfig.shapes[j];
				var childAmmoShape = getAmmoShape(shapeConfig);
				var localTrans = new Ammo.btTransform();
				var pos = shapeConfig.localPosition;
				var quat = shapeConfig.localRotation;
				localTrans.setIdentity();
				localTrans.setOrigin(new Ammo.btVector3(pos[0], pos[1], pos[2]));
				localTrans.setRotation(new Ammo.btQuaternion(quat[0], quat[1], quat[2], quat[3]));
				shape.addChildShape(localTrans, childAmmoShape);
			}
		}

		if (!shape) {
			return;
		}

		// Get body transform
		ammoTransform.setIdentity();
		ammoTransform.setOrigin(arrayToTempAmmoVector(bodyConfig.position));
		var q = bodyConfig.rotation;
		var ammoQuat = new Ammo.btQuaternion(q[0], q[1], q[2], q[3]);
		ammoTransform.setRotation(ammoQuat);
		Ammo.destroy(ammoQuat);

		if (bodyConfig.type === 4) {
			bodyConfig.mass = 0;
		}

		var motionState = new Ammo.btDefaultMotionState(ammoTransform);
		var localInertia = new Ammo.btVector3(0, 0, 0);

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

		if (bodyConfig.type === 4) {
			body.setCollisionFlags(body.getCollisionFlags() | collisionFlags.KINEMATIC_OBJECT);
			body.setActivationState(activationStates.DISABLE_DEACTIVATION);
		}

		ammoWorld.addRigidBody(body);

		bodies.push(body);
		bodyConfigs.push(bodyConfig);
		idToBodyMap[bodyConfig.id] = body;
	},

	removeBody: function (params) {
		var body = getBodyById(params.id);
		if (!body) {
			return;
		}
		bodies.splice(bodies.indexOf(body), 1);
		delete idToBodyMap[params.id];
		ammoWorld.removeRigidBody(body);
		Ammo.destroy(body);
	},

	run: function (/*params*/) {
		var last = performance.now() / 1000;
		simulationStartTime = last;
		physicsTime = 0;

		function mainLoop() {
			var now = performance.now() / 1000;
			var wallClockTime = now - simulationStartTime;
			var dt = now - last;
			last = now;
			var subSteps = 0;
			while (physicsTime < wallClockTime) {
				step(dt);
				physicsTime += timeStep;
				subSteps++;
				if (subSteps >= maxSubSteps) {
					break;
				}
			}
			sendTransforms();
		}
		if (interval) {
			clearInterval(interval);
		}
		interval = setInterval(mainLoop, timeStep * 1000);
	},

	pause: function (/*params*/) {
		if (interval) {
			clearInterval(interval);
		}
	},

	step: function (/*params*/) {
		// Manual step
		step(timeStep);
	},

	setCenterOfMassTransform: function (params) {
		var body = getBodyById(params.id);
		if (!body) {
			return;
		}
		var transform = new Ammo.btTransform();
		transform.setIdentity();
		transform.setOrigin(new Ammo.btVector3(params.position[0], params.position[1], params.position[2]));
		transform.setRotation(new Ammo.btQuaternion(params.quaternion[0], params.quaternion[1], params.quaternion[2], params.quaternion[3]));
		body.setCenterOfMassTransform(transform);
	},

	setLinearVelocity: function (params) {
		var body = getBodyById(params.id);
		if (!body) {
			return;
		}
		body.setLinearVelocity(arrayToTempAmmoVector(params.velocity));
		if (bodyIsKinematic(body)) {
			var bodyConfig = bodyConfigs[bodies.indexOf(body)];
			bodyConfig.linearVelocity = params.velocity;
		}
	},

	setAngularVelocity: function (params) {
		var body = getBodyById(params.id);
		if (!body) {
			return;
		}
		body.setAngularVelocity(new Ammo.btVector3(params.velocity[0], params.velocity[1], params.velocity[2]));
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

	enableCharacterControl: function (params) {
		var body = getBodyById(params.id);
		if (!body) {
			return;
		}
		var config = bodyConfigs[bodies.indexOf(body)];
		body.setAngularFactor(0);
		config.enableCharacterControl = true;
		config.characterRay = params.ray;
		config.characterVelocity = [0, 0, 0];
		config.characterOnGround = false;
	},

	characterJump: function (params) {
		var body = getBodyById(params.id);
		if (!body) {
			return;
		}
		var config = bodyConfigs[bodies.indexOf(body)];
		if (config.characterOnGround) {
			body.applyImpulse(arrayToTempAmmoVector(params.jumpImpulse), ammoZeroVector);
		}
	},

	setCharacterVelocity: function (params) {
		var body = getBodyById(params.id);
		if (!body) {
			return;
		}
		var config = bodyConfigs[bodies.indexOf(body)];
		config.characterVelocity = params.velocity;
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
			commandHandlers[data.command](data);
		} else {
			console.warn('No handler for command "' + data.command + '"');
		}
	}
};

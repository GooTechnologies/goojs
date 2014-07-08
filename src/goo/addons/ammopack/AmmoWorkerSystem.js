define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/util/rsvp'
],
/** @lends */
function (
	System,
	SystemBus,
	Quaternion,
	Vector3,
	RSVP
) {
	'use strict';

	/**
	 * @class Handles integration with Ammo.js, using a worker thread.
	 * See also {@link AmmoWorkerComponent}
	 * @extends System
	 * @param [Object] settings. The settings object can contain the following properties:
	 * @param {Vector3} [settings.gravity] (defaults to [0, -10, 0])
	 * @param {number} [settings.maxSubSteps=3]
	 * @param {number} [settings.timeStep=1/60]
	 * @example
	 *     var ammoWorkerSystem = new AmmoWorkerSystem({
	 *         gravity: new Vector3(0, -10, 0),
	 *         timeStep: 1 / 60
	 *     });
	 *     goo.world.setSystem(ammoWorkerSystem);
	 */
	function AmmoWorkerSystem(settings) {
		System.call(this, 'AmmoWorkerSystem', ['AmmoWorkerRigidbodyComponent', 'TransformComponent']);
		settings = settings || {};

		/** @private
		 */
		this._worker = null;

		/**
		 * Map between messageId's and Promises. Should be resolved when a message gets back from worker.
		 * @private
		 * @type {Object}
		 */
		this._pendingRayCasts = {};

		this._initWorker();
		this.setTimeStep(settings.timeStep || 1 / 60, typeof(settings.maxSubSteps) === 'number' ? settings.maxSubSteps : 3);
		this.setGravity(settings.gravity || new Vector3(0, -10, 0));
		this.run();
	}
	AmmoWorkerSystem.prototype = Object.create(System.prototype);

	var tmpQuat = new Quaternion();
	var messageId = 0;

	var commandHandlers = {
		rayCastResult: function (data) {
			var pending = this._pendingRayCasts;
			var result = {};
			if (data.bodyId) {
				for (var i = 0; i < this._activeEntities.length; i++) {
					var entity = this._activeEntities[i];
					if (entity.id === data.bodyId) {
						result.entity = entity;
						result.point = new Vector3(data.point);
						result.normal = new Vector3(data.normal);
					}
				}
			}
			pending[data.messageId].resolve(result);
			delete pending[data.messageId];
		}
	};

	/**
	 * Initialize the worker thread.
	 * @private
	 */
	AmmoWorkerSystem.prototype._initWorker = function () {
	    // Create worker
	    var code = workerCode.toString().replace(/^function workerCode\(\)\s\{/, '').replace(/\}$/, '');
	    var blob = new Blob([code], { type: 'text/javascript' });
		var worker = new Worker(window.URL.createObjectURL(blob));

		this._worker = worker;
		var that = this;

		worker.onmessage = function (event) {
			var data = event.data;

			if (data.command) {
				commandHandlers[data.command].call(that, data);
			}

			if (data.length) {

				// Unpack data
				for (var i = 0; i < that._activeEntities.length; i++) {
					var entity = that._activeEntities[i];
					tmpQuat.setd(data[7 * i + 3], data[7 * i + 4], data[7 * i + 5], data[7 * i + 6]);
					entity.transformComponent.transform.rotation.copyQuaternion(tmpQuat);
					entity.transformComponent.setTranslation(data[7 * i + 0], data[7 * i + 1], data[7 * i + 2]);
				}

				worker.postMessage(data, [data.buffer]);
			}
		};

		// Send starting message
		this._postMessage({
			command: 'init'
		});
	};

	/**
	 * @private
	 * @param {object} message
	 */
	AmmoWorkerSystem.prototype._postMessage = function (message) {
		this._worker.postMessage(message);
	};

	/**
	 * Starts the physics simulation.
	 */
	AmmoWorkerSystem.prototype.run = function () {
		this._postMessage({
			command: 'run'
		});
	};

	/**
	 * Stops the physics simulation.
	 */
	AmmoWorkerSystem.prototype.pause = function () {
		this._postMessage({
			command: 'pause'
		});
	};

	/**
	 * @param {Vector3} gravity
	 */
	AmmoWorkerSystem.prototype.setGravity = function (gravity) {
		this._postMessage({
			command: 'setGravity',
			gravity: v2a(gravity)
		});
	};

	/**
	 * @param {Vector3} start
	 * @param {Vector3} end
	 * @return {RSVP.Promise} Promise that resolves with the raycast results.
	 */
	AmmoWorkerSystem.prototype.rayCast = function (start, end) {
		var message = {
			command: 'rayCast',
			start: v2a(start),
			end: v2a(end),
			messageId: messageId++
		};
		this._postMessage(message);
		var p = new RSVP.Promise();
		this._pendingRayCasts[message.messageId] = p;
		return p;
	};

	/**
	 * Set the time step for physics simulation, along with the maximum number of substeps.
	 * @param {number} timeStep
	 * @param {number} maxSubSteps
	 */
	AmmoWorkerSystem.prototype.setTimeStep = function (timeStep, maxSubSteps) {
		this._postMessage({
			command: 'setTimeStep',
			timeStep: timeStep,
			maxSubSteps: maxSubSteps
		});
	};

	AmmoWorkerSystem.prototype.inserted = function (entity) {
		entity.ammoWorkerRigidbodyComponent._system = this;
		entity.ammoWorkerRigidbodyComponent._add();
	};

	AmmoWorkerSystem.prototype.deleted = function (entity) {
		this._postMessage({
			command: 'removeBody',
			id: entity.id
		});
		delete entity.ammoWorkerRigidbodyComponent._system;
	};

	AmmoWorkerSystem.prototype.process = function (/*entities, tpf*/) {

	};

	function v2a(v) {
		return Array.prototype.slice.call(v.data, 0);
	}

	function workerCode() {
		/* global importScripts,Ammo,postMessage,onmessage */
		/*jshint bitwise: false*/
		var Module = {
			TOTAL_MEMORY: 256 * 1024 * 1024
		};
		importScripts('http://code.gooengine.com/0.10.6/lib/ammo.small.js');

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
		var timeStep;
		var maxSubSteps = 3;
		var bodies = [];
		var bodyConfigs = [];
		var idToBodyMap = {};
		var bus = new ARRAY_TYPE(NUM_FLOATS_PER_BODY * BUS_RESIZE_STEP);

		// Temp vars
        var ammoRayStart = new Ammo.btVector3();
        var ammoRayEnd = new Ammo.btVector3();

		/**
		 * Convert a shape config to an instance of Ammo shape.
		 * @param  {object} shapeConfig
		 * @return {Ammo.btBoxShape|Ammo.btSphereShape}
		 */
		function getAmmoShape(shapeConfig) {
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

			// TODO: handle substepping manually. This is needed for kinematic objects to work properly.
			ammoWorld.stepSimulation(timeStep, 0, timeStep);

			if (!bus || !bus.length) {
				return;
			}

			checkResizeBus();

			// Pack body data into bus
			for (var i = 0; i < bodies.length; i++) {
				var body = bodies[i];
				var bodyConfig = bodyConfigs[i];

				body.getMotionState().getWorldTransform(ammoTransform);

				// Move kinematic bodies
				if (body.getCollisionFlags() & collisionFlags.KINEMATIC_OBJECT) {
					updateKinematic(body, bodyConfig, ammoTransform, dt);
				}

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

		function updateKinematic(body, bodyConfig, currentTransform, dt) {
			var v = bodyConfig.linearVelocity;
			if (!v) {
				return;
			}
			var position = currentTransform.getOrigin();
			var transform = new Ammo.btTransform();
			transform.setIdentity();
			transform.getOrigin().setValue(position.x() + v[0] * dt, position.y() + v[1] * dt, position.z() + v[2] * dt);

			// TODO: Integrate the quaternion, like this:
			/*
			w.set(angularVelo.x, angularVelo.y, angularVelo.z, 0);
			w.mult(quat,wq);
			quat.x += half_dt * wq.x;
			quat.y += half_dt * wq.y;
			quat.z += half_dt * wq.z;
			quat.w += half_dt * wq.w;
			quat.normalize();
            */
			// transform.setRotation(new Ammo.btQuaternion(params.quaternion[0], params.quaternion[1], params.quaternion[2], params.quaternion[3]));
			body.getMotionState().setWorldTransform(transform);

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

		var commandHandlers = {
			init: function (/*params*/) {
				bodies.length = 0;
				collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
				dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
				overlappingPairCache = new Ammo.btDbvtBroadphase();
				solver = new Ammo.btSequentialImpulseConstraintSolver();
				ammoWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
				ammoTransform = new Ammo.btTransform();
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
				var ammoPos = new Ammo.btVector3(bodyConfig.position[0], bodyConfig.position[1], bodyConfig.position[2]);
				ammoTransform.setOrigin(ammoPos);
				Ammo.destroy(ammoPos);
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
				info.set_m_friction(bodyConfig.friction);
				info.set_m_restitution(bodyConfig.restitution);
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
				var last = Date.now();
				function mainLoop() {
					var now = Date.now();
					step((now - last) / 1000);
					last = now;
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
				step(timeStep, 0);
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
				//body.setWorldTransform(transform);
			},

			setLinearVelocity: function (params) {
				var body = getBodyById(params.id);
				if (!body) {
					return;
				}
				body.setLinearVelocity(new Ammo.btVector3(params.velocity[0], params.velocity[1], params.velocity[2]));
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
	        }
		};

		function sendCommand(command) {
			postMessage(command);
		}

		onmessage = function (event) {
			var data = event.data;

			if (data.length) {
				bus = data;
				return;
			}

			if (data.command) {
				if (commandHandlers[data.command]) {
					//console.log('command: ' + data.command);
					commandHandlers[data.command](data);
				} else {
					console.warn('No handler for command "' + data.command + '"');
				}
			}
		};

		function getBodyById(id) {
			return idToBodyMap[id];
		}
	}

	return AmmoWorkerSystem;
});

define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/addons/ammopack/AmmoBoxColliderComponent',
	'goo/addons/ammopack/AmmoSphereColliderComponent',
	'goo/addons/ammopack/AmmoPlaneColliderComponent'
],
/** @lends */
function (
	System,
	SystemBus,
	Quaternion,
	Vector3,
	AmmoBoxColliderComponent,
	AmmoSphereColliderComponent,
	AmmoPlaneColliderComponent
) {
	'use strict';

	// from http://bullet.googlecode.com/svn-history/r2171/trunk/src/BulletCollision/CollisionDispatch/btCollisionObject.h
	/*
	var btCollisionFlags = {
		CF_STATIC_OBJECT: 1,
		CF_KINEMATIC_OBJECT: 2,
		CF_NO_CONTACT_RESPONSE : 4,
		CF_CUSTOM_MATERIAL_CALLBACK : 8,
		CF_CHARACTER_OBJECT : 16,
		CF_DISABLE_VISUALIZE_OBJECT : 32,
		CF_DISABLE_SPU_COLLISION_PROCESSING : 64
	};
	*/

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

		this._initWorker();
		this.setTimeStep(settings.timeStep || 1 / 60, typeof(settings.numSubSteps) === 'number' ? settings.numSubSteps : 3);
		this.setGravity(settings.gravity || new Vector3(0, -10, 0));
		this._postMessage({
			command: 'run'
		});
	}
	AmmoWorkerSystem.prototype = Object.create(System.prototype);

	var tmpQuat = new Quaternion();

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

			/*
			if (data.command) {
				// TODO: Handle commands from worker...
			}
			*/

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
		//console.log(JSON.stringify(message,2,2));
		this._worker.postMessage(message);
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
		entity.ammoWorkerRigidbodyComponent._entity = entity;


		// Check if there are colliders on the second level
		var colliders = [];
		entity.traverse(function (child, level) {
			if (level === 1 && child.ammoColliderComponent) {
				colliders.push(child);
			}
		});

		// Check if the root entity has a collider
		if (entity.ammoColliderComponent) {
			colliders.push(entity);
		}

		if (!colliders.length) {
			return;
		}

		var shapeConfigs = [];

		// Update transforms
		entity.transformComponent.updateTransform();
		entity.transformComponent.updateWorldTransform();
		for (var j = 0; j < colliders.length; j++) {
			var colliderEntity = colliders[j];
			colliderEntity.transformComponent.updateTransform();
			colliderEntity.transformComponent.updateWorldTransform();
		}

		for (var j = 0; j < colliders.length; j++) {
			var colliderEntity = colliders[j];

			var colliderComponent = colliderEntity.ammoColliderComponent;
			var shapeConfig;

			if (colliderComponent instanceof AmmoBoxColliderComponent) {
				shapeConfig = {
					type: 'box',
					halfExtents: v2a(colliderComponent.halfExtents)
				};
			} else if (colliderComponent instanceof AmmoSphereColliderComponent) {
				shapeConfig = {
					type: 'sphere',
					radius: colliderComponent.radius,
				};
			} else if (colliderComponent instanceof AmmoPlaneColliderComponent) {
				shapeConfig = {
					type: 'plane',
					normal: v2a(colliderComponent.normal),
					planeConstant: colliderComponent.planeConstant,
				};
			}
			if (shapeConfig) {
				if (colliderEntity !== entity) {

					// Add local transform
					var pos = colliderEntity.transformComponent.transform.translation;
					shapeConfig.localPosition = v2a(pos);

					var rot = colliderEntity.transformComponent.transform.rotation;
					tmpQuat.fromRotationMatrix(rot);

					shapeConfig.localRotation = v2a(tmpQuat);
				}
				shapeConfigs.push(shapeConfig);
			}
		}

		// Allow no shapes?
		if (!shapeConfigs.length) {
			return;
		}

		var gooPos = entity.transformComponent.worldTransform.translation;
		var gooRot = entity.transformComponent.worldTransform.rotation;

		tmpQuat.fromRotationMatrix(gooRot);

		this._postMessage({
			command: 'addBody',
			id: entity.id,
			mass: entity.ammoWorkerRigidbodyComponent._mass,
			position: v2a(gooPos),
			rotation: v2a(tmpQuat),
			shapes: shapeConfigs,
		});
	};

	AmmoWorkerSystem.prototype.deleted = function (entity) {
		this._postMessage({
			type: 'removeBody',
			id: entity.id
		});
		delete entity.ammoWorkerRigidbodyComponent._entity;
		delete entity.ammoWorkerRigidbodyComponent._system;
	};

	AmmoWorkerSystem.prototype.process = function (/*entities, tpf*/) {

	};

	function v2a(v) {
		return Array.prototype.slice.call(v.data, 0);
	}

	/*
	function hasZeroRigidTransform(transform) {
		if (transform.translation.length() !== 0) {
			return false;
		}

		var m = transform.rotation.data;
		var elements = [1, 2, 3, 5, 6, 7];
		for (var i = 0; i < elements.length; i++) {
			if (m[i]) {
				return false;
			}
		}

		return true;
	}
	*/

	function workerCode() {
		/* global importScripts,Ammo,postMessage,onmessage */
		var Module = {
			TOTAL_MEMORY: 256 * 1024 * 1024
		};
		importScripts('http://code.gooengine.com/0.10.6/lib/ammo.small.js');

		var ARRAY_TYPE = typeof(Float32Array) !== 'undefined' ? Float32Array : Array;
		var NUM_FLOATS_PER_BODY = 7; // 3 pos, 4 rot
		var BUS_RESIZE_STEP = 10;

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
		var bus = new ARRAY_TYPE(NUM_FLOATS_PER_BODY * BUS_RESIZE_STEP);

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
				console.log('plane ' + shapeConfig.normal + ' ' + shapeConfig.planeConstant);
				var n = shapeConfig.normal;
				shape = new Ammo.btStaticPlaneShape(new Ammo.btVector3(n[0], n[1], n[2]), shapeConfig.planeConstant);
				break;
			default:
				throw new Error('Shape type not recognized: ' + shapeConfig.type);
			}
			return shape;
		}

		function step(dt, subSteps) {
			dt = dt || 1 / 60;
			subSteps = typeof(subSteps) === 'number' ? subSteps : maxSubSteps;

			ammoWorld.stepSimulation(dt, maxSubSteps, timeStep);

			if (!bus || !bus.length) {
				return;
			}

			checkResizeBus();

			// Pack body data into bus
			for (var i = 0; i < bodies.length; i++) {
				var body = bodies[i];
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

				var motionState = new Ammo.btDefaultMotionState(ammoTransform);
				var localInertia = new Ammo.btVector3(0, 0, 0);

				if (bodyConfig.mass !== 0) {
					shape.calculateLocalInertia(bodyConfig.mass, localInertia);
				}

				var info = new Ammo.btRigidBodyConstructionInfo(bodyConfig.mass, motionState, shape, localInertia);
				info.set_m_friction(bodyConfig.friction);
				info.set_m_restitution(bodyConfig.restitution);
				var body = new Ammo.btRigidBody(info);

				/*
				body.setLinearVelocity(new Ammo.btVector3(bodyConfig.velocity[0],bodyConfig.velocity[1],bodyConfig.velocity[2]));
				body.setAngularVelocity(new Ammo.btVector3(bodyConfig.angularVelocity[0],bodyConfig.angularVelocity[1],bodyConfig.angularVelocity[2]));
				*/

				ammoWorld.addRigidBody(body);

				bodies.push(body);
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
			step: function (/*params*/) {
				// Manual step
				step(timeStep, 0);
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
					console.log('command: ' + data.command);
					commandHandlers[data.command](data);
				} else {
					console.warn('No handler for command "' + data.command + '"');
				}
			}
		};
	}

	return AmmoWorkerSystem;
});

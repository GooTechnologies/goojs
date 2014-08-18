/* global Ammo */
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

	var ammoTransform;

	/**
	 * @class Handles integration with Ammo.js, using a worker thread.
	 * See also {@link AmmoWorkerComponent}
	 * @extends System
	 * @param [Object] settings. The settings object can contain the following properties:
	 * @param {Vector3} [settings.gravity] (defaults to [0, -10, 0])
	 * @param {number} [settings.maxSubSteps=3]
	 * @param {number} [settings.timeStep=1/60]
	 * @param {number} [settings.run=true]
	 * @example
	 *     var ammoWorkerSystem = new AmmoWorkerSystem({
	 *         gravity: new Vector3(0, -10, 0),
	 *         timeStep: 1 / 60,
	 *         workerUrl: 'ammo_worker.js',
	 *         ammoUrl: 'ammo.js'
	 *     });
	 *     goo.world.setSystem(ammoWorkerSystem);
	 */
	function AmmoWorkerSystem(settings) {
		System.call(this, 'AmmoWorkerSystem', ['AmmoWorkerRigidbodyComponent', 'TransformComponent']);
		settings = settings || {};

		// Temp vars
		ammoRayStart = new Ammo.btVector3();
		ammoRayEnd = new Ammo.btVector3();
		ammoZeroVector = new Ammo.btVector3();

		ammoTransform = new Ammo.btTransform();

		this.ptrToEntityMap = {};
		this._eventListeners = {
			collision: []
		};

		this.fixedTime = typeof(settings.timeStep) === 'number' ? settings.timeStep : 1 / 60;
		this.maxSubSteps = settings.maxSubSteps || 5;
		var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
		var overlappingPairCache = new Ammo.btDbvtBroadphase();
		var solver = new Ammo.btSequentialImpulseConstraintSolver();
		this.ammoWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
		var gravity = settings.gravity;
		if (typeof(gravity) !== 'number') {
			gravity = -9.81
		};
		this.setGravity(new Vector3(0, gravity, 0));
	}
	AmmoWorkerSystem.prototype = Object.create(System.prototype);

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
	function fillTerrainHeightBuffer(buffer, heights) {
		var floatByteSize = 4;
		for (var i = 0, il = heights.length; i < il; i ++) {
			Ammo.setValue(buffer + i * floatByteSize, heights[i], 'float');
		}
	}

	//! schteppe: Attach on System?
	AmmoWorkerSystem.prototype.getEntityById = function (id) {
		if (!id) {
			return;
		}
		for (var i = 0; i < this._activeEntities.length; i++) {
			var entity = this._activeEntities[i];
			if (entity.id === id) {
				return entity;
			}
		}
	};

	/**
	 * Add an event listener. Available events: 'collision'
	 * @param {string}   type
	 * @param {function} callback
	 */
	AmmoWorkerSystem.prototype.addEventListener = function (type, callback) {
		if (!this._eventListeners[type] || this._eventListeners[type].indexOf(callback) > -1) {
			return;
		}
		if (typeof callback === 'function') {
			this._eventListeners[type].push(callback);
		}
	};

	var tmpQuat = new Quaternion();

	/**
	 * Initialize the worker thread.
	 * @private
	 */
	/*
	AmmoWorkerSystem.prototype._initWorker = function () {
		// Create worker
		var worker = new Worker(this.workerUrl);

		this._worker = worker;
		var that = this;

		worker.onmessage = function (event) {
			var data = event.data;

			if (data.command) {
				commandHandlers[data.command].call(that, data);
				return;
			}

			if (data.length) {
				if (!that.passive) {
					// Unpack data
					for (var i = 0; i < that._activeEntities.length; i++) {
						var entity = that._activeEntities[i];
						tmpQuat.setd(data[7 * i + 3], data[7 * i + 4], data[7 * i + 5], data[7 * i + 6]);
						entity.transformComponent.transform.rotation.copyQuaternion(tmpQuat);
						entity.transformComponent.transform.translation.setd(data[7 * i + 0], data[7 * i + 1], data[7 * i + 2]);
						entity.transformComponent.setUpdated();
					}
				}

				// Send back the buffer
				worker.postMessage(data, [data.buffer]);
			}
		};

		// Send starting message
		this._postMessage({
			command: 'init',
			ammoUrl: this.ammoUrl
		});
	};
	*/

	AmmoWorkerSystem.prototype.reset = function () {
		var entities = this._activeEntities;
		/*
		this.clear();
		for (var i = 0, len = entities.length; i < len; i++) {
			this.added(entities[i]);
		}
		*/
		for (var i = 0, len = entities.length; i < len; i++) {
			var entity = entities[i];
			this.deleted(entity);
			this.inserted(entity);
		}
	};

	/**
	 * Delete the worker and create a new one.
	 */
	AmmoWorkerSystem.prototype.clear = function () {
		System.prototype.clear.apply(this);
		// this._postMessage({ command: 'destroy' });
	};

	/**
	 * @param {Vector3} gravity
	 */
	AmmoWorkerSystem.prototype.setGravity = function (gravity) {
		console.log(gravity.x, gravity.y, gravity.z);
		this.ammoWorld.setGravity(new Ammo.btVector3(gravity.x, gravity.y, gravity.z));
	};

	var ammoRayStart;
	var ammoRayEnd;
	var ammoZeroVector;

	/**
	 * @param {Vector3} start
	 * @param {Vector3} end
	 * @return {object|false}
	 */
	AmmoWorkerSystem.prototype.rayCast = function (start, end) {
		if(!ammoRayStart) ammoRayStart = new Ammo.btVector3();
		if(!ammoRayEnd) ammoRayEnd = new Ammo.btVector3();
		if(!ammoZeroVector) ammoZeroVector = new Ammo.btVector3();

		var ammoWorld = this.ammoWorld;

		ammoRayStart.setValue(start.x, start.y, start.z);
		ammoRayEnd.setValue(end.x, end.y, end.z);
		var rayCallback = new Ammo.ClosestRayResultCallback(ammoRayStart, ammoRayEnd);
		ammoWorld.rayTest(ammoRayStart, ammoRayEnd, rayCallback);
		if (rayCallback.hasHit()) {
			var collisionObjPtr = rayCallback.get_m_collisionObject();

			var collisionObj = Ammo.wrapPointer(collisionObjPtr, Ammo.btCollisionObject);
			var body = Ammo.btRigidBody.prototype.upcast(collisionObj);
			if (body) {
				var normal = rayCallback.get_m_hitNormalWorld();
				var point = rayCallback.get_m_hitPointWorld();
				var foundEntity;
				for (var i = 0; i < this._activeEntities.length; i++) {

					if (this._activeEntities[i].ammoWorkerRigidbodyComponent.body.a === collisionObjPtr.a) {
						foundEntity = this._activeEntities[i].ammoWorkerRigidbodyComponent.body[i];
						break;
					}
				}
				if (foundEntity) {
					return {
						normal : new Vector3(normal.x(), normal.y(), normal.z()),
						point : new Vector3(point.x(), point.y(), point.z()),
						entity: foundEntity
					};
				}
			}
		}
		Ammo.destroy(rayCallback);
	};

	AmmoWorkerSystem.prototype.inserted = function (entity) {
		entity.ammoWorkerRigidbodyComponent._system = this;
		entity.ammoWorkerRigidbodyComponent._add();
		var body = entity.ammoWorkerRigidbodyComponent.body;
		if(body)
		this.ptrToEntityMap[body.a || body.ptr] = body;
	};

	AmmoWorkerSystem.prototype.deleted = function (entity) {
		var body = entity.ammoWorkerRigidbodyComponent.body;
		/*
		delete idToBodyMap[entity.id];
		delete ptrToBodyMap[entity.id];
		for (var i = 0; i < bodyConfig.shapes.length; i++) {
			var shapeId = bodyConfig.shapes[i].id;
			var ammoShape = colliderIdToAmmoShapeMap[shapeId];
			Ammo.destroy(ammoShape);
			delete colliderIdToAmmoShapeMap[bodyConfig.shapes[i].id];
		}
		*/
		this.ammoWorld.removeRigidBody(body);
		Ammo.destroy(body);
	};

	AmmoWorkerSystem.prototype.process = function (entities, tpf) {
		/*
		// Move character bodies
		for (var i = 0; i < entities.length; i++) {
			var body = entities[i].ammoWorkerRigidbodyComponent.body;
			var bodyConfig = bodyConfigs[i];
			if (bodyConfig.enableCharacterControl) {
				body.getMotionState().getWorldTransform(ammoTransform);
				updateCharacter(body, bodyConfig, ammoTransform, timeStep);
			}
		}
		*/

		this.ammoWorld.stepSimulation(tpf, this.maxSubSteps, this.fixedTime);

		// Move kinematic bodies
		/*for (var i = 0; i < entities.length; i++) {
			var body = entities[i].ammoWorkerRigidbodyComponent.body;
			var bodyConfig = bodyConfigs[i];

			body.getMotionState().getWorldTransform(ammoTransform);

			if (body.getCollisionFlags() & collisionFlags.KINEMATIC_OBJECT) {
				updateKinematic(body, bodyConfig, ammoTransform, tpf);
			}
		}*/

		this.updateVisuals(entities);
		// this.reportCollisions();
	};

	AmmoWorkerSystem.prototype.updateVisuals = function(entities) {
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			if(entity.ammoWorkerRigidbodyComponent._mass > 0)
				entity.ammoWorkerRigidbodyComponent.copyPhysicalTransformToVisual(entity);
		}
	};

	AmmoWorkerSystem.prototype.reportCollisions = function() {
		var dp = this.ammoWorld.getDispatcher();
		var num = dp.getNumManifolds();

		var pairIds = [];
		for (var i = 0; i < num; i++) {
			var manifold = dp.getManifoldByIndexInternal(i);

			var num_contacts = manifold.getNumContacts();
			if (num_contacts === 0) {
				continue;
			}

			var entityA = this.ptrToEntityMap[manifold.getBody0()];
			var entityB = this.ptrToEntityMap[manifold.getBody1()];

			if (entityA && entityB) {
				for (var j = 0; j < this._eventListeners.collision.length; j++) {
					this._eventListeners.collision[j]({
						entityA: entityA,
						entityB: entityB
					});
				}
			}
		}
	}

	function v2a(v) {
		return Array.prototype.slice.call(v.data, 0);
	}

	return AmmoWorkerSystem;
});

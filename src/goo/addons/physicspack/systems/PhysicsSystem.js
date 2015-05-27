define([
	'goo/addons/physicspack/systems/AbstractPhysicsSystem',
	'goo/addons/physicspack/RaycastResult',
	'goo/addons/physicspack/components/RigidBodyComponent',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/entities/EntityUtils',
	'goo/math/Transform'
],
function (
	AbstractPhysicsSystem,
	RaycastResult,
	RigidBodyComponent,
	Vector3,
	Quaternion,
	EntityUtils,
	Transform
) {
	'use strict';

	/* global CANNON */

	var tmpVec1;
	var tmpVec2;
	var tmpQuat = new Quaternion();
	var tmpVec = new Vector3();
	var tmpCannonResult;
	var tmpTransform = new Transform();

	/**
	 * A physics system using [Cannon.js]{@link http://github.com/schteppe/cannon.js}.
	 * @extends AbstractPhysicsSystem
	 * @param {Object} [settings]
	 * @param {Vector3} [settings.gravity]
	 * @param {number} [settings.stepFrequency=60]
	 * @param {number} [settings.maxSubSteps=10]
	 */
	function PhysicsSystem(settings) {
		settings = settings || {};

		/**
		 * @type {CANNON.World}
		 */
		this.cannonWorld = new CANNON.World({
			broadphase: new CANNON.SAPBroadphase()
		});

		var that = this;
		this.cannonWorld.addEventListener('postStep', function () {
			that._emitContactEvents();
			that._emitSubStepEvent();
		});

		this._entities = {};
		this._shapeIdToColliderEntityMap = new Map();

		if (!tmpVec1) {
			tmpVec1 = new CANNON.Vec3();
			tmpVec2 = new CANNON.Vec3();
			tmpCannonResult = new CANNON.RaycastResult();
		}

		this.setGravity(settings.gravity || new Vector3(0, -10, 0));

		/**
		 * @type {number}
		 * @default 60
		 */
		this.stepFrequency = settings.stepFrequency !== undefined ? settings.stepFrequency : 60;

		/**
		 * The maximum number of timesteps to use for making the physics clock catch up with the wall clock. If set to zero, a variable timestep is used (not recommended).
		 * @type {number}
		 * @default 10
		 */
		this.maxSubSteps = settings.maxSubSteps !== undefined ? settings.maxSubSteps : 10;

		/**
		 * The current shape pair hashes.
		 * @private
		 * @type {Set}
		 */
		this._currentContacts = new Set();

		/**
		 * Shape pair hashes from last step.
		 * @private
		 * @type {Set}
		 */
		this._lastContacts = new Set();

		// Function to be used with Array.prototype.sort(), will sort the contacts by hash.
		this._sortContacts = function (contactA, contactB) {
			return PhysicsSystem._getShapePairHash(contactA.si, contactA.sj) - PhysicsSystem._getShapePairHash(contactB.si, contactB.sj);
		}.bind(this);

		// Set iterator callback for lastContacts: emits endContact events
		this._emitEndContactEvents = function (hash) {
			var idA = PhysicsSystem._getShapeIdA(hash);
			var idB = PhysicsSystem._getShapeIdB(hash);

			var entityA = this._shapeIdToColliderEntityMap.get(idA);
			var entityB = this._shapeIdToColliderEntityMap.get(idB);

			var found = this._currentContacts.has(hash);
			if (!found) {
				if (entityA.colliderComponent.isTrigger || entityB.colliderComponent.isTrigger) {
					this._emitTriggerExit(entityA, entityB);
				} else {
					this._emitEndContact(entityA, entityB);
				}
			}
		}.bind(this);

		// Set iterator callback for currentContacts: Moves all hashes from currentContacts to lastContacts
		this._moveHashes = function (hash) {
			this._lastContacts.add(hash);
			this._currentContacts.delete(hash);
		}.bind(this);

		// Set iterator callback for lastContacts: just empties the Set
		this._emptyLastContacts = function (hash) {
			this._lastContacts.delete(hash);
		}.bind(this);

		this.initialized = false;

		AbstractPhysicsSystem.call(this, 'PhysicsSystem', ['RigidBodyComponent']);
	}
	PhysicsSystem.prototype = Object.create(AbstractPhysicsSystem.prototype);
	PhysicsSystem.prototype.constructor = PhysicsSystem;

	/**
	 * @private
	 */
	PhysicsSystem.prototype._swapContactLists = function () {
		this._lastContacts.forEach(this._emptyLastContacts);
		this._currentContacts.forEach(this._moveHashes);
	};

	/**
	 * @param {Vector3} gravityVector
	 */
	PhysicsSystem.prototype.setGravity = function (gravityVector) {
		this.cannonWorld.gravity.copy(gravityVector);
	};

	/**
	 * @param {Vector3} store
	 */
	PhysicsSystem.prototype.getGravity = function (store) {
		var gravity = this.cannonWorld.gravity;
		store.x = gravity.x;
		store.y = gravity.y;
		store.z = gravity.z;
	};

	/**
	 * @private
	 * @param {number} deltaTime
	 */
	PhysicsSystem.prototype.step = function (deltaTime) {
		var world = this.cannonWorld;

		// Step the world forward in time
		var fixedTimeStep = 1 / this.stepFrequency;
		var maxSubSteps = this.maxSubSteps;
		if (maxSubSteps) {
			// Fixed time step
			world.step(fixedTimeStep, deltaTime, maxSubSteps);
		} else {
			// Variable time step
			world.step(deltaTime);
		}
	};

	/**
	 * Returns an integer hash given two shapes.
	 * @private
	 * @param  {CANNON.Shape} shapeA
	 * @param  {CANNON.Shape} shapeB
	 * @return {number}
	 */
	PhysicsSystem._getShapePairHash = function (shapeA, shapeB) {
		var idA = shapeA.id;
		var idB = shapeB.id;

		if (idA > idB) {
			var tmp = idA;
			idA = idB;
			idB = tmp;
		}

		var hash = (idA << 16) | idB;

		return hash;
	};

	/**
	 * Returns the first of the shape id's given a hash.
	 * @private
	 * @param  {number} hash
	 * @return {number}
	 */
	PhysicsSystem._getShapeIdA = function (hash) {
		return (hash & 0xFFFF0000) >> 16;
	};

	/**
	 * Returns the second shape id given a hash.
	 * @private
	 * @param  {number} hash
	 * @return {number}
	 */
	PhysicsSystem._getShapeIdB = function (hash) {
		return hash & 0x0000FFFF;
	};

	/**
	 * Fill a Map with contacts.
	 * @private
	 * @param  {Array} contacts
	 * @param  {Map} targetMap
	 */
	PhysicsSystem.prototype._fillContactsMap = function (contacts, targetMap) {
		for (var i = 0; i !== contacts.length; i++) {
			var contact = contacts[i];
			var hash = PhysicsSystem._getShapePairHash(contact.si, contact.sj);
			targetMap.add(hash);
		}
	};

	/**
	 * @private
	 */
	PhysicsSystem.prototype._emitContactEvents = function () {

		// TODO: Move this logic to CANNON.js intead?

		// Get overlapping entities
		var contacts = this.cannonWorld.contacts.sort(this._sortContacts), // TODO: How to sort without creating a new array?
			currentContacts = this._currentContacts,
			lastContacts = this._lastContacts;

		// Make the shape pairs unique
		this._fillContactsMap(contacts, currentContacts);

		// loop over the non-unique, but sorted array.
		var lastHash;
		for (var i = 0; i < contacts.length; i++) {
			var contact = contacts[i];
			var shapeA = contact.si;
			var shapeB = contact.sj;
			var entityA = this._shapeIdToColliderEntityMap.get(shapeA.id);
			var entityB = this._shapeIdToColliderEntityMap.get(shapeB.id);

			var hash = PhysicsSystem._getShapePairHash(contact.si, contact.sj);
			if (hash !== lastHash) {
				var wasInContact = this._lastContacts.has(hash);

				if (entityA.colliderComponent.isTrigger || entityB.colliderComponent.isTrigger) {
					if (wasInContact) {
						this._emitTriggerStay(entityA, entityB);
					} else {
						this._emitTriggerEnter(entityA, entityB);
					}
				} else {
					if (wasInContact) {
						this._emitDuringContact(entityA, entityB);
					} else {
						this._emitBeginContact(entityA, entityB);
					}
				}
			}

			lastHash = hash;
		}

		// Emit end contact events
		lastContacts.forEach(this._emitEndContactEvents);

		// Swap the lists, drop references to the current Cannon.js contacts
		this._swapContactLists();
	};

	var tmpOptions = {};
	PhysicsSystem.prototype._getCannonRaycastOptions = function (options) {
		tmpOptions.collisionFilterMask = options.collisionMask !== undefined ? options.collisionMask : -1;
		tmpOptions.collisionFilterGroup = options.collisionGroup !== undefined ? options.collisionGroup : -1;
		tmpOptions.skipBackfaces = options.skipBackfaces !== undefined ? options.skipBackfaces : true;
		return tmpOptions;
	};

	PhysicsSystem.prototype._copyCannonRaycastResultToGoo = function (cannonResult, gooResult, rayStart) {
		if (cannonResult.hasHit) {
			gooResult.entity = this._entities[cannonResult.body.id] || this._shapeIdToColliderEntityMap.get(cannonResult.shape.id);
			var point = cannonResult.hitPointWorld;
			var normal = cannonResult.hitNormalWorld;
			gooResult.point.setDirect(point.x, point.y, point.z);
			gooResult.normal.setDirect(normal.x, normal.y, normal.z);
			gooResult.distance = rayStart.distance(gooResult.point);
		}
		return cannonResult.hasHit;
	};

	// Get the start & end of the ray, store in cannon vectors
	PhysicsSystem.prototype._getCannonStartEnd = function (start, direction, distance, cannonStart, cannonEnd) {
		cannonStart.copy(start);
		cannonEnd.copy(direction);
		cannonEnd.scale(distance, cannonEnd);
		cannonEnd.vadd(start, cannonEnd);
	};

	/**
	 * Make a ray cast into the world of colliders, stopping at the first hit that the ray intersects. Note that there's no given order in the traversal, and there's no control over what will be returned.
	 * @param  {Vector3} start
	 * @param  {Vector3} direction
	 * @param  {number} maxDistance
	 * @param  {Object} [options]
	 * @param  {number} [options.collisionMask=-1]
	 * @param  {number} [options.collisionGroup=-1]
	 * @param  {number} [options.skipBackFaces=true]
	 * @param  {RaycastResult} [result]
	 * @returns {boolean} True if hit, else false
	 */
	PhysicsSystem.prototype.raycastAny = function (start, direction, maxDistance, options, result) {
		if (options instanceof RaycastResult) {
			result = options;
			options = {};
		}
		options = options || {};
		result = result || new RaycastResult();

		var cannonStart = tmpVec1;
		var cannonEnd = tmpVec2;
		this._getCannonStartEnd(start, direction, maxDistance, cannonStart, cannonEnd);

		this.cannonWorld.raycastAny(cannonStart, cannonEnd, this._getCannonRaycastOptions(options), tmpCannonResult);

		return this._copyCannonRaycastResultToGoo(tmpCannonResult, result, start);
	};

	/**
	 * Make a ray cast into the world of colliders, and only return the closest hit.
	 * @param  {Vector3} start
	 * @param  {Vector3} direction
	 * @param  {number} maxDistance
	 * @param  {Object} [options]
	 * @param  {number} [options.collisionMask=-1]
	 * @param  {number} [options.collisionGroup=-1]
	 * @param  {number} [options.skipBackFaces=true]
	 * @param  {RaycastResult} [result]
	 * @returns {boolean} True if hit, else false
	 */
	PhysicsSystem.prototype.raycastClosest = function (start, direction, maxDistance, options, result) {
		if (options instanceof RaycastResult) {
			result = options;
			options = {};
		}
		options = options || {};
		result = result || new RaycastResult();

		var cannonStart = tmpVec1;
		var cannonEnd = tmpVec2;
		this._getCannonStartEnd(start, direction, maxDistance, cannonStart, cannonEnd);

		this.cannonWorld.raycastClosest(cannonStart, cannonEnd, this._getCannonRaycastOptions(options), tmpCannonResult);

		return this._copyCannonRaycastResultToGoo(tmpCannonResult, result, start);
	};

	var tmpResult = new RaycastResult();

	/**
	 * Make a ray cast into the world of colliders, evaluating the given callback once at every hit.
	 * @param  {Vector3} start
	 * @param  {Vector3} direction
	 * @param  {number} maxDistance
	 * @param  {Object} [options]
	 * @param  {number} [options.collisionMask=-1]
	 * @param  {number} [options.collisionGroup=-1]
	 * @param  {number} [options.skipBackFaces=true]
	 * @param  {(RaycastResult) -> boolean} callback
	 * @returns {boolean} True if hit, else false
	 */
	PhysicsSystem.prototype.raycastAll = function (start, direction, maxDistance, options, callback) {
		if (typeof(options) === 'function') {
			callback = options;
			options = {};
		}
		callback = callback || function () {};

		var cannonStart = tmpVec1;
		var cannonEnd = tmpVec2;
		this._getCannonStartEnd(start, direction, maxDistance, cannonStart, cannonEnd);

		var that = this;
		var hitAny = false;
		this.cannonWorld.raycastAll(cannonStart, cannonEnd, this._getCannonRaycastOptions(options), function (cannonResult) {
			var hit = that._copyCannonRaycastResultToGoo(cannonResult, tmpResult, start);
			if (hit) {
				hitAny = true;
			}
			if (callback(tmpResult) === false) {
				cannonResult.abort();
			}
		});

		return hitAny;
	};

	/**
	 * Stops simulation and updating of the entitiy transforms.
	 */
	PhysicsSystem.prototype.pause = function () {
		this.passive = true;
	};

	/**
	 * Resumes simulation and starts updating the entities after stop() or pause().
	 */
	PhysicsSystem.prototype.play = function () {
		this.passive = false;

		// Initialize all of the physics world
		this.initialize();
	};

	/**
	 * Stops simulation.
	 */
	PhysicsSystem.prototype.stop = function () {
		this.pause();

		// Trash the physics world
		this.destroy();
	};

	/**
	 * @private
	 * @param  {array} entities
	 */
	PhysicsSystem.prototype.initialize = function (entities) {
		entities = entities || this._activeEntities;

		var N = entities.length;

		for (var i = 0; i !== N; i++) {
			var entity = entities[i];
			var rigidBodyComponent = entity.rigidBodyComponent;

			// Initialize body
			rigidBodyComponent.initialize();
		}

		// Initialize all lonely colliders without rigid body
		var colliderEntities = this._activeColliderEntities;
		for (var i = 0; i !== colliderEntities.length; i++) {
			var colliderEntity = colliderEntities[i];

			if (!colliderEntity.colliderComponent) { // Needed?
				continue;
			}

			if (!colliderEntity.colliderComponent.getBodyEntity() && !colliderEntity.colliderComponent.cannonBody) {
				colliderEntity.colliderComponent.initialize();
			}
		}

		// Initialize joints - must be done *after* all bodies were initialized
		for (var i = 0; i !== N; i++) {
			var entity = entities[i];

			var joints = entity.rigidBodyComponent.joints;
			for (var j = 0; j < joints.length; j++) {
				var joint = joints[j];
				entity.rigidBodyComponent.initializeJoint(joint, entity, this);
			}
		}

		this.initialized = true;
	};

	/**
	 * @private
	 * @param  {array} entities
	 */
	PhysicsSystem.prototype.destroy = function (entities) {
		entities = entities || this._activeEntities;
		var N = entities.length;

		this._shapeIdToColliderEntityMap.forEach(function (key) {
			this._shapeIdToColliderEntityMap.delete(key);
		}.bind(this));

		// Empty the contact event lists
		this._lastContacts.forEach(function (key) {
			this._lastContacts.delete(key);
		}.bind(this));
		this._currentContacts.forEach(function (key) {
			this._currentContacts.delete(key);
		}.bind(this));

		// Destroy joints
		for (var i = 0; i !== N; i++) {
			var entity = entities[i];

			var joints = entity.rigidBodyComponent.joints;
			for (var j = 0; j < joints.length; j++) {
				var joint = joints[j];
				entity.rigidBodyComponent.destroyJoint(joint, entity, this);
			}
		}

		// Destroy all lonely colliders without rigid body
		for (var i = 0; i !== this._activeColliderEntities.length; i++) {
			var colliderEntity = this._activeColliderEntities[i];

			if (!colliderEntity.colliderComponent) { // Needed?
				continue;
			}

			if (colliderEntity.colliderComponent.cannonBody) {
				colliderEntity.colliderComponent.destroy();
			}
		}

		for (var i = 0; i !== N; i++) {
			var entity = entities[i];
			var rigidBodyComponent = entity.rigidBodyComponent;

			// Destroy body
			rigidBodyComponent.destroy();
		}

		this.initialized = false;
	};

	/**
	 * @private
	 * @param  {array} entities
	 * @param  {number} tpf
	 */
	PhysicsSystem.prototype.process = function (entities, tpf) {
		if (!this.initialized) {
			this.initialize();
		}
		this.step(tpf);
		this.syncTransforms(entities);
	};

	/**
	 * @private
	 * @param  {array} entities
	 */
	PhysicsSystem.prototype.syncTransforms = function (entities) {
		var N = entities.length;

		// Need a tree traversal, that takes the roots first
		var queue = [];
		for (var i = 0; i !== N; i++) {
			var entity = entities[i];
			var rigidBodyComponent = entity.rigidBodyComponent;

			// Set updated = false so we don't update the same twice
			rigidBodyComponent._updated = false;

			if (!entity.transformComponent.parent) {
				// Add roots at the end of the array
				queue.push(entity);
			} else {
				// Children first
				queue.unshift(entity);
			}
		}

		// Update positions of entities from the physics data
		while (queue.length) {
			var entity = queue.pop();
			var rigidBodyComponent = entity.rigidBodyComponent;
			var transformComponent = entity.transformComponent;
			var transform = transformComponent.transform;

			if (rigidBodyComponent._updated) {
				continue;
			}
			rigidBodyComponent._updated = true;

			// Get physics orientation
			if (rigidBodyComponent.interpolation === RigidBodyComponent.INTERPOLATE) {
				rigidBodyComponent.getInterpolatedPosition(tmpVec);
				rigidBodyComponent.getInterpolatedQuaternion(tmpQuat);
			} else {
				rigidBodyComponent.getPosition(tmpVec);
				rigidBodyComponent.getQuaternion(tmpQuat);
			}

			// Set local transform of the entity
			transform.translation.setVector(tmpVec);
			transform.rotation.copyQuaternion(tmpQuat);

			// Update transform manually
			transformComponent.updateTransform();
			transformComponent.updateWorldTransform();

			var parent = transformComponent.parent;
			if (parent) {

				// The rigid body is a child, but we have its physics world transform
				// and need to set the world transform of it.
				parent.entity.transformComponent.worldTransform.invert(tmpTransform);
				Transform.combine(tmpTransform, transform, tmpTransform);

				transform.rotation.copy(tmpTransform.rotation);
				transform.translation.copy(tmpTransform.translation);

				// Update transform
				transformComponent.updateTransform();
				transformComponent.updateWorldTransform();
			}

			transformComponent.setUpdated();
		}
	};

	return PhysicsSystem;
});
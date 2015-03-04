define([
	'goo/addons/physicspack/systems/AbstractPhysicsSystem',
	'goo/addons/physicspack/RaycastResult',
	'goo/addons/physicspack/components/RigidbodyComponent',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/entities/EntityUtils',
	'goo/math/Transform'
],
function (
	AbstractPhysicsSystem,
	RaycastResult,
	RigidbodyComponent,
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
			that.emitContactEvents();
			that.emitSubStepEvent();
		});

		this._entities = {};

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
		 * The maximum number of timesteps to use for making the physics clock catch up with the wall clock. If set to zero, a variable timestep will be used (not recommended).
		 * @type {number}
		 * @default 10
		 */
		this.maxSubSteps = settings.maxSubSteps !== undefined ? settings.maxSubSteps : 10;

		this._inContactCurrentStepA = [];
		this._inContactCurrentStepB = [];
		this._inContactLastStepA = [];
		this._inContactLastStepB = [];

		AbstractPhysicsSystem.call(this, 'PhysicsSystem', ['RigidbodyComponent']);
	}
	PhysicsSystem.prototype = Object.create(AbstractPhysicsSystem.prototype);
	PhysicsSystem.prototype.constructor = PhysicsSystem;

	/**
	 * @private
	 */
	PhysicsSystem.prototype._swapContactLists = function () {
		var tmp = this._inContactCurrentStepA;
		this._inContactCurrentStepA = this._inContactLastStepA;
		this._inContactLastStepA = tmp;
		this._inContactCurrentStepA.length = 0;

		tmp = this._inContactCurrentStepB;
		this._inContactCurrentStepB = this._inContactLastStepB;
		this._inContactLastStepB = tmp;
		this._inContactCurrentStepB.length = 0;
	};

	/**
	 * @param {Vector3} gravityVector
	 */
	PhysicsSystem.prototype.setGravity = function (gravityVector) {
		this.cannonWorld.gravity.copy(gravityVector);
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
	 * @private
	 */
	PhysicsSystem.prototype.emitContactEvents = function () {

		// Get overlapping entities
		var contacts = this.cannonWorld.contacts,
			num = contacts.length,
			entities = this._entities;

		this._swapContactLists();

		for (var i = 0; i !== num; i++) {
			var contact = contacts[i];

			var bodyA = contact.bi;
			var bodyB = contact.bj;
			var entityA = entities[bodyA.id];
			var entityB = entities[bodyB.id];

			if (bodyA.id > bodyB.id) {
				var tmp = entityA;
				entityA = entityB;
				entityB = tmp;
			}

			if (this._inContactLastStepA.indexOf(entityA) === -1) {
				this.emitBeginContact(entityA, entityB);
			} else {
				this.emitDuringContact(entityA, entityB);
			}

			this._inContactCurrentStepA.push(entityA);
			this._inContactCurrentStepB.push(entityB);
		}

		// Emit end contact events
		for (var i = 0; i !== this._inContactLastStepA.length; i++) {
			var entityA = this._inContactLastStepA[i];
			var entityB = this._inContactLastStepB[i];

			var found = false;
			for (var j = 0; j !== this._inContactCurrentStepA.length; j++) {
				if (entityA === this._inContactCurrentStepA[i] && entityB === this._inContactCurrentStepB[i]) {
					found = true;
					break;
				}
			}
			if (!found) {
				this.emitEndContact(entityA, entityB);
			}
		}
	};

	var tmpOptions = {};
	PhysicsSystem.prototype._getCannonRaycastOptions = function (options) {
		tmpOptions.collisionFilterMask = options.collisionMask !== undefined ? options.collisionMask : -1;
		tmpOptions.collisionFilterGroup = options.collisionGroup !== undefined ? options.collisionGroup : -1;
		tmpOptions.skipBackfaces = options.skipBackfaces !== undefined ? options.skipBackfaces : true;
		return tmpOptions;
	};

	PhysicsSystem.prototype._copyCannonRaycastResultToGoo = function (cannonResult, gooResult) {
		if (cannonResult.hasHit) {
			gooResult.entity = this._entities[cannonResult.body.id];
			var point = cannonResult.hitPointWorld;
			var normal = cannonResult.hitNormalWorld;
			gooResult.point.setDirect(point.x, point.y, point.z);
			gooResult.normal.setDirect(normal.x, normal.y, normal.z);
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
	 * Make a ray cast into the world of colliders, stopping at the first hit that the ray intersects (could be any physics object). Note that there's no order in the traversal, and you will never have control over what will be returned.
	 * @param  {Vector3} start
	 * @param  {Vector3} direction
	 * @param  {number} distance
	 * @param  {Object} [options]
	 * @param  {RaycastResult} [result]
	 * @returns {boolean} True if hit, else false
	 */
	PhysicsSystem.prototype.raycastAny = function (start, direction, distance, options, result) {
		if (options instanceof RaycastResult) {
			result = options;
			options = {};
		}
		options = options || {};
		result = result || new RaycastResult();

		var cannonStart = tmpVec1;
		var cannonEnd = tmpVec2;
		this._getCannonStartEnd(start, direction, distance, cannonStart, cannonEnd);

		this.cannonWorld.raycastAny(cannonStart, cannonEnd, this._getCannonRaycastOptions(options), tmpCannonResult);

		return this._copyCannonRaycastResultToGoo(tmpCannonResult, result);
	};

	/**
	 * Make a ray cast into the world of colliders, and only return the closest hit.
	 * @param  {Vector3} start
	 * @param  {Vector3} direction
	 * @param  {number} distance
	 * @param  {Object} [options]
	 * @param  {RaycastResult} [result]
	 * @returns {boolean} True if hit, else false
	 */
	PhysicsSystem.prototype.raycastClosest = function (start, direction, distance, options, result) {
		if (options instanceof RaycastResult) {
			result = options;
			options = {};
		}
		options = options || {};
		result = result || new RaycastResult();

		var cannonStart = tmpVec1;
		var cannonEnd = tmpVec2;
		this._getCannonStartEnd(start, direction, distance, cannonStart, cannonEnd);

		this.cannonWorld.raycastClosest(cannonStart, cannonEnd, this._getCannonRaycastOptions(options), tmpCannonResult);

		return this._copyCannonRaycastResultToGoo(tmpCannonResult, result);
	};

	var tmpResult = new RaycastResult();

	/**
	 * Make a ray cast into the world of colliders, evaluating the given callback once at every hit.
	 * @param  {Vector3} start
	 * @param  {Vector3} direction
	 * @param  {number} distance
	 * @param  {Object} [options]
	 * @param  {Function} callback
	 * @returns {boolean} True if hit, else false
	 */
	PhysicsSystem.prototype.raycastAll = function (start, direction, distance, options, callback) {
		if (typeof(options) === 'function') {
			callback = options;
			options = {};
		}
		callback = callback || function () {};

		var cannonStart = tmpVec1;
		var cannonEnd = tmpVec2;
		this._getCannonStartEnd(start, direction, distance, cannonStart, cannonEnd);

		var that = this;
		var hitAny = false;
		this.cannonWorld.raycastAll(cannonStart, cannonEnd, this._getCannonRaycastOptions(options), function (cannonResult) {
			var hit = that._copyCannonRaycastResultToGoo(cannonResult, tmpResult);
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
	 * Stops updating the entities. They will continue again from the pause positions when calling .play().
	 */
	PhysicsSystem.prototype.pause = function () {
		this.passive = true;
	};

	/**
	 * Resumes updating the entities.
	 */
	PhysicsSystem.prototype.play = function () {
		this.passive = false;
	};

	/**
	 * Stops simulating and sets the positions to the initial ones.
	 */
	PhysicsSystem.prototype.stop = function () {
		this.pause();

		// Trash everything
		for (var i = 0; i < this._activeEntities.length; i++) {
			this._activeEntities[i].rigidbodyComponent._dirty = true;
		}
	};

	/**
	 * @private
	 * @param  {Entity} entity
	 */
	PhysicsSystem.prototype.inserted = function (entity) {
		var component = entity.rigidbodyComponent;
		if (component._dirty) {
			component.initialize();
		}
	};

	/**
	 * @private
	 * @param  {Entity} entity
	 */
	PhysicsSystem.prototype.deleted = function (entity) {
		if (entity.rigidbodyComponent) {
			for (var i = 0; i < entity.rigidbodyComponent.joints.length; i++) {
				entity.rigidbodyComponent.destroyJoint(entity.rigidbodyComponent.joints[i]);
			}
			entity.rigidbodyComponent.joints.length = 0;
			entity.rigidbodyComponent.destroy();
		}
	};

	/**
	 * @private
	 * @param  {Entity} entity
	 */
	PhysicsSystem.prototype._addLonelyCollider = function (entity) {
		var material = null;
		if (entity.colliderComponent.material) {
			material = new CANNON.Material();
			material.friction = entity.colliderComponent.material.friction;
			material.restitution = entity.colliderComponent.material.restitution;
		}
		var shape = RigidbodyComponent.getCannonShape(entity.colliderComponent.collider);
		shape.material = material;
		var body = new CANNON.Body({
			mass: 0,
			collisionResponse: entity.colliderComponent.isTrigger,
			shape: shape
		});
		this.cannonWorld.addBody(body);
		entity.colliderComponent.cannonBody = body;
	};

	PhysicsSystem.prototype._colliderDeleted = function (entity) {
		var colliderComponent = entity.colliderComponent;
		if (colliderComponent) {
			var body = colliderComponent.cannonBody;
			if (body) {
				this.cannonWorld.removeBody(body);
				colliderComponent.cannonBody = null;
			}
		}
	};

	PhysicsSystem.prototype._colliderDeletedComponent = function (entity, colliderComponent) {
		var body = colliderComponent.cannonBody;
		if (body) {
			this.cannonWorld.removeBody(body);
			colliderComponent.cannonBody = null;
		}
	};

	/**
	 * @private
	 * @param  {array} entities
	 */
	PhysicsSystem.prototype.initialize = function (entities) {
		var N = entities.length;

		for (var i = 0; i !== N; i++) {
			var entity = entities[i];
			var rigidbodyComponent = entity.rigidbodyComponent;

			// Initialize bodies
			if (rigidbodyComponent._dirty) {
				rigidbodyComponent.initialize();
			} else {
				// Update the colliders if they changed
				rigidbodyComponent._updateDirtyColliders();
			}
		}

		// Initialize joints - must be done *after* all bodies were initialized
		for (var i = 0; i !== N; i++) {
			var entity = entities[i];

			var joints = entity.rigidbodyComponent.joints;
			for (var j = 0; j < joints.length; j++) {
				var joint = joints[j];
				if (!joint._dirty) {
					continue;
				}
				entity.rigidbodyComponent.initializeJoint(joint, entity, this);
				joint._dirty = false;
			}
		}

		// Initialize all colliders without rigid body
		for (var i = 0; i !== this._activeColliderEntities.length; i++) {
			var colliderEntity = this._activeColliderEntities[i];
			if (colliderEntity.colliderComponent.bodyEntity === null && !colliderEntity.colliderComponent.cannonBody) {
				this._addLonelyCollider(colliderEntity);
			}
		}
	};

	/**
	 * @private
	 * @param  {array} entities
	 * @param  {number} tpf
	 */
	PhysicsSystem.prototype.process = function (entities, tpf) {

		this.initialize(entities);

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
			var rigidbodyComponent = entity.rigidbodyComponent;

			// Set updated = false so we don't update the same twice
			rigidbodyComponent._updated = false;

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
			var rigidbodyComponent = entity.rigidbodyComponent;
			var transformComponent = entity.transformComponent;
			var transform = transformComponent.transform;

			if (rigidbodyComponent._updated) {
				continue;
			}
			rigidbodyComponent._updated = true;

			// Get physics orientation
			rigidbodyComponent.getPosition(tmpVec);
			rigidbodyComponent.getQuaternion(tmpQuat);

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
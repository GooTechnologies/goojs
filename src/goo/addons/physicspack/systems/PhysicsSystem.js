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
		 * The maximum number of timesteps to use for making the physics clock catch up with the wall clock. If set to zero, a variable timestep is used (not recommended).
		 * @type {number}
		 * @default 10
		 */
		this.maxSubSteps = settings.maxSubSteps !== undefined ? settings.maxSubSteps : 10;

		this._inContactCurrentStepA = [];
		this._inContactCurrentStepB = [];
		this._inContactLastStepA = [];
		this._inContactLastStepB = [];

		AbstractPhysicsSystem.call(this, 'PhysicsSystem', ['RigidBodyComponent']);
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
	 * Make a ray cast into the world of colliders, stopping at the first hit that the ray intersects. Note that there's no given order in the traversal, and there's no control over what will be returned.
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

		// this.setAllBodiesDirty();
		// this.setAllCollidersDirty();
		this.updateLonelyColliders(true);
	};

	/**
	 * Stops simulation.
	 */
	PhysicsSystem.prototype.stop = function () {
		this.pause();

		// Trash everything
		this.setAllBodiesDirty();
		this.setAllCollidersDirty();
	};

	PhysicsSystem.prototype.setAllBodiesDirty = function () {
		for (var i = 0; i < this._activeEntities.length; i++) {
			this._activeEntities[i].rigidBodyComponent.setToDirty();
		}
	};

	PhysicsSystem.prototype.setAllCollidersDirty = function () {
		for (var i = 0; i < this._activeColliderEntities.length; i++) {
			this._activeColliderEntities[i].colliderComponent.setToDirty();
		}
	};

	/**
	 * @private
	 * @param  {Entity} entity
	 */
	PhysicsSystem.prototype.inserted = function (entity) {
		entity.rigidBodyComponent.initialize();
	};

	/**
	 * @private
	 * @param  {Entity} entity
	 */
	PhysicsSystem.prototype.deleted = function (entity) {
		if (entity.rigidBodyComponent) {
			for (var i = 0; i < entity.rigidBodyComponent.joints.length; i++) {
				entity.rigidBodyComponent.destroyJoint(entity.rigidBodyComponent.joints[i]);
			}
			entity.rigidBodyComponent.joints.length = 0;
			entity.rigidBodyComponent.destroy();
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
		entity.colliderComponent.updateWorldCollider();
		var shape = RigidBodyComponent.getCannonShape(entity.colliderComponent.worldCollider);
		shape.material = material;
		var body = new CANNON.Body({
			mass: 0,
			collisionResponse: !entity.colliderComponent.isTrigger,
			shape: shape
		});
		this.cannonWorld.addBody(body);
		entity.colliderComponent.cannonBody = body;
		if (entity.colliderComponent.bodyEntity && entity.colliderComponent.bodyEntity.rigidBodyComponent) {
			entity.colliderComponent.bodyEntity.rigidBodyComponent.setToDirty();
		}
		entity.colliderComponent.bodyEntity = null;
		entity.colliderComponent.setToDirty();
	};

	/**
	 * @private
	 * @param  {Entity} entity
	 */
	PhysicsSystem.prototype._removeLonelyCollider = function (entity) {
		if (entity.colliderComponent.cannonBody) {
			this.cannonWorld.removeBody(entity.colliderComponent.cannonBody);
			entity.colliderComponent.cannonBody = null;
		}

		var bodyEntity = entity.colliderComponent.getBodyEntity();
		if (bodyEntity) {
			bodyEntity.rigidBodyComponent.setToDirty();
		}

		entity.colliderComponent.setToDirty();
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
			var rigidBodyComponent = entity.rigidBodyComponent;

			// Initialize bodies
			if (rigidBodyComponent.isDirty()) {
				rigidBodyComponent.initialize();
			}
			rigidBodyComponent.updateDirtyColliders();
		}

		// Initialize joints - must be done *after* all bodies were initialized
		for (var i = 0; i !== N; i++) {
			var entity = entities[i];

			var joints = entity.rigidBodyComponent.joints;
			for (var j = 0; j < joints.length; j++) {
				var joint = joints[j];
				if (!joint._dirty) {
					continue;
				}
				entity.rigidBodyComponent.initializeJoint(joint, entity, this);
				joint._dirty = false;
			}
		}

		// Initialize all lonely colliders without rigid body
		for (var i = 0; i !== this._activeColliderEntities.length; i++) {
			var colliderEntity = this._activeColliderEntities[i];

			if (!colliderEntity.colliderComponent) { // Needed?
				continue;
			}

			if (!colliderEntity.colliderComponent.getBodyEntity() && (!colliderEntity.colliderComponent.cannonBody || colliderEntity.colliderComponent.isDirty())) {
				this._removeLonelyCollider(colliderEntity);
				this._addLonelyCollider(colliderEntity);
			}

			if (colliderEntity.colliderComponent.getBodyEntity() && colliderEntity.colliderComponent.cannonBody) {
				this._removeLonelyCollider(colliderEntity);
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
		this.updateLonelyColliders();
		this.step(tpf);
		this.syncTransforms(entities);
	};

	/**
	 * Checks for dirty ColliderComponents without a RigidBodyComponent and updates them.
	 */
	PhysicsSystem.prototype.updateLonelyColliders = function (forceUpdate) {
		for (var i = this._activeColliderEntities.length - 1; i >= 0; i--) {
			var entity = this._activeColliderEntities[i];

			// Set transform from entity
			var colliderComponent = entity.colliderComponent;
			if (colliderComponent && (forceUpdate || colliderComponent._dirty || entity.transformComponent._updated)) {
				var transform = entity.transformComponent.worldTransform;
				var body = colliderComponent.cannonBody;
				if (body) {
					body.position.copy(transform.translation);
					tmpQuat.fromRotationMatrix(transform.rotation);
					body.quaternion.copy(tmpQuat);

					// Update scale of stuff
					var cannonShape = body.shapes[0];
					if (cannonShape) {
						cannonShape.collisionResponse = !colliderComponent.isTrigger;
						colliderComponent.updateWorldCollider();
						RigidBodyComponent.copyScaleFromColliderToCannonShape(
							cannonShape,
							colliderComponent.worldCollider
						);
					}
				}
			}
		}
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
			rigidBodyComponent.getPosition(tmpVec);
			rigidBodyComponent.getQuaternion(tmpQuat);

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
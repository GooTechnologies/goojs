var AbstractPhysicsSystem = require('../../../addons/physicspack/systems/AbstractPhysicsSystem');
var RaycastResult = require('../../../addons/physicspack/RaycastResult');
var RigidBodyComponent = require('../../../addons/physicspack/components/RigidBodyComponent');
var Vector3 = require('../../../math/Vector3');
var Quaternion = require('../../../math/Quaternion');
var Transform = require('../../../math/Transform');

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

	this.cannonWorld.addEventListener('beginShapeContact', function (evt) {
		var shapeIdToColliderEntityMap = this._shapeIdToColliderEntityMap;
		var entityA = shapeIdToColliderEntityMap.get(evt.shapeA.id);
		var entityB = shapeIdToColliderEntityMap.get(evt.shapeB.id);

		if (!entityA || !entityB) {
			return;
		}

		var colliderComponentA = entityA.colliderComponent;
		var colliderComponentB = entityB.colliderComponent;
		if (colliderComponentA.isTrigger || colliderComponentB.isTrigger) {
			this.emitTriggerEnter(entityA, entityB);
			this._stayingEntities.push(entityA, entityB);

			// At least one of the colliders need to have a non-kinematic rigid body
		} else if ((colliderComponentA.getBodyEntity() && !colliderComponentA.getBodyEntity().rigidBodyComponent.isKinematic) || (colliderComponentB.getBodyEntity() && !colliderComponentB.getBodyEntity().rigidBodyComponent.isKinematic)) {
			this.emitBeginContact(entityA, entityB);
			this._stayingEntities.push(entityA, entityB);
		}
	}.bind(this));

	this.cannonWorld.addEventListener('endShapeContact', function (evt) {
		var shapeIdToColliderEntityMap = this._shapeIdToColliderEntityMap;
		var entityA = shapeIdToColliderEntityMap.get(evt.shapeA.id);
		var entityB = shapeIdToColliderEntityMap.get(evt.shapeB.id);

		// Remove them from the staying array
		var stayingEntities = this._stayingEntities;
		for (var i = 0; i < stayingEntities.length; i += 2) {
			if ((stayingEntities[i] === entityA && stayingEntities[i + 1] === entityB) || (stayingEntities[i] === entityB && stayingEntities[i + 1] === entityA)) {
				stayingEntities.splice(i, 2);
				break;
			}
		}

		if (entityA.colliderComponent.isTrigger || entityB.colliderComponent.isTrigger) {
			this.emitTriggerExit(entityA, entityB);
		} else {
			this.emitEndContact(entityA, entityB);
		}
	}.bind(this));

	this.cannonWorld.addEventListener('postStep', function () {
		this.emitSubStepEvent();
		var stayingEntities = this._stayingEntities;
		for (var i = 0; i < stayingEntities.length; i += 2) {
			var entityA = stayingEntities[i];
			var entityB = stayingEntities[i + 1];
			if (entityA.colliderComponent.isTrigger || entityB.colliderComponent.isTrigger) {
				this.emitTriggerStay(entityA, entityB);
			} else {
				this.emitDuringContact(entityA, entityB);
			}
		}
	}.bind(this));

	this._stayingEntities = [];
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

	this.initialized = false;

	AbstractPhysicsSystem.call(this, 'PhysicsSystem', ['RigidBodyComponent']);
}

PhysicsSystem.prototype = Object.create(AbstractPhysicsSystem.prototype);
PhysicsSystem.prototype.constructor = PhysicsSystem;

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

var tmpOptions = {};
PhysicsSystem.prototype._getCannonRaycastOptions = function (options) {
	tmpOptions.collisionFilterMask = options.collisionMask !== undefined ? options.collisionMask : -1;
	tmpOptions.collisionFilterGroup = options.collisionGroup !== undefined ? options.collisionGroup : -1;
	tmpOptions.skipBackfaces = options.skipBackfaces !== undefined ? options.skipBackfaces : true;
	return tmpOptions;
};

PhysicsSystem.prototype._copyCannonRaycastResultToGoo = function (cannonResult, gooResult, rayStart) {
	if (cannonResult.hasHit) {
		gooResult.entity = this._shapeIdToColliderEntityMap.get(cannonResult.shape.id);
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
 * @param  {function (result: RaycastResult) : boolean} callback
 * @returns {boolean} True if hit, else false
 */
PhysicsSystem.prototype.raycastAll = function (start, direction, maxDistance, options, callback) {
	if (typeof options === 'function') {
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
 * Resumes simulation and starts updating the entities after stop() or pause().
 */
PhysicsSystem.prototype.play = function () {
	this.passive = false;

	// Initialize all of the physics world
	this.initialize();
};

/**
 * Stops simulation and updating of the entitiy transforms.
 */
PhysicsSystem.prototype.pause = function () {
	this.passive = true;
};

/**
 * Resumes simulation and starts updating the entities after stop() or pause(); an alias for `.play`
 */
PhysicsSystem.prototype.resume = function () {
	this.passive = false;
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
	this._stayingEntities.length = 0;

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
	if (entities.length === 0) {
		return;
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
		transform.translation.set(tmpVec);
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

module.exports = PhysicsSystem;
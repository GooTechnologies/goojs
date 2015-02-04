define([
	'goo/entities/components/Component',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/math/Transform',
	'goo/entities/SystemBus'
],
function (
	Component,
	Vector3,
	Quaternion,
	Transform,
	SystemBus
) {
	'use strict';

	var tmpQuat = new Quaternion();

	/**
	 * Base class for rigid bodies.
	 * @extends Component
	 */
	function AbstractRigidbodyComponent() {
		Component.call(this, arguments);

		/**
		 * Joints on the body. Use .addJoint to add one, or .removeJoint to remove.
		 * @type {Array}
		 */
		this.joints = [];

		/**
		 * Will be set to true if any the body needs to be reinitialized.
		 * @type {boolean}
		 */
		this._dirty = true;
	}
	AbstractRigidbodyComponent.prototype = Object.create(Component.prototype);
	AbstractRigidbodyComponent.prototype.constructor = AbstractRigidbodyComponent;

	/**
	 * @param {Joint} joint
	 */
	AbstractRigidbodyComponent.prototype.addJoint = function (joint) {
		this.joints.push(joint);
	};

	/**
	 * @param {Joint} joint
	 */
	AbstractRigidbodyComponent.prototype.removeJoint = function (joint) {
		var joints = this.joints;
		var index = joints.indexOf(joint);
		if (index !== -1) {
			joints.splice(index, 1);
			this.destroyJoint(joint);
		}
	};

	AbstractRigidbodyComponent.initializedEvent = {
		entity: null
	};

	/**
	 * Should be called by subclasses when initializing the physics engine body.
	 * @param  {Entity} entity
	 */
	AbstractRigidbodyComponent.prototype.emitInitialized = function (entity) {
		var event = AbstractRigidbodyComponent.initializedEvent;
		event.entity = entity;
		SystemBus.emit('goo.physics.initialized', event);
		event.entity = null; // Remove reference, don't need it any more
	};

	/**
	 * Creates the physics engine rigid body and adds it to the simulation
	 * @virtual
	 */
	AbstractRigidbodyComponent.prototype.initialize = function () {};

	/**
	 * @virtual
	 */
	AbstractRigidbodyComponent.prototype.destroy = function () {};

	/**
	 * Creates a joint in the physics engine.
	 * @virtual
	 * @param {Joint} joint
	 * @param {Entity} entity
	 * @param {System} system
	 */
	AbstractRigidbodyComponent.prototype.initializeJoint = function (/*joint, entity, system*/) {};

	/**
	 * Removes a joint from the physics engine.
	 * @virtual
	 * @param {Joint} joint
	 */
	AbstractRigidbodyComponent.prototype.destroyJoint = function (/*joint*/) {};

	var invBodyTransform = new Transform();
	var trans = new Transform();
	var trans2 = new Transform();

	/**
	 * Traverse the tree of colliders from a root entity and down.
	 * @param  {Entity}   entity
	 * @param  {Function} callback Will be called with colliderEntity, collider, localPosition and localQuaternion as arguments
	 */
	AbstractRigidbodyComponent.prototype.traverseColliders = function (entity, callback) {
		// Needed for getting the Rigidbody-local transform of each collider
		entity.transformComponent.updateTransform();
		entity.transformComponent.updateWorldTransform();

		var bodyTransform = entity.transformComponent.worldTransform;
		invBodyTransform.copy(bodyTransform);
		invBodyTransform.invert(invBodyTransform);

		// Traverse the entities depth first, but skip nodes below other rigidbody components
		var queue = [entity];
		while (queue.length) {
			var childEntity = queue.pop();

			var collider = childEntity.colliderComponent;
			if (collider) {

				childEntity.transformComponent.updateTransform();
				childEntity.transformComponent.updateWorldTransform();

				// Look at the world transform and then get the transform relative to the root entity. This is needed for compounds with more than one level of recursion
				trans.copy(childEntity.transformComponent.worldTransform);
				Transform.combine(invBodyTransform, trans, trans2);

				var offset = trans2.translation;
				var rot = trans2.rotation;
				tmpQuat.fromRotationMatrix(rot);

				// Add the shape
				callback(childEntity, collider.collider, offset, tmpQuat);
			}

			// Add children that don't have rigid body components.
			var childTransformComponents = childEntity.transformComponent.children;
			for (var i = 0; i < childTransformComponents.length; i++) {
				var e = childTransformComponents[i].entity;
				if (!e.rigidbodyComponent) {
					queue.push(e);
				}
			}
		}
	};

	/**
	 * @private
	 * @virtual
	 * @param entity
	 */
	AbstractRigidbodyComponent.prototype.attached = function (/*entity*/) {};

	/**
	 * @private
	 * @param entity
	 */
	AbstractRigidbodyComponent.prototype.detached = function (/*entity*/) {

		// Destroy joints
		var joints = this.joints;
		var len = joints.length;
		for (var i = 0; i !== len; i++) {
			this.destroyJoint(joints[i]);
		}
		joints.length = 0;

		// Destroy the body
		this.destroy();

		this._entity = null;
		this._system = null;
	};

	return AbstractRigidbodyComponent;
});

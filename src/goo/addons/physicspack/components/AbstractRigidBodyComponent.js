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
	function AbstractRigidBodyComponent() {
		Component.call(this, arguments);

		/**
		 * Joints on the body. Use .addJoint to add one, or .removeJoint to remove.
		 * @type {Array}
		 */
		this.joints = [];
	}
	AbstractRigidBodyComponent.prototype = Object.create(Component.prototype);
	AbstractRigidBodyComponent.prototype.constructor = AbstractRigidBodyComponent;

	/**
	 * @param {PhysicsJoint}  joint
	 */
	AbstractRigidBodyComponent.prototype.addJoint = function (joint) {
		this.joints.push(joint);
	};

	/**
	 * @param {PhysicsJoint}  joint
	 */
	AbstractRigidBodyComponent.prototype.removeJoint = function (joint) {
		var joints = this.joints;
		var index = joints.indexOf(joint);
		if (index !== -1) {
			joints.splice(index, 1);
		}
	};

	AbstractRigidBodyComponent.initializedEvent = {
		entity: null
	};

	/**
	 * Should be called by subclasses when initializing the physics engine body.
	 * @param  {Entity} entity
	 */
	AbstractRigidBodyComponent.prototype.emitInitialized = function (entity) {
		var event = AbstractRigidBodyComponent.initializedEvent;
		event.entity = entity;
		SystemBus.emit('goo.physics.initialized', event);
		event.entity = null; // Remove reference, don't need it any more
	};

	/**
	 * Creates the physics engine rigid body and adds it to the simulation
	 * @virtual
	 */
	AbstractRigidBodyComponent.prototype.initialize = function () {};

	/**
	 * @virtual
	 */
	AbstractRigidBodyComponent.prototype.destroy = function () {};

	/**
	 * Creates a joint in the physics engine.
	 * @virtual
	 * @param {PhysicsJoint}  joint
	 * @param {Entity} entity
	 * @param {System} system
	 */
	AbstractRigidBodyComponent.prototype.initializeJoint = function (/*joint, entity, system*/) {};

	/**
	 * Removes a joint from the physics engine.
	 * @virtual
	 * @param {PhysicsJoint}  joint
	 */
	AbstractRigidBodyComponent.prototype.destroyJoint = function (/*joint*/) {};

	var inverseBodyTransform = new Transform();
	var trans = new Transform();
	var trans2 = new Transform();

	/**
	 * Traverse the tree of colliders from a root entity and down.
	 * @param  {Entity}   entity
	 * @param  {Function} callback A callback to be called for each collider below or on the same entity. The arguments to the callback are: colliderEntity, collider, localPosition and localQuaternion.
	 */
	AbstractRigidBodyComponent.prototype.traverseColliders = function (entity, callback) {
		// Needed for getting the RigidBody-local transform of each collider
		entity.transformComponent.updateTransform();
		entity.transformComponent.updateWorldTransform();

		var bodyTransform = entity.transformComponent.worldTransform;
		inverseBodyTransform.copy(bodyTransform);
		inverseBodyTransform.invert(inverseBodyTransform);

		// Traverse the entities depth first, but skip nodes below other rigid body components
		var queue = [entity];
		while (queue.length) {
			var childEntity = queue.pop();

			var collider = childEntity.colliderComponent;
			if (collider) {

				childEntity.transformComponent.updateTransform();
				childEntity.transformComponent.updateWorldTransform();

				// Look at the world transform and then get the transform relative to the root entity. This is needed for compounds with more than one level of recursion
				trans.copy(childEntity.transformComponent.worldTransform);
				Transform.combine(inverseBodyTransform, trans, trans2);

				var offset = trans2.translation;
				var rot = trans2.rotation;
				tmpQuat.fromRotationMatrix(rot);

				// Add the shape
				callback.call(this, childEntity, collider.collider, offset, tmpQuat);
			}

			// Add children that don't have rigid body components.
			var childTransformComponents = childEntity.transformComponent.children;
			for (var i = 0; i < childTransformComponents.length; i++) {
				var e = childTransformComponents[i].entity;
				if (!e.rigidBodyComponent) {
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
	AbstractRigidBodyComponent.prototype.attached = function (/*entity*/) {};

	/**
	 * @private
	 * @param entity
	 */
	AbstractRigidBodyComponent.prototype.detached = function (/*entity*/) {
		this._entity = null;
		this._system = null;
	};

	return AbstractRigidBodyComponent;
});

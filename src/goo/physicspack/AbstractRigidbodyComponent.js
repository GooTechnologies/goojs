define([
	'goo/entities/components/Component',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/math/Transform',
	'goo/entities/SystemBus'
],
/** @lends */
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
	 * @class
	 * @extends Component
	 * @param {object} [settings]
	 */
	function AbstractRigidbodyComponent(settings) {
		settings = settings || {};

		Component.call(this, arguments);

		/**
		 * Joints on the body. Use .addJoint to add one, or .removeJoint to remove.
		 * @type {Array}
		 */
		this.joints = [];

		/**
		 * Will be set to true if any the body needs to be reinitialized.
		 * @type {Boolean}
		 */
		this._dirty = true;
	}
	AbstractRigidbodyComponent.prototype = Object.create(Component.prototype);
	AbstractRigidbodyComponent.constructor = AbstractRigidbodyComponent;

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
		var idx = joints.indexOf(joint);
		if (idx !== -1) {
			joints.splice(idx, 1);
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
		var evt = AbstractRigidbodyComponent.initializedEvent;
		evt.entity = entity;
		SystemBus.emit('goo.physics.initialized', evt);
		evt.entity = null; // Remove reference, don't need it any more
	};

	/**
	 * Creates the physics engine rigid body and adds it to the simulation
	 * @virtual
	 */
	AbstractRigidbodyComponent.prototype.initialize = function () {};

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
	var gooTrans = new Transform();
	var gooTrans2 = new Transform();

	/**
	 * Traverse the tree of colliders from a root entity and down.
	 * @param  {Entity}   entity
	 * @param  {Function} callback Will be called with colliderEntity, collider, localPosition and localQuaternion as arguments
	 */
	AbstractRigidbodyComponent.prototype.traverseColliders = function (entity, callback) {
		// Needed for getting the Rigidbody-local transform of each collider
		// entity.transformComponent.updateTransform();
		// entity.transformComponent.updateWorldTransform();
		var bodyTransform = entity.transformComponent.worldTransform;
		invBodyTransform.copy(bodyTransform);
		invBodyTransform.invert(invBodyTransform);

		entity.traverse(function (childEntity) {
			var collider = childEntity.colliderComponent;
			if (collider) {

				// Look at the world transform and then get the transform relative to the root entity. This is needed for compounds with more than one level of recursion

				gooTrans.copy(childEntity.transformComponent.worldTransform);
				Transform.combine(invBodyTransform, gooTrans, gooTrans2);
				gooTrans2.update();

				var offset = gooTrans2.translation;
				var rot = gooTrans2.rotation;
				tmpQuat.fromRotationMatrix(rot);

				// Add the shape
				callback(childEntity, collider.collider, offset, tmpQuat);
			}
		});
	};

	return AbstractRigidbodyComponent;
});

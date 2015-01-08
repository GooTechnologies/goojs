define([
	'goo/entities/components/Component',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/math/Transform'
],
/** @lends */
function (
	Component,
	Vector3,
	Quaternion,
	Transform
) {
	'use strict';

	var tmpQuat = new Quaternion();

	/**
	 * @class
	 * @extends Component
	 */
	function AbstractRigidbodyComponent(settings) {
		settings = settings || {};

		Component.call(this, arguments);

		/**
		 * Joints on the body. Use .addJoint to add one.
		 * @type {Array}
		 */
		this.joints = [];

		/**
		 * Will be set to true if any of the colliders were changed
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
		if (this.rigidbody) {
			this.rigidbody.addJoint(joint);
		}
	};

	/**
	 * Creates the physics engine rigid body and adds it to the simulation
	 * @virtual
	 */
	AbstractRigidbodyComponent.prototype.initialize = function () {};

	/**
	 * Creates all joints in the physics engine.
	 * @virtual
	 * @private
	 * @param {Joint} joint
	 * @param {Entity} entity
	 * @param {System} system
	 */
	AbstractRigidbodyComponent.prototype.initializeJoint = function (/*joint, entity, system*/) {};

	/**
	 * Traverse the tree of colliders from a root entity and down
	 * @param  {Entity}   entity
	 * @param  {Function} callback Will be called with colliderEntity, collider, localPosition and localQuaternion as arguments
	 */
	AbstractRigidbodyComponent.prototype.traverseColliders = function (entity, callback) {
		// Needed for getting the Rigidbody-local transform of each collider
		// entity.transformComponent.updateTransform();
		// entity.transformComponent.updateWorldTransform();
		var bodyTransform = entity.transformComponent.worldTransform;
		var invBodyTransform = new Transform();
		invBodyTransform.copy(bodyTransform);
		invBodyTransform.invert(invBodyTransform);
		var gooTrans = new Transform();
		var gooTrans2 = new Transform();

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

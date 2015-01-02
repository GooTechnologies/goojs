define([
	'goo/math/Transform',
	'goo/math/Quaternion'
],
/** @lends */
function (
	Transform,
	Quaternion
) {
	'use strict';

	/**
	 * @class Base class for rigid body. Made for interaction with a physics engine.
	 */
	function Rigidbody(settings) {
		settings = settings || {};
	}
	Rigidbody.constructor = Rigidbody;

	/**
	 * Get the world transform from the entity and set on the body
	 * @param {Entity} entity
	 */
	Rigidbody.prototype.setTransformFromEntity = function (entity) {};

	/**
	 * Set the force on the body
	 * @param {Vector3} force
	 */
	Rigidbody.prototype.applyForce = function (force) {};

	/**
	 * Set the velocity on the body
	 * @param {Vector3} velocity
	 */
	Rigidbody.prototype.setVelocity = function (velocity) {};

	/**
	 * Set the body position.
	 * @param {Vector3} position
	 */
	Rigidbody.prototype.setPosition = function (pos) {};

	/**
	 * Set the body angular velocity position.
	 * @param {Vector3} angularVelocity
	 */
	Rigidbody.prototype.setAngularVelocity = function (angularVelocity) {};

	var tmpQuat = new Quaternion();

	/**
	 * Creates the physics engine rigid body and adds it to the simulation
	 */
	Rigidbody.prototype.initialize = function () {};

	/**
	 * Creates all joints in the physics engine.
	 */
	Rigidbody.prototype.initializeJoint = function (joint, entity, system) {};

	/**
	 * Traverse the tree of colliders from a root entity and down
	 * @param  {Entity}   entity
	 * @param  {Function} callback Will be called with colliderEntity, collider, localPosition and localQuaternion as arguments
	 */
	Rigidbody.prototype.traverseColliders = function (entity, callback) {
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

	return Rigidbody;
});

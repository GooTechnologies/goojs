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
	 * @class Base class for rigid body wrappers.
	 */
	function Rigidbody(settings) {
		settings = settings || {};

		// Set to true if any of the colliders were changed
		this._dirty = true;

		this.isKinematic = settings.isKinematic || false;
		this.mass = settings.mass || 1.0;
		if (this.isKinematic) {
			this.mass = 0;
		}
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
	Rigidbody.prototype.setForce = function (force) {};

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

	/**
	 * Add a collider to the body
	 * @param {Collider} collider
	 * @param {Vector3} position
	 * @param {Quaternion} quaternion
	 */
	Rigidbody.prototype.addCollider = function (collider, position, quaternion) {};

	var tmpQuat = new Quaternion();

	/**
	 * Creates the physics engine rigid body and adds it to the simulation
	 */
	Rigidbody.prototype.initialize = function () {};

	/**
	 * Traverse the tree of colliders from a root entity and down
	 * @param  {Entity}   entity
	 * @param  {Function} callback Will be called with colliderEntity, collider, localPosition and localQuaternion as arguments
	 */
	Rigidbody.prototype.traverseColliders = function (entity, callback) {
		if (entity.colliderComponent && entity.colliderComponent.collider) {

			// Entity has a collider on the root
			// Create a simple shape
			this.addCollider(entity.colliderComponent.collider);
		}

		// Needed for getting the Rigidbody-local transform of each collider
		// entity.transformComponent.updateTransform();
		// entity.transformComponent.updateWorldTransform();
		var bodyTransform = entity.transformComponent.worldTransform;
		var invBodyTransform = new Transform();
		invBodyTransform.copy(bodyTransform);
		invBodyTransform.invert(invBodyTransform);
		var gooTrans = new Transform();

		//var cmOffset = this.centerOfMassOffset;

		var gooTrans2 = new Transform();

		var that = this;
		entity.traverse(function (childEntity) {
			var collider = childEntity.colliderComponent;
			if (collider) {

				// Look at the world transform and then get the transform relative to the root entity. This is needed for compounds with more than one level of recursion
				// childEntity.transformComponent.updateTransform();
				// childEntity.transformComponent.updateWorldTransform();

				gooTrans.copy(childEntity.transformComponent.worldTransform);
				Transform.combine(invBodyTransform, gooTrans, gooTrans2);
				gooTrans2.update();

				// var gooTrans2 = new Transform();
				// gooTrans2.copy(childEntity.transformComponent.transform);

				var offset = gooTrans2.translation;
				var rot = gooTrans2.rotation;
				var q = tmpQuat;
				q.fromRotationMatrix(rot);

				// var o2 = orientation.clone();
				// o2.w *= -1;
				// o2.vmult(offset, offset);

				// Add center of mass offset
				//offset.add(cmOffset);

				// Add the shape
				callback(childEntity, collider.collider, offset, q);
			}
		});
	};

	return Rigidbody;
});

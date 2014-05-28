define([
	'goo/entities/components/Component',
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Quad',
	'goo/util/ObjectUtil'
],
/** @lends */
function (
	Component,
	Quaternion,
	Vector3,
	Transform,
	Box,
	Sphere,
	Quad,
	_
) {
	'use strict';

	var CANNON = window.CANNON;

	/**
	 * @class Adds Cannon physics to an entity. Should be combined with one of the CannonCollider components, such as the {@link CannonSphereColliderComponent}. Also see {@link CannonSystem}.
	 * @extends Component
	 * @param {Object}  [settings]
	 * @param {number}  [settings.mass=1]
	 * @example
	 * <caption>{@linkplain http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example}</caption>
	 * world.setSystem(new CannonSystem());
	 * var entity = world.createEntity();
	 * var rigidBodyComponent = new CannonRigidBodyComponent({
	 *   mass : 1
	 * });
	 * entity.setComponent(rigidBodyComponent);
	 * var boxColliderComponent = new CannonBoxColliderComponent({
	 *   halfExtents : new Vector3(1, 1, 1)
	 * });
	 * entity.setComponent(boxColliderComponent);
	 */
	function CannonRigidbodyComponent(settings) {
		settings = settings || {};
		this.type = 'CannonRigidbodyComponent';

		_.defaults(settings, {
			mass : 1,
			velocity : new Vector3()
			// Todo: a lot of more things from Cannon.js API
		}); //! AT: this is modifying the settings object which is bad practice (as in 'unintended side effects')

		this.mass = settings.mass;
		this._initialVelocity = new Vector3();
		this._initialVelocity.setv(settings.velocity);
	}

	CannonRigidbodyComponent.prototype = Object.create(Component.prototype);
	CannonRigidbodyComponent.constructor = CannonRigidbodyComponent;

	CannonRigidbodyComponent.prototype.api = {
		setForce: function (force) {
			CannonRigidbodyComponent.prototype.setForce.call(this.cannonRigidbodyComponent, force);
		},
		setVelocity: function (velocity) {
			CannonRigidbodyComponent.prototype.setVelocity.call(this.cannonRigidbodyComponent, velocity);
		},
		// schteppe: needs to be separate from the transformcomponent setTranslation, since the transformcomponent data will get overridden by physics
		setPosition: function (pos) {
			CannonRigidbodyComponent.prototype.setPosition.call(this.cannonRigidbodyComponent, pos);
		},
		setAngularVelocity: function (angularVelocity) {
			CannonRigidbodyComponent.prototype.setAngularVelocity.call(this.cannonRigidbodyComponent, angularVelocity);
		}
	};

	var tmpQuat = new Quaternion();

	/**
	 * Set the force on the body
	 * @param {Vector3} force
	 */
	CannonRigidbodyComponent.prototype.setForce = function (force) {
		this.body.force.set(force.x, force.y, force.z);
	};

	/**
	 * Set the velocity on the body
	 * @param {Vector3} velocity
	 */
	CannonRigidbodyComponent.prototype.setVelocity = function (velocity) {
		this.body.velocity.set(velocity.x, velocity.y, velocity.z);
	};

	/**
	 * Set the body position.
	 * @param {Vector3} position
	 */
	CannonRigidbodyComponent.prototype.setPosition = function (pos) {
		this.body.position.set(pos.x, pos.y, pos.z);
	};

	/**
	 * Set the body angular velocity position.
	 * @param {Vector3} angularVelocity
	 */
	CannonRigidbodyComponent.prototype.setAngularVelocity = function (angularVelocity) {
		this.body.angularVelocity.set(angularVelocity.x, angularVelocity.y, angularVelocity.z);
	};

	/**
	 * Get the collider component from an entity, if one exist.
	 * @return {mixed} Any of the collider types, or NULL if not found
	 */
	CannonRigidbodyComponent.getCollider = function (entity) {
		return entity.cannonBoxColliderComponent || entity.cannonPlaneColliderComponent || entity.cannonSphereColliderComponent || null;
	};

	CannonRigidbodyComponent.prototype.createShape = function (entity) {
		var shape;

		var collider = CannonRigidbodyComponent.getCollider(entity);
		if (!collider) {
			// No collider. Check children.
			shape = new CANNON.Compound();

			// Needed for getting the Rigidbody-local transform of each collider
			var bodyTransform = entity.transformComponent.worldTransform;
			var invBodyTransform = new Transform();
			invBodyTransform.copy(bodyTransform);
			invBodyTransform.invert(invBodyTransform);
			//var gooTrans = new Transform();

			var that = this;
			entity.traverse(function (entity) {
				var collider = CannonRigidbodyComponent.getCollider(entity);
				if (collider) {

					// TODO: Should look at the world transform and then get the transform relative to the root entity. This is needed for compounds with more than one level of recursion
					// Like this:
					//gooTrans.copy(entity.transformComponent.worldTransform);
					//Transform.combine(invBodyTransform, gooTrans, gooTrans);
					//var t = gooTrans;
					// But for now it does not work.. just do this instead:
					var t = entity.transformComponent.transform;

					var trans = t.translation;
					var rot = t.rotation;
					var offset = new CANNON.Vec3(trans.x, trans.y, trans.z);
					var q = tmpQuat;
					q.fromRotationMatrix(rot);
					var orientation = new CANNON.Quaternion(q.x, q.y, q.z, q.w);
					shape.addChild(collider.cannonShape, offset, orientation);
				}
			});

		} else {

			// Entity has a collider on the root
			// Create a simple shape
			shape = collider.cannonShape;
		}

		return shape;
	};

	return CannonRigidbodyComponent;
});

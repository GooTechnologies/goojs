define([
	'goo/entities/components/Component',
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Quad',
	'goo/util/ObjectUtil'
], function (
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

	/* global CANNON */

	/**
	 * Adds Cannon physics to an entity. Should be combined with one of the CannonCollider components, such as the {@link CannonSphereColliderComponent}. Also see {@link CannonSystem}.
	 * @extends Component
	 * @param {Object} [settings]
	 * @param {number} [settings.mass=1]
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example
	 * @example
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
	function CannonRigidBodyComponent(settings) {
		Component.apply(this, arguments);

		settings = settings || {};
		this.type = 'CannonRigidBodyComponent';

		_.defaults(settings, {
			mass : 1,
			velocity : new Vector3()
			// Todo: a lot of more things from Cannon.js API
		}); //! AT: this is modifying the settings object which is bad practice (as in 'unintended side effects')

		this.mass = settings.mass;
		this._initialPosition = null;
		this._initialVelocity = new Vector3();
		this._initialVelocity.setVector(settings.velocity);
		this.body = null;
		this.centerOfMassOffset = new Vector3();
	}

	CannonRigidBodyComponent.prototype = Object.create(Component.prototype);
	CannonRigidBodyComponent.constructor = CannonRigidBodyComponent;

	CannonRigidBodyComponent.prototype.api = {
		setForce: function (force) {
			CannonRigidBodyComponent.prototype.setForce.call(this.cannonRigidBodyComponent, force);
		},
		setVelocity: function (velocity) {
			CannonRigidBodyComponent.prototype.setVelocity.call(this.cannonRigidBodyComponent, velocity);
		},
		// schteppe: needs to be separate from the transformcomponent setTranslation, since the transformcomponent data will get overridden by physics
		setPosition: function (pos) {
			CannonRigidBodyComponent.prototype.setPosition.call(this.cannonRigidBodyComponent, pos);
		},
		setAngularVelocity: function (angularVelocity) {
			CannonRigidBodyComponent.prototype.setAngularVelocity.call(this.cannonRigidBodyComponent, angularVelocity);
		}
	};

	var tmpQuat = new Quaternion();

	/**
	 * Set the force on the body
	 * @param {Vector3} force
	 */
	CannonRigidBodyComponent.prototype.setForce = function (force) {
		this.body.force.set(force.x, force.y, force.z);
	};

	/**
	 * Set the velocity on the body
	 * @param {Vector3} velocity
	 */
	CannonRigidBodyComponent.prototype.setVelocity = function (velocity) {
		this.body.velocity.set(velocity.x, velocity.y, velocity.z);
	};

	/**
	 * Set the body position.
	 * @param {Vector3} position
	 */
	CannonRigidBodyComponent.prototype.setPosition = function (pos) {
		if (this.body) {
			this.body.position.set(pos.x, pos.y, pos.z);
		} else {
			this._initialPosition = new Vector3(pos);
		}
	};

	/**
	 * Set the body angular velocity position.
	 * @param {Vector3} angularVelocity
	 */
	CannonRigidBodyComponent.prototype.setAngularVelocity = function (angularVelocity) {
		this.body.angularVelocity.set(angularVelocity.x, angularVelocity.y, angularVelocity.z);
	};

	/**
	 * Get the collider component from an entity, if one exist.
	 * @returns {mixed} Any of the collider types, or NULL if not found
	 */
	CannonRigidBodyComponent.getCollider = function (entity) {
		return entity.cannonBoxColliderComponent || entity.cannonPlaneColliderComponent || entity.cannonSphereColliderComponent || entity.cannonTerrainColliderComponent || entity.cannonCylinderColliderComponent || null;
	};

	CannonRigidBodyComponent.prototype.addShapesToBody = function (entity) {
		var body = entity.cannonRigidBodyComponent.body;

		var collider = CannonRigidBodyComponent.getCollider(entity);
		if (!collider) {

			// Needed for getting the RigidBody-local transform of each collider
			// entity.transformComponent.updateTransform();
			// entity.transformComponent.updateWorldTransform();
			var bodyTransform = entity.transformComponent.worldTransform;
			var invBodyTransform = new Transform();
			invBodyTransform.copy(bodyTransform);
			invBodyTransform.invert(invBodyTransform);
			var gooTrans = new Transform();

			var cmOffset = this.centerOfMassOffset;

			entity.traverse(function (childEntity) {
				var collider = CannonRigidBodyComponent.getCollider(childEntity);
				if (collider) {

					// Look at the world transform and then get the transform relative to the root entity. This is needed for compounds with more than one level of recursion
					// childEntity.transformComponent.updateTransform();
					// childEntity.transformComponent.updateWorldTransform();

					gooTrans.copy(childEntity.transformComponent.worldTransform);
					var gooTrans2 = new Transform();
					Transform.combine(invBodyTransform, gooTrans, gooTrans2);
					gooTrans2.update();

					// var gooTrans2 = new Transform();
					// gooTrans2.copy(childEntity.transformComponent.transform);

					var trans = gooTrans2.translation;
					var rot = gooTrans2.rotation;

					var offset = new CANNON.Vec3(trans.x, trans.y, trans.z);
					var q = tmpQuat;
					q.fromRotationMatrix(rot);
					var orientation = new CANNON.Quaternion(q.x, q.y, q.z, q.w);

					// var o2 = orientation.clone();
					// o2.w *= -1;
					// o2.vmult(offset, offset);

					// Subtract center of mass offset
					offset.vadd(cmOffset, offset);

					if (collider.isTrigger) {
						collider.cannonShape.collisionResponse = false;
					}

					// Add the shape
					body.addShape(collider.cannonShape, offset, orientation);
				}
			});

		} else {

			// Entity has a collider on the root
			// Create a simple shape
			body.addShape(collider.cannonShape);
		}
	};

	return CannonRigidBodyComponent;
});

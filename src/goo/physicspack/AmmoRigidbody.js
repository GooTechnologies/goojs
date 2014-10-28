define([
	'goo/physicspack/Rigidbody',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/math/Transform',
	'goo/physicspack/colliders/BoxCollider',
	'goo/physicspack/colliders/SphereCollider',
	'goo/physicspack/colliders/CylinderCollider',
	'goo/physicspack/colliders/PlaneCollider',
	'goo/physicspack/colliders/TerrainCollider'
],
/** @lends */
function (
	Rigidbody,
	Vector3,
	Quaternion,
	Transform,
	BoxCollider,
	SphereCollider,
	CylinderCollider,
	PlaneCollider,
	TerrainCollider
) {
	'use strict';

	/* global Ammo */

	function AmmoRigidbody(cannonWorld, settings) {
		settings = settings || {};
		Rigidbody.call(this, settings);

		/**
		 * The CANNON.Body instance
		 */
		this.cannonBody = new CANNON.Body({
			mass: 1
		});
		cannonWorld.addBody(this.cannonBody);
	}

	AmmoRigidbody.prototype = Object.create(Rigidbody.prototype);
	AmmoRigidbody.constructor = AmmoRigidbody;

	AmmoRigidbody.prototype.setKinematic = function () {
		var body = this.cannonBody;
		body.mass = 0;
		body.type = CANNON.Body.KINEMATIC;
	};

	var tmpQuat = new Quaternion();

	// Get the world transform from the entity and set on the body
	AmmoRigidbody.prototype.setTransformFromEntity = function (entity) {
		var t = entity.transformComponent.transform;
		var body = this.cannonBody;
		body.position.copy(t.translation);
		var q = tmpQuat;
		q.fromRotationMatrix(t.rotation);
		body.quaternion.copy(q);

	};

	AmmoRigidbody.prototype.setMass = function (mass) {
		var body = this.cannonBody;
		body.mass = mass;
		body.type = CANNON.Body.DYNAMIC;
	};

	AmmoRigidbody.prototype.setForce = function (force) {
		this.cannonBody.force.copy(force);
	};

	AmmoRigidbody.prototype.setVelocity = function (velocity) {
		this.cannonBody.velocity.copy(velocity);
	};

	AmmoRigidbody.prototype.setPosition = function (pos) {
		this.cannonBody.position.copy(pos);
	};

	AmmoRigidbody.prototype.getPosition = function (targetVector) {
		var p = this.cannonBody.position;
		targetVector.setd(p.x, p.y, p.z);
	};

	AmmoRigidbody.prototype.setQuaternion = function (pos) {
		this.cannonBody.quaternion.copy(pos);
	};

	AmmoRigidbody.prototype.getQuaternion = function (targetQuat) {
		var q = this.cannonBody.quaternion;
		targetQuat.setd(q.x, q.y, q.z, q.w);
	};

	AmmoRigidbody.prototype.setAngularVelocity = function (angularVelocity) {
		this.cannonBody.angularVelocity.copy(angularVelocity);
	};

	AmmoRigidbody.prototype.getShape = function (collider) {
		var shape;
		if (collider instanceof BoxCollider) {
			var halfExtents = new CANNON.Vec3();
			halfExtents.copy(collider.halfExtents);
			shape = new CANNON.Box(halfExtents);
		} else if (collider instanceof SphereCollider) {
			shape = new CANNON.Sphere(collider.radius);
		} else if (collider instanceof PlaneCollider) {
			shape = new CANNON.Plane();
		} else if (collider instanceof CylinderCollider) {
			shape = new CANNON.Cylinder(
				collider.radiusTop,
				collider.radiusBottom,
				collider.height,
				collider.numSegments
			);
		} else if (collider instanceof TerrainCollider) {
			shape = new CANNON.Heightfield(collider.data);
		}
		return shape;
	};

	AmmoRigidbody.prototype.addCollider = function (collider, position, quaternion) {
		var body = this.cannonBody;

		collider.cannonShape = this.getShape(collider);

		if (collider.isTrigger) {
			collider.cannonShape.collisionResponse = false;
		}

		// Add the shape
		var cannonPos = new CANNON.Vec3();
		if (position) {
			cannonPos.copy(position);
		}
		var cannonQuat = new CANNON.Quaternion();
		if (position) {
			cannonQuat.copy(quaternion);
		}
		body.addShape(collider.cannonShape, cannonPos, cannonQuat);
	};

	return AmmoRigidbody;
});
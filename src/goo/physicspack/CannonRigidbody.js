define([
	'goo/physicspack/Rigidbody',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/math/Transform',
	'goo/physicspack/colliders/BoxCollider',
	'goo/physicspack/colliders/SphereCollider',
	'goo/physicspack/colliders/CylinderCollider',
	'goo/physicspack/colliders/PlaneCollider',
	'goo/physicspack/colliders/TerrainCollider',
	'goo/physicspack/joints/BallJoint'
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
	TerrainCollider,
	BallJoint
) {
	'use strict';

	/* global CANNON */

	function CannonRigidbody(entity) {
		Rigidbody.call(this, entity);
	}

	CannonRigidbody.prototype = Object.create(Rigidbody.prototype);
	CannonRigidbody.constructor = CannonRigidbody;

	var tmpQuat = new Quaternion();

	// Get the world transform from the entity and set on the body
	CannonRigidbody.prototype.setTransformFromEntity = function (entity) {
		var t = entity.transformComponent.transform;
		var body = this.cannonBody;
		body.position.copy(t.translation);
		var q = tmpQuat;
		q.fromRotationMatrix(t.rotation);
		body.quaternion.copy(q);
	};

	CannonRigidbody.prototype.applyForce = function (force) {
	};

	CannonRigidbody.prototype.setVelocity = function (velocity) {
		this.cannonBody.velocity.copy(velocity);
	};

	CannonRigidbody.prototype.setPosition = function (pos) {
		this.cannonBody.position.copy(pos);
	};

	CannonRigidbody.prototype.getPosition = function (targetVector) {
		var p = this.cannonBody.position;
		targetVector.setDirect(p.x, p.y, p.z);
	};

	CannonRigidbody.prototype.setQuaternion = function (pos) {
		this.cannonBody.quaternion.copy(pos);
	};

	CannonRigidbody.prototype.getQuaternion = function (targetQuat) {
		var q = this.cannonBody.quaternion;
		targetQuat.setDirect(q.x, q.y, q.z, q.w);
	};

	CannonRigidbody.prototype.setAngularVelocity = function (angularVelocity) {
		this.cannonBody.angularVelocity.copy(angularVelocity);
	};

	CannonRigidbody.prototype.getCannonShape = function (collider) {
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

	CannonRigidbody.prototype.initialize = function (entity, system) {
		if (!entity.rigidbodyComponent._dirty) {
			return;
		}
		var rbc = entity.rigidbodyComponent;
		this.cannonBody = new CANNON.Body({
			mass: entity.rigidbodyComponent.mass
		});
		system.world.addBody(this.cannonBody);

		var initialVelocity = new CANNON.Vec3();
		initialVelocity.copy(rbc.initialVelocity);
		this.cannonBody.velocity.copy(initialVelocity);

		var that = this;
		this.traverseColliders(entity, function (colliderEntity, collider, position, quaternion) {
			that.addCollider(collider, position, quaternion);
		});
		if (rbc.isKinematic) {
			this.cannonBody.type = CANNON.Body.KINEMATIC;
		}
		this.setTransformFromEntity(entity);
	};

	CannonRigidbody.prototype.initializeJoint = function (joint, entity, system) {
		var bodyA = entity.rigidbodyComponent.rigidbody.cannonBody;
		var bodyB = joint.connectedEntity.rigidbodyComponent.rigidbody.cannonBody;
		var constraint;
		if (joint instanceof BallJoint) {
			var pivotInA = new CANNON.Vec3();
			var pivotInB = new CANNON.Vec3();
			pivotInA.copy(joint.localPivot);

			// Get the local pivot in bodyB
			bodyA.pointToWorldFrame(joint.localPivot, pivotInB);
			bodyB.pointToLocalFrame(pivotInB, pivotInB);

			constraint = new CANNON.PointToPointConstraint(bodyA, pivotInA, bodyB, pivotInB);
		}
		if (constraint) {
			bodyA.world.addConstraint(constraint);
			joint.joint = constraint;
		}
	};

	CannonRigidbody.prototype.addCollider = function (collider, position, quaternion) {
		var body = this.cannonBody;

		collider.cannonShape = this.getCannonShape(collider);

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

	return CannonRigidbody;
});
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

	/* global Ammo */

	var tmpTransform;
	var tmpVector;
	var tmpVector2;
	var tmpQuat;
	var tmpGooQuat = new Quaternion();

	function AmmoRigidbody(entity) {
		Rigidbody.call(this, entity);

		/**
		 * The Ammo.btRigidbody instance. Will be created on .initialize()
		 */
		this.ammoBody = null;

		if (!tmpTransform) {
			tmpTransform = new Ammo.btTransform();
		}
		if (!tmpVector) {
			tmpVector = new Ammo.btVector3();
		}
		if (!tmpVector2) {
			tmpVector2 = new Ammo.btVector3();
		}
		if (!tmpQuat) {
			tmpQuat = new Ammo.btQuaternion();
		}
	}

	AmmoRigidbody.prototype = Object.create(Rigidbody.prototype);
	AmmoRigidbody.constructor = AmmoRigidbody;

	AmmoRigidbody.prototype.setTransformFromEntity = function (entity) {
		var gooPos = entity.transformComponent.transform.translation;
		tmpTransform.setIdentity();
		tmpTransform.setOrigin(new Ammo.btVector3(gooPos.x, gooPos.y, gooPos.z)); // TODO: use tmp vec/quat
		tmpGooQuat.fromRotationMatrix(entity.transformComponent.transform.rotation);
		var q = tmpGooQuat;
		tmpTransform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));
		this.ammoBody.setWorldTransform(tmpTransform);
	};

	AmmoRigidbody.prototype.applyForce = function (force) {
		tmpVector.setValue(force.x, force.y, force.z);
		tmpVector2.setValue(0, 0, 0);
		this.ammoBody.applyForce(tmpVector, tmpVector2);
	};

	AmmoRigidbody.prototype.setVelocity = function (velocity) {
		tmpVector.setValue(velocity.x, velocity.y, velocity.z);
		this.ammoBody.setLinearVelocity(tmpVector);
	};

	AmmoRigidbody.prototype.setPosition = function (pos) {
		tmpVector.setValue(pos.x, pos.y, pos.z);
		this.ammoBody.getWorldTransform().setOrigin(tmpVector);
	};

	AmmoRigidbody.prototype.getPosition = function (targetVector) {
		var p = this.ammoBody.getWorldTransform();
		var origin = p.getOrigin();
		targetVector.setDirect(origin.getX(), origin.getY(), origin.getZ());
	};

	AmmoRigidbody.prototype.setQuaternion = function (quat) {
		var p = this.ammoBody.getWorldTransform();
		tmpQuat.setValue(quat.x, quat.y, quat.z, quat.w);
		p.setRotation(tmpQuat);
	};

	AmmoRigidbody.prototype.getQuaternion = function (targetQuat) {
		var t = this.ammoBody.getWorldTransform();
		var aq = t.getRotation();
		targetQuat.setDirect(aq.getX(), aq.getY(), aq.getZ(), aq.getW());
	};

	AmmoRigidbody.prototype.setAngularVelocity = function (angularVelocity) {
		this.cannonBody.angularVelocity.copy(angularVelocity);
	};

	AmmoRigidbody.prototype.initialize = function (entity, system) {
		var gooTransform = entity.transformComponent.worldTransform;
		var gooPos = gooTransform.translation;
		var gooRot = gooTransform.rotation;

		var ammoTransform = new Ammo.btTransform();
		ammoTransform.setIdentity();
		ammoTransform.setOrigin(new Ammo.btVector3(gooPos.x, gooPos.y, gooPos.z));
		var q = tmpGooQuat;
		q.fromRotationMatrix(gooRot);
		ammoTransform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));

		var shape = this.constructAmmoShape(entity);

		var motionState = new Ammo.btDefaultMotionState(ammoTransform);
		var localInertia = new Ammo.btVector3(0, 0, 0);

		// rigidbody is dynamic if and only if mass is non zero, otherwise static
		if (entity.rigidbodyComponent.mass !== 0.0) {
			shape.calculateLocalInertia(entity.rigidbodyComponent.mass, localInertia);
		}

		var info = new Ammo.btRigidBodyConstructionInfo(entity.rigidbodyComponent.mass, motionState, shape, localInertia);
		this.localInertia = localInertia;
		this.ammoBody = new Ammo.btRigidBody(info);
		system.world.addRigidBody(this.ammoBody);
		this.setVelocity(entity.rigidbodyComponent.initialVelocity);
		//this.body.setLinearFactor(this.linearFactor);
	};

	AmmoRigidbody.prototype.constructAmmoShape = function (entity) {
		var shape;
		var numColliders = 0;
		var collider;
		this.traverseColliders(entity, function (colliderEntity, _collider) {
			numColliders++;
			collider =_collider;
		});

		shape = new Ammo.btCompoundShape();
		this.traverseColliders(entity, function (colliderEntity, collider, localPosition, localQuaternion){

			// Get local transform
			var localTrans = tmpTransform;
			localTrans.setIdentity();
			localTrans.setOrigin(new Ammo.btVector3(localPosition.x, localPosition.y, localPosition.z));
			localTrans.setRotation(new Ammo.btQuaternion(localQuaternion.x, localQuaternion.y, localQuaternion.z, localQuaternion.w));

			// Get the shape
			var childShape;
			var collider = colliderEntity.colliderComponent.collider;

			if (collider instanceof BoxCollider) {
				var halfExtents = new Ammo.btVector3(collider.halfExtents.x, collider.halfExtents.y, collider.halfExtents.z);
				childShape = new Ammo.btBoxShape(halfExtents);

			} else if (collider instanceof SphereCollider) {
				childShape = new Ammo.btSphereShape(collider.radius);

			} else if (collider instanceof PlaneCollider) {
				childShape = new Ammo.btStaticPlaneShape(new Ammo.btVector3(0, 0, 1), 0);

			} else if (collider instanceof CylinderCollider) {
				childShape = new Ammo.btCylinderShapeZ(new Ammo.btVector3(collider.height / 2, collider.radiusTop, collider.radiusTop));

			} else if (collider instanceof TerrainCollider) {
				// childShape = new CANNON.Heightfield(collider.data);
			}

			if (childShape) {
				shape.addChildShape(localTrans, childShape);
			}
		});

		return shape;
	};

	AmmoRigidbody.prototype.initializeJoint = function (joint, entity, system) {
		var bodyA = entity.rigidbodyComponent.rigidbody.ammoBody;
		var bodyB = joint.connectedEntity.rigidbodyComponent.rigidbody.ammoBody;

		var constraint;

		if (joint instanceof BallJoint) {
			var pivotInA = new Ammo.btVector3();
			var pivotInB = new Ammo.btVector3();
			pivotInA.setValue(joint.localPivot.x, joint.localPivot.y, joint.localPivot.z);
			pivotInB = bodyA.getWorldTransform().op_mul(pivotInA);
			pivotInB = bodyB.getWorldTransform().inverse().op_mul(pivotInB);
			constraint = new Ammo.btPoint2PointConstraint(bodyA, bodyB, pivotInA, pivotInB);
		}

		if (constraint) {
			system.world.addConstraint(constraint, joint.collideConnected);
			joint.joint = constraint;
		}
	};

	return AmmoRigidbody;
});
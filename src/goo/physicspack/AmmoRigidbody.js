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
	/* jslint bitwise: true */

	var tmpTransform;
	var tmpVector;
	var tmpVector2;
	var tmpQuat;
	var tmpGooQuat = new Quaternion();

	/**
	 * @class
	 * @param {Entity} entity
	 * @extends Rigidbody
	 */
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
		tmpVector.setValue(angularVelocity.x, angularVelocity.y, angularVelocity.z);
		this.ammoBody.setAngularVelocity(tmpVector);
	};

	AmmoRigidbody.prototype.setLinearDamping = function (linearDamping) {
		this.ammoBody.setDamping(linearDamping, this.entity.rigidbodyComponent.angularDamping);
	};

	AmmoRigidbody.prototype.setAngularDamping = function (angularDamping) {
		this.ammoBody.setDamping(this.entity.rigidbodyComponent.linearDamping, angularDamping);
	};

	AmmoRigidbody.prototype.setCollisionGroup = function (/*collisionGroup*/) {
		this.entity.rigidbodyComponent._dirty = true;
	};

	AmmoRigidbody.prototype.setCollisionMask = function (/*collisionMask*/) {
		this.entity.rigidbodyComponent._dirty = true;
	};

	AmmoRigidbody.prototype.setFriction = function (friction) {
		this.ammoBody.set_m_friction(friction);
	};

	AmmoRigidbody.prototype.setRestitution = function (restitution) {
		this.ammoBody.set_m_restitution(restitution);
	};

	AmmoRigidbody.prototype.updateKinematic = function (entity) {
		var body = this.ammoBody;
        if (body.getMotionState()) {
            var pos = entity.transformComponent.worldTransform.translation;
            tmpGooQuat.fromRotationMatrix(entity.transformComponent.worldTransform.rotation);
            tmpTransform.setIdentity();
            tmpTransform.getOrigin().setValue(pos.x, pos.y, pos.z);
            tmpQuat.setValue(tmpGooQuat.x, tmpGooQuat.y, tmpGooQuat.z, tmpGooQuat.w);
            tmpTransform.setRotation(tmpQuat);
            body.getMotionState().setWorldTransform(tmpTransform);
        }
	};

	AmmoRigidbody.prototype.initialize = function (entity, system) {
		var rbc = entity.rigidbodyComponent;
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
		if (rbc.mass !== 0.0) {
			shape.calculateLocalInertia(rbc.mass, localInertia);
		}

		var info = new Ammo.btRigidBodyConstructionInfo(rbc.mass, motionState, shape, localInertia);
		this.localInertia = localInertia;
		var body = this.ammoBody = new Ammo.btRigidBody(info);
		if (rbc.isKinematic) {
			body.setCollisionFlags(body.getCollisionFlags() | AmmoRigidbody.AmmoFlags.CF_KINEMATIC_OBJECT);
			body.setActivationState(AmmoRigidbody.AmmoFlags.DISABLE_DEACTIVATION);
		}

		if (typeof(rbc.collisionGroup) !== 'undefined' && typeof(rbc.collisionMask) !== 'undefined') {
			system.world.addRigidBody(this.ammoBody, rbc.collisionGroup, rbc.collisionMask);
		} else {
			system.world.addRigidBody(this.ammoBody);
		}
		this.setVelocity(rbc.initialVelocity);
		//this.body.setLinearFactor(this.linearFactor);
	};

	AmmoRigidbody.AmmoFlags = {
		// See http://bulletphysics.org/Bullet/BulletFull/classbtCollisionObject.html
		CF_STATIC_OBJECT: 1,
		CF_KINEMATIC_OBJECT: 2,
		CF_NO_CONTACT_RESPONSE: 4,
		CF_CUSTOM_MATERIAL_CALLBACK: 8,
		CF_CHARACTER_OBJECT: 16,
		CF_DISABLE_VISUALIZE_OBJECT: 32,
		CF_DISABLE_SPU_COLLISION_PROCESSING: 64,

		// http://bulletphysics.org/Bullet/BulletFull/btCollisionObject_8h.html
		ACTIVE_TAG: 1,
		ISLAND_SLEEPING: 2,
		WANTS_DEACTIVATION: 3,
		DISABLE_DEACTIVATION: 4,
		DISABLE_SIMULATION: 5
	};

	AmmoRigidbody.prototype.constructAmmoShape = function (entity) {
		var shape;
		var numColliders = 0;
		var collider;
		this.traverseColliders(entity, function (colliderEntity, _collider) {
			numColliders++;
			collider = _collider;
		});

		shape = new Ammo.btCompoundShape();
		this.traverseColliders(entity, function (colliderEntity, collider, localPosition, localQuaternion) {

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

			//} else if (collider instanceof TerrainCollider) {
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
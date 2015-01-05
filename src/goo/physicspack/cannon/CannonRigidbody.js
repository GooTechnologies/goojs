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
	'goo/physicspack/colliders/MeshCollider',
	'goo/physicspack/joints/BallJoint',
	'goo/physicspack/joints/HingeJoint'
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
	MeshCollider,
	BallJoint,
	HingeJoint
) {
	'use strict';

	/* global CANNON */
	var tmpQuat = new Quaternion();
	var tmpCannonVec;
	var tmpCannonVec2;

	/**
	 * @class
	 * @param {Entity} entity
	 * @extends Rigidbody
	 */
	function CannonRigidbody(entity) {
		Rigidbody.call(this, entity);

		/**
		 * @type {CANNON.Body}
		 */
		this.cannonBody = null;

		if (!tmpCannonVec) {
			tmpCannonVec = new CANNON.Vec3();
		}
		if (!tmpCannonVec2) {
			tmpCannonVec2 = new CANNON.Vec3();
		}
	}

	CannonRigidbody.prototype = Object.create(Rigidbody.prototype);
	CannonRigidbody.constructor = CannonRigidbody;

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
		tmpCannonVec.copy(force);
		tmpCannonVec2.set(0, 0, 0);
		this.cannonBody.applyForce(tmpCannonVec, tmpCannonVec2);
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

	CannonRigidbody.prototype.setLinearDamping = function (linearDamping) {
		this.cannonBody.damping = linearDamping;
	};

	CannonRigidbody.prototype.setAngularDamping = function (angularDamping) {
		this.cannonBody.angularDamping = angularDamping;
	};

	CannonRigidbody.prototype.setCollisionGroup = function (collisionGroup) {
		this.cannonBody.collisionFilterGroup = collisionGroup;
	};

	CannonRigidbody.prototype.setCollisionMask = function (collisionMask) {
		this.cannonBody.collisionFilterMask = collisionMask;
	};

	CannonRigidbody.prototype.setFriction = function (friction) {
		this.cannonBody.material.friction = friction;
	};

	CannonRigidbody.prototype.setRestitution = function (restitution) {
		this.cannonBody.material.restitution = restitution;
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
				collider.radius,
				collider.radius,
				collider.height,
				collider.numSegments
			);
		} else if (collider instanceof TerrainCollider) {
			shape = new CANNON.Heightfield(collider.data);
		} else if (collider instanceof MeshCollider) {
			// Assume triangles
			if (collider.meshData.indexModes[0] !== 'triangles') {
				throw new Error('MeshCollider data must be a triangle mesh!');
			}
			shape = new CANNON.Trimesh(
				collider.meshData.getAttributeBuffer('POSITION'),
				collider.meshData.getIndexBuffer()
			);
		} else {
			console.warn('Unhandled collider: ', collider);
		}
		return shape;
	};

	CannonRigidbody.prototype.initialize = function (entity, system) {
		if (!entity.rigidbodyComponent._dirty) {
			return;
		}
		var rbc = entity.rigidbodyComponent;
		var body = this.cannonBody = new CANNON.Body({
			mass: entity.rigidbodyComponent.mass,
			material: new CANNON.Material()
		});
		system.world.addBody(body);
		system._entities[body.id] = entity;

		var initialVelocity = new CANNON.Vec3();
		initialVelocity.copy(rbc.initialVelocity);
		body.velocity.copy(initialVelocity);

		var that = this;
		this.traverseColliders(entity, function (colliderEntity, collider, position, quaternion) {
			that.addCollider(collider, position, quaternion);
		});
		if (rbc.isKinematic) {
			body.type = CANNON.Body.KINEMATIC;
		}
		this.setTransformFromEntity(entity);
	};

	CannonRigidbody.prototype.initializeJoint = function (joint, entity/*, system*/) {
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

		} else if (joint instanceof HingeJoint) {
			var pivotInA = new CANNON.Vec3();
			var pivotInB = new CANNON.Vec3();
			var axisInA = new CANNON.Vec3();
			var axisInB = new CANNON.Vec3();

			pivotInA.copy(joint.localPivot);
			axisInA.copy(joint.localAxis);

			pivotInB.copy(joint.localPivot);
			axisInB.copy(joint.localAxis);

			// Get the local pivot in bodyB
			bodyA.pointToWorldFrame(joint.localPivot, pivotInB);
			bodyB.pointToLocalFrame(pivotInB, pivotInB);

			// Get the local axis in bodyB
			bodyA.vectorToWorldFrame(joint.localAxis, axisInB);
			bodyB.vectorToLocalFrame(axisInB, axisInB);

			constraint = new CANNON.HingeConstraint(bodyA, bodyB, {
				pivotInA: pivotInA,
				pivotInB: pivotInB,
				axisInA: axisInA,
				axisInB: axisInB,
				collideConnected: joint.collideConnected
			});
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
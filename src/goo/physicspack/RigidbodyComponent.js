define([
	'goo/physicspack/AbstractRigidbodyComponent',
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
	AbstractRigidbodyComponent,
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
	 * @param {object} [settings]
	 * @param {object} [settings.isKinematic=false]
	 * @param {object} [settings.mass=1]
	 * @extends AbstractRigidbody
	 */
	function RigidbodyComponent(settings) {
		settings = settings || {};
		AbstractRigidbodyComponent.apply(this, arguments);

		this.type = 'RigidbodyComponent';

		/**
		 * @type {CANNON.Body}
		 */
		this.cannonBody = null;

		this._dirty = true;

		/**
		 * @type {Boolean}
		 */
		this.isKinematic = settings.isKinematic || false;

		/**
		 * @type {number}
		 */
		this.mass = typeof(settings.mass) !== 'undefined' ? settings.mass : 1.0;
		if (this.isKinematic) {
			this.mass = 0;
		}

		/**
		 * @type {Vector3|null}
		 */
		this.initialVelocity = settings.initialVelocity ? settings.initialVelocity.clone() : null;

		/**
		 * @type {Vector3|null}
		 */
		this.initialAngularVelocity = settings.initialAngularVelocity ? settings.initialAngularVelocity.clone() : null;

		/**
		 * @private
		 * @type {number}
		 */
		this._linearDamping = 0.01;

		/**
		 * @private
		 * @type {number}
		 */
		this._angularDamping = 0.01;

		/**
		 * @private
		 * @type {number}
		 */
		this._friction = 0.3;

		/**
		 * @private
		 * @type {number}
		 */
		this._restitution = 0;

		/**
		 * @private
		 * @type {number}
		 */
		this._collisionGroup = typeof(settings.collisionGroup) !== 'undefined' ? settings.collisionGroup : undefined;

		/**
		 * @private
		 * @type {number}
		 */
		this._collisionMask = typeof(settings.collisionMask) !== 'undefined' ? settings.collisionMask : undefined;

		if (!tmpCannonVec) {
			tmpCannonVec = new CANNON.Vec3();
			tmpCannonVec2 = new CANNON.Vec3();
		}
	}
	RigidbodyComponent.prototype = Object.create(AbstractRigidbodyComponent.prototype);
	RigidbodyComponent.constructor = RigidbodyComponent;
	RigidbodyComponent.type = 'RigidbodyComponent';

	// Get the world transform from the entity and set on the body
	RigidbodyComponent.prototype.setTransformFromEntity = function (entity) {
		var t = entity.transformComponent.transform;
		var body = this.cannonBody;
		body.position.copy(t.translation);
		var q = tmpQuat;
		q.fromRotationMatrix(t.rotation);
		body.quaternion.copy(q);
	};

	RigidbodyComponent.prototype.applyForce = function (force) {
		tmpCannonVec.copy(force);
		tmpCannonVec2.set(0, 0, 0);
		this.cannonBody.applyForce(tmpCannonVec, tmpCannonVec2);
	};

	RigidbodyComponent.prototype.setVelocity = function (velocity) {
		this.cannonBody.velocity.copy(velocity);
	};

	RigidbodyComponent.prototype.setPosition = function (pos) {
		this.cannonBody.position.copy(pos);
	};

	RigidbodyComponent.prototype.getPosition = function (targetVector) {
		var p = this.cannonBody.position;
		targetVector.setDirect(p.x, p.y, p.z);
	};

	RigidbodyComponent.prototype.setQuaternion = function (pos) {
		this.cannonBody.quaternion.copy(pos);
	};

	RigidbodyComponent.prototype.getQuaternion = function (targetQuat) {
		var q = this.cannonBody.quaternion;
		targetQuat.setDirect(q.x, q.y, q.z, q.w);
	};

	RigidbodyComponent.prototype.setAngularVelocity = function (angularVelocity) {
		this.cannonBody.angularVelocity.copy(angularVelocity);
	};

	Object.defineProperties(RigidbodyComponent.prototype, {

		restitution: {
			get: function () {
				return this.cannonBody.material.restitution;
			},
			set: function (value) {
				this.cannonBody.material.restitution = value;
			}
		},

		friction: {
			get: function () {
				return this.cannonBody.material.friction;
			},
			set: function (value) {
				this.cannonBody.material.friction = value;
			}
		},

		collisionMask: {
			get: function () {
				return this.cannonBody.collisionFilterMask;
			},
			set: function (value) {
				this.cannonBody.collisionFilterMask = value;
			}
		},

		collisionGroup: {
			get: function () {
				return this.cannonBody.collisionFilterGroup;
			},
			set: function (value) {
				this.cannonBody.collisionFilterGroup = value;
			}
		},

		linearDamping: {
			get: function () {
				return this.cannonBody.linearDamping;
			},
			set: function (value) {
				this.cannonBody.linearDamping = value;
			}
		},

		angularDamping: {
			get: function () {
				return this.cannonBody.angularDamping;
			},
			set: function (value) {
				this.cannonBody.angularDamping = value;
			}
		}
	});

	RigidbodyComponent.prototype.getCannonShape = function (collider) {
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

	RigidbodyComponent.prototype.initialize = function (entity, system) {
		if (!this._dirty) {
			return;
		}

		if (this.cannonBody) {
			this.world.removeBody(this.cannonBody);
		}

		var body = this.cannonBody = new CANNON.Body({
			mass: this.mass,
			material: new CANNON.Material()
		});
		system.world.addBody(body);
		system._entities[body.id] = entity;

		if (this.initialVelocity) {
			body.velocity.copy(this.initialVelocity);
			this.initialVelocity = null;
		}

		if (this.initialAngularVelocity) {
			body.velocity.copy(this.initialAngularVelocity);
			this.initialAngularVelocity = null;
		}

		var that = this;
		this.traverseColliders(entity, function (colliderEntity, collider, position, quaternion) {
			that.addCollider(collider, position, quaternion);
		});
		if (this.isKinematic) {
			body.type = CANNON.Body.KINEMATIC;
		}
		this.setTransformFromEntity(entity);
	};

	RigidbodyComponent.prototype.initializeJoint = function (joint) {
		var bodyA = this.cannonBody;
		var bodyB = joint.connectedEntity.rigidbodyComponent.cannonBody;
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
		} else {
			console.warn('Unhandled joint: ', joint);
		}

		if (constraint) {
			bodyA.world.addConstraint(constraint);
			joint.joint = constraint;
		}
	};

	RigidbodyComponent.prototype.addCollider = function (collider, position, quaternion) {
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

	return RigidbodyComponent;
});
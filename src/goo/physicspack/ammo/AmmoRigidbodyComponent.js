define([
	'goo/physicspack/AbstractRigidbodyComponent',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/math/Transform',
	'goo/math/Matrix3x3',
	'goo/physicspack/colliders/BoxCollider',
	'goo/physicspack/colliders/SphereCollider',
	'goo/physicspack/colliders/CylinderCollider',
	'goo/physicspack/colliders/PlaneCollider',
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
	Matrix3x3,
	BoxCollider,
	SphereCollider,
	CylinderCollider,
	PlaneCollider,
	MeshCollider,
	BallJoint,
	HingeJoint
) {
	'use strict';

	/* global Ammo */
	/* jslint bitwise: true */

	var tmpTransform;
	var tmpVector;
	var tmpVector2;
	var tmpVector3;
	var tmpVector4;
	var tmpQuat;

	var tmpGooQuat = new Quaternion();
	var tmpGooMat3 = new Matrix3x3();

	/**
	 * @class
	 * @param {object} [settings]
	 * @param {object} [settings.mass=1]
	 * @extends AbstractRigidbodyComponent
	 */
	function AmmoRigidbodyComponent(settings) {
		settings = settings || {};

		AbstractRigidbodyComponent.apply(this, arguments);

		this.type = 'AmmoRigidbodyComponent';

		/**
		 * The Ammo.btRigidbody instance. Will be created on .initialize()
		 * @type {Ammo.btRigidBody}
		 */
		this.ammoBody = null;

		/**
		 * @type {number}
		 */
		this.mass = settings.mass !== undefined ? settings.mass : 1;

		/**
		 * @private
		 * @type {number}
		 */
		this._collisionGroup = settings.collisionGroup !== undefined ? settings.collisionGroup : null;

		/**
		 * @private
		 * @type {number}
		 */
		this._collisionMask = settings.collisionMask !== undefined ? settings.collisionMask : null;

		/**
		 * @private
		 * @type {number}
		 */
		this._linearDamping = settings.linearDamping !== undefined ? settings.linearDamping : 0.01;

		/**
		 * @private
		 * @type {number}
		 */
		this._angularDamping = settings.angularDamping !== undefined ? settings.angularDamping : 0.05;

		/**
		 * @private
		 * @type {boolean}
		 */
		this._initialized = false;

		/**
		 * @private
		 * @type {Vector3}
		 */
		this._velocity = settings.velocity ? settings.velocity.clone() : new Vector3();

		/**
		 * @private
		 * @type {Vector3}
		 */
		this._angularVelocity = settings.angularVelocity ? settings.angularVelocity.clone() : new Vector3();

		/**
		 * @private
		 * @type {number}
		 */
		this._friction = settings.friction !== undefined ? settings.friction : 0.5;

		/**
		 * @private
		 * @type {number}
		 */
		this._restitution = settings.restitution !== undefined ? settings.restitution : 0;

		/**
		 * @type {Boolean}
		 */
		this.isKinematic = settings.isKinematic !== undefined ? settings.isKinematic : false;
		if (this.isKinematic) {
			this.mass = 0;
		}

		if (!tmpTransform) {
			tmpTransform = new Ammo.btTransform();
			tmpVector = new Ammo.btVector3();
			tmpVector2 = new Ammo.btVector3();
			tmpVector3 = new Ammo.btVector3();
			tmpVector4 = new Ammo.btVector3();
			tmpQuat = new Ammo.btQuaternion();
		}
	}
	AmmoRigidbodyComponent.prototype = Object.create(AbstractRigidbodyComponent.prototype);
	AmmoRigidbodyComponent.constructor = AmmoRigidbodyComponent;
	AmmoRigidbodyComponent.type = 'AmmoRigidbodyComponent';

	/**
	 * Use the local transform in the entity and set on the rigid body.
	 * @param {Entity} entity
	 */
	AmmoRigidbodyComponent.prototype.setTransformFromEntity = function (entity) {
		var gooPos = entity.transformComponent.transform.translation;
		var transform = tmpTransform;
		transform.setIdentity();
		tmpVector.setValue(gooPos.x, gooPos.y, gooPos.z);
		transform.setOrigin(tmpVector);
		tmpGooQuat.fromRotationMatrix(entity.transformComponent.transform.rotation);
		var q = tmpGooQuat;
		tmpQuat.setValue(q.x, q.y, q.z, q.w);
		transform.setRotation(tmpQuat);
		this.ammoBody.setWorldTransform(transform);
	};

	/**
	 * Apply force on the center of mass.
	 * @param  {Vector3} force
	 */
	AmmoRigidbodyComponent.prototype.applyForce = function (force) {
		tmpVector.setValue(force.x, force.y, force.z);
		tmpVector2.setValue(0, 0, 0);
		this.ammoBody.applyForce(tmpVector, tmpVector2);
	};

	/**
	 * Set the current velocity of the body.
	 * @param  {Vector3} velocity
	 */
	AmmoRigidbodyComponent.prototype.setVelocity = function (velocity) {
		tmpVector.setValue(velocity.x, velocity.y, velocity.z);
		this.ammoBody.setLinearVelocity(tmpVector);
		this._velocity.setVector(velocity);
	};

	/**
	 * Get the current velocity from the body.
	 * @param  {Vector3} targetVector
	 */
	AmmoRigidbodyComponent.prototype.getVelocity = function (targetVector) {
		var v = this.ammoBody.getLinearVelocity();
		targetVector.setDirect(v.x(), v.y(), v.z());
	};

	/**
	 * Set the current angular velocity of the body.
	 * @param  {Vector3} angularVelocity
	 */
	AmmoRigidbodyComponent.prototype.setAngularVelocity = function (angularVelocity) {
		tmpVector.setValue(angularVelocity.x, angularVelocity.y, angularVelocity.z);
		this.ammoBody.setAngularVelocity(tmpVector);
		this._angularVelocity.setVector(angularVelocity);
	};

	/**
	 * Get the current angular velocity from the body.
	 * @param  {Vector3} targetVector
	 */
	AmmoRigidbodyComponent.prototype.getAngularVelocity = function (targetVector) {
		var v = this.ammoBody.getAngularVelocity();
		targetVector.setDirect(v.x(), v.y(), v.z());
	};

	/**
	 * Set the position of (teleport) the body.
	 * @param  {Vector3} position
	 */
	AmmoRigidbodyComponent.prototype.setPosition = function (pos) {
		tmpVector.setValue(pos.x, pos.y, pos.z);
		this.ammoBody.getWorldTransform().setOrigin(tmpVector);
	};

	/**
	 * Get the position of the body.
	 * @param  {Vector3} targetVector
	 */
	AmmoRigidbodyComponent.prototype.getPosition = function (targetVector) {
		var p = this.ammoBody.getWorldTransform();
		var origin = p.getOrigin();
		targetVector.setDirect(origin.x(), origin.y(), origin.z());
	};

	/**
	 * Set the orientation of the body.
	 * @param  {Quaternion} quaternion
	 */
	AmmoRigidbodyComponent.prototype.setQuaternion = function (quat) {
		var p = this.ammoBody.getWorldTransform();
		tmpQuat.setValue(quat.x, quat.y, quat.z, quat.w);
		p.setRotation(tmpQuat);
	};

	/**
	 * Get the orientation of the body.
	 * @param  {Quaternion} targetQuat
	 */
	AmmoRigidbodyComponent.prototype.getQuaternion = function (targetQuat) {
		var t = this.ammoBody.getWorldTransform();
		var aq = t.getRotation();
		targetQuat.setDirect(aq.x(), aq.y(), aq.z(), aq.w());
	};


	Object.defineProperties(AmmoRigidbodyComponent.prototype, {

		/**
		 * @memberOf AmmoRigidbodyComponent#
		 * @type {number}
		 */
		restitution: {
			get: function () {
				return this.ammoBody.getRestitution();
			},
			set: function (value) {
				this.ammoBody.setRestitution(value);
			}
		},

		/**
		 * @memberOf AmmoRigidbodyComponent#
		 * @type {number}
		 */
		friction: {
			get: function () {
				return this.ammoBody.getFriction();
			},
			set: function (value) {
				this.ammoBody.setFriction(value);
			}
		},

		/**
		 * @memberOf AmmoRigidbodyComponent#
		 * @type {number}
		 */
		collisionMask: {
			get: function () {
				return this._collisionMask;
			},
			set: function (value) {
				this._dirty = true;
				this._collisionMask = value;
			}
		},

		/**
		 * @memberOf AmmoRigidbodyComponent#
		 * @type {number}
		 */
		collisionGroup: {
			get: function () {
				return this._collisionGroup;
			},
			set: function (value) {
				this._dirty = true;
				this._collisionGroup = value;
			}
		},

		/**
		 * @memberOf AmmoRigidbodyComponent#
		 * @type {number}
		 */
		linearDamping: {
			get: function () {
				return this._linearDamping;
			},
			set: function (value) {
				if (this.ammoBody) {
					this.ammoBody.setDamping(value, this._angularDamping);
				}
				this._linearDamping = value;
			}
		},

		/**
		 * @memberOf AmmoRigidbodyComponent#
		 * @type {number}
		 */
		angularDamping: {
			get: function () {
				return this._angularDamping;
			},
			set: function (value) {
				if (this.ammoBody) {
					this.ammoBody.setDamping(this._linearDamping, value);
				}
				this._angularDamping = value;
			}
		},
	});

	/**
	 * @private
	 * @param  {Entity} entity
	 */
	AmmoRigidbodyComponent.prototype.updateKinematic = function (entity) {
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

	/**
	 * @private
	 */
	AmmoRigidbodyComponent.prototype.destroy = function () {
		if (this.ammoBody) {
			var world = this._system.ammoWorld;
			while (this.joints.length) {
				var joint = this.joints.pop();
				world.removeConstraint(joint.ammoJoint);
				Ammo.destroy(joint.ammoJoint);
				joint.ammoJoint = null;
			}

			world.removeRigidBody(this.ammoBody);
			Ammo.destroy(this.ammoBody);
			this.ammoBody = null;
		}
		if (this._ammoShape) {
			Ammo.destroy(this._ammoShape);
			this._ammoShape = null;
		}
	};

	/**
	 * @private
	 */
	AmmoRigidbodyComponent.prototype.initialize = function () {
		var system = this._system;
		var entity = this._entity;

		if (this.ammoBody) {
			this.destroy();
		}

		var gooTransform = entity.transformComponent.transform;
		var gooPos = gooTransform.translation;
		var gooRot = gooTransform.rotation;

		var ammoTransform = tmpTransform;
		ammoTransform.setIdentity();
		tmpVector.setValue(gooPos.x, gooPos.y, gooPos.z);
		ammoTransform.setOrigin(tmpVector);

		var q = tmpGooQuat;
		q.fromRotationMatrix(gooRot);
		tmpQuat.setValue(q.x, q.y, q.z, q.w);
		ammoTransform.setRotation(tmpQuat);

		var shape = this.constructAmmoShape(entity);

		var motionState = new Ammo.btDefaultMotionState(ammoTransform);
		var localInertia = tmpVector;
		localInertia.setValue(0, 0, 0);

		// rigidbody is dynamic if and only if mass is non zero, otherwise static
		if (this.mass !== 0.0) {
			shape.calculateLocalInertia(this.mass, localInertia);
		}

		var info = new Ammo.btRigidBodyConstructionInfo(this.mass, motionState, shape, localInertia);
		var body = this.ammoBody = new Ammo.btRigidBody(info);

		// Register the body pointer, needed by the system
		var ptr = body.a || body.ptr;
		system._entities[ptr] = entity;

		if (this.isKinematic) {
			body.setCollisionFlags(body.getCollisionFlags() | AmmoRigidbodyComponent.AmmoFlags.CF_KINEMATIC_OBJECT);
			body.setActivationState(AmmoRigidbodyComponent.AmmoFlags.DISABLE_DEACTIVATION);
		}

		if (typeof(this._collisionGroup) === 'number' && typeof(this._collisionMask) === 'number') {
			system.ammoWorld.addRigidBody(body, this._collisionGroup, this._collisionMask);
		} else {
			system.ammoWorld.addRigidBody(body);
		}

		// Set initial values
		if (!this._initialized) {
			this._initialized = true;
			this.setVelocity(this._velocity);
			this.setAngularVelocity(this._angularVelocity);
			this.linearDamping = this._linearDamping;
			this.angularDamping = this._angularDamping;
			this.friction = this._friction;
			this.restitution = this._restitution;
		}

		this._ammoShape = shape;

		// //Ammo.destroy(motionState);
		// //Ammo.destroy(info);
		this.emitInitialized(entity);
	};

	/**
	 * @static
	 */
	AmmoRigidbodyComponent.AmmoFlags = {
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

	/**
	 * @private
	 */
	AmmoRigidbodyComponent.prototype.constructAmmoShape = function (entity) {
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
			var localTrans = new Ammo.btTransform();
			localTrans.setIdentity();
			tmpVector.setValue(localPosition.x, localPosition.y, localPosition.z);
			localTrans.setOrigin(tmpVector);
			tmpQuat.setValue(localQuaternion.x, localQuaternion.y, localQuaternion.z, localQuaternion.w);
			localTrans.setRotation(tmpQuat);

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
				childShape = new Ammo.btCylinderShapeZ(new Ammo.btVector3(collider.height / 2, collider.radius, collider.radius));

			} else if (collider instanceof MeshCollider) {

				var scale = collider.scale.data;
				var floatByteSize = 4;
				var use32bitIndices = true;
				var intByteSize = use32bitIndices ? 4 : 2;
				var intType = use32bitIndices ? 'i32' : 'i16';

				var meshData = collider.meshData;

				var vertices = meshData.getAttributeBuffer('POSITION');
				var vertexBuffer = Ammo.allocate(floatByteSize * vertices.length, 'float', Ammo.ALLOC_NORMAL);
				for (var i = 0, il = vertices.length; i < il; i++) {
					Ammo.setValue(vertexBuffer + i * floatByteSize, scale[i % 3] * vertices[i], 'float');
				}

				var indices = meshData.getIndexBuffer();
				var indexBuffer = Ammo.allocate(intByteSize * indices.length, intType, Ammo.ALLOC_NORMAL);
				for (var i = 0, il = indices.length; i < il; i++) {
					Ammo.setValue(indexBuffer + i * intByteSize, indices[i], intType);
				}

				var iMesh = new Ammo.btIndexedMesh();
				iMesh.set_m_numTriangles(meshData.indexCount / 3);
				iMesh.set_m_triangleIndexBase(indexBuffer);
				iMesh.set_m_triangleIndexStride(intByteSize * 3);

				iMesh.set_m_numVertices(meshData.vertexCount);
				iMesh.set_m_vertexBase(vertexBuffer);
				iMesh.set_m_vertexStride(floatByteSize * 3);

				var triangleIndexVertexArray = new Ammo.btTriangleIndexVertexArray();
				triangleIndexVertexArray.addIndexedMesh(iMesh, 2); // indexedMesh, indexType = PHY_INTEGER = 2 seems optional

				// bvh = Bounding Volume Hierarchy
				childShape = new Ammo.btBvhTriangleMeshShape(triangleIndexVertexArray, true, true); // btStridingMeshInterface, useQuantizedAabbCompression, buildBvh

			} else {
				console.warn('Unhandled collider: ', collider);
			}

			if (childShape) {
				shape.addChildShape(localTrans, childShape);
			}
		});

		return shape;
	};

	/**
	 * @private
	 */
	AmmoRigidbodyComponent.prototype.destroyJoint = function (joint) {
		if (joint.ammoJoint) {
			this._system.ammoWorld.removeConstraint(joint.ammoJoint);
			joint.ammoJoint = null;
		}
	};

	/**
	 * @private
	 */
	AmmoRigidbodyComponent.prototype.initializeJoint = function (joint, entity, system) {
		var bodyA = this.ammoBody;
		var bodyB = joint.connectedEntity.ammoRigidbodyComponent.ammoBody;

		var constraint;

		if (joint instanceof BallJoint) {
			var pivotInA = new Ammo.btVector3();
			var pivotInB = new Ammo.btVector3();
			var localPivot = joint.localPivot;
			pivotInA.setValue(localPivot.x, localPivot.y, localPivot.z);

			// Get the local pivot in B
			pivotInB = bodyA.getWorldTransform().op_mul(pivotInA);
			pivotInB = bodyB.getWorldTransform().inverse().op_mul(pivotInB);

			// Create constraint
			constraint = new Ammo.btPoint2PointConstraint(bodyA, bodyB, pivotInA, pivotInB);

		} else if (joint instanceof HingeJoint) {
			var pivotInA = new Ammo.btVector3();
			var pivotInB = new Ammo.btVector3();
			var axisInA = new Ammo.btVector3();
			var axisInB = new Ammo.btVector3();

			var localPivot = joint.localPivot;
			var localAxis = joint.localAxis;
			pivotInA.setValue(localPivot.x, localPivot.y, localPivot.z);
			axisInA.setValue(localAxis.x, localAxis.y, localAxis.z);

			// Get the pivot in B
			pivotInB = bodyA.getWorldTransform().op_mul(pivotInA);
			pivotInB = bodyB.getWorldTransform().inverse().op_mul(pivotInB);

			// Get the local axis in B
			var quatA = bodyA.getWorldTransform().getRotation();
			tmpGooQuat.set(quatA.x(), quatA.y(), quatA.z(), quatA.w());
			tmpGooMat3.copyQuaternion(tmpGooQuat);
			var worldAxis = new Vector3();
			worldAxis.setVector(joint.localAxis);
			tmpGooMat3.applyPre(worldAxis); // Transform the localAxisA into world

			var quatB = bodyB.getWorldTransform().getRotation();
			tmpGooQuat.set(quatB.x(), quatB.y(), quatB.z(), quatB.w());
			tmpGooMat3.copyQuaternion(tmpGooQuat);
			tmpGooMat3.invert().applyPre(worldAxis); // Transform the world axis to local in B
			axisInB.setValue(worldAxis.x, worldAxis.y, worldAxis.z);

			constraint = new Ammo.btHingeConstraint(bodyA, bodyB, pivotInA, pivotInB, axisInA, axisInB, false);
		}

		if (constraint) {
			system.ammoWorld.addConstraint(constraint, joint.collideConnected);
			joint.ammoJoint = constraint;
		}
	};

	/**
	 * Clone the component.
	 */
	AmmoRigidbodyComponent.prototype.clone = function () {
		return new AmmoRigidbodyComponent({
			mass: this._mass,
			isKinematic: this._isKinematic,
			linearDamping: this._linearDamping,
			angularDamping: this._angularDamping,
			collisionMask: this._collisionMask,
			collisionGroup: this._collisionGroup,
			friction: this._friction,
			restitution: this._restitution
		});
	};

	/**
	 * @private
	 * @virtual
	 * @param entity
	 */
	AmmoRigidbodyComponent.prototype.attached = function (entity) {
		this._entity = entity;
		this._system = entity._world.getSystem('AmmoPhysicsSystem');
	};

	return AmmoRigidbodyComponent;
});
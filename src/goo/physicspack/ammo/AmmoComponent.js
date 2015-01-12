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
	'goo/physicspack/colliders/TerrainCollider',
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
	TerrainCollider,
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
	 * @param {Entity} entity
	 * @param {object} [settings]
	 * @param {object} [settings.mass=1]
	 * @extends AbstractRigidbodyComponent
	 */
	function AmmoComponent(settings) {
		settings = settings || {};

		AbstractRigidbodyComponent.apply(this, arguments);

		this.type = 'AmmoComponent';

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
		this._collisionGroup = null;

		/**
		 * @private
		 * @type {number}
		 */
		this._collisionMask = null;

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
		this._friction = 0.3;

		/**
		 * @private
		 * @type {number}
		 */
		this._restitution = 0;

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
	AmmoComponent.prototype = Object.create(AbstractRigidbodyComponent.prototype);
	AmmoComponent.constructor = AmmoComponent;
	AmmoComponent.type = 'AmmoComponent';

	AmmoComponent.prototype.setTransformFromEntity = function (entity) {
		var gooPos = entity.transformComponent.transform.translation;
		tmpTransform.setIdentity();
		tmpTransform.setOrigin(new Ammo.btVector3(gooPos.x, gooPos.y, gooPos.z)); // TODO: use tmp vec/quat
		tmpGooQuat.fromRotationMatrix(entity.transformComponent.transform.rotation);
		var q = tmpGooQuat;
		tmpTransform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));
		this.ammoBody.setWorldTransform(tmpTransform);
	};

	AmmoComponent.prototype.applyForce = function (force) {
		tmpVector.setValue(force.x, force.y, force.z);
		tmpVector2.setValue(0, 0, 0);
		this.ammoBody.applyForce(tmpVector, tmpVector2);
	};

	AmmoComponent.prototype.setVelocity = function (velocity) {
		tmpVector.setValue(velocity.x, velocity.y, velocity.z);
		this.ammoBody.setLinearVelocity(tmpVector);
		this._velocity.setVector(velocity);
	};

	AmmoComponent.prototype.setPosition = function (pos) {
		tmpVector.setValue(pos.x, pos.y, pos.z);
		this.ammoBody.getWorldTransform().setOrigin(tmpVector);
	};

	AmmoComponent.prototype.getPosition = function (targetVector) {
		var p = this.ammoBody.getWorldTransform();
		var origin = p.getOrigin();
		targetVector.setDirect(origin.x(), origin.y(), origin.z());
	};

	AmmoComponent.prototype.setQuaternion = function (quat) {
		var p = this.ammoBody.getWorldTransform();
		tmpQuat.setValue(quat.x, quat.y, quat.z, quat.w);
		p.setRotation(tmpQuat);
	};

	AmmoComponent.prototype.getQuaternion = function (targetQuat) {
		var t = this.ammoBody.getWorldTransform();
		var aq = t.getRotation();
		targetQuat.setDirect(aq.x(), aq.y(), aq.z(), aq.w());
	};

	AmmoComponent.prototype.setAngularVelocity = function (angularVelocity) {
		tmpVector.setValue(angularVelocity.x, angularVelocity.y, angularVelocity.z);
		this.ammoBody.setAngularVelocity(tmpVector);
		this._angularVelocity.setVector(angularVelocity);
	};

	Object.defineProperties(AmmoComponent.prototype, {

		restitution: {
			get: function () {
				return this.ammoBody.get_m_restitution();
			},
			set: function (value) {
				this.ammoBody.set_m_restitution(value);
			}
		},

		friction: {
			get: function () {
				return this.ammoBody.get_m_friction();
			},
			set: function (value) {
				this.ammoBody.set_m_friction(value);
			}
		},

		collisionMask: {
			get: function () {
				return this._collisionMask;
			},
			set: function (value) {
				this._dirty = true;
				this._collisionMask = value;
			}
		},

		collisionGroup: {
			get: function () {
				return this._collisionGroup;
			},
			set: function (value) {
				this._dirty = true;
				this._collisionGroup = value;
			}
		}
	});

	AmmoComponent.prototype.updateKinematic = function (entity) {
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

	AmmoComponent.prototype.initialize = function (entity, system) {
		if (this.ammoBody) {
			system.world.removeRigidBody(this.ammoBody);
			Ammo.destroy(this.ammoBody);
		}

		var gooTransform = entity.transformComponent.transform;
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
		if (this.mass !== 0.0) {
			shape.calculateLocalInertia(this.mass, localInertia);
		}

		var info = new Ammo.btRigidBodyConstructionInfo(this.mass, motionState, shape, localInertia);
		this.localInertia = localInertia;
		var body = this.ammoBody = new Ammo.btRigidBody(info);

		// Register the body pointer, needed by the system
		var ptr = body.a || body.ptr;
		system._entities[ptr] = entity;

		if (this.isKinematic) {
			body.setCollisionFlags(body.getCollisionFlags() | AmmoComponent.AmmoFlags.CF_KINEMATIC_OBJECT);
			body.setActivationState(AmmoComponent.AmmoFlags.DISABLE_DEACTIVATION);
		}

		if (typeof(this.collisionGroup) === 'number' && typeof(this.collisionMask) === 'number') {
			system.world.addRigidBody(this.ammoBody, this.collisionGroup, this.collisionMask);
		} else {
			system.world.addRigidBody(this.ammoBody);
		}

		if (!this._initialized) {
			this._initialized = true;
			this.setVelocity(this._velocity);
			this.setAngularVelocity(this._velocity);
		}
	};

	AmmoComponent.AmmoFlags = {
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

	AmmoComponent.prototype.constructAmmoShape = function (entity) {
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
				childShape = new Ammo.btCylinderShapeZ(new Ammo.btVector3(collider.height / 2, collider.radius, collider.radius));

			//} else if (collider instanceof TerrainCollider) {
				// childShape = new CANNON.Heightfield(collider.data); // TODO

			} else if (collider instanceof TerrainCollider) {

				var scale = scale || [1, 1, 1];
				var floatByteSize = 4;
				var use32bitIndices = true;
				var intByteSize = use32bitIndices ? 4 : 2;
				var intType = use32bitIndices ? 'i32' : 'i16';

				var meshData = entity.meshDataComponent.meshData;

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

	AmmoComponent.prototype.initializeJoint = function (joint, entity, system) {
		var bodyA = this.ammoBody;
		var bodyB = joint.connectedEntity.ammoComponent.ammoBody;

		var constraint;

		if (joint instanceof BallJoint) {
			var pivotInA = tmpVector;
			var pivotInB = tmpVector2;
			var localPivot = joint.localPivot;
			pivotInA.setValue(localPivot.x, localPivot.y, localPivot.z);

			// Get the local pivot in B
			pivotInB = bodyA.getWorldTransform().op_mul(pivotInA);
			pivotInB = bodyB.getWorldTransform().inverse().op_mul(pivotInB);

			// Create constraint
			constraint = new Ammo.btPoint2PointConstraint(bodyA, bodyB, pivotInA, pivotInB);

		} else if (joint instanceof HingeJoint) {
			var pivotInA = tmpVector;
			var pivotInB = tmpVector2;
			var axisInA = tmpVector3;
			var axisInB = tmpVector4;

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
			system.world.addConstraint(constraint, joint.collideConnected);
			joint.joint = constraint;
		}
	};

	return AmmoComponent;
});
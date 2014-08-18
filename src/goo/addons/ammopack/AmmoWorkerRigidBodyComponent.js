/* global Ammo */
define([
	'goo/entities/components/Component',
	'goo/math/Quaternion'
],
/** @lends */
function (
	Component,
	Quaternion
) {
	'use strict';

	var tmpQuat = new Quaternion();
	var ammoTransform = new Ammo.btTransform();

	var tmpAmmoVec;
	function numToTempAmmoVector(x, y, z) {
			tmpAmmoVec = new Ammo.btVector3(x, y, z);
		return tmpAmmoVec;
	}
	function arrayToTempAmmoVector(a) {
		return numToTempAmmoVector(a[0], a[1], a[2]);
	}
	function arrayToAmmoVector(a) {
		return new Ammo.btVector3(a[0], a[1], a[2]);
	}
	var tmpAmmoQuat;
	function numToTempAmmoQuat(x, y, z, w) {
			tmpAmmoQuat = new Ammo.btQuaternion(x, y, z, w);
		return tmpAmmoQuat;
	}
	function arrayToTempAmmoQuat(a) {
		return numToTempAmmoQuat(a[0], a[1], a[2], a[3]);
	}
	function fillTerrainHeightBuffer(buffer, heights) {
		var floatByteSize = 4;
		for (var i = 0, il = heights.length; i < il; i ++) {
			Ammo.setValue(buffer + i * floatByteSize, heights[i], 'float');
		}
	}

	/**
	 * @class Adds threaded Ammo physics to an entity. Should be combined with one of the AmmoCollider components, such as the @link{AmmoSphereColliderComponent}. Also see {@link AmmoWorkerSystem}.
	 * @extends Component
	 * @param {object} [settings]
	 * @param {number} [settings.mass=1]
	 * @param {number} [settings.type] Must be set to AmmoWorkerRigidbodyComponent.DYNAMIC, KINEMATIC, or STATIC. Defaults to DYNAMIC.
	 */
	function AmmoWorkerRigidbodyComponent(settings) {
		this.type = 'AmmoWorkerRigidbodyComponent';

		settings = settings || {};

		/**
		 * @type {Entity}
		 */
		this.entity = null;

		this._mass = settings.mass;

		this._friction = null;
		this._restitution = null;
		this._bodyType = null;
		this._collisionFlags = null;
	}
	AmmoWorkerRigidbodyComponent.prototype = Object.create(Component.prototype);
	AmmoWorkerRigidbodyComponent.constructor = AmmoWorkerRigidbodyComponent;

	/**
	 * Dynamic object. Has a nonzero finite mass and responds to forces.
	 * @static
	 * @type {Number}
	 */
	AmmoWorkerRigidbodyComponent.DYNAMIC = 1;

	/**
	 * Static object. Non-moving and infinite mass.
	 * @static
	 * @type {Number}
	 */
	AmmoWorkerRigidbodyComponent.STATIC = 2;

	/**
	 * Kinematic body. Infinite mass but can move.
	 * @static
	 * @type {Number}
	 */
	AmmoWorkerRigidbodyComponent.KINEMATIC = 4;

	AmmoWorkerRigidbodyComponent.ACTIVE = 1;
	AmmoWorkerRigidbodyComponent.ISLAND_SLEEPING = 2;
	AmmoWorkerRigidbodyComponent.WANTS_DEACTIVATION = 3;
	AmmoWorkerRigidbodyComponent.DISABLE_DEACTIVATION = 4;
	AmmoWorkerRigidbodyComponent.DISABLE_SIMULATION = 5;

	AmmoWorkerRigidbodyComponent.STATIC_OBJECT = 1;
	AmmoWorkerRigidbodyComponent.KINEMATIC_OBJECT = 2;
	AmmoWorkerRigidbodyComponent.NO_CONTACT_RESPONSE = 4;
	AmmoWorkerRigidbodyComponent.CUSTOM_MATERIAL_CALLBACK = 8;
	AmmoWorkerRigidbodyComponent.CHARACTER_OBJECT = 16;
	AmmoWorkerRigidbodyComponent.DISABLE_VISUALIZE_OBJECT = 32;
	AmmoWorkerRigidbodyComponent.DISABLE_SPU_COLLISION_PROCESSING = 64;



	/**
	 * Convert a shape config to an instance of Ammo shape.
	 * @param  {object} shapeConfig
	 * @return {Ammo.btBoxShape|Ammo.btSphereShape}
	 */
	function getAmmoShape(shapeConfig /*, bodyConfig*/) {
		'use strict';

		var shape;
		switch (shapeConfig.type) {

		case 'box':
			var extents = arrayToTempAmmoVector(shapeConfig.halfExtents);
			shape = new Ammo.btBoxShape(extents);
			break;

		case 'sphere':
			shape = new Ammo.btSphereShape(shapeConfig.radius);
			break;

		case 'cylinder':
			shape = new Ammo.btCylinderShapeZ(arrayToTempAmmoVector(shapeConfig.halfExtents));
			break;

		case 'plane':
			shape = new Ammo.btStaticPlaneShape(arrayToTempAmmoVector(shapeConfig.normal), shapeConfig.planeConstant);
			break;

		case 'terrain':
			var floatByteSize = 4;
			var heightBuffer = Ammo.allocate(floatByteSize * shapeConfig.numWidthPoints * shapeConfig.numLengthPoints, 'float', Ammo.ALLOC_NORMAL);

			fillTerrainHeightBuffer(heightBuffer, shapeConfig.heights);

			var heightDataType = 0;

			shape = new Ammo.btHeightfieldTerrainShape(
				shapeConfig.numWidthPoints,
				shapeConfig.numLengthPoints,
				heightBuffer,
				shapeConfig.heightScale, // 1.0
				shapeConfig.minHeight,
				shapeConfig.maxHeight,
				shapeConfig.upAxis, // 1 == y
				heightDataType,
				shapeConfig.flipQuadEdges // false
			);

			shape.heightBuffer = heightBuffer;

			var sx = shapeConfig.width / (shapeConfig.numWidthPoints - 1);
			var sz = shapeConfig.length / (shapeConfig.numLengthPoints - 1);
			var sy = 1.0;
			var sizeVector = arrayToTempAmmoVector([sx, sy, sz]);
			shape.setLocalScaling(sizeVector);
			break;

		case 'trianglemesh':
			var scale = [1, 1, 1];
			var floatByteSize = 4;
			var use32bitIndices = true;
			var intByteSize = use32bitIndices ? 4 : 2;
			var intType = use32bitIndices ? 'i32' : 'i16';

			var vertices = shapeConfig.vertices; // meshData.dataViews.POSITION;
			var vertexBuffer = Ammo.allocate(floatByteSize * vertices.length, 'float', Ammo.ALLOC_NORMAL);

			for (var i = 0, il = vertices.length; i < il; i ++) {
				Ammo.setValue(vertexBuffer + i * floatByteSize, scale[i % 3] * vertices[i], 'float');
			}

			var indices = shapeConfig.indices; // meshData.indexData.data;
			var indexBuffer = Ammo.allocate(intByteSize * indices.length, intType, Ammo.ALLOC_NORMAL);
			for (var i = 0, il = indices.length; i < il; i++) {
				Ammo.setValue(indexBuffer + i * intByteSize, indices[i], intType);
			}

			var iMesh = new Ammo.btIndexedMesh();
			iMesh.set_m_numTriangles(shapeConfig.indexCount/*meshData.indexCount / 3*/);
			iMesh.set_m_triangleIndexBase(indexBuffer);
			iMesh.set_m_triangleIndexStride(intByteSize * 3);

			iMesh.set_m_numVertices(shapeConfig.vertexCount/*meshData.vertexCount*/);
			iMesh.set_m_vertexBase(vertexBuffer);
			iMesh.set_m_vertexStride(floatByteSize * 3);

			var triangleIndexVertexArray = new Ammo.btTriangleIndexVertexArray();
			triangleIndexVertexArray.addIndexedMesh(iMesh, 2); // indexedMesh, indexType = PHY_INTEGER = 2 seems optional

			// bvh = Bounding Volume Hierarchy
			shape = new Ammo.btBvhTriangleMeshShape(triangleIndexVertexArray, true, true); // btStridingMeshInterface, useQuantizedAabbCompression, buildBvh

			break;

		default:
			throw new Error('Shape type not recognized: ' + shapeConfig.type);
		}

		//colliderIdToAmmoShapeMap[shapeConfig.id] = shape;

		return shape;
	}


	/**
	 * Handles attaching itself to an entity.
	 * @private
	 * @param entity
	 */
	AmmoWorkerRigidbodyComponent.prototype.attached = function (entity) {
		this.entity = entity;
	};

	AmmoWorkerRigidbodyComponent.prototype.detached = function (/*entity*/) {
		this.entity = null;
	};

	function proxy(name) {
		AmmoWorkerRigidbodyComponent.prototype.api[name] = function () {
			AmmoWorkerRigidbodyComponent.prototype[name].apply(this.ammoWorkerRigidbodyComponent, arguments);
			return this;
		};
	}

	AmmoWorkerRigidbodyComponent.prototype.api = {
		setLinearVelocity: function () {
			AmmoWorkerRigidbodyComponent.prototype.setLinearVelocity.apply(this.ammoWorkerRigidbodyComponent, arguments);
			return this;
		},
		setAngularVelocity: function () {
			AmmoWorkerRigidbodyComponent.prototype.setAngularVelocity.apply(this.ammoWorkerRigidbodyComponent, arguments);
			return this;
		},
		setCenterOfMassTransform: function () {
			AmmoWorkerRigidbodyComponent.prototype.setCenterOfMassTransform.apply(this.ammoWorkerRigidbodyComponent, arguments);
			return this;
		},
		setAngularFactor: function () {
			AmmoWorkerRigidbodyComponent.prototype.setAngularFactor.apply(this.ammoWorkerRigidbodyComponent, arguments);
			return this;
		},
		setLinearFactor: function () {
			AmmoWorkerRigidbodyComponent.prototype.setLinearFactor.apply(this.ammoWorkerRigidbodyComponent, arguments);
			return this;
		}
	};

	proxy('setCollisionFlags');

	/**
	 * Scans attached colliders and instructs the worker to create the body.
	 */
	AmmoWorkerRigidbodyComponent.prototype._add = function () {
		var entity = this.entity;

		// Check if there are colliders on the second level
		var colliders = [];
		entity.traverse(function (child, level) {
			if (level === 1 && child.colliderComponent) {
				colliders.push(child);
			}
		});

		// Check if the root entity has a collider
		if (entity.colliderComponent) {
			colliders.push(entity);
		}

		if (!colliders.length) {
			return;
		}

		var shapeConfigs = [];

		// Update transforms
		entity.transformComponent.updateTransform();
		entity.transformComponent.updateWorldTransform();
		for (var j = 0; j < colliders.length; j++) {
			var colliderEntity = colliders[j];
			colliderEntity.transformComponent.updateTransform();
			colliderEntity.transformComponent.updateWorldTransform();
		}

		for (var j = 0; j < colliders.length; j++) {
			var colliderEntity = colliders[j];

			var colliderComponent = colliderEntity.colliderComponent;
			var shapeConfig = colliderComponent.collider.serialize();

			// Add collider id
			shapeConfig.id = colliderEntity.id;

			if (shapeConfig) {
				if (colliderEntity !== entity) {

					// Add local transform
					var pos = colliderEntity.transformComponent.transform.translation;
					shapeConfig.localPosition = v2a(pos);

					var rot = colliderEntity.transformComponent.transform.rotation;
					tmpQuat.fromRotationMatrix(rot);

					shapeConfig.localRotation = v2a(tmpQuat);
				}
				shapeConfigs.push(shapeConfig);
			}
		}

		// Allow no shapes?
		if (!shapeConfigs.length) {
			return;
		}

		var gooPos = entity.transformComponent.worldTransform.translation;
		var gooRot = entity.transformComponent.worldTransform.rotation;

		tmpQuat.fromRotationMatrix(gooRot);

		var bodyConfig = {
			command: 'addBody',
			id: entity.id,
			mass: entity.ammoWorkerRigidbodyComponent._mass || 0,
			friction: entity.ammoWorkerRigidbodyComponent._friction,
			restitution: entity.ammoWorkerRigidbodyComponent._restitution,
			position: v2a(gooPos),
			rotation: v2a(tmpQuat),
			shapes: shapeConfigs,
			type: entity.ammoWorkerRigidbodyComponent._bodyType,
			collisionFlags: entity.ammoWorkerRigidbodyComponent._collisionFlags
		};

		var shape, shapeConfig;

		if (bodyConfig.shapes.length === 1 && !bodyConfig.shapes[0].localPosition) {
			// One collider primitive, no local transform.
			shapeConfig = bodyConfig.shapes[0];
			shape = getAmmoShape(shapeConfig, bodyConfig);
		} else {
			/*
			// More than one collider primitive or collider with offset
			shape = new Ammo.btCompoundShape();
			var localTrans = ammoTransform;
			for (var j = 0; j < bodyConfig.shapes.length; j++) {
				shapeConfig = bodyConfig.shapes[j];
				var childAmmoShape = getAmmoShape(shapeConfig, bodyConfig);
				var pos = shapeConfig.localPosition;
				var quat = shapeConfig.localRotation;
				localTrans.setIdentity();
				localTrans.setOrigin(arrayToTempAmmoVector(pos));
				localTrans.setRotation(arrayToTempAmmoQuat(quat));
				shape.addChildShape(localTrans, childAmmoShape);
			}
			*/
		}

		if (!shape) {
			return;
		}

		// Get body transform
		var trans = new Ammo.btTransform();
		trans.setIdentity();
		trans.setOrigin(arrayToTempAmmoVector(bodyConfig.position));
		trans.setRotation(arrayToTempAmmoQuat(bodyConfig.rotation));

		/*
		if (bodyConfig.type === 4) {
			bodyConfig.mass = 0;
		}
		*/

		var motionState = new Ammo.btDefaultMotionState(trans);
		var localInertia = new Ammo.btVector3(0, 0, 0);

		if (bodyConfig.mass !== 0) {
			shape.calculateLocalInertia(bodyConfig.mass, localInertia);
		}

		var info = new Ammo.btRigidBodyConstructionInfo(bodyConfig.mass, motionState, shape, localInertia);
		if (typeof(bodyConfig.friction) === 'number') {
			info.set_m_friction(bodyConfig.friction);
		}
		if (typeof(bodyConfig.restitution) === 'number') {
			info.set_m_restitution(bodyConfig.restitution);
		}
		var body = new Ammo.btRigidBody(info);
		Ammo.destroy(info);

		/*
		if (bodyConfig.type === 4) {
			body.setCollisionFlags(body.getCollisionFlags() | collisionFlags.KINEMATIC_OBJECT);
			body.setActivationState(activationStates.DISABLE_DEACTIVATION);
		}
		*/

		if (bodyConfig.collisionFlags) {
			body.setCollisionFlags(bodyConfig.collisionFlags);
		}
		if (bodyConfig.activationState) {
			body.setActivationState(bodyConfig.activationState);
		}

		this._system.ammoWorld.addRigidBody(body);

		this.body = body;
	};

	AmmoWorkerRigidbodyComponent.prototype.setLinearFactor = function (linearFactor) {
	};
	AmmoWorkerRigidbodyComponent.prototype.setAngularFactor = function (angularFactor) {
	};
	AmmoWorkerRigidbodyComponent.prototype.setFriction = function (friction) {
	};
	AmmoWorkerRigidbodyComponent.prototype.setSleepingThresholds = function (linear, angular) {
	};
	AmmoWorkerRigidbodyComponent.prototype.activate = function () {
	};
	AmmoWorkerRigidbodyComponent.prototype.setActivationState = function (activationState) {
	};
	AmmoWorkerRigidbodyComponent.prototype.setCollisionFlags = function (collisionFlags) {
	};
	AmmoWorkerRigidbodyComponent.prototype.setCenterOfMassTransform = function (position, quaternion) {
	};
	AmmoWorkerRigidbodyComponent.prototype.setLinearVelocity = function (velocity) {
		// this.body.setLinearVelocity(arrayToTempAmmoVector(velocity));
	};

	/**
	 * Set the angular velocity of the body
	 * @param {Vector3} velocity
	 */
	AmmoWorkerRigidbodyComponent.prototype.setAngularVelocity = function (velocity) {
	};
	AmmoWorkerRigidbodyComponent.prototype.applyCentralImpulse = function (impulse) {
	};
	AmmoWorkerRigidbodyComponent.prototype.applyCentralForce = function (force) {
	};
	AmmoWorkerRigidbodyComponent.prototype.enableCharacterController = function (ray) {
	};
	AmmoWorkerRigidbodyComponent.prototype.disableCharacterController = function () {
	};
	AmmoWorkerRigidbodyComponent.prototype.setCharacterVelocity = function (velocity, angularVelocity) {
	};
	AmmoWorkerRigidbodyComponent.prototype.characterJump = function (jumpImpulse) {
	};
	AmmoWorkerRigidbodyComponent.prototype.enableVehicle = function (settings) {
		/*
		if (!settings) {
			// Default config
			settings = {
				wheels: [{
					radius: 1,
					position: [-1, 0.0, 1.0],
					direction: [0, -1, 0],
					axle: [-1, 0, 0],
					suspensionLength: 0.3,
					m_suspensionStiffness: 20,
					m_wheelsDampingRelaxation: 2.3,
					m_wheelsDampingCompression: 4.4,
					m_frictionSlip: 1000,
					m_rollInfluence: 0.01,
					isFrontWheel: true,
				}, {
					radius: 1,
					position: [1, 0.0, 1.0],
					direction: [0, -1, 0],
					axle: [-1, 0, 0],
					suspensionLength: 0.3,
					m_suspensionStiffness: 20,
					m_wheelsDampingRelaxation: 2.3,
					m_wheelsDampingCompression: 4.4,
					m_frictionSlip: 1000,
					m_rollInfluence: 0.01,
					isFrontWheel: true,
				}, {
					radius: 1,
					position: [-1, 0.0, -1.0],
					direction: [0, -1, 0],
					axle: [-1, 0, 0],
					suspensionLength: 0.3,
					m_suspensionStiffness: 20,
					m_wheelsDampingRelaxation: 2.3,
					m_wheelsDampingCompression: 4.4,
					m_frictionSlip: 1000,
					m_rollInfluence: 0.01,
					isFrontWheel: false,
				}, {
					radius: 1,
					position: [1, 0.0, -1.0],
					direction: [0, -1, 0],
					axle: [-1, 0, 0],
					suspensionLength: 0.3,
					m_suspensionStiffness: 20,
					m_wheelsDampingRelaxation: 2.3,
					m_wheelsDampingCompression: 4.4,
					m_frictionSlip: 1000,
					m_rollInfluence: 0.01,
					isFrontWheel: false,
				}]
			};
		}
		*/
	};
	// Force is array with 4 values or 1 value
	AmmoWorkerRigidbodyComponent.prototype.setVehicleEngineForce = function (force) {
		this._postMessage({
			command: 'setVehicleEngineForce',
			force: force
		});
	};
	// Force is array with 4 values or 1 value
	AmmoWorkerRigidbodyComponent.prototype.setVehicleSteeringValue = function (value) {
		this._postMessage({
			command: 'setVehicleSteeringValue',
			value: value
		});
	};

	/**
	 * Update collider information.
	 * @param {Entity} colliderEntity The entity that holds the collider
	 */
	AmmoWorkerRigidbodyComponent.prototype.updateCollider = function (colliderEntity) {
		this._postMessage({
			command: 'updateCollider',
			colliderId: colliderEntity.id,
			data: colliderEntity.colliderComponent.collider.serialize()
		});
	};

	AmmoWorkerRigidbodyComponent.prototype.copyPhysicalTransformToVisual = function (entity) {
		var tc = entity.transformComponent;
		if (!this.body) {
			return;
		}
		var trans = new Ammo.btTransform();
		this.body.getMotionState().getWorldTransform(trans);
		var ammoQuat = trans.getRotation();
		tmpQuat.setd(ammoQuat.x(), ammoQuat.y(), ammoQuat.z(), ammoQuat.w());
		tc.transform.rotation.copyQuaternion(tmpQuat);
		var origin = trans.getOrigin();
		tc.setTranslation(origin.x(), origin.y(), origin.z());
	};

	function v2a(v) {
		return Array.prototype.slice.call(v.data, 0);
	}

	return AmmoWorkerRigidbodyComponent;
});

/* Goo Engine UNOFFICIAL
 * Copyright 2016 Goo Technologies AB
 */

webpackJsonp([0],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },

/***/ 1:
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
		AmmoComponent: __webpack_require__(2),
		AmmoSystem: __webpack_require__(58),
		calculateTriangleMeshShape: __webpack_require__(26)
	};
	if (typeof(window) !== 'undefined') {
		for (var key in module.exports) {
			window.goo[key] = module.exports[key];
		}
	}

/***/ },

/***/ 2:
/***/ function(module, exports, __webpack_require__) {

	var EntityUtils = __webpack_require__(3);
	var Component = __webpack_require__(20);
	var Quaternion = __webpack_require__(23);
	var calculateTriangleMeshShape = __webpack_require__(26);
	var Box = __webpack_require__(27);
	var Quad = __webpack_require__(28);
	var Sphere = __webpack_require__(29);
	var Material = __webpack_require__(30);
	var ShaderLib = __webpack_require__(46);
	var BoundingBox = __webpack_require__(7);
	var BoundingSphere = __webpack_require__(13);
	var ObjectUtils = __webpack_require__(6);

	/* global Ammo */

	/**
	 * Adds Ammo physics to a Goo entity.
	 * Ammo is a powerful physics engine converted from the C language project Bullet.
	 * Use Ammo.js if you need to support any 3D shape (trimesh).
	 * Also see {@link AmmoSystem}.
	 * @deprecated Deprecated as of v0.11.x and scheduled for removal in v0.13.0; consider using the Cannon system/component instead.
	 * @extends Component
	 * @param {Object} [settings] The settings object can contain the following properties:
	 * @param {number} [settings.mass=0] (0 means immovable)
	 * @param {boolean} [settings.useBounds=false] use the model bounds or use the real (must-be-convex) vertices
	 * @param {boolean} [settings.useWorldBounds=false] use the model world bounds or use the real (must-be-convex) vertices (this setting is experimental)
	 * @param {boolean} [settings.useWorldTransform=false] use the model world transform instead of local (this setting is experimental)
	 * @param {boolean} [settings.showBounds=false] show the model world bounding box (this setting is experimental)
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/Ammo/Ammo-vtest.html Working example
	 * @example
	 * var entity = world.createEntity(new Box(20, 10, 1));
	 * entity.setComponent(new AmmoComponent({ mass: 5 }));
	 */
	function AmmoComponent(settings) {
		Component.apply(this, arguments);

		this.settings = settings = settings || {};

		ObjectUtils.defaults(settings, {
			mass: 0,
			useBounds: false,
			useWorldBounds: false,
			useWorldTransform: false,
			linearFactor: new Ammo.btVector3(1, 1, 1),
			isTrigger: false,
			onInitializeBody: null,
			scale: null,
			translation: null,
			rotation: null
		});

		this.mass = settings.mass;
		this.useBounds = settings.useBounds;
		this.useWorldBounds = settings.useWorldBounds;
		this.useWorldTransform = settings.useWorldTransform;
		this.linearFactor = settings.linearFactor;
		this.onInitializeBody = settings.onInitializeBody;
		this.isTrigger = settings.isTrigger;
		this.scale = settings.scale;
		this.translation = settings.translation;
		this.rotation = settings.rotation;

		this.type = 'AmmoComponent';
		this.ammoTransform = new Ammo.btTransform();
		this.gooQuaternion = new Quaternion();
		this.shape = undefined;
	}

	AmmoComponent.prototype = Object.create(Component.prototype);
	AmmoComponent.prototype.constructor = AmmoComponent;

	AmmoComponent.prototype.getAmmoShapefromGooShape = function (entity, gooTransform) {
		var shape;

		// Need to abs since negative scales are fine for meshes but not for bounding boxes.
		var scale = [Math.abs(gooTransform.scale.x), Math.abs(gooTransform.scale.y), Math.abs(gooTransform.scale.z)];
		// if a scale value is used in settings
		if (this.scale) {
			scale = [Math.abs(this.scale.x), Math.abs(this.scale.y), Math.abs(this.scale.z)];
		}

		if (entity.meshDataComponent && entity.meshDataComponent.meshData) {
			var meshData = entity.meshDataComponent.meshData;
			if (meshData instanceof Box) {
				shape = new Ammo.btBoxShape(new Ammo.btVector3(meshData.xExtent * scale[0], meshData.yExtent * scale[1], meshData.zExtent * scale[2]));
			} else if (meshData instanceof Sphere) {
				shape = new Ammo.btSphereShape(meshData.radius * scale[0]);
			} else if (meshData instanceof Quad) {
				// there doesn't seem to be a Quad shape in Ammo
				shape = new Ammo.btBoxShape(new Ammo.btVector3(meshData.xExtent, meshData.yExtent, 0.01)); //new Ammo.btPlane();
			} else {
				if (this.useBounds || this.mass > 0) {
					entity.meshDataComponent.computeBoundFromPoints();
					var bound = entity.meshDataComponent.modelBound;
					if (bound instanceof BoundingBox) {
						shape = new Ammo.btBoxShape(new Ammo.btVector3(bound.xExtent * scale[0], bound.yExtent * scale[1], bound.zExtent * scale[2]));
					} else if (bound instanceof BoundingSphere) {
						shape = new Ammo.btSphereShape(bound.radius * scale[0]);
					}
				} else {
					shape = calculateTriangleMeshShape(entity, scale); // this can only be used for static meshes, i.e. mass == 0.
				}
			}
		} else {
			var shape = new Ammo.btCompoundShape();
			var c = entity.transformComponent.children;
			for (var i = 0; i < c.length; i++) {
				var childAmmoShape = this.getAmmoShapefromGooShape(c[i].entity, gooTransform);
				var localTrans = new Ammo.btTransform();
				localTrans.setIdentity();
				var gooPos = c[i].transform.translation;
				localTrans.setOrigin(new Ammo.btVector3(gooPos.x, gooPos.y, gooPos.z));
				// TODO: also setRotation ?
				shape.addChildShape(localTrans, childAmmoShape);
			}
		}
		return shape;
	};

	AmmoComponent.prototype.getAmmoShapefromGooShapeWorldBounds = function (entity) {
		var shape;
		var bound = EntityUtils.getTotalBoundingBox(entity);
		this.center = bound.center;
		shape = new Ammo.btBoxShape(new Ammo.btVector3(bound.xExtent, bound.yExtent, bound.zExtent));
		//shape = new Ammo.btBoxShape(new Ammo.btVector3( bound.xExtent * scale, bound.yExtent * scale, bound.zExtent * scale));
		return shape;
	};

	AmmoComponent.prototype.initialize = function (entity) {
		var gooTransform = entity.transformComponent.transform;

		if (this.useWorldTransform) {
			gooTransform = entity.transformComponent.sync().worldTransform;
		}

		var gooPos = this.translation || gooTransform.translation;
		var gooRot = this.rotation || gooTransform.rotation;

		var ammoTransform = new Ammo.btTransform();
		ammoTransform.setIdentity(); // TODO: is this needed ?
		ammoTransform.setOrigin(new Ammo.btVector3(gooPos.x, gooPos.y, gooPos.z));
		this.gooQuaternion.fromRotationMatrix(gooRot);
		var q = this.gooQuaternion;
		ammoTransform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));

		if (this.useWorldBounds) {
			entity._world.process();
			this.shape = this.getAmmoShapefromGooShapeWorldBounds(entity, gooTransform);
			this.difference = this.center.clone().sub(gooTransform.translation).negate();
		} else {
			this.shape = this.getAmmoShapefromGooShape(entity, gooTransform);
		}

		if (false === this.isTrigger) {
			var motionState = new Ammo.btDefaultMotionState(ammoTransform);
			var localInertia = new Ammo.btVector3(0, 0, 0);

			// rigidbody is dynamic if and only if mass is non zero, otherwise static
			if (this.mass !== 0.0) {
				this.shape.calculateLocalInertia(this.mass, localInertia);
			}

			var info = new Ammo.btRigidBodyConstructionInfo(this.mass, motionState, this.shape, localInertia);
			this.localInertia = localInertia;
			this.body = new Ammo.btRigidBody(info);
			this.body.setLinearFactor(this.linearFactor);

			if (this.onInitializeBody) {
				this.onInitializeBody(this.body);
			}
		}
	};

	AmmoComponent.prototype.showBounds = function (entity) {
		var bound = EntityUtils.getTotalBoundingBox(entity);
		var bv;

		var material = new Material(ShaderLib.simpleLit);
		material.wireframe = true;
		if (bound.xExtent) {
			bv = entity._world.createEntity(new Box(bound.xExtent * 2, bound.yExtent * 2, bound.zExtent * 2), material);
		} else if (bound.radius) {
			bv = entity._world.createEntity(new Sphere(12, 12, bound.radius), material);
		}

		bv.transformComponent.setTranslation(bound.center);

		bv.addToWorld();
		this.bv = bv;
	};

	AmmoComponent.prototype.setPhysicalTransform = function (transform) {
		var gooPos = transform.translation;
		this.ammoTransform.setIdentity(); // TODO: is this needed ?
		this.ammoTransform.setOrigin(new Ammo.btVector3(gooPos.x, gooPos.y, gooPos.z));
		this.gooQuaternion.fromRotationMatrix(transform.rotation);
		var q = this.gooQuaternion;
		this.ammoTransform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));
		this.body.setWorldTransform(this.ammoTransform);
	};

	AmmoComponent.prototype.copyPhysicalTransformToVisual = function (entity) {
		var tc = entity.transformComponent;
		if (!this.body) {
			return;
		}
		this.body.getMotionState().getWorldTransform(this.ammoTransform);
		var ammoQuat = this.ammoTransform.getRotation();
		this.gooQuaternion.setDirect(ammoQuat.x(), ammoQuat.y(), ammoQuat.z(), ammoQuat.w());
		tc.transform.rotation.copyQuaternion(this.gooQuaternion);
		var origin = this.ammoTransform.getOrigin();
		tc.setTranslation(origin.x(), origin.y(), origin.z());
		if (this.settings.showBounds) {
			if (!this.bv) {
				this.showBounds(entity);
			}
			this.bv.transformComponent.transform.rotation.copy(tc.transform.rotation);
			this.bv.transformComponent.setTranslation(tc.transform.translation);
		}
		if (this.difference) {
			tc.addTranslation(this.difference);
		}
	};

	module.exports = AmmoComponent;

/***/ },

/***/ 26:
/***/ function(module, exports) {

	/* global Ammo */

	module.exports = function (entity, scale) {
		scale = scale || [1, 1, 1];
		var floatByteSize = 4;
		var use32bitIndices = true;
		var intByteSize = use32bitIndices ? 4 : 2;
		var intType = use32bitIndices ? 'i32' : 'i16';

		var meshData = entity.meshDataComponent.meshData;

		var vertices = meshData.dataViews.POSITION;
		var vertexBuffer = Ammo.allocate( floatByteSize * vertices.length, 'float', Ammo.ALLOC_NORMAL );
		for ( var i = 0, il = vertices.length; i < il; i ++ ) {
			Ammo.setValue( vertexBuffer + i * floatByteSize, scale[i % 3] * vertices[ i ], 'float' );
		}

		var indices = meshData.indexData.data;
		var indexBuffer = Ammo.allocate( intByteSize * indices.length, intType, Ammo.ALLOC_NORMAL );
		for ( var i = 0, il = indices.length; i < il; i ++ ) {
			Ammo.setValue( indexBuffer + i * intByteSize, indices[ i ], intType );
		}

		var iMesh = new Ammo.btIndexedMesh();
		iMesh.set_m_numTriangles( meshData.indexCount / 3 );
		iMesh.set_m_triangleIndexBase( indexBuffer );
		iMesh.set_m_triangleIndexStride( intByteSize * 3 );

		iMesh.set_m_numVertices( meshData.vertexCount );
		iMesh.set_m_vertexBase( vertexBuffer );
		iMesh.set_m_vertexStride( floatByteSize * 3 );

		var triangleIndexVertexArray = new Ammo.btTriangleIndexVertexArray();
		triangleIndexVertexArray.addIndexedMesh( iMesh, 2); // indexedMesh, indexType = PHY_INTEGER = 2 seems optional

		// bvh = Bounding Volume Hierarchy
		return new Ammo.btBvhTriangleMeshShape( triangleIndexVertexArray, true, true ); // btStridingMeshInterface, useQuantizedAabbCompression, buildBvh
	};

/***/ },

/***/ 58:
/***/ function(module, exports, __webpack_require__) {

	var System = __webpack_require__(42);


	/*global Ammo */

	/**
	 * Handles integration with Ammo.js.
	 * Depends on the global Ammo object,
	 * so load ammo.small.js using a script tag before using this system.
	 * Direct access to the ammoWorld is available like this: myAmmoSystem.ammoWorld
	 * See also {@link AmmoComponent}
	 * @deprecated Deprecated as of v0.11.x and scheduled for removal in v0.13.0; consider using the Cannon system/component instead.
	 * @extends System
	 * @param {Object} settings The settings object can contain the following properties:
	 * @param {number} settings.gravity (defaults to -9.81)
	 * @param {number} settings.maxSubSteps (defaults to 5)
	 * @param {number} settings.stepFrequency (defaults to 60)
	 * @example
	 * var ammoSystem = new AmmoSystem({stepFrequency: 60});
	 * goo.world.setSystem(ammoSystem);
	 */
	function AmmoSystem(settings) {
		System.call(this, 'AmmoSystem', ['AmmoComponent', 'TransformComponent']);
		this.settings = settings || {};
		this.fixedTime = 1 / (this.settings.stepFrequency || 60);
		this.maxSubSteps = this.settings.maxSubSteps || 5;
		var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
		var overlappingPairCache = new Ammo.btDbvtBroadphase();
		var solver = new Ammo.btSequentialImpulseConstraintSolver();
		this.ammoWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
		var gravity = this.settings.gravity;
		if (gravity == null) {
			gravity = -9.81;
		}
		this.ammoWorld.setGravity(new Ammo.btVector3(0, gravity, 0));
	}

	AmmoSystem.prototype = Object.create(System.prototype);

	AmmoSystem.prototype.inserted = function (entity) {
		if (entity.ammoComponent) {
			entity.ammoComponent.initialize(entity);
			this.ammoWorld.addRigidBody(entity.ammoComponent.body);
		} else {
			console.log('Warning: missing entity.ammoComponent');
		}
	};

	AmmoSystem.prototype.deleted = function (entity) {
		if (entity.ammoComponent) {
			this.ammoWorld.removeRigidBody(entity.ammoComponent.body);
		}
	};

	AmmoSystem.prototype.process = function (entities, tpf) {
		this.ammoWorld.stepSimulation( tpf, this.maxSubSteps, this.fixedTime);

		for (var i = 0; i < entities.length; i++) {
			var e = entities[i];
			if (e.ammoComponent.mass > 0) {
				e.ammoComponent.copyPhysicalTransformToVisual(e);
			}
		}
	};

	module.exports = AmmoSystem;


/***/ }

});

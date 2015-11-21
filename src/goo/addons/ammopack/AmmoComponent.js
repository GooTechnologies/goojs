var EntityUtils = require('../../entities/EntityUtils');
var Component = require('../../entities/components/Component');
var Quaternion = require('../../math/Quaternion');
var calculateTriangleMeshShape = require('../../addons/ammopack/calculateTriangleMeshShape');
var Box = require('../../shapes/Box');
var Quad = require('../../shapes/Quad');
var Sphere = require('../../shapes/Sphere');
var Material = require('../../renderer/Material');
var ShaderLib = require('../../renderer/shaders/ShaderLib');
var BoundingBox = require('../../renderer/bounds/BoundingBox');
var BoundingSphere = require('../../renderer/bounds/BoundingSphere');
var ObjectUtils = require('../../util/ObjectUtils');

	'use strict';

	/*global Ammo */

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

		_.defaults(settings, {
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
			gooTransform = entity.transformComponent.worldTransform;
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
		// entity.meshRendererComponent.worldBound
		// entity.meshDataComponent.computeBoundFromPoints();
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
		//entity.transformComponent.attachChild( bv.transformComponent );

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
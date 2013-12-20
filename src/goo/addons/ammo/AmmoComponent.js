define([
	'goo/entities/components/Component',
	'goo/math/Quaternion',
	'goo/addons/ammo/calculateTriangleMeshShape',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/shapes/Sphere',
	'goo/renderer/bounds/BoundingBox',
	'goo/renderer/bounds/BoundingSphere'
],
/** @lends */
function(
	Component, Quaternion, calculateTriangleMeshShape, Box, Quad, Sphere, BoundingBox, BoundingSphere
) {
	"use strict";

	var Ammo = window.Ammo; // make jslint happy

	/**
	 * @class Adds Ammo physics to a Goo entity.
	 * Ammo is a powerful physics engine converted from the c language project Bullet
	 * use Ammo.js if you need to support any 3D shape ( trimesh )
	 * See also {@link AmmoSystem}
	 * @extends Component
	 * @param {Object} [settings] The settings object can contain the following properties:
	 * @param {number} [settings.mass=0] (0 means immovable)
	 * @param {boolean} [settings.useBounds=false] use the model bounds or use the real (must-be-convex) vertices
	 * @example
	 * var entity = EntityUtils.createTypicalEntity(goo.world, ShapeCreator.createBox(20, 10, 1));
	 * entity.setComponent(new AmmoComponent({mass:5}));
	 */
	function AmmoComponent(settings) {
		this.type = 'AmmoComponent';
		this.settings = settings || {};
		this.mass = settings.mass !== undefined ? settings.mass : 0;
		this.useBounds = settings.useBounds !== undefined ? settings.useBounds : false;
		this.ammoTransform = new Ammo.btTransform();
		this.gooQuaternion = new Quaternion();
	}
	AmmoComponent.prototype = Object.create(Component.prototype);

	AmmoComponent.prototype.getAmmoShapefromGooShape = function(entity, scale) {
		var shape;
		if( entity.meshDataComponent && entity.meshDataComponent.meshData) {
			var meshData = entity.meshDataComponent.meshData;
			if (meshData instanceof Box) {
				shape = new Ammo.btBoxShape(new Ammo.btVector3( meshData.xExtent, meshData.yExtent, meshData.zExtent));
			} else if (meshData instanceof Sphere) {
				shape = new Ammo.btSphereShape(meshData.radius);
			} else if (meshData instanceof Quad) {
				// there doesn't seem to be a Quad shape in Ammo
				shape = new Ammo.btBoxShape(new Ammo.btVector3( meshData.xExtent, meshData.yExtent, 0.01 )); //new Ammo.btPlane();
			} else {
				if (this.useBounds || this.mass > 0) {
					entity.meshDataComponent.computeBoundFromPoints();
					var bound = entity.meshDataComponent.modelBound;
					if (bound instanceof BoundingBox) {
						shape = new Ammo.btBoxShape(new Ammo.btVector3( bound.xExtent*scale, bound.yExtent*scale, bound.zExtent*scale));
					} else if (bound instanceof BoundingSphere) {
						shape = new Ammo.btSphereShape( bound.radius*scale);
					}
				} else {
					shape = calculateTriangleMeshShape( entity, scale); // this can only be used for static meshes, i.e. mass == 0.
				}
			}
		} else {
			var shape = new Ammo.btCompoundShape();
			var c = entity.transformComponent.children;
			for(var i=0; i<c.length; i++) {
				var childAmmoShape = this.getAmmoShapefromGooShape( c[i].entity );
				var localTrans = new Ammo.btTransform();
				localTrans.setIdentity();
				var gooTransform = c[i].transform;
				var gooPos = gooTransform.translation;
				localTrans.setOrigin(new Ammo.btVector3( gooPos.x, gooPos.y, gooPos.z));
				// TODO: also setRotation ?
				shape.addChildShape(localTrans,childAmmoShape);
			}
		}
		return shape;
	};


	AmmoComponent.prototype.initialize = function(entity) {
		var gooTransform = entity.transformComponent.transform;
		var gooPos = gooTransform.translation;

		var ammoTransform = new Ammo.btTransform();
		ammoTransform.setIdentity(); // TODO: is this needed ?
		ammoTransform.setOrigin(new Ammo.btVector3( gooPos.x, gooPos.y, gooPos.z));
		this.gooQuaternion.fromRotationMatrix(gooTransform.rotation);
		var q = this.gooQuaternion;
		ammoTransform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));
		var motionState = new Ammo.btDefaultMotionState( ammoTransform );

		var shape = this.getAmmoShapefromGooShape(entity, gooTransform.scale.x);

		var localInertia = new Ammo.btVector3(0, 0, 0);

		// rigidbody is dynamic if and only if mass is non zero, otherwise static
		if(this.mass !== 0.0) {
			shape.calculateLocalInertia( this.mass, localInertia );
		}

		var info = new Ammo.btRigidBodyConstructionInfo(this.mass, motionState, shape, localInertia);
		this.body = new Ammo.btRigidBody( info );
	};


	AmmoComponent.prototype.copyPhysicalTransformToVisual = function(entity) {
		var tc = entity.transformComponent;
		this.body.getMotionState().getWorldTransform(this.ammoTransform);
		var ammoQuat = this.ammoTransform.getRotation();
		this.gooQuaternion.setd(ammoQuat.x(), ammoQuat.y(), ammoQuat.z(), ammoQuat.w());
		tc.transform.rotation.copyQuaternion(this.gooQuaternion);
		var origin = this.ammoTransform.getOrigin();
		tc.setTranslation(origin.x(), origin.y(), origin.z());
	};


	return AmmoComponent;
});

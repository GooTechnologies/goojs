var AbstractColliderComponent = require('../../../addons/physicspack/components/AbstractColliderComponent');
var BoxCollider = require('../../../addons/physicspack/colliders/BoxCollider');
var SphereCollider = require('../../../addons/physicspack/colliders/SphereCollider');
var MeshCollider = require('../../../addons/physicspack/colliders/MeshCollider');
var PlaneCollider = require('../../../addons/physicspack/colliders/PlaneCollider');
var CylinderCollider = require('../../../addons/physicspack/colliders/CylinderCollider');
var Collider = require('../../../addons/physicspack/colliders/Collider');
var Vector3 = require('../../../math/Vector3');
var Quaternion = require('../../../math/Quaternion');

var tmpQuat = new Quaternion();

/* global CANNON */

/**
 * Adds a physics collider to the entity. If the entity or any of its ancestors have a {RigidBodyComponent}, the collider is added to the physics world.
 * @param {Object} [settings]
 * @param {Collider} [settings.collider]
 * @param {boolean} [settings.isTrigger=false]
 * @extends AbstractColliderComponent
 */
function ColliderComponent(settings) {
	AbstractColliderComponent.apply(this, arguments);
	this.type = 'ColliderComponent';
	settings = settings || {};

	/**
	 * The Cannon.js Body instance, if the ColliderComponent was initialized without a RigidBodyComponent.
	 * @type {CANNON.Body}
	 */
	this.cannonBody = null;

	/**
	 * The Cannon.js Shape instance
	 * @type {CANNON.Body}
	 */
	this.cannonShape = null;
}

ColliderComponent.prototype = Object.create(AbstractColliderComponent.prototype);
ColliderComponent.prototype.constructor = ColliderComponent;

ColliderComponent.type = 'ColliderComponent';

/**
 * Initialize the collider as a static rigid body in the physics world.
 */
ColliderComponent.prototype.initialize = function () {
	var entity = this.entity;

	var material = null;
	if (this.material) {
		material = new CANNON.Material();
		material.friction = this.material.friction;
		material.restitution = this.material.restitution;
	}
	this.updateWorldCollider();
	var cannonShape = this.cannonShape = ColliderComponent.getCannonShape(this.worldCollider);
	cannonShape.material = material;

	this.updateLayerAndMask();

	cannonShape.collisionResponse = !this.isTrigger;

	// Get transform from entity
	var transform = entity.transformComponent.sync().worldTransform;
	var position = new CANNON.Vec3();
	var quaternion = new CANNON.Quaternion();
	position.copy(transform.translation);
	tmpQuat.fromRotationMatrix(transform.rotation);
	quaternion.copy(tmpQuat);

	var body = new CANNON.Body({
		mass: 0,
		position: position,
		quaternion: quaternion
	});
	this.system.cannonWorld.addBody(body);
	this.cannonBody = body;

	// Register it
	this.system._shapeIdToColliderEntityMap.set(cannonShape.id, entity);

	var collider = this.worldCollider;
	if (collider instanceof SphereCollider) {
		cannonShape.radius = collider.radius;
	} else if (collider instanceof BoxCollider) {
		cannonShape.halfExtents.copy(collider.halfExtents);
		cannonShape.updateConvexPolyhedronRepresentation();
	} else if (collider instanceof MeshCollider) {
		var scale = new CANNON.Vec3();
		scale.copy(collider.scale);
		cannonShape.setScale(scale);
	}
	cannonShape.updateBoundingSphereRadius();
	body.computeAABB();
	body.addShape(cannonShape);
	body.aabbNeedsUpdate = true;
};

/**
 * Remove the collider from the physics world. Does the opposite of .initialize()
 */
ColliderComponent.prototype.destroy = function () {
	var body = this.cannonBody;
	body.shapes.forEach(function (shape) {
		this.system._shapeIdToColliderEntityMap.delete(shape.id);
	}.bind(this));
	this.system.cannonWorld.removeBody(body);
	this.cannonBody = null;
	this.cannonShape = null;
};

ColliderComponent.numCylinderSegments = 10;

/**
 * Create a CANNON.Shape given a Collider. A BoxCollider yields a CANNON.Box and so on.
 * @param {Collider} collider
 * @returns {CANNON.Shape}
 * @hidden
 */
ColliderComponent.getCannonShape = function (collider) {
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
			ColliderComponent.numCylinderSegments
		);
		var quat = new CANNON.Quaternion();
		quat.setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2);
		shape.transformAllPoints(new Vector3(), quat);
		shape.computeEdges();
		shape.updateBoundingSphereRadius();
	} else if (collider instanceof MeshCollider) {
		// Assume triangles
		if (collider.meshData.indexModes[0] !== 'Triangles') {
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

/**
 * @private
 * @param  {Object} obj
 * @param  {Entity} entity
 * @returns {boolean}
 */
ColliderComponent.applyOnEntity = function (obj, entity) {
	if (obj instanceof Collider) {
		entity.setComponent(new ColliderComponent({
			collider: obj
		}));
		return true;
	}
};

ColliderComponent.prototype.updateLayerAndMask = function () {
	ColliderComponent.updateLayerAndMask(this.entity);
};

ColliderComponent.updateLayerAndMask = function (entity) {
	var layer = entity.layer;
	var cannonShape = entity.colliderComponent.cannonShape;
	if (cannonShape) {
		cannonShape.collisionFilterMask = entity._world.getSystem('PhysicsSystem').getLayerMask(layer);
		cannonShape.collisionFilterGroup = Math.pow(2, layer);
	}
};

module.exports = ColliderComponent;

var EntitySelection = require('../../../entities/EntitySelection');
var System = require('../../../entities/systems/System');
var SystemBus = require('../../../entities/SystemBus');
var PhysicsPlaneDebugShape = require('../../../addons/physicspack/shapes/PhysicsPlaneDebugShape');
var PhysicsCylinderDebugShape = require('../../../addons/physicspack/shapes/PhysicsCylinderDebugShape');
var PhysicsSphereDebugShape = require('../../../addons/physicspack/shapes/PhysicsSphereDebugShape');
var PhysicsBoxDebugShape = require('../../../addons/physicspack/shapes/PhysicsBoxDebugShape');
var SphereCollider = require('../../../addons/physicspack/colliders/SphereCollider');
var BoxCollider = require('../../../addons/physicspack/colliders/BoxCollider');
var CylinderCollider = require('../../../addons/physicspack/colliders/CylinderCollider');
var PlaneCollider = require('../../../addons/physicspack/colliders/PlaneCollider');
var MeshCollider = require('../../../addons/physicspack/colliders/MeshCollider');
var Transform = require('../../../math/Transform');
var Material = require('../../../renderer/Material');
var ShaderLib = require('../../../renderer/shaders/ShaderLib');
var Pool = require('../../../addons/physicspack/util/Pool');

/**
 * Renders all ColliderComponents in the scene.
 * @extends System
 * @example
 * world.setSystem(new PhysicsDebugRenderSystem());
 */
function PhysicsDebugRenderSystem() {
	System.call(this, 'PhysicsDebugRenderSystem', ['TransformComponent']);

	this.priority = 3;

	this.renderList = [];
	this.camera = null;

	SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
		this.camera = newCam.camera;
	}.bind(this));

	/**
	 * If set to true, all entities with a ColliderComponent attached is rendered, and the selection is disregarded.
	 * @type {boolean}
	 */
	this.renderAll = true;

	/**
	 * The selected entities to be rendered.
	 * @type {EntitySelection}
	 */
	this.selection = new EntitySelection();

	this.sphereMeshData = new PhysicsSphereDebugShape(32);
	this.boxMeshData = new PhysicsBoxDebugShape();
	this.cylinderMeshData = new PhysicsCylinderDebugShape(32);
	this.planeMeshData = new PhysicsPlaneDebugShape();

	this.material = new Material(ShaderLib.simpleColored);
	this.material.uniforms.color = [0, 1, 0];
	this.material.wireframe = true;
	this.renderablePool = new Pool({
		create: function () {
			return {
				meshData: null,
				transform: new Transform(),
				materials: []
			};
		},
		init: function (meshData, material) {
			this.meshData = meshData;
			this.materials[0] = material;
		},
		destroy: function (renderable) {
			renderable.meshData = null;
			renderable.materials.length = 0;
		}
	});
}
PhysicsDebugRenderSystem.prototype = Object.create(System.prototype);
PhysicsDebugRenderSystem.prototype.constructor = PhysicsDebugRenderSystem;

/**
 * @private
 * @param  {array} entities
 */
PhysicsDebugRenderSystem.prototype.process = function (entities) {
	this.clear();

	if (this.passive) {
		return;
	}

	for (var i = 0, N = entities.length; i !== N; i++) {
		var entity = entities[i];

		if (!this.renderAll && !this.selection.contains(entity)) {
			// Render selection is enabled, but this entity is not a part of it
			continue;
		}

		// Colliders
		if (entity.colliderComponent) {
			entity.colliderComponent.updateWorldCollider();
			var collider = entity.colliderComponent.worldCollider;
			var meshData = this.getMeshData(collider);
			var renderable = this.renderablePool.get(meshData, this.material);

			this.getWorldTransform(entity, collider, renderable.transform);
			renderable.transform.update();

			this.renderList.push(renderable);
		}

		// TODO: Joints
	}
};

/**
 * Get the world transform of the debug rendering mesh data from a collider.
 * @private
 * @param  {Entity} colliderEntity
 * @param  {Collider} collider
 * @param  {Transform} targetTransform
 */
PhysicsDebugRenderSystem.prototype.getWorldTransform = function (colliderEntity, collider, targetTransform) {
	targetTransform.copy(colliderEntity.transformComponent.sync().worldTransform);

	if (collider instanceof SphereCollider) {
		var scale = collider.radius;
		targetTransform.scale.set(scale, scale, scale);
	} else if (collider instanceof BoxCollider) {
		targetTransform.scale.copy(collider.halfExtents).scale(2);
	} else if (collider instanceof CylinderCollider) {
		targetTransform.scale.set(collider.radius, collider.radius, collider.height);
	} else if (collider instanceof PlaneCollider) {
		targetTransform.scale.set(1, 1, 1);
	} else if (collider instanceof MeshCollider) {
		targetTransform.scale.set(collider.scale);
	}
};

/**
 * Get mesh data to use for debug rendering.
 * @private
 * @param  {Collider} collider
 * @returns {MeshData}
 */
PhysicsDebugRenderSystem.prototype.getMeshData = function (collider) {
	var meshData;
	if (collider instanceof SphereCollider) {
		meshData = this.sphereMeshData;
	} else if (collider instanceof BoxCollider) {
		meshData = this.boxMeshData;
	} else if (collider instanceof CylinderCollider) {
		meshData = this.cylinderMeshData;
	} else if (collider instanceof PlaneCollider) {
		meshData = this.planeMeshData;
	} else if (collider instanceof MeshCollider) {
		meshData = collider.meshData;
	}
	return meshData;
};

/**
 * @private
 * @param  {Renderer} renderer
 */
PhysicsDebugRenderSystem.prototype.render = function (renderer) {
	renderer.checkResize(this.camera);
	if (this.camera) {
		renderer.render(this.renderList, this.camera, null, null, false);
	}
};

/**
 * Release all previous renderables in the renderList
 * @private
 */
PhysicsDebugRenderSystem.prototype.clear = function () {
	for (var i = 0, N = this.renderList.length; i !== N; i++) {
		this.renderablePool.release(this.renderList[i]);
	}
	this.renderList.length = 0;
};

/**
 * @private
 */
PhysicsDebugRenderSystem.prototype.cleanup = function () {
	this.clear();
};

module.exports = PhysicsDebugRenderSystem;
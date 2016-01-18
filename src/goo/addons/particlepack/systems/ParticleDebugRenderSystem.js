define([
	'goo/entities/EntitySelection',
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/shapes/Cylinder',
	'goo/addons/physicspack/shapes/PhysicsPlaneDebugShape',
	'goo/addons/physicspack/shapes/PhysicsCylinderDebugShape',
	'goo/addons/physicspack/shapes/PhysicsSphereDebugShape',
	'goo/addons/physicspack/shapes/PhysicsBoxDebugShape',
	'goo/addons/physicspack/colliders/SphereCollider',
	'goo/addons/physicspack/colliders/BoxCollider',
	'goo/addons/physicspack/colliders/CylinderCollider',
	'goo/addons/physicspack/colliders/PlaneCollider',
	'goo/addons/physicspack/colliders/MeshCollider',
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/addons/physicspack/util/Pool'
],
function (
	EntitySelection,
	System,
	SystemBus,
	Sphere,
	Box,
	Cylinder,
	PhysicsPlaneDebugShape,
	PhysicsCylinderDebugShape,
	PhysicsSphereDebugShape,
	PhysicsBoxDebugShape,
	SphereCollider,
	BoxCollider,
	CylinderCollider,
	PlaneCollider,
	MeshCollider,
	Quaternion,
	Vector3,
	Transform,
	Material,
	ShaderLib,
	Pool
) {
	'use strict';

	/**
	 * Renders all ColliderComponents in the scene.
	 * @extends System
	 * @example
	 * world.setSystem(new ParticleDebugRenderSystem());
	 */
	function ParticleDebugRenderSystem() {
		System.call(this, 'ParticleDebugRenderSystem', ['ParticleComponent']);

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
	ParticleDebugRenderSystem.prototype = Object.create(System.prototype);
	ParticleDebugRenderSystem.prototype.constructor = ParticleDebugRenderSystem;

	/**
	 * @private
	 * @param  {array} entities
	 */
	ParticleDebugRenderSystem.prototype.process = function (entities, tpf) {
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

			// entity.particleComponent.process(tpf);

			// var collider = entity.colliderComponent.worldCollider;
			// var meshData = this.getMeshData(collider);
			// var renderable = this.renderablePool.get(meshData, this.material);

			// renderable.transform.update();

			// this.renderList.push(renderable);
		}
	};

	/**
	 * Get mesh data to use for debug rendering.
	 * @private
	 * @param  {Entity} entity
	 * @returns {MeshData}
	 * @todo
	 */
	ParticleDebugRenderSystem.prototype.getMeshData = function (entity) {
		var meshData;
		return meshData;
	};

	/**
	 * @private
	 * @param  {Renderer} renderer
	 */
	ParticleDebugRenderSystem.prototype.render = function (renderer) {
		renderer.checkResize(this.camera);
		if (this.camera) {
			renderer.render(this.renderList, this.camera, null, null, false);
		}
	};

	/**
	 * Release all previous renderables in the renderList
	 * @private
	 */
	ParticleDebugRenderSystem.prototype.clear = function () {
		for (var i = 0, N = this.renderList.length; i !== N; i++) {
			this.renderablePool.release(this.renderList[i]);
		}
		this.renderList.length = 0;
	};

	/**
	 * @private
	 */
	ParticleDebugRenderSystem.prototype.cleanup = function () {
		this.clear();
	};

	/**
	 * 
	 * @private
	 */
	ParticleDebugRenderSystem.prototype.update = function () {
		var l = this._activeEntities.length;
		while(l--){
			var entity = this._activeEntities[l];

			if (this.renderAll || this.selection.contains(entity)) {
				entity.particleComponent.play();
			} else {
				entity.particleComponent.stop();
				entity.particleComponent._updateVertexData();
			}
		}
	};


	return ParticleDebugRenderSystem;
});
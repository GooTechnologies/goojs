define([
	'goo/entities/EntitySelection',
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/shapes/Cone'
],
function (
	EntitySelection,
	System,
	SystemBus,
	Vector3,
	Transform,
	Material,
	ShaderLib,
	Sphere,
	Box,
	Cone
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

		var material = new Material(ShaderLib.simpleColored);
		material.uniforms.color = [0, 1, 0];
		material.wireframe = true;
		this.sphereRenderable = {
			materials: [material],
			transform: new Transform(),
			meshData: new Sphere(12,12,1)
		};
		this.boxRenderable = {
			materials: [material],
			transform: new Transform(),
			meshData: new Box(1,1,1)
		};
		this.coneRenderable = {
			materials: [material],
			transform: new Transform(),
			meshData: new Cone(8, 1, 1)
		};
		this.offsetTransform = new Transform();
	}
	ParticleDebugRenderSystem.prototype = Object.create(System.prototype);
	ParticleDebugRenderSystem.prototype.constructor = ParticleDebugRenderSystem;

	/**
	 * @private
	 * @param  {array} entities
	 */
	ParticleDebugRenderSystem.prototype.process = function (entities, tpf) {};

	/**
	 * @private
	 * @param  {Renderer} renderer
	 */
	ParticleDebugRenderSystem.prototype.render = function (renderer) {
		if (!this.camera || this.passive) {
			return;
		}

		renderer.checkResize(this.camera);

		var entities = this._activeEntities;
		for (var i = 0, N = entities.length; i !== N; i++) {
			var entity = entities[i];

			if (!this.renderAll && !this.selection.contains(entity)) {
				// Render selection is enabled, but this entity is not a part of it
				continue;
			}

			var renderable;
			switch(entity.particleComponent.shapeType){
			case 'sphere':
				renderable = this.sphereRenderable;
				var radius = entity.particleComponent.sphereRadius;
				renderable.transform.scale.setDirect(radius,radius,radius);
				this.offsetTransform.setIdentity();
				break;
			case 'box':
				renderable = this.boxRenderable;
				renderable.transform.scale.copy(entity.particleComponent.boxExtents);
				this.offsetTransform.setIdentity();
				break;
			case 'cone':
				var coneRadius = entity.particleComponent.coneRadius;
				renderable = this.coneRenderable;
				this.offsetTransform.setIdentity();
				renderable.transform.scale.setDirect(coneRadius, coneRadius, entity.particleComponent.coneLength);
				this.offsetTransform.translation.set(0,0,-entity.particleComponent.coneLength);
				this.offsetTransform.rotation.rotateX(Math.PI / 2);
				break;
			}

			if(renderable){
				var transform = renderable.transform;
				var worldTransform = entity.transformComponent.worldTransform;

				transform.rotation.copy(this.offsetTransform.rotation);
				transform.rotation.mul(worldTransform.rotation);

				this.offsetTransform.translation.applyPost(transform.rotation);
				transform.translation.copy(this.offsetTransform.translation).add(worldTransform.translation);

				transform.update();
				renderer.render(renderable, this.camera, null, null, false);
			}
		}
	};

	/**
	 * @private
	 */
	ParticleDebugRenderSystem.prototype.cleanup = function () {};

	/**
	 * 
	 * @private
	 */
	ParticleDebugRenderSystem.prototype.update = function () {
		var entities = this._activeEntities;
		var l = entities.length;
		while(l--){
			var entity = entities[l];

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
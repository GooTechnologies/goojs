define([
	'goo/entities/EntitySelection',
	'goo/entities/systems/System',
	'goo/entities/SystemBus',
	'goo/math/Transform',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/shapes/Cylinder'
],
function (
	EntitySelection,
	System,
	SystemBus,
	Transform,
	Material,
	ShaderLib,
	Sphere,
	Box,
	Cylinder
) {
	'use strict';

	/**
	 * Renders all ParticleSystemComponents in the scene.
	 * @extends System
	 */
	function ParticleDebugRenderSystem() {
		System.call(this, 'ParticleDebugRenderSystem', ['ParticleSystemComponent']);

		this.priority = 3;

		this.renderList = [];
		this.camera = null;

		SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
			this.camera = newCam.camera;
		}.bind(this));

		/**
		 * If set to true, all entities with a ParticleSystemComponent attached is rendered, and the selection is disregarded.
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
			meshData: new Cylinder(16, 1, 1, 1)
		};
		this.offsetTransform = new Transform();
	}
	ParticleDebugRenderSystem.prototype = Object.create(System.prototype);
	ParticleDebugRenderSystem.prototype.constructor = ParticleDebugRenderSystem;

	/**
	 * @private
	 * @param  {array} entities
	 */
	ParticleDebugRenderSystem.prototype.process = function (entities, tpf) {
		for(var i=0; i<entities.length; i++){
			var entity = entities[i];
			var meshEntity = entity.particleSystemComponent.meshEntity;
			if(meshEntity){
				if(entity.isVisiblyHidden())
					meshEntity.meshRendererComponent.hidden = true;
				else 
					meshEntity.meshRendererComponent.hidden = !this._shouldRenderDebugForEntity(entity);
			}
		}
	};

	ParticleDebugRenderSystem.prototype._shouldRenderDebugForEntity = function (entity) {
		return !this.passive && (this.renderAll || this.selection.contains(entity));
	};

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
			switch(entity.particleSystemComponent.shapeType){
			case 'sphere':
				renderable = this.sphereRenderable;
				var radius = entity.particleSystemComponent.sphereRadius;
				renderable.transform.scale.setDirect(radius,radius,radius);
				this.offsetTransform.setIdentity();
				break;
			case 'box':
				renderable = this.boxRenderable;
				renderable.transform.scale.copy(entity.particleSystemComponent.boxExtents);
				this.offsetTransform.setIdentity();
				break;
			case 'cone':
				var coneRadius = entity.particleSystemComponent.coneRadius;
				renderable = this.coneRenderable;
				this.offsetTransform.setIdentity();
				renderable.meshData.radiusTop = coneRadius + Math.tan(entity.particleSystemComponent.coneAngle) * entity.particleSystemComponent.coneLength;
				renderable.meshData.radiusBottom = coneRadius;
				renderable.meshData.height = entity.particleSystemComponent.coneLength;
				renderable.meshData.rebuild();
				renderable.meshData.setVertexDataUpdated();
				this.offsetTransform.translation.set(0,0,entity.particleSystemComponent.coneLength * 0.5);
				this.offsetTransform.rotation.rotateX(3 * Math.PI / 2);
				break;
			}

			if(renderable){
				renderable.meshData.indexModes = ['Lines'];

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
	 * @private
	 */
	ParticleDebugRenderSystem.prototype.update = function () {
		var entities = this._activeEntities;
		var l = entities.length;
		while(l--){
			var entity = entities[l];

			if (this._shouldRenderDebugForEntity(entity)) {
				entity.particleSystemComponent.play();
			} else {
				entity.particleSystemComponent.stop();
			}
		}

		this.process(this._activeEntities);
	};


	return ParticleDebugRenderSystem;
});
var System = require('../../entities/systems/System');



	/**
	 * Processes all entities with a portal component, a mesh renderer component and a mesh data component
	 * @extends System
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/PortalComponent/PortalComponent-vtest.html Working example
	 * @param {Renderer} renderer
	 * @param {RenderSystem} renderSystem
	 */
	function PortalSystem(renderer, renderSystem) {
		System.call(this, 'PortalSystem', ['MeshRendererComponent', 'MeshDataComponent', 'PortalComponent']);

		this.renderer = renderer;
		this.renderSystem = renderSystem;

		this.renderList = [];
	}

	PortalSystem.prototype = Object.create(System.prototype);
	PortalSystem.prototype.constructor = PortalSystem;

	PortalSystem.prototype.process = function (entities) {
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var portalComponent = entity.portalComponent;

			if (portalComponent.options.autoUpdate || portalComponent.doUpdate) {
				portalComponent.doUpdate = false;

				var camera = portalComponent.camera;
				var target = portalComponent.target;
				var secondaryTarget = portalComponent.secondaryTarget;
				var overrideMaterial = portalComponent.overrideMaterial;

				if (portalComponent.alwaysRender || entity.isVisible) {
					this.render(this.renderer, camera, target, overrideMaterial);

					var material = entity.meshRendererComponent.materials[0];
					material.setTexture('DIFFUSE_MAP', target);

					if (portalComponent.options.preciseRecursion) {
						var tmp = target;
						portalComponent.target = secondaryTarget;
						portalComponent.secondaryTarget = tmp;
					}
				}
			}
		}
	};

	PortalSystem.prototype.render = function (renderer, camera, target, overrideMaterial) {
		renderer.updateShadows(this.renderSystem.partitioner, this.renderSystem.entities, this.renderSystem.lights);

		for (var i = 0; i < this.renderSystem.preRenderers.length; i++) {
			var preRenderer = this.renderSystem.preRenderers[i];
			preRenderer.process(renderer, this.renderSystem.entities, this.renderSystem.partitioner, camera, this.renderSystem.lights);
		}

		this.renderSystem.partitioner.process(camera, this.renderSystem.entities, this.renderList);

		if (this.renderSystem.composers.length > 0) {
			for (var i = 0; i < this.renderSystem.composers.length; i++) {
				var composer = this.renderSystem.composers[i];
				composer.render(renderer, this.renderSystem.currentTpf, camera, this.renderSystem.lights, null, true);
			}
		} else {
			renderer.render(this.renderList, camera, this.renderSystem.lights, target, true, overrideMaterial);
		}
	};

	module.exports = PortalSystem;
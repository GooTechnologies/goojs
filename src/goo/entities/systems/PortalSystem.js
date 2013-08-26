define([
	'goo/entities/systems/System'
],
/** @lends */
function (
	System
) {
	"use strict";

	function PortalSystem(renderer, renderSystem) {
		System.call(this, 'PortalSystem', ['MeshRendererComponent', 'MeshDataComponent', 'PortalComponent']);

		this.renderer = renderer;
		this.renderSystem = renderSystem;

		this.renderList = [];
		this.doRender = true;

		this.currentTpf = 0.0;
	}

	PortalSystem.prototype = Object.create(System.prototype);

	PortalSystem.prototype.process = function (entities, tpf) {
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var portalComponent = entity.portalComponent;
			var camera = portalComponent.camera;
			var target1 = portalComponent.target1;
			var target2 = portalComponent.target2;

			// do not perform the render if the surface is culled
			this.render(this.renderer, camera, target1);

			var material = entity.meshRendererComponent.materials[0];
			material.setTexture('DIFFUSE_MAP', target1);

			var tmp = target1;
			portalComponent.target1 = target2;
			portalComponent.target2 = tmp;
		}

		this.currentTpf = tpf;
	};

	PortalSystem.prototype.render = function (renderer, camera, target) {
		//renderer.checkResize(camera);

		// var w = renderer.viewportWidth;
		// var h = renderer.viewportHeight;
		// console.log(w, h);

		// renderer.setViewport(0, 0, target.width, target.height);

		if (!this.doRender) {
			return;
		}

		/*
		renderer.updateShadows(this.partitioner, this.renderSystem.entities, this.lights);

		for (var i = 0; i < this.preRenderers.length; i++) {
			var preRenderer = this.preRenderers[i];
			preRenderer.process(renderer, this.renderSystem.entities, this.partitioner, camera, this.lights);
		}
		*/

		this.renderSystem.partitioner.process(camera, this.renderSystem.entities, this.renderList);

		/*
		if (this.composers.length > 0) {
			for (var i = 0; i < this.composers.length; i++) {
				var composer = this.composers[i];
				composer.render(renderer, this.currentTpf, camera, this.lights, null, true);
			}
		} else {
			renderer.render(this.renderList, camera, this.lights, target, true);
		}
		*/

		renderer.render(this.renderList, camera, this.renderSystem.lights, target, true);

		// renderer.setViewport(0, 0, w, h);
	};

	return PortalSystem;
});
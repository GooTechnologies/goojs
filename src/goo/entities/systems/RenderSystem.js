define([
	'goo/entities/systems/System',
	'goo/entities/EventHandler',
	'goo/renderer/SimplePartitioner'
],
/** @lends RenderSystem */
function (
	System,
	EventHandler,
	SimplePartitioner
) {
	"use strict";

	/**
	 * @class Renders entities/renderables supplied through the render list (coming from the current partitioner)
	 * @param {Entity[]} renderList List of renderables to render
	 * @property {Boolean} doRender Only render if set to true
	 */

	// TODO: Should old renderList argument be assigned to this.renderList?
	function RenderSystem() {
		System.call(this, 'RenderSystem', ['MeshRendererComponent', 'MeshDataComponent']);

		this.entities = [];
		this.renderList = [];
		this.partitioner = new SimplePartitioner();
		this.preRenderers = [];
		this.composers = [];
		this.doRender = true;

		this.camera = null;
		this.lights = [];
		this.currentTpf = 0.0;

		var that = this;
		EventHandler.addListener({
			setCurrentCamera : function (camera) {
				that.camera = camera;
			},
			setLights : function (lights) {
				that.lights = lights;
			}
		});
	}

	RenderSystem.prototype = Object.create(System.prototype);

	RenderSystem.prototype.inserted = function (entity) {
		if (this.partitioner) {
			this.partitioner.added(entity);
		}
	};

	RenderSystem.prototype.deleted = function (entity) {
		if (this.partitioner) {
			this.partitioner.removed(entity);
		}
	};

	RenderSystem.prototype.process = function (entities, tpf) {
		this.entities = entities;
		this.currentTpf = tpf;
	};

	RenderSystem.prototype.render = function (renderer) {
		renderer.checkResize(this.camera);

		if (!this.doRender) {
			return;
		}

		if (this.camera) {
			for (var i = 0; i < this.preRenderers.length; i++) {
				var preRenderer = this.preRenderers[i];
				preRenderer.process(renderer, this.entities, this.partitioner);
			}

			this.renderList.length = 0;
			this.partitioner.process(this.camera, this.entities, this.renderList);

			if (this.composers.length > 0) {
				for (var i = 0; i < this.composers.length; i++) {
					var composer = this.composers[i];
					composer.render(renderer, this.currentTpf);
				}
			} else {
				renderer.render(this.renderList, this.camera, this.lights);
			}
		}
	};

	return RenderSystem;
});
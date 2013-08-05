define([
	'goo/entities/systems/System',
	'goo/entities/EventHandler',
	'goo/renderer/SimplePartitioner'
],
/** @lends */
function (
	System,
	EventHandler,
	SimplePartitioner
) {
	"use strict";

	/**
	 * @class Renders entities/renderables using a configurable partitioner for culling
	 * @property {Boolean} doRender Only render if set to true
	 */
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

		this.picking = {
			doPick: false,
			x: 0,
			y: 0,
			pickingStore: {},
			pickingCallback: function(id, depth) {
				console.log(id, depth);
			},
			skipUpdateBuffer: false
		};
	}

	RenderSystem.prototype = Object.create(System.prototype);

	RenderSystem.prototype.pick = function (x, y, callback, skipUpdateBuffer) {
		this.picking.x = x;
		this.picking.y = y;
		this.picking.skipUpdateBuffer = skipUpdateBuffer === undefined ? false : skipUpdateBuffer;
		if (callback) {
			this.picking.pickingCallback = callback;
		}
		this.picking.doPick = true;
	};

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
			renderer.updateShadows(this.partitioner, this.entities, this.lights);

			for (var i = 0; i < this.preRenderers.length; i++) {
				var preRenderer = this.preRenderers[i];
				preRenderer.process(renderer, this.entities, this.partitioner, this.camera, this.lights);
			}

			this.partitioner.process(this.camera, this.entities, this.renderList);

			if (this.picking.doPick) {
				renderer.pick(this.renderList, this.camera, this.picking.x, this.picking.y, this.picking.pickingStore, this.picking.skipUpdateBuffer);
				this.picking.pickingCallback(this.picking.pickingStore.id, this.picking.pickingStore.depth);
				this.picking.doPick = false;
			}

			if (this.composers.length > 0) {
				for (var i = 0; i < this.composers.length; i++) {
					var composer = this.composers[i];
					composer.render(renderer, this.currentTpf, this.camera, this.lights);
				}
			} else {
				renderer.render(this.renderList, this.camera, this.lights);
			}
		}
	};

	return RenderSystem;
});
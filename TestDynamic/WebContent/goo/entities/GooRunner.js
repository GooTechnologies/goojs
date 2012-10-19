"use strict";

define([ 'goo/entities/World', 'goo/entities/systems/TransformSystem', 'goo/entities/systems/RenderSystem',
		'goo/entities/systems/PartitioningSystem', 'goo/renderer/Renderer',
		'goo/entities/systems/BoundingUpdateSystem', 'goo/entities/systems/ScriptSystem',
		'goo/entities/systems/LightingSystem' ], function(World, TransformSystem, RenderSystem, PartitioningSystem,
		Renderer, BoundingUpdateSystem, ScriptSystem, LightingSystem) {
	function GooRunner() {
		this.world = new World();
		this.renderer = new Renderer();
		GooRunner.renderer = this.renderer;

		// world.setManager(new TagManager());
		// world.setManager(new LightManager());

		// world.setSystem(new LoadingSystem());
		this.world.setSystem(new ScriptSystem());
		// world.setSystem(new VelocitySystem());
		this.world.setSystem(new TransformSystem());
		this.world.setSystem(new BoundingUpdateSystem());
		this.world.setSystem(new LightingSystem());

		var partitioningSystem = new PartitioningSystem();
		this.world.setSystem(partitioningSystem);

		var renderSystem = new RenderSystem(partitioningSystem.renderList);
		this.world.setSystem(renderSystem);

		init();
		window.requestAnimationFrame(run);

		this.callbacks = [];

		var that = this;
		var start = Date.now();
		function run(time) {
			that.world.tpf = (time - start) / 1000.0;
			start = time;

			that.world.process();

			renderSystem.render(that.renderer);

			for ( var i in that.callbacks) {
				that.callbacks[i](that.world.tpf);
			}

			window.requestAnimationFrame(run);
		}
	}

	function init() {
		var lastTime = 0;
		var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

		for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
					|| window[vendors[x] + 'CancelRequestAnimationFrame'];
		}

		if (window.requestAnimationFrame === undefined) {
			window.requestAnimationFrame = function(callback, element) {
				var currTime = Date.now(), timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function() {
					callback(currTime + timeToCall);
				}, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}

		if (window.cancelAnimationFrame === undefined) {
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
		}
	}

	return GooRunner;
});
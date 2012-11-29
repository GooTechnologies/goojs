// REVIEW: This is a better structure for version control + easier to spot mistakes:
// define([
// 'goo/entities/World',
// 'goo/entities/systems/TransformSystem',
// 'goo/entities/systems/RenderSystem',
// 'goo/entities/systems/PartitioningSystem',
// 'goo/renderer/Renderer',
// 'goo/entities/systems/BoundingUpdateSystem',
// 'goo/entities/systems/ScriptSystem',
// 'goo/entities/systems/LightingSystem'
// ], function(
// World,
// TransformSystem,
// RenderSystem,
// PartitioningSystem,
// Renderer,
// BoundingUpdateSystem,
// ScriptSystem,
// LightingSystem
// ) {

define(['goo/entities/World', 'goo/entities/systems/TransformSystem', 'goo/entities/systems/RenderSystem', 'goo/entities/systems/PartitioningSystem',
		'goo/renderer/Renderer', 'goo/entities/systems/BoundingUpdateSystem', 'goo/entities/systems/ScriptSystem',
		'goo/entities/systems/LightingSystem', 'goo/renderer/SimplePartitioner', 'goo/entities/managers/LightManager',
		'goo/entities/systems/CameraSystem', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent'], function(World, TransformSystem,
	RenderSystem, PartitioningSystem, Renderer, BoundingUpdateSystem, ScriptSystem, LightingSystem, SimplePartitioner, LightManager, CameraSystem,
	Camera, CameraComponent) {
	"use strict";

	/**
	 * @name GooRunner
	 * @class Standard setup of entity system to use as base for small projects/demos
	 */
	function GooRunner(parameters) {
		parameters = parameters || {};

		this.world = new World();
		this.renderer = new Renderer();

		// this.world.setManager(new TagManager());
		this.world.setManager(new LightManager());

		// this.world.setSystem(new LoadingSystem());
		this.world.setSystem(new ScriptSystem());
		this.world.setSystem(new TransformSystem());
		this.world.setSystem(new CameraSystem());
		this.world.setSystem(new BoundingUpdateSystem());
		this.world.setSystem(new LightingSystem());

		var partitioningSystem = new PartitioningSystem();
		partitioningSystem.partitioner = new SimplePartitioner();
		this.world.setSystem(partitioningSystem);

		var renderSystem = new RenderSystem(partitioningSystem.renderList);
		this.world.setSystem(renderSystem);

		init();
		window.requestAnimationFrame(run);

		if (parameters.showStats) {
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.left = '0px';
			this.stats.domElement.style.top = '0px';
			// document.getElementById( 'container' ).appendChild(stats.domElement);
			document.body.appendChild(this.stats.domElement);
		}

		this.callbacks = [];

		var that = this;
		var start = Date.now();
		function run(time) {
			that.world.tpf = (time - start) / 1000.0;
			that.world.time += that.world.tpf;
			start = time;

			that.world.process();

			that.renderer.info.reset();

			renderSystem.render(that.renderer);

			for ( var i in that.callbacks) {
				that.callbacks[i](that.world.tpf);
			}

			if (this.stats) {
				this.stats.update();
			}

			window.requestAnimationFrame(run);
		}
	}

	function init() {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];

		for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
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
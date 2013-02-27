define(['goo/entities/World', 'goo/entities/systems/TransformSystem', 'goo/entities/systems/RenderSystem', 'goo/entities/systems/PartitioningSystem',
		'goo/renderer/Renderer', 'goo/entities/systems/BoundingUpdateSystem', 'goo/entities/systems/ScriptSystem',
		'goo/entities/systems/LightingSystem', 'goo/renderer/SimplePartitioner', 'goo/entities/managers/LightManager',
		'goo/entities/systems/CameraSystem', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent', 'goo/util/Stats',
		"goo/entities/systems/CSSTransformSystem", 'goo/util/GameUtils'],
/** @lends GooRunner */
function (World, TransformSystem, RenderSystem, PartitioningSystem, Renderer, BoundingUpdateSystem, ScriptSystem, LightingSystem, SimplePartitioner,
	LightManager, CameraSystem, Camera, CameraComponent, Stats, CSSTransformSystem, GameUtils) {
	"use strict";

	/**
	 * Standard setup of entity system to use as base for small projects/demos It accepts a JSON object containing the settings for the Renderer
	 * class.<br/>
	 * <code>default = {
	 *     alpha : false,
	 *     premultipliedAlpha : true,
	 *     antialias : false,
	 *     stencil : false,
	 *     preserveDrawingBuffer : false,
	 *     showStats : false,
	 *      manuallyStartGameLoop : false
	 * }</code>
	 *
	 * @constructor
	 * @param {Object} parameters GooRunner settings passed in a JSON object.
	 */
	function GooRunner (parameters) {
		parameters = parameters || {};

		this.world = new World();
		this.renderer = new Renderer(parameters);

		// this.world.setManager(new TagManager());
		this.world.setManager(new LightManager());

		// this.world.setSystem(new LoadingSystem());
		this.world.setSystem(new ScriptSystem());
		this.world.setSystem(new TransformSystem());
		this.world.setSystem(new CSSTransformSystem(this.renderer));
		this.world.setSystem(new CameraSystem());
		this.world.setSystem(new BoundingUpdateSystem());
		this.world.setSystem(new LightingSystem());

		var partitioningSystem = new PartitioningSystem();
		partitioningSystem.partitioner = new SimplePartitioner();
		this.world.setSystem(partitioningSystem);

		var renderSystem = new RenderSystem(partitioningSystem.renderList);
		this.world.setSystem(renderSystem);

		this.doRender = true;

		GameUtils.initAllShims();

		if (parameters.showStats) {
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.left = '10px';
			this.stats.domElement.style.top = '10px';
			// document.getElementById( 'container' ).appendChild(stats.domElement);
			document.body.appendChild(this.stats.domElement);
		}

		this.callbacks = [];
		this.callbacksPreProcess = [];
		this.callbacksPreRender = [];

		var that = this;
		this.start = -1;
		this.run = function (time) {
			try {
				if (that.start < 0) {
					that.start = time;
				}
				that.world.tpf = (time - that.start) / 1000.0;
				that.world.time += that.world.tpf;
				World.time = that.world.time;
				that.start = time;
				if (that.world.tpf < 0) {// skip a loop - original start time probably bad.
					that.world.time = 0;
					that.world.tpf = 0;
					World.time = 0;
					that.animationId = window.requestAnimationFrame(that.run);
					return;
				} else if (that.world.tpf > 0.5) {
					that.animationId = window.requestAnimationFrame(that.run);
					return;
				}

				for ( var i in that.callbacksPreProcess) {
					that.callbacksPreProcess[i](that.world.tpf);
				}

				that.world.process();

				for ( var i in that.callbacksPreRender) {
					that.callbacksPreRender[i](that.world.tpf);
				}

				that.renderer.info.reset();

				if (that.doRender) {
					renderSystem.render(that.renderer);
				}

				for ( var i in that.callbacks) {
					that.callbacks[i](that.world.tpf);
				}

				if (that.stats) {
					that.stats.update(that.renderer.info);
				}

				that.animationId = window.requestAnimationFrame(that.run);
			} catch (e) {
				if (e instanceof Error) {
					console.error(e.stack);
				} else {
					console.error(e);
				}
			}
		};

		this.animationId = -1;
		if (!parameters.manuallyStartGameLoop) {
			this.startGameLoop(this.run);
		}

		//TODO: Temporary shift+space for fullscreen and shift+enter for mouselock
		var isCtrl = false;
		document.onkeyup = function (e) {
			if (e.which === 17) {
				isCtrl = false;
			}
		};
		document.onkeydown = function (e) {
			if (e.which === 17) {
				isCtrl = true;
			} else if (e.which === 32 && isCtrl) {
				GameUtils.toggleFullScreen();
			} else if (e.which === 13 && isCtrl) {
				GameUtils.togglePointerLock();
			}
		};
	}

	GooRunner.prototype.startGameLoop = function () {
		this.start = -1;
		this.animationId = window.requestAnimationFrame(this.run);
	};

	GooRunner.prototype.stopGameLoop = function () {
		window.cancelAnimationFrame(this.animationId);
	};

	return GooRunner;
});
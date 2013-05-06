define([
	'goo/entities/World',
	'goo/entities/systems/TransformSystem',
	'goo/entities/systems/RenderSystem',
	'goo/renderer/Renderer',
	'goo/entities/systems/BoundingUpdateSystem',
	'goo/entities/systems/ScriptSystem',
	'goo/entities/systems/LightingSystem',
	'goo/entities/managers/LightManager',
	'goo/entities/systems/CameraSystem',
	'goo/entities/systems/ParticlesSystem',
	'goo/util/Stats',
	"goo/entities/systems/CSSTransformSystem",
	'goo/util/GameUtils'
],
/** @lends */
function (
	World,
	TransformSystem,
	RenderSystem,
	Renderer,
	BoundingUpdateSystem,
	ScriptSystem,
	LightingSystem,
	LightManager,
	CameraSystem,
	ParticlesSystem,
	Stats,
	CSSTransformSystem,
	GameUtils
) {
	"use strict";

	/**
	 * @class Standard setup of entity system to use as base for small projects/demos
	 *
	 * @param {Object} [parameters] GooRunner settings passed in a JSON object.
	 * @param {boolean} [parameters.alpha=false]
	 * @param {boolean} [parameters.premultipliedAlpha=true]
	 * @param {boolean} [parameters.antialias=false]
	 * @param {boolean} [parameters.stencil=false]
	 * @param {boolean} [parameters.preserveDrawingBuffer=false]
	 * @param {boolean} [parameters.showStats=false]
	 * @param {boolean} [parameters.manuallyStartGameLoop=false]
	 * @param {boolean} [parameters.logo=true]
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
		this.world.setSystem(new CameraSystem());
		this.world.setSystem(new CSSTransformSystem(this.renderer));
		this.world.setSystem(new ParticlesSystem());
		this.world.setSystem(new BoundingUpdateSystem());
		this.world.setSystem(new LightingSystem());
		var renderSystem = this.renderSystem = new RenderSystem();
		this.world.setSystem(renderSystem);

		this.doRender = true;

		GameUtils.initAllShims();

		if (parameters.showStats) {
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.left = '10px';
			this.stats.domElement.style.top = '10px';
			document.body.appendChild(this.stats.domElement);
		}
		if (parameters.logo === undefined || parameters.logo) {
			var div = document.createElement('div');
			var svg = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 396.603 277.343" width="70px" height="50px">'
			+ '<path fill="#2A3276" d="M303.337,46.286c-13.578,0-25.784,5.744-34.396,14.998c-9.86,10.59-26.319,10.59-36.172,0'
			+ 'c-8.605-9.254-20.818-14.998-34.402-14.998c-25.936,0-46.971,21.034-46.971,46.978c0,25.936,21.035,46.972,46.971,46.972'
			+ 'c13.584,0,25.797-5.744,34.402-14.998c9.853-10.598,26.325-10.598,36.172,0c8.612,9.254,20.818,14.998,34.396,14.998'
			+ 'c25.941,0,46.977-21.036,46.977-46.972C350.313,67.32,329.278,46.286,303.337,46.286z M198.296,116.39'
			+ 'c-12.785,0-23.146-10.359-23.146-23.144s10.361-23.151,23.146-23.151c12.795,0,23.156,10.367,23.156,23.151'
			+ 'S211.091,116.39,198.296,116.39z M303.337,116.407c-12.785,0-23.146-10.36-23.146-23.144c0-12.784,10.36-23.151,23.146-23.151'
			+ 'c12.795,0,23.156,10.367,23.156,23.151C326.493,106.047,316.132,116.407,303.337,116.407z M156.18,138.347'
			+ 'c-14.087-3.23-22.316-17.482-18.068-31.305c3.704-12.072,2.568-25.511-4.22-37.256C120.927,47.323,92.22,39.63,69.766,52.587'
			+ 'C47.317,65.552,39.624,94.26,52.581,116.713c6.795,11.761,17.853,19.462,30.17,22.282c14.084,3.235,22.314,17.497,18.074,31.317'
			+ 'c-3.711,12.08-2.582,25.504,4.213,37.264c12.965,22.455,41.666,30.148,64.127,17.178c22.447-12.945,30.148-41.658,17.185-64.111'
			+ 'C179.554,148.881,168.497,141.181,156.18,138.347z M104.802,113.287c-11.064,6.387-25.219,2.599-31.604-8.474'
			+ 'c-6.397-11.07-2.604-25.225,8.474-31.609c11.057-6.398,25.22-2.598,31.611,8.46C119.673,92.741,115.872,106.897,104.802,113.287z'
			+ ' M145.687,207.256c-12.785,0-23.145-10.361-23.145-23.145s10.359-23.15,23.145-23.15c12.797,0,23.156,10.367,23.156,23.15'
			+ 'S158.483,207.256,145.687,207.256z" />'
			+ '</svg>';
			var span = '<span style="color: #EEE; font-family: Helvetica, sans-serif; font-size: 11px; display: inline-block; margin-top: 14px; margin-right: -3px; vertical-align: top;">Powered by</span>';

			div.innerHTML = '<a style="text-decoration: none;" href="http://www.gooengine.com" target="_blank">' + span+svg + '</a>';

			div.style.position = 'absolute';
			div.style.top = '10px';
			div.style.right = '10px';
			div.style.zIndex = '2000';
			div.id = 'goologo';

			document.body.appendChild(div);
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

				for (var i = 0; i < that.callbacksPreProcess.length; i++) {
					that.callbacksPreProcess[i](that.world.tpf);
				}

				that.world.process();

				for (var i = 0; i < that.callbacksPreRender.length; i++) {
					that.callbacksPreRender[i](that.world.tpf);
				}

				that.renderer.info.reset();

				if (that.doRender) {
					renderSystem.render(that.renderer);
				}

				for (var i = 0; i < that.callbacks.length; i++) {
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
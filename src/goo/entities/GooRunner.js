define([
	'goo/entities/World',
	'goo/entities/systems/TransformSystem',
	'goo/entities/systems/RenderSystem',
	'goo/renderer/Renderer',
	'goo/renderer/Material',
	'goo/renderer/Util',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/systems/BoundingUpdateSystem',
	'goo/entities/systems/ScriptSystem',
	'goo/entities/systems/LightingSystem',
	'goo/entities/managers/LightManager',
	'goo/entities/systems/CameraSystem',
	'goo/entities/systems/ParticlesSystem',
	'goo/util/Stats',
	"goo/entities/systems/CSSTransformSystem",
	"goo/entities/systems/AnimationSystem",
	"goo/entities/systems/TextSystem",
	"goo/entities/systems/LightDebugSystem",
	"goo/entities/systems/CameraDebugSystem",
	'goo/util/GameUtils',
	'goo/util/Logo',
	'goo/entities/EventHandler'
],
/** @lends */
function (
	World,
	TransformSystem,
	RenderSystem,
	Renderer,
	Material,
	Util,
	ShaderLib,
	BoundingUpdateSystem,
	ScriptSystem,
	LightingSystem,
	LightManager,
	CameraSystem,
	ParticlesSystem,
	Stats,
	CSSTransformSystem,
	AnimationSystem,
	TextSystem,
	LightDebugSystem,
	CameraDebugSystem,
	GameUtils,
	Logo,
	EventHandler
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
	 * @param {boolean} [parameters.tpfSmoothingCount=10]
	 */
	function GooRunner (parameters) {
		parameters = parameters || {};

		this.world = new World();
		this.renderer = new Renderer(parameters);

		this.world.setSystem(new ScriptSystem());
		this.world.setSystem(new TransformSystem());
		this.world.setSystem(new CameraSystem());
		this.world.setSystem(new CSSTransformSystem(this.renderer));
		this.world.setSystem(new ParticlesSystem());
		this.world.setSystem(new BoundingUpdateSystem());
		this.world.setSystem(new LightingSystem());
		this.world.setSystem(new AnimationSystem());
		this.world.setSystem(new TextSystem());
		this.world.setSystem(new LightDebugSystem());
		this.world.setSystem(new CameraDebugSystem());
		this.renderSystem = new RenderSystem();
		this.world.setSystem(this.renderSystem);

		this.doProcess = true;
		this.doRender = true;

		GameUtils.initAllShims();

		this.tpfSmoothingCount = parameters.tpfSmoothingCount !== undefined ? parameters.tpfSmoothingCount : 10;

		if (parameters.showStats) {
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.left = '10px';
			this.stats.domElement.style.top = '10px';
			document.body.appendChild(this.stats.domElement);
		}
		if (parameters.logo === undefined || parameters.logo) {
			var logoDiv = this._buildLogo(parameters.logo);
			document.body.appendChild(logoDiv);
		}

		this.callbacks = [];
		this.callbacksPreProcess = [];
		this.callbacksPreRender = [];
		this._takeSnapshots = [];

		var that = this;
		this.start = -1;
		this.run = function (time) {
			try {
				that._updateFrame(time);
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

		this._addDebugKeys();
		this.currentMouseOn = null;
		this.lastMosueOn = null;
	}

	var tpfSmoothingArrary = [];
	var tpfIndex = 0;

	GooRunner.prototype._updateFrame = function (time) {
		if (this.start < 0) {
			this.start = time;
		}

		var tpf = (time - this.start) / 1000.0;

		if (tpf < 0) { // skip a loop - original start time probably bad.
			this.world.time = 0;
			this.world.tpf = 0;
			World.time = 0;
			this.animationId = window.requestAnimationFrame(this.run);
			return;
		} else if (tpf > 0.5) { // big tpf, probably lost focus
			this.start = time;
			this.animationId = window.requestAnimationFrame(this.run);
			return;
		}

		tpf = Math.max(Math.min(tpf, 0.5), 0.0001);

		// Smooth out the tpf
		tpfSmoothingArrary[tpfIndex] = tpf;
		tpfIndex = (tpfIndex + 1) % this.tpfSmoothingCount;
		var avg = 0;
		for (var i = 0; i < tpfSmoothingArrary.length; i++) {
			avg += tpfSmoothingArrary[i];
		}
		avg /= tpfSmoothingArrary.length;
		this.world.tpf = avg;

		this.world.time += this.world.tpf;
		World.time = this.world.time;
		this.start = time;

		for (var i = 0; i < this.callbacksPreProcess.length; i++) {
			this.callbacksPreProcess[i](this.world.tpf);
		}

		if (this.doProcess) {
			this.world.process();
		}

		for (var i = 0; i < this.callbacksPreRender.length; i++) {
			this.callbacksPreRender[i](this.world.tpf);
		}

		this.renderer.info.reset();

		if (this.doRender) {
			this.renderSystem.render(this.renderer);
		}

		for (var i = 0; i < this.callbacks.length; i++) {
			this.callbacks[i](this.world.tpf);
		}

		if (this.stats) {
			this.stats.update(this.renderer.info);
		}
		if (this._takeSnapshots.length) {
			try {
				var image = this.renderer.domElement.toDataURL();
				for (var i = this._takeSnapshots.length - 1; i >= 0; i--) {
					this._takeSnapshots[i](image);
				}
			} catch (err) {
				console.error('Failed to take snapshot', err.message);
			}
			this._takeSnapshots = [];
		}


		this.animationId = window.requestAnimationFrame(this.run);
	};

	GooRunner.prototype._buildLogo = function (settings) {
		var div = document.createElement('div');
		var svg = Logo.getLogo({
			width: '70px',
			height: '50px',
			color: Logo.blue
		});
		var span = '<span style="color: #EEE; font-family: Helvetica, sans-serif; font-size: 11px; display: inline-block; margin-top: 14px; margin-right: -3px; vertical-align: top;">Powered by</span>';
		div.innerHTML = '<a style="text-decoration: none;" href="http://www.gooengine.com" target="_blank">' + span + svg + '</a>';
		div.style.position = 'absolute';
		div.style.zIndex = '2000';
		if (settings === 'topright') {
			div.style.top = '10px';
			div.style.right = '10px';
		} else if (settings === 'topleft') {
			div.style.top = '10px';
			div.style.left = '10px';
		} else if (settings === 'bottomright') {
			div.style.bottom = '10px';
			div.style.right = '10px';
		} else if (settings === 'bottomleft') {
			div.style.bottom = '10px';
			div.style.left = '10px';
		} else {
			div.style.top = '10px';
			div.style.right = '10px';
		}
		div.id = 'goologo';
		div.style.webkitTouchCallout = 'none';
		div.style.webkitUserSelect = 'none';
		div.style.khtmlUserSelect = 'none';
		div.style.mozUserSelect = 'none';
		div.style.msUserSelect = 'none';
		div.style.userSelect = 'none';
		div.ondragstart = function() {
			return false;
		};

		return div;
	};

	GooRunner.prototype._addDebugKeys = function () {
		//TODO: Temporary keymappings
		// shift+space = toggle fullscreen
		// shift+enter = toggle mouselock
		// shift+1 = normal rendering
		// shift+2 = show normals
		// shift+3 = simple lit
		// shift+4 = wireframe
		// shift+5 = flat wireframe
		// shift+6 = lit wireframe
		var isCtrl = false;
		document.addEventListener("keyup", function (e) {
			if (e.which === 16) {
				isCtrl = false;
			}
		}, false);
		document.addEventListener("keydown", function (e) {
			if (e.which === 16) {
				isCtrl = true;
			} else if (e.which === 32 && isCtrl) {
				GameUtils.toggleFullScreen();
			} else if (e.which === 13 && isCtrl) {
				GameUtils.togglePointerLock();
			} else if (e.which === 49 && isCtrl) {
				this.renderer.overrideMaterial = null;
			} else if (e.which === 50 && isCtrl) {
				this.renderer.overrideMaterial = Material.createMaterial(Util.clone(ShaderLib.showNormals), 'OverrideMaterial1');
			} else if (e.which === 51 && isCtrl) {
				this.renderer.overrideMaterial = Material.createMaterial(Util.clone(ShaderLib.simpleLit), 'OverrideMaterial2');
			} else if (e.which === 52 && isCtrl) {
				var material4 = Material.createMaterial(Util.clone(ShaderLib.simple), 'OverrideMaterial4');
				material4.wireframe = true;
				material4.wireframeColor = [0, 0, 0];
				this.renderer.overrideMaterial = material4;
			} else if (e.which === 53 && isCtrl) {
				var material3 = Material.createMaterial(Util.clone(ShaderLib.simple), 'OverrideMaterial3');
				var material4 = Material.createMaterial(Util.clone(ShaderLib.simple), 'OverrideMaterial4');
				material4.wireframe = true;
				material4.wireframeColor = [0, 0, 0];
				var material5 = [material3, material4];
				this.renderer.overrideMaterial = material5;
			} else if (e.which === 54 && isCtrl) {
				var material2 = Material.createMaterial(Util.clone(ShaderLib.simpleLit), 'OverrideMaterial2');
				var material4 = Material.createMaterial(Util.clone(ShaderLib.simple), 'OverrideMaterial4');
				material4.wireframe = true;
				material4.wireframeColor = [0, 0, 0];
				var material6 = [material2, material4];
				this.renderer.overrideMaterial = material6;
			}
		}.bind(this), false);

		document.addEventListener("mousedown", function (e) {
			if (isCtrl) {
				var x = e.clientX;
				var y = e.clientY;
				this.renderSystem.pick(x, y, function(id, depth) {
					var entity = this.world.entityManager.getEntityById(id);
					console.log('Picked entity:', entity, 'At depth:', depth);
				}.bind(this));
			}
		}.bind(this), false);

		///
		var mouseMovePicking = false;
		var lastEntity = null;
		document.addEventListener("mousemove", function (e) {
			if (mouseMovePicking) {
				var x = e.clientX;
				var y = e.clientY;
				this.renderSystem.pick(x, y, function(id) {
					var entity = this.world.entityManager.getEntityById(id);
					if(entity !== lastEntity) {
						EventHandler.dispatch('mouseOut', lastEntity);
						EventHandler.dispatch('mouseEnter', entity);
						lastEntity = entity;
					}
				}.bind(this));
			}
		}.bind(this), false);
	};

	/**
	 * Starts the game loop. (done through requestAnimationFrame)
	 */
	GooRunner.prototype.startGameLoop = function () {
		this.start = -1;
		this.animationId = window.requestAnimationFrame(this.run);
	};

	/**
	 * Stops the game loop.
	 */
	GooRunner.prototype.stopGameLoop = function () {
		window.cancelAnimationFrame(this.animationId);
	};

	/**
	 * Takes snapshot at next rendercall
	 */
	GooRunner.prototype.takeSnapshot = function(callback) {
		this._takeSnapshots.push(callback);
	};

	return GooRunner;
});
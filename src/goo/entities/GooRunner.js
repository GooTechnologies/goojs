define([
	'goo/entities/World',
	'goo/entities/systems/TransformSystem',
	'goo/entities/systems/RenderSystem',
	'goo/renderer/Renderer',
	'goo/entities/systems/BoundingUpdateSystem',
	'goo/entities/systems/ScriptSystem',
	'goo/entities/systems/LightingSystem',
	'goo/entities/systems/CameraSystem',
	'goo/entities/systems/ParticlesSystem',
	'goo/util/Stats',
	"goo/entities/systems/CSSTransformSystem",
	"goo/entities/systems/AnimationSystem",
	"goo/entities/systems/LightDebugSystem",
	"goo/entities/systems/CameraDebugSystem",
	'goo/entities/systems/MovementSystem',

	'goo/sound/AudioContext',
	'goo/entities/systems/SoundSystem',

	'goo/entities/components/TransformComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/LightComponent',
	'goo/entities/components/ScriptComponent',
	'goo/entities/components/SoundComponent',

	'goo/util/GameUtils',
	'goo/util/Logo'
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
	CameraSystem,
	ParticlesSystem,
	Stats,
	CSSTransformSystem,
	AnimationSystem,
	LightDebugSystem,
	CameraDebugSystem,
	MovementSystem,

	AudioContext,
	SoundSystem,

	TransformComponent,
	MeshDataComponent,
	MeshRendererComponent,
	CameraComponent,
	LightComponent,
	ScriptComponent,
	SoundComponent,

	GameUtils,
	Logo
) {
	'use strict';

	/**
	 * @class The main class that updates the world and calls the renderers
	 *
	 * @param {Object} [parameters] GooRunner settings passed in a JSON object
	 * @param {boolean} [parameters.alpha=false] Specifies if the canvas should have an alpha channel or not.
	 * @param {boolean} [parameters.premultipliedAlpha=true] Enables or disables premultiplication of color by alpha
	 * @param {boolean} [parameters.antialias=true] Specifies if antialiasing should be turned on or no
	 * @param {boolean} [parameters.stencil=false] Enables the stencil buffer
	 * @param {boolean} [parameters.preserveDrawingBuffer=false] By default the drawing buffer will be cleared after it is presented to the HTML compositor. Enable this option to not clear the drawing buffer
	 * @param {canvas}  [parameters.canvas] If not supplied, Renderer will create a new canvas
	 * @param {boolean} [parameters.showStats=false] If enabled a small stats widget showing stats will be displayed
	 * @param {boolean} [parameters.useDevicePixelRatio=false] Take into account the device pixel ratio (for retina screens etc)
	 * @param {boolean} [parameters.manuallyStartGameLoop=false] By default the 'game loop' will start automatically. Enable this option to manually start the game loop at any time
	 * @param {boolean | string | { position, color }} [parameters.logo='topright'] Specifies whether the Goo logo is visible or not and where should and be placed and what color should it have.
	 * If the parameter is not specified then the logo is placed in the top right corner.
	 * If no logo is desired then this parameter should have the 'false' value.
	 * If the supplied parameter is one of the following: 'topleft', 'topright', 'bottomleft', 'bottomright' then the logo will be positioned in the according corner
	 * If the parameter is of type object then the logo will be positioned according to the 'position' key and will be colored according to the 'color' key
	 * @param {boolean} [parameters.tpfSmoothingCount=10] Specifies the amount of previous frames to use when computing the 'time per frame'
	 * @param {boolean} [parameters.debugKeys=false] If enabled the hotkeys Shift+[1..6] will be enabled
	 */

	function GooRunner (parameters) {
		parameters = parameters || {};

		GameUtils.initAllShims();

		/** Automatically created Goo world.
		 * @type {World}
		 */
		this.world = new World(this);

		/** Automatically created renderer.
		 * @type {Renderer}
		 */
		this.renderer = new Renderer(parameters);

		// do this is a method called setupSystems
		this.world.setSystem(new ScriptSystem(this.world));
		this.world.setSystem(new TransformSystem());
		this.world.setSystem(new CameraSystem());
		this.world.setSystem(new CSSTransformSystem(this.renderer)); // Go away!
		this.world.setSystem(new ParticlesSystem());
		this.world.setSystem(new BoundingUpdateSystem());
		this.world.setSystem(new LightingSystem());
		this.world.setSystem(new AnimationSystem());
		this.world.setSystem(new LightDebugSystem()); // Go away!
		this.world.setSystem(new CameraDebugSystem()); // Go away!
		this.world.setSystem(new MovementSystem()); // Go away!
		if (AudioContext) {
			this.world.setSystem(new SoundSystem());
		}

		this.renderSystem = new RenderSystem();
		this.renderSystems = [this.renderSystem];
		this.world.setSystem(this.renderSystem);

		// register components - do it in a separate method; can be an array
		this.world.registerComponent(TransformComponent);
		this.world.registerComponent(MeshDataComponent);
		this.world.registerComponent(MeshRendererComponent);
		this.world.registerComponent(CameraComponent);
		this.world.registerComponent(LightComponent);
		this.world.registerComponent(ScriptComponent);

		this.doProcess = true;
		this.doRender = true;

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
		this.callbacksNextFrame = [];
		this._takeSnapshots = [];

		this.start = -1;

		this.animationId = 0;
		if (!parameters.manuallyStartGameLoop) {
			this.startGameLoop();
		}

		if (parameters.debugKeys) {
			this._addDebugKeys();
		}

		// Event stuff
		this._events = {
			click: null,
			mousedown: null,
			mouseup: null,
			mousemove: null
		};
		this._eventListeners = {
			click: [],
			mousedown: [],
			mouseup: [],
			mousemove: []
		};
		this._eventTriggered = {
			click: null,
			mousedown: null,
			mouseup: null,
			mousemove: null
		};

		GameUtils.addVisibilityChangeListener(function (paused) {
			if (paused) {
				this._stopGameLoop();
			} else {
				if (!this.manuallyPaused) {
					this._startGameLoop();
				}
			}
		}.bind(this));

		this._picking = {
			x: 0,
			y: 0,
			skipUpdateBuffer: false,
			doPick: false,
			pickingCallback: null,
			pickingStore: {},
			clearColorStore: []
		};

		this.manuallyPaused = !!parameters.manuallyStartGameLoop;
	}

	/**
	 *
	 * @private
	 * @param time
	 */
	//! TODO: private until documented
	GooRunner.prototype.run = function (time) {
		try {
			this._updateFrame(time);
		} catch (e) {
			if (e instanceof Error) {
				console.error(e.stack);
			} else {
				console.error(e);
			}
		}
	};

	/**
	 * Add a render system to the world
	 * @private
	 * @param system
	 * @param idx
	 */
	//! AT: private until priorities get added to render systems as 'idx' is very unflexibile
	GooRunner.prototype.setRenderSystem = function (system, idx) {
		this.world.setSystem(system);
		if (idx !== undefined) {
			this.renderSystems.splice(idx, 0, system);
		} else {
			this.renderSystems.push(system);
		}
	};

	var tpfSmoothingArray = [];
	var tpfIndex = 0;

	GooRunner.prototype._updateFrame = function (time) {
		if (this.start < 0) {
			this.start = time;
		}

		var tpf = (time - this.start) / 1000.0;

		if (tpf < 0 || tpf > 1.0) { // skip a loop - original start time probably bad.
			this.start = time;
			this.animationId = window.requestAnimationFrame(this.run.bind(this));
			return;
		}

		tpf = Math.max(Math.min(tpf, 0.5), 0.0001); //! AT: MathUtils.clamp

		// Smooth out the tpf
		tpfSmoothingArray[tpfIndex] = tpf;
		tpfIndex = (tpfIndex + 1) % this.tpfSmoothingCount;
		var avg = 0;
		for (var i = 0; i < tpfSmoothingArray.length; i++) {
			avg += tpfSmoothingArray[i];
		}
		avg /= tpfSmoothingArray.length;
		this.world.tpf = avg;

		this.world.time += this.world.tpf;
		World.time = this.world.time;
		World.tpf = this.world.tpf;
		this.start = time;

		// execute callbacks
		//! AT: doing this to be able to schedule new callbacks from the existing callbacks
		try {
			var callbacksNextFrame = this.callbacksNextFrame;
			this.callbacksNextFrame = [];
			for (var i = 0; i < callbacksNextFrame.length; i++) {
				callbacksNextFrame[i](this.world.tpf);
			}
		} catch (e) {
			console.error(e);
		}

		try {
			for (var i = 0; i < this.callbacksPreProcess.length; i++) {
				this.callbacksPreProcess[i](this.world.tpf);
			}
		} catch (e) {
			console.error(e);
		}

		// process the world
		if (this.doProcess) {
			this.world.process();
		}

		this.renderer.info.reset();

		if (this.doRender) {
			this.renderer.checkResize(Renderer.mainCamera);
			this.renderer.setRenderTarget();
			//this.renderer.clear();

			// run the prerender callbacks
			for (var i = 0; i < this.callbacksPreRender.length; i++) {
				this.callbacksPreRender[i](this.world.tpf);
			}

			// run all the renderers
			for (var i = 0; i < this.renderSystems.length; i++) {
				if (!this.renderSystems[i].passive) {
					this.renderSystems[i].render(this.renderer);
				}
			}
			// handle pick requests
			if (this._picking.doPick && Renderer.mainCamera) {
				var cc = this.renderer.clearColor.data;
				this._picking.clearColorStore[0] = cc[0];
				this._picking.clearColorStore[1] = cc[1];
				this._picking.clearColorStore[2] = cc[2];
				this._picking.clearColorStore[3] = cc[3];
				this.renderer.setClearColor(0, 0, 0, 1);

				for (var i = 0; i < this.renderSystems.length; i++) {
					if (this.renderSystems[i].renderToPick && !this.renderSystems[i].passive) {
						this.renderSystems[i].renderToPick(this.renderer, this._picking.skipUpdateBuffer);
					}
				}
				this.renderer.pick(this._picking.x, this._picking.y, this._picking.pickingStore, Renderer.mainCamera);
				try {
					this._picking.pickingCallback(this._picking.pickingStore.id, this._picking.pickingStore.depth);
				} catch (e) {
					console.error(e);
				}
				this._picking.doPick = false;

				this.renderer.setClearColor.apply(this.renderer, this._picking.clearColorStore);
			}
		}

		// run the post render callbacks
		try {
			for (var i = 0; i < this.callbacks.length; i++) {
				this.callbacks[i](this.world.tpf);
			}
		} catch (e) {
			console.error(e);
		}

		// update the stats if there are any
		if (this.stats) {
			this.stats.update(this.renderer.info);
		}

		// resolve any snapshot requests
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

		// schedule next frame
		this.animationId = window.requestAnimationFrame(this.run.bind(this));
	};

	//TODO: move this to Logo
	GooRunner.prototype._buildLogo = function (settings) {
		var div = document.createElement('div');

		var color = settings && settings.color ? settings.color : Logo.blue;

		var svg = Logo.getLogo({
			width: '70px',
			height: '50px',
			color: color
		});
		var span = '<span style="color: #EEE; font-family: Helvetica, sans-serif; font-size: 11px; display: inline-block; margin-top: 14px; margin-right: -3px; vertical-align: top;">Powered by</span>';
		div.innerHTML = '<a style="text-decoration: none;" href="http://www.gooengine.com" target="_blank">' + span + svg + '</a>';
		div.style.position = 'absolute';
		div.style.zIndex = '2000';

		if (!settings) {
			div.style.top = '10px';
			div.style.right = '10px';
		} else if (settings === 'topright' || settings.position === 'topright') {
			div.style.top = '10px';
			div.style.right = '10px';
		} else if (settings === 'topleft' || settings.position === 'topleft') {
			div.style.top = '10px';
			div.style.left = '10px';
		} else if (settings === 'bottomright' || settings.position === 'bottomright') {
			div.style.bottom = '10px';
			div.style.right = '10px';
		} else {
			div.style.bottom = '10px';
			div.style.left = '10px';
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

	/**
	 * Enable misc debug configurations for inspecting aspects of the scene on hotkeys.
	 * @private
	 */
	GooRunner.prototype._addDebugKeys = function () {
		// shift+space = toggle fullscreen
		// shift+enter = toggle mouselock
		// shift+1 = normal rendering
		// shift+2 = show normals
		// shift+3 = simple lit
		// shift+4 = color
		// shift+5 = wireframe
		// shift+6 = flat
		// shift+7 = textured
		// shift+8 = regular material + wireframe
		// shift+click = log picked entity
		var activeKey = 'shiftKey';
		document.addEventListener("keydown", function (e) {
			if (e.which === 32 && e[activeKey]) { // Space
				GameUtils.toggleFullScreen();
			} else if (e.which === 13 && e[activeKey]) { // Enter
				GameUtils.togglePointerLock();
			} else if (e.which === 49 && e[activeKey]) { // 1
				this.renderSystem.setDebugMaterial();
			} else if ((e.which === 50 || e.which === 222) && e[activeKey]) { // 2
				this.renderSystem.setDebugMaterial('normals');
			} else if (e.which === 51 && e[activeKey]) { // 3
				this.renderSystem.setDebugMaterial('lit');
			} else if (e.which === 52 && e[activeKey]) { // 4
				this.renderSystem.setDebugMaterial('color');
			} else if (e.which === 53 && e[activeKey]) { // 5
				this.renderSystem.setDebugMaterial('wireframe');
			} else if (e.which === 54 && e[activeKey]) { // 6
				this.renderSystem.setDebugMaterial('flat');
			} else if ((e.which === 55 || e.which === 191) && e[activeKey]) { // 7
				this.renderSystem.setDebugMaterial('texture');
			} else if ((e.which === 56) && e[activeKey]) { // 8
				this.renderSystem.setDebugMaterial('+wireframe');
			}
		}.bind(this), false);

		document.addEventListener('mousedown', function (e) {
			if (e[activeKey]) {
				var x = e.clientX;
				var y = e.clientY;
				this.pick(x, y, function(id, depth) {
					var entity = this.world.entityManager.getEntityById(id);
					console.log('Picked entity:', entity, 'At depth:', depth);
				}.bind(this));
			}
		}.bind(this), false);
	};

	/**
	 * Adds an event listener to the GooRunner
	 * @param {string} type Can currently be 'click', 'mousedown', 'mousemove' or 'mouseup'
	 * @param {function(event)} Callback to call when event is fired
	 */
	GooRunner.prototype.addEventListener = function (type, callback) {
		if(!this._eventListeners[type] || this._eventListeners[type].indexOf(callback) > -1) {
			return;
		}

		if(typeof callback === 'function') {
			this._eventListeners[type].push(callback);
			if(this._eventListeners[type].length === 1) {
				this._enableEvent(type);
			}
		}
	};

	/**
	 * Removes an event listener to the GooRunner
	 * @param {string} type Can currently be 'click', 'mousedown', 'mousemove' or 'mouseup'
	 * @param {function(event)} Callback to remove from event listener
	 */
	GooRunner.prototype.removeEventListener = function (type, callback) {
		if(!this._eventListeners[type]) {
			return;
		}
		var index = this._eventListeners[type].indexOf(callback);
		if (index > -1) {
			this._eventListeners[type].splice(index, 1);
		}
		if (this._eventListeners[type].length === 0) {
			this._disableEvent(type);
		}
	};

	/**
   * Triggers an event on the goorunner (force)
	 * @param {string} type Can currently be 'click', 'mousedown', 'mousemove' or 'mouseup'
	 * @param {object} evt The goorunner-style event
	 * @param {Entity} evt.entity The goorunner-style event
	 * @param {number} evt.x
	 * @param {number} evt.y
	 * @param {Event} evt.domEvent The original DOM event
   */
	GooRunner.prototype.triggerEvent = function(type, evt) {
		evt.type = type;
		this._eventTriggered[type] = evt.domEvent;
		this._dispatchEvent(evt);
	};


	GooRunner.prototype._dispatchEvent = function (evt) {
		for (var type in this._eventTriggered) {
			if(this._eventTriggered[type] && this._eventListeners[type]) {
				var e = {
					entity: evt.entity,
					depth: evt.depth,
					x: evt.x,
					y: evt.y,
					type: type,
					domEvent: this._eventTriggered[type],
					id: evt.id,
					intersection: evt.intersection
				};
				try {
					for (var i = 0; i < this._eventListeners[type].length; i++) {
						if(this._eventListeners[type][i](e) === false) {
							break;
						}
					}
				} catch(err) {
					console.error(err);
				}
				this._eventTriggered[type] = null;
			}
		}
	};

	/**
	 * Enables event listening on the GooRunner
	 * @param {string} type Can currently be 'click', 'mousedown', 'mousemove' or 'mouseup'
	 * @private
	 */
	GooRunner.prototype._enableEvent = function (type) {
		if(this._events[type]) {
			return;
		}
		var func = function(e) {
			var x = (e.offsetX !== undefined) ? e.offsetX : e.layerX;
			var y = (e.offsetY !== undefined) ? e.offsetY : e.layerY;
			this._eventTriggered[type] = e;
			this.pick(x, y, function(index, depth) {
				var entity = this.world.entityManager.getEntityByIndex(index);
				var intersection = Renderer.mainCamera.getWorldPosition(x, y, this.renderer.viewportWidth, this.renderer.viewportHeight, depth);
				this._dispatchEvent({
					entity: entity,
					depth: depth,
					x: x,
					y: y,
					id: index,
					intersection: intersection
				});
			}.bind(this));
		}.bind(this);
		this.renderer.domElement.addEventListener(type, func);
		this._events[type] = func;
	};

	/**
	 * Disables event listening on the GooRunner
	 * @param {string} type Can currently be 'click', 'mousedown', 'mousemove' or 'mouseup'
	 * @private
	 */
	GooRunner.prototype._disableEvent = function (type) {
		if (this._events[type]) {
			this.renderer.domElement.removeEventListener(type, this._events[type]);
		}
		this._events[type] = null;
	};

	/**
	 * The method that actually starts the game loop
	 * @private
	 */
	GooRunner.prototype._startGameLoop = function () {
		if (!this.animationId) {
			this.start = -1;
			this.animationId = window.requestAnimationFrame(this.run.bind(this));
		}
	};

	/**
	 * Starts the game loop. (done through requestAnimationFrame)
	 */
	GooRunner.prototype.startGameLoop = function () {
		this.manuallyPaused = false;
		this._startGameLoop();
	};

	/**
	 * The method that actually stops the game loop
	 * @private
	 */
	GooRunner.prototype._stopGameLoop = function () {
		window.cancelAnimationFrame(this.animationId);
		this.animationId = 0;
	};

	/**
	 * Stops the game loop.
	 */
	GooRunner.prototype.stopGameLoop = function () {
		this.manuallyPaused = true;
		this._stopGameLoop();
	};

	/**
	 * Takes an image snapshot from the 3d scene at next render call
	 */
	GooRunner.prototype.takeSnapshot = function (callback) {
		this._takeSnapshots.push(callback);
	};

	/**
	 * Requests a pick from screen space coordinates. A successful pick returns id and depth of the pick target.
	 *
	 * @param {number} x screen coordinate
	 * @param {number} y screen coordinate
	 * @param {Function} callback to handle the pick result
	 * @param {boolean} skipUpdateBuffer when true picking will be attempted against existing buffer
	 */
	GooRunner.prototype.pick = function (x, y, callback, skipUpdateBuffer) {
		this._picking.x = x;
		this._picking.y = y;
		this._picking.skipUpdateBuffer = skipUpdateBuffer === undefined ? false : skipUpdateBuffer;
		if (callback) {
			this._picking.pickingCallback = callback;
		}
		this._picking.doPick = true;
	};

	/**
	 * Pick, the synchronous method. Uses the same pickbuffer so it will affect asynch picking. Also goes only through the normal render system.
	 * @private
	 */
	GooRunner.prototype.pickSync = function (x, y) {
		// save the clear color
		var currentClearColor = this.renderer.clearColor.data;

		var savedClearColor = [
			currentClearColor[0],
			currentClearColor[1],
			currentClearColor[2],
			currentClearColor[3]
		];

		// change the clear color
		this.renderer.setClearColor(0, 0, 0, 1);

		// render
		this.renderSystem.renderToPick(this.renderer, false);

		// restore the clear color
		this.renderer.setClearColor.apply(this.renderer, savedClearColor);

		// get the picking data from the buffer
		var pickingStore = {};
		this.renderer.pick(x, y, pickingStore, Renderer.mainCamera);
		return pickingStore;
	};

	return GooRunner;
});
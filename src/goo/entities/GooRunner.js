define( 
	[ "goo/entities/Collection",
	  "goo/entities/ProcessParameters",
	  "goo/util/ParseArguments",
	  "goo/entities/Scene",
	  "goo/entities/Entity",
	  "goo/renderer/Renderer",
	  "goo/util/GameUtils",
	  "goo/util/Logo",
	  "goo/util/Stats",
	  "goo/loaders/DynamicLoader",
	  "goo/entities/World" ],				// REVIEW: REMOVE! Only reason it's here is because of static World.time, which should be removed, too.
	  
	function( Collection, ProcessParameters, ParseArguments, Scene, Entity, Renderer, GameUtils, Logo, Stats, DynamicLoader, World ) {

		"use strict";

		var collection       = new Collection();
		var collectionScenes = new Collection();

		function GooRunner( parameters ) {
			parameters = parameters || {};

			this.processParameters   = new ProcessParameters( parameters );
			this.scenes              = [];
			this.renderer            = new Renderer( parameters );		// REVIEW: maybe renderer should be on Scene level?
			this.rafId               = -1;

			// REVIEW: Even though I've writen to add more access methods we should ask ourselves if
			// the renderer should be shared among scenes or not...
			// TODO: add more access methods
			// setup renderer access methods

			this.domElement    = this.renderer.domElement;
			this.setClearColor = this.renderer.setClearColor.bind( this.renderer );

			if( parameters.domContainer ) {
				parameters.domContainer.appendChild( this.domElement );
			} 

			// add scenes

			this.add( parameters.scenes );

			if( this.scenes.length === 0 ) {
				this.addScene( new Scene( { name: "default" } ));
			}

			// REVIEW: all callbacks should have an API (add/get etc).
			// Also, would look better to wrap all callbacks in an object, like this.callbacks = { preProcess: [], preRender: [], postRender: [] }; 
			this.callbacks           = [];
			this.callbacksPreProcess = [];
			this.callbacksPreRender  = [];

			// REVIEW: these should probably be removed and you should use
			// scene.enabled and scene.visible
			this.doProcess = true;
			this.doRender = true;

			// REVIEW: maybe move all of this picking out of Goo(Runner) somehow.
			// Would be nice with just a Pick.pixelAt( 0, 0 ) or something...
			this._takeSnapshots = [];
			this._picking = {
				x: 0,
				y: 0,
				skipUpdateBuffer: false,
				doPick: false,
				pickingCallback: null,
				pickingStore: {},
				clearColorStore: []
			};

			// REVIEW: Move this to signals.js or own Event-class?
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

			// setup GameUtils
			// REVIEW: what happens here if we've got multiple Goo-instances? Also, should
			// we be dependent on "GameUtils" or do our own implementation of the features used
			GameUtils.initAllShims();
			GameUtils.addVisibilityChangeListener( function( paused ) {
				if( paused ) {
					this.pause();
				} else {
					this.start();
				}
			}.bind( this ));

			// setup stats and logo
			// REVIEW: put these in separate classes?
			if( parameters.showStats ) {
				this.stats = new Stats();
				this.stats.domElement.style.position = 'absolute';
				this.stats.domElement.style.left = '10px';
				this.stats.domElement.style.top = '10px';
				document.body.appendChild( this.stats.domElement );
			}

			if( parameters.logo === undefined || parameters.logo ) {
				var logoDiv = this._buildLogo(parameters.logo);
				document.body.appendChild(logoDiv);
			}

			// REVIEW: this should be removed! No more world.
			this.world = this.scenes[ 0 ];
			World.time = 0;

			// REVIEW: this is for backwards compability. RenderSystems now live on Scene level.
			this.renderSystem  = this.world.getSystem( "RenderSystem" );
			this.renderSystems = [ this.renderSystem ];			// REVIEW: maybe renderer should be on Scene level?

			// REVIEW: Using that ugly API2-hack to turn this off by default and changed name to "start"
			if( GooRunner.isAPI2 ) {
				if( parameters.start === true ) {
					this.startGameLoop(this.run);
				}
			} else {
				if( !parameters.manuallyStartGameLoop ) {
					this.startGameLoop(this.run);
				}
			}

			if( parameters.debugKeys ) {
				this._addDebugKeys();
			}
		}

		// general add/get methods

		GooRunner.prototype.add = function() {
			collection.clear();
			collection.preventClear();

			// TODO: change to ParseArguments

			var argument, a, al = arguments.length;
			var type;
			for( a = 0; a < al; a++ ) {
				argument = arguments[ a ];

				if( argument !== undefined ) {
					type = typeof( argument );

					if( type === "object" ) { 
						if( Array.isArray( argument )) {
							this.add.apply( this, argument );
							collection.preventClear();
						} else {
							collection.add( this.addScene( argument ));
						}
					} else if( type === "function" || type === "string" ) {
						collection.add( this.addScene( argument ));
					}
				}
			}

			collection.allowClear();
			return collection.items.length === 1 ? collection.first : collection;
		};

		GooRunner.prototype.get = function() {
			collection.clear();
			collection.preventClear();

			// TODO: Change to ParseArguments

			var argument, a, al = arguments.length;
			var type;
			for( a = 0; a < al; a++ ) {
				argument = arguments[ a ];

				if( argument !== undefined ) {
					type = typeof( argument );

					if( type === "object" ) { 
						if( Array.isArray( argument )) {
							this.add.apply( argument );
						} else {
							collection.add( this.getScene( argument.name ));
						}
					} else if( type === "string" ) {
						collection.add( this.getScene( argument ));
					}
				}
			}

			if( collection.items.length === 0 ) {
				return this.scenes[ 0 ];
			}

			collection.allowClear();
			return collection.items.length === 1 ? collection.first : collection;
		};

		// scene methods

		GooRunner.prototype.addScene = function( scene ) {

			// TODO: Change to process parameters

			if( scene === undefined ) {
				scene = new Scene();
			} else if( typeof( scene ) === "string" ) {
				scene = new Scene( { name: scene } );
			} else if( typeof( scene ) === "function" ) {
				scene = new scene();
			} else if( scene instanceof Scene ) {
				scene = scene;
			} else {
				console.error( "Goo.addScene: unknown parameter type ", scene );
			}

			scene.init( this );
			this.scenes.push( scene );

			return scene;
		};

		GooRunner.prototype.getScene = function() {
			if( arguments.length === 0 ) {
				return collection.fromArray( this.scenes ).orFirst();
			}
 
			collectionScenes.fromArray( this.scenes );
			collection.clear();

			ParseArguments( this, arguments, function( goo, type, value ) {
				if( type === ProcessParameters.STRING ) {
					collection.add( collectionScenes.compare( "name", value ));
				} else if( type === ProcessParameters.INSTANCE ) {
					collection.add( value );
				} else if( type === ProcessParameters.CONSTRUCTOR ) {
					collectionScenes.each( function( scene ) {
						collection.add( scene );
					});
				}
			});

			return collection.orFirst();
		};

		GooRunner.prototype.loadScene = function( path, onSuccess, onError ) {
			var scene  = this.scenes.length === 1 ? this.scenes[ 0 ] : this.addScene();
			var loader = new DynamicLoader( {
				world   : scene,
				rootPath: path
			} );

			loader.load( "project.project" ).then( function( entities ) {
				if( onSuccess ) {
					onSuccess( scene );
				}
			} ).then( null, function( e ) {
				if( onError ) {
					onError( e );
				}
			} );
		};

		// start and stuff

		GooRunner.prototype.start = function( preProcessCallback ) {
			if( preProcessCallback ) {
				this.callbacksPreProcess.push( preProcessCallback );
			}

			if( this.rafId === -1 ) {
				this.processParameters.resetTime();
				this.rafId = window.requestAnimationFrame( this.process.bind( this ));
			}
		};

		GooRunner.prototype.pause = function() {
			if( this.rafId !== -1 ) {
				window.cancelAnimationFrame( this.rafId );
				this.rafId = -1;
			}
		};

		GooRunner.prototype.stop = function() {
			processParameters.resetTime();
			World.time = 0;						// REVIEW: Remove!
			this.pause();
		};

		GooRunner.prototype.process = function( timeStamp ) {		
			// REVIEW: add some sort of debug-flag which wraps everything in here with a try-catch or
			// have a separate processDebug which is attached to the raf if debug === true

			this.processParameters.updateTime( timeStamp );
			World.time = this.processParameters.timeInSeconds;				// REVIEW: Remove!
			World.tpf  = this.processParameters.deltaTimeInSeconds;

			var c, cl = this.callbacksPreProcess.length;
			for( c = 0; c < cl; c++ ) {
				// REVIEW: Would be nice to send processParameters only!
				this.callbacksPreProcess[ c ]( this.processParameters.deltaTimeInSeconds, this.processParameters );
			}

			var scenes = this.scenes;
			var sl = scenes.length;
			
			// REVIEW: remove this.doProcess and rely on scene.enabled?
			if( this.doProcess ) {
				while( sl-- ) {
					scenes[ sl ].process( this.processParameters );
				}
			}

			this.renderer.info.reset();

			// REVIEW: remove this.doRender and rely on scene.visible?
			if( this.doRender ) {
				this.renderer.checkResize( Renderer.mainCamera );
				this.renderer.setRenderTarget();
				this.renderer.clear();

				cl = this.callbacksPreRender.length;
				for( c = 0; c < cl; c++ ) {
					// REVIEW: Would be nice to send processParameters only!
					this.callbacksPreRender[ c ]( this.processParameters.deltaTimeInSeconds, this.processParameters );
				}

				sl = scenes.length;
				while( sl-- ) {
					scenes[ sl ].render( this.processParameters );
				}

				// REVIEW: Move this out of Goo?
				if(this._picking.doPick) {
					var cc = this.renderer.clearColor.data;
					this._picking.clearColorStore[0] = cc[0];
					this._picking.clearColorStore[1] = cc[1];
					this._picking.clearColorStore[2] = cc[2];
					this._picking.clearColorStore[3] = cc[3];
					this.renderer.setClearColor(0,0,0,1);

					for (var i = 0; i < this.renderSystems.length; i++) {
						if (this.renderSystems[i].renderToPick) {
							this.renderSystems[i].renderToPick(this.renderer, this._picking.skipUpdateBuffer);
						}
					}
					this.renderer.pick(this._picking.x, this._picking.y, this._picking.pickingStore, Renderer.mainCamera);
					this._picking.pickingCallback(this._picking.pickingStore.id, this._picking.pickingStore.depth);
					this._picking.doPick = false;

					this.renderer.setClearColor.apply(this.renderer, this._picking.clearColorStore);
				}				
			}

			cl = this.callbacks.length;
			for( c = 0; c < cl; c++ ) {
				// REVIEW: Would be nice to send processParameters only!
				this.callbacks[ c ]( this.processParameters.deltaTimeInSeconds, this.processParameters );
			}
	
			if (this.stats) {
				this.stats.update(this.renderer.info);
			}
			// REVIEW: Somehow move this out of GooRunner?
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

			this.rafId = window.requestAnimationFrame( this.process.bind( this ));
		};

		// REVIEW: These are here for backwards compability, should either be 
		// removed or updated

		/**
		 * Starts the game loop. (done through requestAnimationFrame)
		 */
		GooRunner.prototype.startGameLoop = function () {
			this.start();
		};

		/**
		 * Stops the game loop.
		 */
		GooRunner.prototype.stopGameLoop = function () {
			this.stop();
		};

		/**
		 * Takes snapshot at next rendercall
		 */
		GooRunner.prototype.takeSnapshot = function(callback) {
			this._takeSnapshots.push(callback);
		};

		GooRunner.prototype.pick = function(x, y, callback, skipUpdateBuffer) {
			this._picking.x = x;
			this._picking.y = y;
			this._picking.skipUpdateBuffer = skipUpdateBuffer === undefined ? false : skipUpdateBuffer;
			if (callback) {
				this._picking.pickingCallback = callback;
			}
			this._picking.doPick = true;
		};

		// REVIEW: These methods are here for backwards compability. Might still
		// be needed and a good place to have them, but should be considered to 
		// be moved elsewhere

		//TODO: move this to Logo class
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

			document.addEventListener("mousedown", function (e) {
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


		// REVIEW: Maybe start using signals.js for all events? Or simply put
		// these methods in a new Event-class?

		/*
		 * Adds an event listener to the goorunner
		 * @param {string} type Can currently be 'click', 'mousedown', 'mousemove' or 'mouseup'
		 * @param {function(event)} Callback to call when event is fired
		 */
		GooRunner.prototype.addEventListener = function(type, callback) {
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

		/*
		 * Removes an event listener to the goorunner
		 * @param {string} type Can currently be 'click', 'mousedown', 'mousemove' or 'mouseup'
		 * @param {function(event)} Callback to remove from event listener
		 */
		GooRunner.prototype.removeEventListener = function(type, callback) {
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

		GooRunner.prototype._dispatchEvent = function(evt) {
			for (var type in this._eventTriggered) {
				if(this._eventTriggered[type] && this._eventListeners[type]) {
					var e = {
						entity: evt.entity,
						depth: evt.depth,
						x: evt.x,
						y: evt.y,
						type: type,
						domEvent: this._eventTriggered[type],
						id: evt.id
					};
					for (var i = 0; i < this._eventListeners[type].length; i++) {
						if(this._eventListeners[type][i](e) === false) {
							break;
						}
					}
					this._eventTriggered[type] = null;
				}
			}
		};

		/*
		 * Enables event listening on the goorunner
		 * @param {string} type Can currently be 'click', 'mousedown', 'mousemove' or 'mouseup'
		 */
		GooRunner.prototype._enableEvent = function(type) {
			if(this._events[type]) {
				return;
			}
			var func = function(e) {
				var x = e.offsetX;
				var y = e.offsetY;
				this._eventTriggered[type] = e;
				this.pick(x, y, function(id, depth) {
					var entity = this.world.entityManager.getEntityById(id);
					this._dispatchEvent({
						entity: entity,
						depth: depth,
						x: x,
						y: y,
						id: id
					});
				}.bind(this));
			}.bind(this);
			this.renderer.domElement.addEventListener(type, func);
			this._events[type] = func;
		};

		/*
		 * Disables event listening on the goorunner
		 * @param {string} type Can currently be 'click', 'mousedown', 'mousemove' or 'mouseup'
		 */
		GooRunner.prototype._disableEvent = function(type) {
			if (this._events[type]) {
				this.renderer.domElement.removeEventListener(type, this._events[type]);
			}
			this._events[type] = null;
		};


		return GooRunner;
	}
);

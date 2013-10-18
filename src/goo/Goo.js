define( 
	[ "goo/core/Collection",
	  "goo/core/ProcessParameters",
	  "goo/core/ProcessArguments",
	  "goo/core/Scene",
	  "goo/entities/Entity",
	  "goo/renderer/Renderer",
	  "goo/util/GameUtils",
	  "goo/util/Logo",
	  "goo/entities/World" ],				// REVIEW: REMOVE! Only reason it's here is because of static World.time, which has to go, too.
	  
	function( Collection, ProcessParameters, ProcessArguments, Scene, Entity, Renderer, GameUtils, Logo, World ) {

		"use strict";

		var collection       = new Collection();
		var collectionScenes = new Collection();

		function Goo( parameters ) {
			parameters = parameters || {};

			this.processParameters   = new ProcessParameters();
			this.scenes              = [];
			this.renderer            = new Renderer( parameters );
			this.rafId               = -1;

			// REVIEW: all callbacks should have an API (add/get etc).
			// Also, would look better to wrap all callbacks in an object, like this.callbacks = { preProcess: [], preRender: [], postRender: [] }; 

			this.callbacks           = [];
			this.callbacksPreProcess = [];
			this.callbacksPreRender  = [];

			// setup renderer access methods
			// TODO: add more access methods

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

			// setup GameUtils
			// REVIEW: what happens here if we've got multiple Goo-instances?

			GameUtils.initAllShims();
			GameUtils.addVisibilityChangeListener( function( paused ) {
				if( paused ) {
					this.pause();
				} else {
					this.start();
				}
			}.bind( this ));

			// REVIEW: this should be removed!

			this.world = this.scenes[ 0 ];
			World.time = 0;
		}

		Goo.prototype.add = function() {
			collection.clear();
			collection.preventClear();

			// TODO: change to ProcessArguments

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

		Goo.prototype.get = function() {
			collection.clear();
			collection.preventClear();

			// TODO: Change to ProcessArguments

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

		Goo.prototype.addScene = function( scene ) {

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

		Goo.prototype.getScene = function() {
			if( arguments.length === 0 ) {
				return collection.fromArray( this.scenes ).orFirst();
			}
 
			collectionScenes.fromArray( this.scenes );
			collection.clear();

			ProcessArguments( this, arguments, function( goo, type, value ) {
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

		// start and stuff

		Goo.prototype.start = function( preProcessCallback ) {
			if( preProcessCallback ) {
				this.callbacksPreProcess.push( preProcessCallback );
			}

			if( this.rafId === -1 ) {
				this.processParameters.resetTime();
				this.rafId = window.requestAnimationFrame( this.process.bind( this ));
			}
		};

		Goo.prototype.pause = function() {
			if( this.rafId !== -1 ) {
				window.cancelAnimationFrame( this.rafId );
				this.rafId = -1;
			}
		};

		Goo.prototype.stop = function() {
			processParameters.resetTime();
			World.time = 0;						// REVIEW: Remove!
			this.pause();
		};

		Goo.prototype.process = function( timeStamp ) {		
			// REVIEW: add some sort of debug-flag which wraps everything in here with a try-catch or
			// have a separate processDebug which is attached to the raf if debug === true

			this.processParameters.updateTime( timeStamp );
			World.time = timeStamp;				// REVIEW: Remove!

			var c, cl = this.callbacksPreProcess.length;
			for( c = 0; c < cl; c++ ) {
				// REVIEW: Would be nice to send processParameters only!
				this.callbacksPreProcess[ c ]( this.processParameters.deltaTime, this.processParameters );
			}

			var scenes = this.scenes;
			var sl = scenes.length;
			
			while( sl-- ) {
				scenes[ sl ].process( this.processParameters );
			}

			cl = this.callbacksPreRender.length;
			for( c = 0; c < cl; c++ ) {
				// REVIEW: Would be nice to send processParameters only!
				this.callbacksPreRender[ c ]( this.processParameters.deltaTime, this.processParameters );
			}

			this.renderer.info.reset();
			this.renderer.checkResize( Renderer.mainCamera );
			this.renderer.setRenderTarget();
			this.renderer.clear();

			sl = scenes.length;
			while( sl-- ) {
				scenes[ sl ].render( this.processParameters );
			}

			// TODO: Picking

			cl = this.callbacks.length;
			for( c = 0; c < cl; c++ ) {
				// REVIEW: Would be nice to send processParameters only!
				this.callbacks[ c ]( this.processParameters.deltaTime, this.processParameters );
			}

			this.rafId = window.requestAnimationFrame( this.process.bind( this ));
		};

		// REVIEW: to not demand users to use require (which honestly is a bit of hurdle) it might
		// be a good thing to clutter the global scope with a "goo" namespace.

		if( window.goo === undefined ) {
			window.goo = {
				Goo: Goo,
				Scene: Scene,
				Entity: Entity,
				Collection: Collection,
				Vector2: Vector2,
				Vector3: Vector3,
				Vector4: Vector4
			}
		}

		return Goo;
	}
);
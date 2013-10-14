define( 
	[ "goo/core/Collection",
	  "goo/core/ProcessParameters",
	  "goo/core/Scene",
	  "goo/renderer/Renderer" ],
	  
	function( Collection, ProcessParameters, Scene, Renderer ) {

		"use strict";

		var collection = new Collection();

		function Goo( parameters ) {
			parameters = parameters || {};

			this.processParameters  = new ProcessParameters();
			this.scenes             = [];
			this.renderer           = new Renderer( parameters );
			this.preProcessCallback = undefined;

			// setup renderer access methods

			defineGetter( this, "domElement",    this.renderer.domElement );
			defineGetter( this, "setClearColor", this.renderer.setClearColor.bind( this.renderer ));

			if( parameters.domContainer ) {
				parameters.domContainer.appendChild( this.domElement );
			} 

			// add scenes

			this.add( parameters.scenes );

			if( this.scenes.length === 0 ) {
				this.addScene( new Scene( { name: "default" } ));
			}

			// this should be removed!

			this.world = this.scenes[ 0 ];
		}

		Goo.prototype.add = function() {
			collection.clear();
			collection.preventClear();

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

		Goo.prototype.getScene = function( name ) {
			var scenes = this.scenes;
			var sl = scenes.length;

			while( sl-- ) {
				if( scenes[ sl ].name === name ) {
					return scenes[ sl ];
				}
			}

			return scenes[ 0 ];
		};

		// start and stuff

		Goo.prototype.start = function( preProcessCallback ) {
			w
		};

		Goo.prototype.pause = function() {
		};

		Goo.prototype.stop = function() {
		};

		Goo.prototype.process = function( timeStamp ) {
			processParameters.updateTime( timeStamp );

			var scene, scenes = this.scenes;
			var sl = scenes.length;
			
			while( sl-- ) {
				scene = scenes[ sl ];
				if( scene ) {
					if( scene.enabled ) {
						scene.process( processParameters );
					}

					if( scene.visible ) {
						scene.render( processParameters );
					}
				} 
			}
		};

		// helpers

		function defineGetter( target, propertyName, propertyData ) {
			Object.defineProperty( target, propertyName, {
				get: function() {
					return propertyData;
				}
			} );
		}

		return Goo;
	}
);
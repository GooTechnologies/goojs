define( 
	[ "goo/core/ProcessParameters"
	  "goo/core/Scene",
	  "goo/systems/RenderSystem",
	  "goo/systems/TransformSystem" ],
	  
	function( ProcessParameters, Scene, RenderSystem, TransformSystem ) {

		"use strict";

		function Goo( parameters ) {
			this.systems           = [];
			this.systemsByType     = {};
			this.scenes            = [];
			this.processParameters = new ProcessParameters();

			this.addSystem( TransformSystem );
			this.addSystem( new RenderSystem( parameters ));

			this.add( parameters.systems, parameters.scenes );

			if( this.scenes.length === 0 ) {
				this.addScene( Scene );
			}

			// this should be removed!

			this.world = this.scenes[ 0 ];
		}

		Goo.prototype.add = function() {
			// todo
		};

		// system methods

		Goo.prototype.addSystem = function( system ) {
			if( !this.hasSystem( system )) {
				if( typeof( system ) === "function" ) {
					system = new system();
				} else {
					system = system;
				}
				system.init( this );
				this.systems.push( system ); 
			}
		};

		Goo.prototype.getSystem = function( system ) {
			if( this.hasSystem( system )) {
				return this.systems[ systemType( system )];
			} else {
				console.warn( "Goo.getSystem: Trying to get " + systemType( system ) + " which doesnt exist" );
			}
		};

		Goo.prototype.getSystems = function() {

		};

		Goo.prototype.hasSystem = function( system ) {
			return this.systems[ systemType( system ) ] !== undefined ? true : false;
		};

		// scene methods

		Goo.prototype.addScene = function( scene ) {
			if( typeof( scene ) === "function" ) {
				scene = new scene();
			} else {
				scene = scene;
			}
			scene.init( this );
			this.scenes.push( scene );
		};


		// run and stuff

		Goo.prototype.run = function() {
		};

		Goo.prototype.pause = function() {
		};

		Goo.prototype.stop = function() {
		};

		Goo.prototype.process = function() {
			var scene, scenes = this.scenes;
			var sl = scenes.length;
			
			while( sl-- ) {
				scene = scenes[ sl ];
				if( scene && scene.enabled ) {
					scene.process();
				}
			}
		};

		// helpers

		function systemType( system ) {
			var type = typeof( system );
			if( type === "string" ) {
				return type;
			} else if( type === "object" && system.type !== undefined ) {
				return system.type;
			} else {
				var raw = system.constructor.toString();
				return raw.splice( 9, raw.indexOf( "(" ));
			}
		}

		return Goo;
	}
);
define( 
	[ "goo/core/ProcessParameters"
	  "goo/core/Scene",
	  "goo/renderer/Renderer" ],
	  
	function( ProcessParameters, Scene, Renderer ) {

		"use strict";

		function Goo( parameters ) {
			this.processParameters = new ProcessParameters();
			this.scenes            = [];
			this.renderer          = new Renderer();

			this.add( parameters.scenes );

			if( this.scenes.length === 0 ) {
				this.addScene( Scene );
			}

			// this should be removed!

			this.world = this.scenes[ 0 ];
		}

		Goo.prototype.add = function() {
			// todo
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
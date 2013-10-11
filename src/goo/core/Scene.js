define( [
	'goo/entities/systems/TransformSystem',
	'goo/entities/systems/RenderSystem',
	'goo/entities/systems/BoundingUpdateSystem',
	'goo/entities/systems/ScriptSystem',
	'goo/entities/systems/LightingSystem',
	'goo/entities/systems/CameraSystem',
	'goo/entities/systems/ParticlesSystem',
	"goo/entities/systems/CSSTransformSystem",
	"goo/entities/systems/AnimationSystem",
	"goo/entities/systems/TextSystem",
	"goo/entities/systems/LightDebugSystem",
	"goo/entities/systems/CameraDebugSystem" ],
	
	function() {
	
		"use strict";

		function Scene( parameters ) {
			this.enabled  = parameters.enabled !== undefined ? parameters.enabled : true;
			this.systems  = [];
			this.entities = [];

			this.add( parameters.systems, parameters.scenes );

			if( this.systems.length === 0 ) {
				this.addSystem( TransformSystem );
				this.addSystem( RenderSystem );
			}
		}



		// general purpuse add/get/has

		Scene.prototype.add = function( System ) {
			if( !this.hasSystem( System )) {
				if( typeof( System ) === "function" ) {
					this.systems.push( new System());
				} else {
					this.systems.push( System );
				}
			}
		};

		Scene.prototype.get = function() {
		};

		Scene.prototype.has = function() {
		};

		Scene.prototype.remove = function() {
		};

		// system methods

		Scene.prototype.addSystem = function( ) {
		};

		Scene.prototype.getSystem = function() {
		};

		Scene.prototype.hasSystem = function() {
		};

		Scene.prototype.removeSystem = function() {
		};

		// entity methods

		Scene.prototype.addEntitiy = function( entity ) {
			if( !this.hasEntity( entity )) {
				this.entities.push( entity );

				var self = this;
				entity.scene = this;
				entity.getChildren().each( function( entity ) {
					self.addEntitiy( entity );
				});
			}
		};

		Scene.prototype.getEntity = function() {
		};

		Scene.prototype.hasEntity = function() {
		};

		Scene.prototype.removeEntity = function() {
		};

		// process

		Scene.prototype.process = function( processParameters ) {
			var system, systems = this.systems;
			var s, sl = systems.length;

			for( s = 0; s < sl; s++ ) {
				system = systems[ s ];
				if( systems.enabled ) {
					systems.process();
				}
			}
		};

		Scene.prototype.render = function( renderer ) {
			if( this.hasSystem( RenderSystem )) {
				this.getSystem( RenderSystem ).render( renderer );
			}
		};

		return Scene;
	}
);
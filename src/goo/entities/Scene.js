define( [
	'goo/entities/Collection',
	'goo/util/ProcessArguments',
	'goo/entities/Entity',
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
	"goo/entities/systems/CameraDebugSystem",
	"goo/entities/components/CameraComponent",
	"goo/entities/components/MeshDataComponent",
	"goo/entities/components/MeshRendererComponent",
	"goo/entities/components/LightComponent",
	"goo/renderer/Renderer" ],
	
	function( 
		Collection,
		ProcessArguments,
		Entity,
		TransformSystem, 
		RenderSystem, 
		BoundingUpdateSystem, 
		ScriptSystem, 
		LightingSystem,
		CameraSystem,
		ParticlesSystem,
		CSSTransformSystem, 
		AnimationSystem,
		TextSystem,
		LightDebugSystem,
		CameraDebugSystem,
		CameraComponent,
		MeshDataComponent,
		MeshRendererComponent,
		LightComponent,
		Renderer ) {
	
		"use strict";

		var collection       = new Collection();
		var entityCollection = new Collection();
		var uniqueId         = 0;

		function Scene( parameters ) {
			parameters = parameters || {};

			this.name             = parameters.name    !== undefined ? parameters.name    : "scene" + (uniqueId++);
			this.enabled          = parameters.enabled !== undefined ? parameters.enabled : true;
			this.visible          = parameters.visible !== undefined ? parameters.visible : true;
			this.systems          = [];
			this.entities         = [];
			this.entities.added   = [];
			this.entities.changed = [];
			this.entities.removed = [];
			this.renderer         = undefined;

			this.add( parameters.systems, parameters.scenes );

			if( this.systems.length === 0 ) {
				this.add( 
					TransformSystem,
					CameraSystem,
					ParticlesSystem,
					BoundingUpdateSystem,
					LightingSystem,
					AnimationSystem,
					LightDebugSystem,
					CameraDebugSystem,
					RenderSystem );
			}
		}

		Scene.prototype.init = function( goo ) {
			// REVIEW: Should scenes share renderer? Probably not.
			this.renderer = goo.renderer;
		};

		// general purpuse add/get/has

		Scene.prototype.add = function() {
			ProcessArguments( this, arguments, function( scene, type, value ) {
				if( type === ProcessArguments.INSTANCE ) {
					if( value instanceof Entity ) {
						scene.addEntity( value );
					} else {
						scene.addSystem( value );
					}
				} else if( type === ProcessArguments.CONSTRUCTOR ) {
					if( value instanceof Entity ) {
						scene.addEntity( new value());
					} else {
						scene.addSystem( new value());
					}
				} else {
					scene.addEntity( value );
				}
			});
		};

		Scene.prototype.get = function() {
			return this.getEntity.apply( this, arguments );
		};

		Scene.prototype.has = function() {
		};

		Scene.prototype.remove = function() {
		};

		// system methods

		Scene.prototype.addSystem = function() {
			ProcessArguments( this, arguments, function( scene, type, value ) {
				if( type === ProcessArguments.INSTANCE ) {
					scene.systems.push( value );
					value.init( this );
				} else if( type === ProcessArguments.CONSTRUCTOR ) {
					value = new value();
					scene.systems.push( value );
					value.init( this );
				}
			});
		};

		Scene.prototype.getSystem = function( type ) {
			ProcessArguments( this, arguments, function( scene, type, value ) {
				// TODO: ...replace below so you can seledt many
			});
			var systems = this.systems;
			var sl = systems.length;

			while( sl-- ) {
				if( systems[ sl ] instanceof type ) {
					return systems[ sl ];
				}
			}
			return undefined;
		};

		Scene.prototype.hasSystem = function( type ) {
			var systems = this.systems;
			var sl = systems.length;

			while( sl-- ) {
				if( systems[ sl ] instanceof type ) {
					return true;
				}
			}
			return false;
		}; 

		Scene.prototype.removeSystem = function() {
			// TODO: select many to remove
		};

		// entity methods

		Scene.prototype.addEntity = function( entity ) {
			entity = entity || new Entity();

			this.entities.push( entity );
			this.entities.added.push( entity );

			entity.scene = this;

			if( entity.hasChildren()) {
				var scene = this;
				entity.getChildren().each( function( child ) {
					scene.addEntitiy( child );
				});
			}

			return entity;
		};

		Scene.prototype.getEntity = function() {
			collection.clear();

			ProcessArguments( this, arguments, function( scene, type, value ) {
				if( type === ProcessArguments.CONSTRUCTOR ) {
					entityCollection.fromArray( scene.entities ).each( function( entity ) {
						if( entity.hasComponent( value )) {
							collection.add( entity );
						}
					} );
				} else if( type === ProcessArguments.STRING ) {
					entityCollection.fromArray( scene.entities ).each( function( entity ) {
						if( entity.name === value ) {
							collection.add( entity );
						}
					} );
				} else if( type === ProcessArguments.TAG ) {
					entityCollection.fromArray( scene.entities ).each( function( entity ) {
						if( entity.hasTag( value )) {
							collection.add( entity );
						}
					} );
				} else if( type === ProcessArguments.ATTRIBUTE ) {
					entityCollection.fromArray( scene.entities ).each( function( entity ) {
						if( entity.hasAttribute( value )) {
							collection.add( entity );
						}
					} );
				} else if( type === ParticlesSystem.INSTANCE ) {
					entityCollection.fromArray( scene.entities ).each( function( entity ) {
						if( entity === value ) {
							collection.add( entity );
						}
					} );
				}
			} );

			// REVIEW: should we always return a collection for simplicity?
			return collection.orFirst();
		};



		Scene.prototype.hasEntity = function( entity ) {
			// todo: cooler parameters
			return this.entities.indexOf( entity ) !== -1;
		};

		// REVIEW: Try to remove this as it's quite weird to have to mark an entity as changed
		// when you've just changed it. The entity and its components should keep track of any
		// changed state and report accordingly
		Scene.prototype.changedEntity = function( entity, component, eventType ) {
			// REVIEW: Move event to class!
			// should be something like: this.entities.changed.push( new ChangedEvent( entity, component, eventType ));
			var e = {
				entity: entity
			};

			if( component !== undefined ) {
				e.component = component;
			}
			if( eventType !== undefined ) {
				e.eventType = eventType;
			}

			this.entities.changed.push( e );
		};

		Scene.prototype.removeEntity = function() {
			this.getEntity.apply( this, arguments );

			collection.each( function( entity ) {
				var i = this.entities.indexOf( entity );
				if( i !== -1 ) {
					this.entities.splice( i, 1 );
					this.entities.removed.push( entity );
					
					entity.scene = undefined;
				}

				if( entity.hasChildren()) {
					// TODO: add entitiy recursive get children and remove manually 
				}
			});
		
			return collection;
		};

		// helper methods for easy creation of enities

		Scene.prototype.createCamera = function( parameters ) {
			return this.addEntity( new Entity( new CameraComponent( parameters )));
		};

		Scene.prototype.createLight = function( parameters ) {
			return this.addEntity( new Entity( new LightComponent( parameters )));
		};

		// process & render

		Scene.prototype.process = function( processParameters ) {
			if( this.enabled ) {
				var entities = this.entities;
				var system, systems = this.systems;
				var s, sl = systems.length;

				applyToSystems( systems, entities.added, function( system, entity ) {
					system.addedEntity( entity );
				});

				applyToSystems( systems, entities.changed, function( system, event ) {
					system.changedEntity( event );
				});

				applyToSystems( systems, entities.removed, function( system, entity ) {
					system.removedEntity( entity );
				});


				for( s = 0; s < sl; s++ ) {
					system = systems[ s ];
					// REVIEW: change .passive to .enabled to have similar API as entities and components
					if( system.enabled ) {
						// REVIEW: shouldn't we send in the entire processParameters object? Also, we
						// should NOT call _process as it defies all religions out there. Please see to
						// that you override the System.process and use the this.entities instead of
						// the (now) incoming entities parameter. 

						system._process( processParameters.deltaTime );
					}
				}
			}
		};

		Scene.prototype.render = function() {
			if( this.visible && this.renderer ) {
				if( this.hasSystem( RenderSystem )) {
					this.getSystem( RenderSystem ).render( this.renderer );
				}
			}
		};

		// helpers

		function applyToSystems( systems, entities, callback ) {
			for( var s = 0; s < systems.length; s++ ) {
				for( var e = 0; e < entities.length; e++ ) {
					callback( systems[ s ], entities[ e ] );
				}
			}
			entities.length = 0;
		}

		return Scene;
	}
);
define( [
	'goo/entities/Collection',
	'goo/util/ParseArguments',
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

	// REVIEW: The entity manager is only here for backwards compability

	'goo/entities/managers/EntityManager'

	 ],
	/** @lends */
	function( 
		Collection,
		ParseArguments,
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
		EntityManager ) {
	
		"use strict";

		var uniqueId = 0;
		var tempCollection = new Collection();

		/**
		 * @class A Scene in Goo.
		 * @description Constructor. Accepts a JSON object containing the settings for the Scene.
		 * @param {object} parameters Scene settings.
		 * @param {string} [parameters.name="sceneXYZ"] Name of Scene. Defaults to "scene" plus a unique number.
		 * @param {boolean} [parameters.enabled=true] Is Scene enabled (will be processed).
		 * @param {boolean} [parameters.visible=true] Is Scene visible (will be renderered).
		 * @param {array} [parameters.entities] Array of entity instances to add to Scene.
		 * @param {array} [parameters.systems] Array of custom systems to add to Scene. These systems will be placed before all default systems.
	 	 * @property {String} name Name of Scene.
	 	 * @property {bool} enabled Is Scene enabled (will be processed and renderered).
	 	 * @property {bool} visible Is Scene visible (will be processed but not renderered).
	 	 * @property {Array} entities Array with Entities in Scene (use for reading only and use .addEntity and .removeEntity for modification).
		 */

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
			this.gooRunner        = undefined;
			this.renderer         = undefined;
			this.time 			  = 1;	// REVIEW: find better name?

			this.add( parameters.entities, parameters.systems );
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

			// REVIEW: Remove!

			this.entityManager    = new EntityManager();
			this._addedEntities   = this.entities.added;
			this._changedEntities = this.entities.changed;
			this._removedEntities = this.entities.removed;
			this.tpf 			  = 1;
		}

		Scene.prototype.init = function( goo ) {
			// REVIEW: Should scenes share renderer? Probably not.
			this.gooRunner = goo;
			this.renderer  = goo.renderer;

			this.addSystemAt( new ScriptSystem      ( this.renderer ), 0 );
			this.addSystemAt( new CSSTransformSystem( this.renderer ), 3 );
		};

		// REVIEW: Remove all references to managers

		Scene.prototype.setManager = function( manager ) {
			console.warn( "Scene.setManager: not used any more" );
		}

		Scene.prototype.getManager = function( type ) {
			console.warn( "Scene.getManager: not used any more" );
			if( type === "EntityManager" ) {
				return this.entityManager;
			}
			return undefined;
		};

		/**
		* Takes mixed arguments and adds these to the Scene. For example:
		* <pre><code>myScene.add( myEntityA, myEntityB, myCustomSystem );</code></pre>
		* @returns {Scene} The Scene
		*/

		Scene.prototype.add = function() {
			ParseArguments( this, arguments, function( scene, type, value ) {
				if( type === ParseArguments.INSTANCE ) {
					if( value instanceof Entity ) {
						scene.addEntity( value );
					} else {
						scene.addSystem( value );
					}
				} else if( type === ParseArguments.CONSTRUCTOR ) {
					if( value instanceof Entity ) {
						scene.addEntity( new value());
					} else {
						scene.addSystem( new value());
					}
				} else {
					scene.addEntity( value );
				}
			});

			return this;
		};

		/**
		* Takes mixed arguments and gets these from the Scene. For example:
		* <pre><code>myScene.get( "#bomb" );</code></pre>
		* <pre><code>myScene.get( "@renderable" );</code></pre>
		* We recommend to use this function in your init code, as it might be a performance heavy operation.
		* @returns {Collection} A collection with all selected items
		*/

		Scene.prototype.get = function() {
			var collection = new Collection();

			ParseArguments( this, arguments, function( scene, type, value ) {
				if( type === ParseArguments.INSTANCE ) {
					if( value instanceof Entity ) {
						scene.getEntity( value );
					} else {
						if( scene.hasSystem( value )) {
							collection.add( this.getSystem( value ));
						}
					}
				} else {
					collection.add( scene.getEntity( value ));
				}
			});

			return collection;
		};

		Scene.prototype.has = function() {
		};

		Scene.prototype.remove = function() {
		};

		// system methods

		// REVIEW: setSystem is here for backwards compability. addSystem is more in 
		// line with the rest of the API

		Scene.prototype.setSystem = function() {
			this.addSystem.apply( this, arguments );
		};

		/**
		* Takes mixed arguments and adds these Systems to the Scene. For example:
		* <pre><code>myScene.addSystem( MyCustomSystem );</code></pre>
		* @returns {Scene} The Scene
		*/

		Scene.prototype.addSystem = function() {
			ParseArguments( this, arguments, function( scene, type, value ) {
				if( !scene.hasSystem( value )) {
					if( type === ParseArguments.INSTANCE ) {
						scene.systems.push( value );
						value.init( this );
					} else if( type === ParseArguments.CONSTRUCTOR ) {
						value = new value();
						scene.systems.push( value );
						value.init( this );
					}
				}
			});

			return this;
		};

		/**
		* Adds a system on a specific index
		* @param {System} system An instance of the System
		* @param {int} index The process index on which to place the System
		* @returns {Scene} The Scene
		*/

		Scene.prototype.addSystemAt = function( system, index ) {
			if( this.systems.indexOf( system ) === -1 ) {
				this.systems.splice( index, 0, system );
			}

			return this;
		};

		/**
		* Takes mixed arguments and returns a collection with the specified Systems. For example:
		* <pre><code>myScene.getSystem( TransformSystem, MyCustomSystem );</code></pre>
		* @param {System|function|string} type An instance of the System, the System's constructor or the type as a string 
		* @returns {System|Collection} A system if you've selected a single System or a Collection of Systems if multiple selection.
		*/

		Scene.prototype.getSystem = function() {
			var collection = new Collection();
			var sl, systems = this.systems;

			ParseArguments( this, arguments, function( scene, type, value ) {
				type = systemType( value );
				sl   = systems.length
				
				while( sl-- ) {
					if( systems[ sl ].type === type ) {
						collection.add( systems[ sl ] );
					}
				}
			});

			if( arguments.length > 1 ) {
				return collection;
			} else {
				return collection.first;
			}
		};

		/**
		* Asks if Scene has a specific System
		* @param {System|function|string} type An instance of the System, the System's constructor or the type as a string 
		* @returns {bool} If System exists in Scene or not
		*/

		Scene.prototype.hasSystem = function( type ) {
			type = systemType( type );
			
			var systems = this.systems;
			var sl = systems.length;

			while( sl-- ) {
				if( systems[ sl ].type === type ) {
					return true;
				}
			}
			return false;
		}; 

		/**
		* Takes mixed arguments and removes the specified Systems. For example:
		* <pre><code>myScene.removeSystem( TransformSystem, MyCustomSystem );</code></pre>
		* @returns {Scene} The Scene itself
		*/

		Scene.prototype.removeSystem = function() {
			var type, sl, systems = this.systems;

			ParseArguments( this, arguments, function( scene, type, value ) {
				type = systemType( value );
				sl   = systems.length;
				while( sl-- ) {
					if( systems[ sl ].type === type ) {
						systems.splice( sl, 1 );
						break;
					}
				} 
			});

			return this;
		};

		/**
		* Takes mixed arguments and adds specified Entities to the Scene. This example adds four entities to the scene by adding the two already created instances and creating two new instances with a tag and another with a name:
		* <pre><code>myScene.addEntity( "#someTag", myEntityA, myEntityB, "someName" );</code></pre>
		* @returns {Scene} The Scene
		*/

		Scene.prototype.addEntity = function() {
			var entity;

			if( arguments.length === 0 ) {
				this.addEntity( new Entity());
				return;
			}

			ParseArguments( this, arguments, function( scene, type, value ) {
				if( type === ParseArguments.INSTANCE ) {
					entity = value;
				} else if( type === ParseArguments.CONSTRUCTOR ) {
					entity = new Entity();
				} else if( type === ParseArguments.STRING || type === ParseArguments.TAG || type === ParseArguments.ATTRIBUTE ) {
					entity = new Entity( value );
				}

				if( !scene.hasEntity( entity )) {
					scene.entities.push( entity );
					scene.entities.added.push( entity );

					entity.scene  = scene;
					entity._world = scene;	// REVIEW: remove!

					if( entity.hasChildren()) {
						entity.getChildren().each( function( child ) {
							scene.addEntitiy( child );
						});
					}
				}
			});

			return this;
		};

		/**
		* Takes mixed arguments and returns a Collection of Entities from the Scene. The first example gets all renderable Entities and the Camera from the Scene and the second gets all Entities in the Scene:
		* <pre><code>myScene.getEntity( "@renderable", "@camera" );</code></pre>
		* <pre><code>myScene.getEntity();</code></pre>
		* We recommend to use this function in your init code, as it might be a performance heavy operation.
		* @returns {Scene} The Scene
		*/

		Scene.prototype.getEntity = function() {
			var collection = new Collection();

			if( arguments.length === 0 ) {
				return collection.fromArray( this.entities );
			}

			ParseArguments( this, arguments, function( scene, type, value ) {
				if( type === ParseArguments.CONSTRUCTOR ) {
					tempCollection.fromArray( scene.entities ).each( function( entity ) {
						if( entity.hasComponent( value )) {
							collection.add( entity );
						}
					} );
				} else if( type === ParseArguments.STRING ) {
					tempCollection.fromArray( scene.entities ).each( function( entity ) {
						if( entity.name === value ) {
							collection.add( entity );
						}
					} );
				} else if( type === ParseArguments.TAG ) {
					tempCollection.fromArray( scene.entities ).each( function( entity ) {
						if( entity.hasTag( value )) {
							collection.add( entity );
						}
					} );
				} else if( type === ParseArguments.ATTRIBUTE ) {
					// if looking for a camera, make sure to return a camera
					var lookingForCamera = false;
					var foundCamera      = false;
					if( value === "@camera" ) {
						lookingForCamera = true;
					}
					
					tempCollection.fromArray( scene.entities ).each( function( entity ) {
						if( entity.hasAttribute( value )) {
							collection.add( entity );
							if( lookingForCamera ) {
								foundCamera = true;
							}
						}
					} );

					if( lookingForCamera && !foundCamera ) {
						collection.add( scene.createCamera());
					}
 				} else if( type === ParseArguments.INSTANCE ) {
					tempCollection.fromArray( scene.entities ).each( function( entity ) {
						if( entity === value ) {
							collection.add( entity );
						}
					} );
				}
			} );

			return collection;
		};

		// REVIEW: Here for backwards compability. Not necessary as getEntity also
		// returns all entities
		Scene.prototype.getEntities = function () {
			return this.entities;
		};


		/**
		* Takes mixed arguments and asks if the Scene has the specified argyments. This example asks if there's an entity called "hello" and entites with the tag #bomb and if there's a camera:
		* <pre><code>myScene.hasEntity( "hello", "#bomb", "@camera" );</code></pre>
		* We recommend to use this function in your init code, as it might be a performance heavy operation.
		* @returns {Scene} The Scene
		*/

		Scene.prototype.hasEntity = function( entity ) {
			var has = true;
			var el, entities = this.entities;

			ParseArguments( this, arguments, function( scene, type, value ) {
				if( has ) {
					if( type === ParseArguments.INSTANCE ) {
						has &= scene.entities.indexOf( value ) !== -1;
					} else if( type === ParseArguments.STRING ) {
						el = entities.length;
						while( el-- ) {
							if( entities[ el ].name === value ) {
								return;
							}
						}
						has = false;
					} else if( type === ParseArguments.TAG ) {
						el = entities.length;
						while( el-- ) {
							if( entities[ el ].hasTag( value )) {
								return;
							}
						}
						has = false;
					} else if( type === ParseArguments.ATTRIBUTE ) {
						el = entities.length;
						while( el-- ) {
							if( entities[ el ].hasAttribute( value )) {
								return;
							}
						}
						has = false;
					}
				}
			});

			return has;
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

		// REVIEW: Remove this code, which is copied (and modified) from World.js and is here for backwards compability
		// Future code commented below 

		Scene.prototype.removeEntity = function (entity, recursive) {
			var index = this.entities.indexOf( entity );
			if( index !== -1 ) {
				this.entities.splice( index, 1 );
				this.entities.removed.push( entity );

				var parent = entity.getParent();
				if( parent !== undefined ) {
					parent.removeChild( entity );
				}

				if( entity.hasChildren()) {
					var children = entity.transformComponent.children;
					var cl = children.length;

					if( recursive ) {
						while( cl-- ) {
							this.removeEntity( children[ cl ], recursive );
						}
					} else {
						for( var i = 0; i < children.length; i++) {
							children[ i ].parent = parent;
						}

						entity.transformComponent.children.length = 0;
					}
				}
			}
		};

/*
		Scene.prototype.removeEntity = function() {
			var entities = this.getEntity.apply( this, arguments );
			var scene    = this;

			entities.each( function( entity ) {
				var i = scene.entities.indexOf( entity );
				if( i !== -1 ) {
					scene.entities.splice( i, 1 );
					scene.entities.removed.push( entity );
					
					entity.scene = undefined;
				}

				if( entity.hasChildren()) {
					entity.getChildren().each( function( entity ) {
						scene.removeEntity( entity );
					});
				}
			});
		
			return this;
		};*/

		// helper methods for easy creation and getting of enities

		Scene.prototype.createEntity = function () {
			var entity = new Entity();
			entity.add.apply( entity, arguments );
			this.addEntity( entity );
			return entity;
		};

		Scene.prototype.createCamera = function( parameters ) {
			return this.createEntity( new CameraComponent( parameters ));
		};

		Scene.prototype.createLight = function( parameters ) {
			return this.createEntity( new LightComponent( parameters ));
		};

		Scene.prototype.getCamera = function() {
			return this.getEntity( "@camera" ).first;	// this always returns a camera (creates a camera if none exists)
		};

		Scene.prototype.getLights = function() {
			return this.getEntity( "@light" );
		};

		// process & render

		Scene.prototype.process = function( processParameters ) {
			if( this.enabled ) {
				// REVIEW: remove!
				this.tpf  = processParameters.deltaTimeInSeconds;
				this.time = processParameters.timeInSeconds;

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

						system._process( processParameters.deltaTimeInSeconds );
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

        function systemType( system ) {
        	if( system !== undefined ) {
	            var type = typeof( system );
	            if( type === "string" ) {
                    return system;
	            } else if( type === "object" && system.type !== undefined ) {
                    return system.type;
	            } else {
                    var raw = system.toString();
                    var beginIndex = raw.indexOf( 'l(this,"' );
	                if( beginIndex !== -1 ) {
	                    // minified code
	                    return raw.slice( beginIndex + 8, raw.indexOf( '",' ));
                    } else {
	                    // unminified code
						return raw.slice( 9, raw.indexOf( "(" ));
                    }

	            }
        	} else return "N/A";
        }

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
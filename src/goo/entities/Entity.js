define(
	[ "goo/entities/Collection",
	  "goo/util/ParseArguments",
	  "goo/entities/components/TransformComponent",
	  "goo/entities/components/MeshDataComponent",
	  "goo/entities/components/MeshRendererComponent",
	  "goo/entities/components/CameraComponent",
	  "goo/entities/components/LightComponent",
	  "goo/renderer/Camera",
	  "goo/renderer/light/Light",
	  "goo/renderer/Material",
	  "goo/renderer/MeshData" ],
	/** @lends */
	function( Collection, ParseArguments, TransformComponent, MeshDataComponent, MeshRendererComponent, CameraComponent, LightComponent, Camera, Light, Material, MeshData ) {
		"use strict";

		// static

		var uniqueID   = 0;
		var collection = new Collection();

		/**
		 * @class Entity in a Scene. The API of an Entity alters with the Components added to it. For example, the TransformComponent adds methods for adding and getting children and updating the Entity's position and rotation. For more information, take a look at the components in question. 
		 * @description Constructor. Accepts mixed arguments, for example:
		 * <pre><code>new Entity( "myEntityName" );</code>
		 * <code>new Entity( "#myTag", "#myOtherTag" );</code>
		 * <code>new Entity( MeshDataComponent, MeshRendererComponent );</code>
		 * <code>new Entity( new MeshDataComponent( myMesh ), myMeshRendererComponent );</code>
		 * <code>new Entity( myChildEntityA, myChildEntityB );</code>
		 * <code>new Entity( { 
	name: "myName", 
	tags: [ "#tagA", "#tagB" ], 
	scene: myScene, 
	enabled: false, 
	components: [ myComponent ] } );</code></pre>
	 	 * @property {String} name Name of Entity
	 	 * @property {bool} enabled Is Entity enabled
		 * @property {Object} tags Object with user defined #tags
		 * @property {Object} attributes Object with engine defined @attributes
		 * @property {Object} components Object with components
		 * @property {Scene} scene Reference to Scene, in which Entity lives
		 */

		function Entity() {
			// construct entitiy

			this.components = {};
			this.tags       = {};
			this.attributes = {};
			this.name       = "";
			this.scene      = undefined;
			this.enabled    = true;

			this.add.apply( this, arguments );

			if( this.name === "" ) {
				this.name = "Entity" + (uniqueID++);
			}

			if( !this.hasComponent( TransformComponent )) {
				this.addComponent( TransformComponent );
			}

			// REVIEW: remove!

			this._world = undefined;
		}

		/**
		* Takes mixed arguments and adds these to the Entity (just like the constructor). For example:
		* <pre><code>myEntity.add( "#myTag", myComponent, myChildEntity );</code></pre>
		* <pre><code>myEntity.add( myMeshData, myMaterial );</code></pre>
		* <pre><code>myEntity.add( myCamera );</code></pre>
		* @returns {Entity} The Entity
		*/

		Entity.prototype.add = function() {
			ParseArguments( this, arguments, function( entity, type, value ) {
				if( type === ParseArguments.PARAMETERS ) {
					if( value.enabled !== undefined ) {
						entity.enabled = value.enabled;
					}
					if( value.name !== undefined ) {
						entity.name = value.name;
					}
					if( entity.scene !== undefined ) {
						entity.setScene( value.scene );
					}
					entity.add( value.components, value.tags, value.attributes );
				} else if( type === ParseArguments.CONSTRUCTOR ) {
					entity.addComponent( new value());
				} else if( type === ParseArguments.INSTANCE ) {
					if( value instanceof Entity ) {
						entity.addChild( value );
					} else if( value instanceof MeshData ) {
						entity.addComponent( new MeshDataComponent( value ));
					} else if( value instanceof Material ) {
						entity.addComponent( new MeshRendererComponent()).getComponent( MeshRendererComponent ).materials.push( value );
					} else if( value instanceof Camera ) {
						entity.addComponent( new CameraComponent( value ));
					} else if( value instanceof Light ) {
						entity.addComponent( new LightComponent( value ));
					} else {
						entity.addComponent( value );
					}
				} else if( type === ParseArguments.TAG ) {
					entity.addTag( value );
				} else if( type === ParseArguments.ATTRIBUTE ) {
					entity.addAttribute( value );
				} else if( type === ParseArguments.STRING ) {
					entity.name = value;
				} else if( type === ParseArguments.BOOL ) {
					entity.enabled = value;
				}
			} );
			return this;
		};

		Entity.prototype.get = function() {
			// TODO: cooler get, which also recurses through all children
			/*collection.clear();
			ParseArguments( this, arguments, function( entitiy, type, value ) {
				if( type === ParseArguments.CONSTRUCTOR ) {

				}
			});*/
			return this.getComponent( arguments[ 0 ] );
		};

		/**
		* Takes mixed arguments and asks if the Entity has these, for example:
		* <pre><code>if( myEntity.has( "#myTag", "@renderable" )) { ... }</code></pre>
		* @returns {bool} If the Entity has the supplied arguments
		*/

		Entity.prototype.has = function() {
			var a, argument, al = arguments.length;
			var type;
			var has = false;

			for( a = 0; a < al; a++ ) {
				argument = arguments[ a ];

				if( argument !== undefined ) {
					type = typeof( argument );

					if( type === "string" ) {
						if( argument.indexOf( "#" ) === 0 ) {
							has &= hasTag( argument );
						} else if( argument.indexOf( "@" ) === 0 ) {
							has &= hasAttribute( argument );
						} else {
							has &= argument === this.name;
						}
					} else if( type === "object" ) {
						if( Array.isArray( argument )) {
							has &= this.has.apply( argument );
						} else {
							has &= this.hasComponent( argument );
						}
					}
				}
			}

			return has;
 		};

 		// scene methods
 		// REVIEW: addToWorld is here for backwards compabiolity but by now the entity is
 		// alread part of a scene (done in Scene.createXXX)

 		Entity.prototype.addToWorld = function() {
 		};

 		/**
 		* Sets which scene the Entity belongs to. Note that it's best practice to use Scene.addEntity()
 		* @param {Scene} scene The scene which the Entity should be added to.
 		* @returns {Entity} The Entity
 		*/

		Entity.prototype.setScene = function( scene ) {
			this.scene = scene;
			scene.addEntity( this );
			// REVIEW: Remove!
			this._world = this.scene;

			this.getChildren().each( function( entitiy ) {
				entitiy.setScene( scene );
			});
			return this;
		};

		// component methods
		// REVIEW: setComponent here for backwards compability. addComponent is more
		// in line with other apis

		Entity.prototype.setComponent = function( component ) {
			this.addComponent( component );
		};

		/**
		* Adds a single component to the Entity. Please use Entity.add() if you like to add more than one Component at once.
		* @param {Component|function} component An instance of the Component or the Component's constructor 
		* @returns {Entity} The entity
		*/

		Entity.prototype.addComponent = function( component ) {
			if( typeof( component ) === "function" ) {
				component = new component();
			} 

			if( this.components[ component.type ] === undefined ) {
				this.components[ component.type ] = [];
			}
			this.components[ component.type ].push( component );

			component.init( this );
			return this;
		};

		/**
		* Gets a Component
		* @param {Component|function|string} component An instance of the Component, the Component's constructor or the type as a string
		* @returns {Component} The component or undefined if not available
		*/

		Entity.prototype.getComponent = function( component ) {
			var type = componentType( component );

			if( this.components[ type ] !== undefined ) {
				return this.components[ type ][ 0 ];
			}
		};


		/**
		* Gets one or more components (all or all of a certain type)
		* @param {Component|function|string} [component] An instance of the Component, the Component's constructor or the type as a string. If omitted, returns all Components
		* @returns {Collection} A Collection of all components
		*/

		Entity.prototype.getComponents = function( component ) {
			collection.clear();

			if( component !== undefined ) {
				var type = componentType( component );

				if( this.components[ type ] !== undefined ) {
					var c, components = this.components[ type ];
					var cl            = components.length;

					for( c = 0; c < cl; c++ ) {
						collection.add( components[ c ] );
					}
				}
			} else {
				var type, c, components, cl;
				for( type in this.components ) {
					components = this.components[ type ];
					cl = components.length;

					for( c = 0; c < cl; c++ ) {
						collection.add( components[ c ] );
					}
				}
			}

			return collection.clone();
		};

		/**
		* Asks if the Entity has one or more components of a certain type
		* @param {Component|function|string} component An instance of the Component, the Component's constructor or the type as a string
		* @returns {bool}
		*/

		Entity.prototype.hasComponent = function( component ) {
			var type = componentType( component );

			return this.components[ type ] ? this.components[ type ].length > 0 ? true : false : false;
		};

		// REVIEW: Remove! This is just for backwards compability
		Entity.prototype.clearComponent = function( type ) {
			this.removeComponent( type );
		};

		/**
		* Removes all components of a certain type
		* @param {Component|function|string} component An instance of the Component, the Component's constructor or the type as a string
		* @returns {Entity} The entity
		*/

		Entity.prototype.removeComponent = function( component ) {
			var type = componentType( component );

			for( var componentType in this.components ) {
				if( componentType === type ) {
					this.components[ componentType ].length = 0;
				}
			}
			return this;
		};

		/**
		* Adds a tag to the Entity
		* @param {string} tag The #tag to add
		* @returns {Entity} The entity
		*/

		Entity.prototype.addTag = function( tag ) {
			tag = ensureTag( tag );
			if( this.tags[ tag ] === undefined ) {
				this.tags[ tag ] = true;
			}
			return this;
		};

		/**
		* Removes a tag from the Entity
		* @param {string} tag The #tag to remove
		* @returns {Entity} The entity
		*/

		Entity.prototype.removeTag = function( tag ) {
			delete this.tags[ ensureTag( tag ) ];
			return this;
		};

		/**
		* Asks if the Entity has a tag
		* @param {string} tag The #tag to ask for
		* @returns {bool}
		*/

		Entity.prototype.hasTag = function( tag ) {
			return this.tags[ tag ] ? true : false;
		};

		/**
		* Adds an engine attribute to the Entity. Note that this method is intended to be used only by the Goo engine itself.
		* @param {string} attribute The @attribute to add
		* @returns {Entity} The entity
		*/

		Entity.prototype.addAttribute = function( attribute ) {
			attribute = ensureAttribute( attribute );
			if( this.attributes[ attribute ] === undefined ) {
				this.attributes[ attribute ] = true;
			}
			return this;
		};

		/**
		* Removes an attribute from the Entity
		* @param {string} attribute The @attribute to remove
		* @returns {Entity} The entity
		*/

		Entity.prototype.removeAttribute = function( attribute ) {
			delete this.attributes[ ensureAttribute( attribute ) ];
			return this;
		};

		/**
		* Asks if the Entity has an attribute
		* @param {string} attribute The @attribute to ask for. For example:
		* <pre><code>if( myEntity.hasAttribute( "@renderable" )) { ... }</code>
		* <code>if( myEntity.hasAttribute( "@camera" )) { ... }</code></pre>
		* @returns {bool}
		*/

		Entity.prototype.hasAttribute = function( attribute ) {
			return this.attributes[ attribute ] ? true : false;
		};

		// TODO: well...
		
		Entity.prototype.clone = function() {
		};

		// helpers

        function componentType( component ) {
        	if( component !== undefined ) {
	            var type = typeof( component );
	            if( type === "string" ) {
                    return component;
	            } else if( type === "object" && component.type !== undefined ) {
                    return component.type;
	            } else {
                    var raw = component.toString();
                    var beginIndex = raw.indexOf( '.type="' );

                    if( beginIndex !== -1 ) {
	                    // minified code
	                    return raw.slice( beginIndex + 7, raw.indexOf( '",' ));
                    } else {
	                    // unminified code
						return raw.slice( 9, raw.indexOf( "(" ));
                    }
	            }
        	} else return "N/A";
        }

		function ensureTag( tag ) {
			if( tag.indexOf( "#" ) === -1 ) {
				console.warn( "Entity.ensureTag: Please add # to your '" + tag + "'" );
				return "#" + tag;
			}
			return tag;
		}

		function ensureAttribute( attribute ) {
			if( attribute.indexOf( "@" ) === -1 ) {
				console.warn( "Entity.ensureAttribute: Please add @ to your '" + attribute + "'" );
				return "@" + attribute;
			}
			return attribute;
		}

		return Entity;
	}
);

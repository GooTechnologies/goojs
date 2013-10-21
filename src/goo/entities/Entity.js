define(
	[ "goo/entities/Collection",
	  "goo/util/ProcessArguments",
	  "goo/entities/components/TransformComponent" ],
	function( Collection, ProcessArguments, TransformComponent ) {
		"use strict";

		// static

		var uniqueID   = 0;
		var collection = new Collection();

		// constructor

		function Entity() {
			this.components = {};
			this.tags       = {};
			this.attributes = {};

			this.add.apply( this, arguments );

			if( !this.hasComponent( TransformComponent )) {
				this.addComponent( TransformComponent );
			}
		}

		// general add/get/has methods

		Entity.prototype.add = function() {
			ProcessArguments( this, arguments, function( entity, type, value ) {
				if( type === ProcessArguments.PARAMETERS ) {
					entity.enabled    = value.enabled !== undefined ? value.enabled : true;
					entity.name       = value.name    !== undefined ? value.name    : "Entity" + (uniqueID++);
					entity.scene      = value.scene   !== undefined ? value.scene   : undefined;
					
					entity.add( value.components, value.tags, value.attributes );
				} else if( type === ProcessArguments.CONSTRUCTOR ) {
					entity.addComponent( new value());
				} else if( type === ProcessArguments.INSTANCE ) {
					if( value instanceof Entity ) {
						entity.addChild( value );
					} else {
						entity.addComponent( value );
					}
				} else if( type === ProcessArguments.TAG ) {
					entity.addTag( value );
				} else if( type === ProcessArguments.ATTRIBUTE ) {
					entity.addAttribute( value );
				} else if( type === ProcessArguments.STRING ) {
					entity.name = value;
				}
			} );
		};

		Entity.prototype.get = function() {
			// TODO: cooler get
			return this.getComponent( arguments[ 0 ] );
		};

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

		Entity.prototype.setScene = function( scene ) {
			this.scene = scene;

			this.getChildren().each( function( entitiy ) {
				entitiy.setScene( scene );
			});
		};

		// component methods

		Entity.prototype.addComponent = function( component ) {
			if( typeof( component ) === "function" ) {
				component = new component();
			} 

			if( this.components[ component.type ] === undefined ) {
				this.components[ component.type ] = [];
			}
			this.components[ component.type ].push( component );

			component.init( this );
		};

		Entity.prototype.getComponent = function( component ) {
			var type = componentType( component );

			if( this.components[ type ] !== undefined ) {
				return this.components[ type ][ 0 ];
			}
		};

		Entity.prototype.getComponents = function( component ) {
			collection.clear();

			if( component !== undefined ) {
				var type = component.type;

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

			return collection;
		};

		Entity.prototype.hasComponent = function( component ) {
			var type = componentType( component );

			return this.components[ type ] ? this.components[ type ].length > 0 ? true : false : false;
		};


		// tag methods

		Entity.prototype.addTag = function( tag ) {
			tag = ensureTag( tag );
			if( this.tags[ tag ] === undefined ) {
				this.tags[ tag ] = true;
			}
		};

		Entity.prototype.removeTag = function( tag ) {
			delete this.tags[ ensureTag( tag ) ];
		};

		Entity.prototype.hasTag = function( tag ) {
			return this.tags[ tag ] ? true : false;
		};

		// attribute methods

		Entity.prototype.addAttribute = function( attribute ) {
			attribute = ensureAttribute( attribute );
			if( this.attributes[ attribute ] === undefined ) {
				this.attributes[ attribute ] = true;
			}
		};

		Entity.prototype.removeAttribute = function( attribute ) {
			delete this.attributes[ ensureAttribute( attribute ) ];
		};

		Entity.prototype.hasAttribute = function( attribute ) {
			return this.attributes[ attribute ] ? true : false;
		};

		// helpers

        function componentType( component ) {
                var type = typeof( component );
                if( type === "string" ) {
                        return component;
                } else if( type === "object" && component.type !== undefined ) {
                        return component.type;
                } else {
                        var raw = component.toString();
                        return raw.slice( 9, raw.indexOf( "(" ));
                }
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
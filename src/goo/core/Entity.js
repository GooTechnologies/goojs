define(
	[ "goo/core/Collection",
	  "goo/components/TransformComponent" ],
	function( Collection, TransformComponent ) {
		"use strict";

		// static

		var uniqueID   = 0;
		var collection = new Collection();

		// constructor

		function Entity( parameters ) {
			this.enabled    = parameters.enabled !== undefined ? parameters.enabled : true;
			this.name       = parameters.name    !== undefined ? parameters.name    : "Entity" + (uniqueID++);
			this.scene      = parameters.scene   !== undefined ? parameters.scene   : undefined;
			this.components = {};
			this.tags       = {};
			this.attributes = {};

			this.add( parameters.components, parameters.tags, parameters.attributes );

			if( !this.hasComponent( TransformComponent )) {
				this.addComponent( TransformComponent );
			}
		}

		Entity.prototype.init = function( scene ) {
			this.scene = this.scene || scene;
		};

		// general add/get/has methods

		Entity.prototype.add = function() {
			var a, argument, al = arguments.length;
			var type;
			for( a = 0; a < al; a++ ) {
				argument = arguments[ a ];

				if( argument !== undefined ) {
					type = typeof( argument );

					if( type === "object" ) { 
						if( argument.constructor.toString().indexOf( "function Array()" ) === 0 ) {
							this.add( argument );
						} else {
							this.addComponent( argument );
						}
					} else if( type === "function" ) {
						this.addComponent( argument );
					} else if( type === "string" ) {
						if( argument.indexOf( "#" ) !== -1 ) {
							this.addTag( argument );
						} else if( argument.indexOf( "@" ) !== -1 ) {
							this.addAttribute( argument );
						} else {
							this.name = argument;
						}
					}
				}
			}
		};

		Entity.prototype.get = function() {

		};

		Entity.prototype.has = function() {
			var a, argument, al = arguments.length;
			var type;
			var doHave = false;

			for( a = 0; a < al; a++ ) {
				argument = arguments[ a ];

				if( argument !== undefined ) {
					type = typeof( argument );

					if( type === "string" ) {
						if( argument.indexOf( "#" ) === 0 ) {
							doHave &= hasTag( argument );
						} else if( argument.indexOf( "@" ) === 0 ) {
							doHave &= hasAttribute( argument );
						} else {
							doHave &= argument === this.name;
						}
					} else {
						doHave &= this.hasComponent( argument );
					}
				}
			}

			return doHave;
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
			component.applyAPI();
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
				var raw = component.constructor.toString();
				return raw.splice( 9, raw.indexOf( "(" ));
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
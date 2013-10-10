define( 
	[],
	function() {
		"use strict";

		function Component( parameters ) {
			this.enabled = true;
			this.entity  = undefined;
			this.api     = {};
			this.type    = functionToType( this.constructor );
		}

		Component.prototype.init = function( entity ) {
			this.entity = entity;
			this.applyAPI();
		};

		Component.prototype.applyAPI = function() {
			if( this.entity ) {
				var key;
				var api    = this.api;
				var entity = this.entity;

				for( key in api ) {
					if( entity[ key ] === undefined ) {
						entity[ key ] = api[ key ];

						if( typeof( entity[ key ] ) === "function" ) {
							entity[ key ].bind( this );
						}
					} else {
						console.error( "Component.applyAPI: " + key + " is already taken, please see to that you don't have a duplicate or don't use the api." );
						return;
					}
				}
			}
		};

		Component.prototype.process = function( processParameters ) {
		};

		Component.prototype.dispose = function() {
		};

		// helpers

		function functionToType( func ) {
			if( typeof( func ) === "string" ) {
				return func;
			} else {
				var raw = func.toString();
				return raw.splice( 9, raw.indexOf( "(" ));
			}
		}

		return Component;
	}
);
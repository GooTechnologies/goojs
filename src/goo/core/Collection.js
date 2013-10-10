define(
	[],
	function() {
		"use strict";

		function Collection() {
			this.first = undefined;
			this.items = [];
			this.last  = undefined;
		}

		Collection.prototype.clear = function() {
			this.first        = undefined;
			this.items.length = 0;
			this.last         = undefined;
		};

		Collection.prototype.add = function( item ) {
			this.items.push( item );
			this.first = this.first || item;
			this.last  = item;
		};

		Collection.prototype.remove = function( item ) {
			var i = this.items.indexOf( item );
			if( i !== -1 ) {
				this.items.splice( i, 1 );
	
				if( this.items.length > 0 ) {
					this.first = this.items[ 0 ];
					this.last  = this.items[ this.items.length - 1 ];
				} else {
					this.first = undefined;
					this.last  = undefined;
				}
			}
		}

		Collection.prototype.each = function( callback ) {
			var all = this.items;
			var a   = 0;
			var al  = all.length;

			for( ; a < al; a++ ) {
				callback( all[ a ] );
			}
		};

		Collection.prototype.init = function( parameters ) {
			callFunction( this.items, "init", parameters );
		};

		Collection.prototype.process = function( parameters ) {
			callFunction( this.items, "process", parameters );
		};

		Collection.prototype.draw = function( parameters ) {
			callFunction( this.items, "draw", parameters );
		};

		Collection.prototype.dispose = function( parameters ) {
			callFunction( this.items, "dispose", parameters );
		};

		// helpers

		function callFunction( items, functionName, parameters ) {
			var i  = 0;
			var il = items.length;

			for( ; i < il; i++ ) {
				if( items[ i ][ functionName ] ) {
					items[ i ][ functionName ]( parameters );
				}
			}
		}
	}
);
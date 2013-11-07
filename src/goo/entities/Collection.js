define(
	[],
	function() {
		"use strict";

		function Collection() {
			this.first        = undefined;
			this.items        = [];
			this.last         = undefined;
			this.clearAllowed = true;
		}

		Collection.prototype.clear = function() {
			if( this.clearAllowed ) {
				this.first        = undefined;
				this.items.length = 0;
				this.last         = undefined;
			}

			return this;
		};

		Collection.prototype.preventClear = function() {
			this.clearAllowed = false;
		};

		Collection.prototype.allowClear = function() {
			this.clearAllowed = true;
		};

		Collection.prototype.fromArray = function( items ) {
			this.items = items.concat( [] );

			if( this.items.length > 0 ) {
				this.first = this.items[ 0 ];
				this.last  = this.items[ this.items.length - 1 ];
			} else {
				this.first = undefined;
				this.last  = undefined;
			}

			return this;
		};

		Collection.prototype.toArray = function() {
			return this.items.concat( [] );
		};

		Collection.prototype.add = function( item ) {
			if( item !== undefined ) {
				if( item instanceof Collection ) {
					var collection = this;
					item.each( function( otherItem ) {
						collection.add( otherItem );
					});
				} else if( this.items.indexOf( item ) === -1 ) {
					this.items.push( item );
					this.first = this.first || item;
					this.last  = item;
				}
			}

			return this;
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

			return this;
		}

		Collection.prototype.orFirst = function() {
			return this.items.length !== 1 ? this : this.first;
		};

		Collection.prototype.each = function( callback ) {
			var all = this.items;
			var a   = 0;
			var al  = all.length;

			for( ; a < al; a++ ) {
				callback( all[ a ] );
			}

			return this;
		};

		Collection.prototype.compare = function( property, value ) {
			var all = this.items;
			var al  = all.length;

			while( al-- ) {
				if( all[ al ][ property ] === value ) {
					return all[ al ];
				}
			}

			return undefined;
		};

		Collection.prototype.init = function( parameters ) {
			callFunction( this.items, "init", parameters );
			return this;
		};

		Collection.prototype.process = function( parameters ) {
			callFunction( this.items, "process", parameters );
			return this;
		};

		Collection.prototype.draw = function( parameters ) {
			callFunction( this.items, "draw", parameters );
			return this;
		};

		Collection.prototype.dispose = function( parameters ) {
			callFunction( this.items, "dispose", parameters );
			return this;
		};

		Collection.prototype.clone = function() {
			var collection   = new Collection();
			collection.first = this.first;
			collection.items = this.items.concat( [] );
			collection.last  = this.last;
			return collection;
		};

		// static

		Collection.clone = function( instanceOrCollection ) {
			if( instanceOrCollection instanceof Collection ) {
				return instanceOrCollection.clone();
			} else {
				var collection = new Collection();
				collection.add( instanceOrCollection );
				return collection;
			}
 		}

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

		return Collection;
	}
);
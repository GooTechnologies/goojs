define( 
	[],
	function() {

		"use strict";

		function System( type, interests ) {
			this.enabled   = true;
			this.type      = type      || "System";
			this.interests = interests || [];
			this.entities  = [];
			this.scene     = undefined;
		}

		System.prototype.init = function( scene ) {
			this.scene = scene;
		};

		/**
		 * Check if a system is interested in an entity based on its interests list.
		 *
		 * @param entity {Entity} to check if the system is interested in
		 */

		System.prototype.isInterestedIn = function( entity ) {
			var isInterested = false;

			if( this.interests && this.interests.length > 0 ) {
				isInterested = true;
				for( var i = 0; i < this.interests.length; i++ ) {
					var type = this.interests[ i ];

					if( entity.components[ type ] === undefined ) {
						isInterested = false;
						break;
					}
				}
			}

			return isInterested;
		};

		System.prototype.addedEntity = function( entity ) {
			if( this.isInterestedIn( entity ) && !this.hasEntity( entity )) {
				this.entities.push( entity );
			
				if( this.addedComponent !== undefined ) {
					entity.getComponents().each( function( component ) {
						this.addedComponent( entity, component );
					});
				}

				if( this.inserted !== undefined ) {
					this.inserted( entity );
				}
			}
		};

		System.prototype.changedEntity = function( event ) {
			if( this.hasEntity( event.entity )) {
				if( event.eventType !== undefined && this[ event.eventType ] !== undefined ) {
					system[ event.eventType ]( event.entity, event.component );
				}
			}
		};

		System.prototype.removedEntity = function( entity ) {
			var i = this.entities.indexOf( entity );
			if( i !== -1 ) {
				this.entities.splice( i, 1 );

				if( this.removedComponent !== undefined ) {
					entity.getComponents().each( function( component ) {
						this.removedComponent( entity, component );
					});
				}

				if( this.deleted !== undefined ) {
					this.deleted( entity );
				}
			}
		};

		System.prototype.hasEntity = function( entity ) {
			return this.entities.indexOf( event.entity ) !== -1;
		};

		// REVIEW: This need to be removed as it's extremely hard to read. Please change
		// this to System.process and override it in the systems as with 
		// your own function and don't expect entites as variable. You have them in this.entities
		// already! 

		System.prototype._process = function( deltaTime ) {
			if( this.process !== undefined ) {
				this.process( this.entites, deltaTime );
			}  
		};

		// REVIEW: This is how it should look like. Please override in all systems and use processParameters.deltaTime for "tpf".
		// Entities exists in this.entities

		System.prototype.process = function( processParameters ) {

		};

		System.prototype.dispose = function () {
		};
	
		return System;
	}
);
define( 
	[ "goo/entities/components/Component",
	  "goo/entities/Collection",
	  "goo/math/Transform" ],

	function( Component, Collection, Transform ) {

		"use strict";

		var collection = new Collection;

		function TransformComponent() {
			Component.call( this );

			this.type     = "TransformComponent";
			this.parent   = undefined;
			this.children = [];

			this.transform      = new Transform();
			this.worldTransform = new Transform();

			this.api = {
				'transformComponent' 	: this,
				'position' 				: this.transform.translation,
				'rotation' 				: this.transform.rotation,
				'scale'      		   	: this.transform.scale,
				'hasParent' 			: this.hasParent.bind( this ),
				'setParent' 			: this.setParent.bind( this ),
				'getParent' 			: this.getParent.bind( this ),
				'hasChildren' 		    : this.hasChildren.bind( this ),
				'addChild' 				: this.attachChild.bind( this ),
				'removeChild' 			: this.detachChild.bind( this ),
				'getChild' 				: this.getChild.bind( this ),
				'getChildren' 			: this.getChildren.bind( this ),
				'setPosition' 			: this.setTranslation.bind( this ),
				'setRotation' 			: this.setRotation.bind( this )
			};

			// REVIEW: shouldn't these be moved into Transform? Also, note that these are marked as private but is not referenced (just set) from within this class...
			// REVIEW: Also, what is the difference between dirty and updated? Find better naming, maybe?

			this._dirty = true;
			this._updated = false;
		}

		TransformComponent.prototype = Object.create( Component.prototype );

		TransformComponent.prototype.hasParent = function() {
			return this.parent !== undefined;
		};

		TransformComponent.prototype.setParent = function( entityOrTransformComponent ) {
			if( entityOrTransformComponent !== undefined ) {
				var parentTransform = ensureTransformComponent( entityOrTransformComponent );
				var parentEntity    = parentTransform.entity;

				if( this.parent !== undefined ) {
					this.parent.detachChild( this );
				}	

				this.parent = parentTransform;

				if( this.entity.scene !== parentEntity.scene )	{
					if( this.entity.scene !== undefined ) {
						this.entity.scene.removeEntity( this.entity );
					}
					if( this.parentEntity.scene !== undefined ) {
						this.parentEntity.scene.addEntity( this.entity );
					}
				}
			} else if( this.parent !== undefined ) {
				this.parent.detachChild( this );
				this.entity.scene.removeEntity( this );
			}
		};

		TransformComponent.prototype.getParent = function() {
			if( this.parent !== undefined ) {
				return this.parent.entity;
			} else {
				return undefined;
			}
		};

		// REVIEW: The Entity API is addChild (to be in line with other methods), maybe rename this, too?

		TransformComponent.prototype.attachChild = function( entityOrTransformComponent ) {
			var childTransform = ensureTransformComponent( entityOrTransformComponent );

			if( this.children.indexOf( childTransform ) === -1 ) {
				var transform = this;

				while( transform !== undefined ) {
					if( transform === childTransform ) {
						console.warn( "TransformComponent.attachChild: An object can\'t be added as a descendant of itself." );
						return;
					}
					transform = transform.parent;
				}

				childTransform.setParent( this );
				this.children.push( childTransform );
			}
		};

		// REVIEW: The Entity API is removeChild (to be in line with other methods), maybe rename this, too?

		TransformComponent.prototype.detachChild = function( entityOrTransformComponent ) {
			var childTransform = ensureTransformComponent( entityOrTransformComponent );
			var childEntity    = childTransform.entity;

			if( childTransform === this ) {
				console.warn( "attachChild: An object can\'t be removed from itself." );
				return;
			}

			var i = this.children.indexOf( childTransform );
			if( i !== -1 ) {
				this.children.splice( i, 1 );
				childTransform.parent = undefined;
				childEntity.scene.removeEntity( childEntity );
			}
		};

		TransformComponent.prototype.getChild = function( name ) {
			// TODO: cooler selector typ so you can get by component, tags and attributes

			var children = this.children;
			var cl       = children.length;

			while( cl-- ) {
				if( children[ cl ].entity.name === name ) {
					// TODO: Return entity and not the TransformComponent!
					return children[ cl ];
				}
			}
		};

		TransformComponent.prototype.getChildren = function() {
			// TODO: Return entity and not the TransformComponent!
			return collection.fromArray( this.children );
		};

		TransformComponent.prototype.hasChildren = function() {
			return this.children.length !== 0;
		};

		/**
		 * Set this transform's translation.
		 * @param {Vector|Float[]|...Float} arguments Component values.
		 * @return {TransformComponent} Self for chaining.
		 */

		 // REVIEW: "Position" is a more common and used word than "Translation". Entity API is setPosition - maybe rename this, too?

		TransformComponent.prototype.setTranslation = function () {
			this.transform.translation.set(arguments);
			this._dirty = true;
			return this;
		};

		/**
		 * Set this transform's scale.
		 * @param {Vector|Float[]|...Float} arguments Component values.
		 * @return {TransformComponent} Self for chaining.
		 */
		TransformComponent.prototype.setScale = function () {
			if( arguments.length === 1 ) {
				this.transform.scale.set( arguments[ 0 ], arguments[ 0 ], arguments[ 0 ] );
			} else {
				this.transform.scale.set(arguments);
			}
			this._dirty = true;
			return this;
		};

		/**
		 * Add to this transform's translation.
		 * @param {Vector|Float[]|...Float} arguments Component values.
		 * @return {TransformComponent} Self for chaining.
		 */

		 // REVIEW: "Position" is a more common and used word than "Translation". Entity API is setPosition - maybe rename this, too?

		TransformComponent.prototype.addTranslation = function () {
			if(arguments.length === 3) {
				this.transform.translation.add(arguments);
			} else {
				this.transform.translation.add(arguments[0]);
			}
			this._dirty = true;
			return this;
		};

		/**
		 * Set this transform's rotation around X, Y and Z axis.
		 * The rotation is applied in XYZ order.
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @return {TransformComponent} Self for chaining.
		 */

		TransformComponent.prototype.setRotation = function (x,y,z) {
			this.transform.rotation.fromAngles(x,y,z);
			this._dirty = true;
			return this;
		};

		 // TODO: addRotation and subRotation (yes, I know it's just to send in negative values but the code becomes more readable)

		/**
		 * Sets the transform to look in a specific direction.
		 * @param {Vector3} position Target position.
		 * @param {Vector3} up Up vector.
		 * @return {TransformComponent} Self for chaining.
		 */
		TransformComponent.prototype.lookAt = function (position, up) {
			this.transform.lookAt(position, up);
			this._dirty = true;
			return this;
		};

		/**
		 * Mark the component for updates of world transform
		 */
		TransformComponent.prototype.setUpdated = function () {
			this._dirty = true;
		};

		/**
		 * Update target transform contained by this component
		 */
		TransformComponent.prototype.updateTransform = function () {
			this.transform.update();
		};

		/**
		 * Update this transform components world transform (resulting transform considering parent transformations)
		 */
		TransformComponent.prototype.updateWorldTransform = function () {
			if (this.parent) {
				this.worldTransform.multiply(this.parent.worldTransform, this.transform);
			} else {
				this.worldTransform.copy(this.transform);
			}
			this._dirty = false;
			this._updated = true;
		};
		
		/**
		* Copies another TransformComponent into this TransformComponent
		*/

		TransformComponent.prototype.copy = function( other ) {
			this.transform     .copy( other.transform );
			this.worldTransform.copy( other.worldTransform );
			this._dirty   = true;
			this._updated = false;
		
			return this;
		};

		/**
		* Clones the component
		*/

		TransformComponent.prototype.clone = function() {
			var theClone = new TransformComponent();
			
			theClone.transform     .copy( this.transform );
			theClone.worldTransform.copy( this.worldTransform );
			return theClone;
		};


		// helpers

		function ensureTransformComponent( entityOrTransformComponent ) {
			return entityOrTransformComponent instanceof TransformComponent ? entityOrTransformComponent : entityOrTransformComponent.get( TransformComponent );
		}

		return TransformComponent;
	}
);
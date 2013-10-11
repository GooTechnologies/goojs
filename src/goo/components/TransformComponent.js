define( 
	[ "goo/component/Component",
	  "goo/core/Collection",
	  "goo/math/Transform" ],

	function( Component, Collection, Vector3, Matrix3x3, Matrix4x4, Transform ) {

		"use strict";

		var collection = new Collection;

		function TransformComponent() {
			Component.call( this );

			this.parent   = undefined;
			this.children = [];

			this.transform      = new Transform();
			this.worldTransform = new Transform();

			this.api = {
				"translation" 	: this.transform.translation,
				"rotation" 		: this.transform.rotation,
				"scale"         : this.transform.scale,
				"setParent" 	: this.setParent,
				"getParent" 	: this.getParent,
				"addChild" 		: this.attachChild,
				"removeChild" 	: this.detachChild,
				"getChild" 		: this.getChild,
				"getChildren" 	: this.getChildren
			};
		}

		TransformComponent.prototype = Object.create( Component );

		TransformComponent.prototype.setParent = function( entity ) {
			if( this.parent ) {
				this.parent.removeChild( this.entity );
			}	

			if( this.entity.scene !== entity.scene )	{
				this.entity.setScene( entity.scene );
			}
		};

		TransformComponent.prototype.getParent = function() {
			return this.parent;
		};

		TransformComponent.prototype.attachChild = function( entity ) {
			
		};

		TransformComponent.prototype.detachChild = function( entity ) {
			
		};

		TransformComponent.prototype.getChild = function() {
			
		};

		TransformComponent.prototype.getChildren = function() {
			// todo: add filtering on components, tags and attributes
			return this.children;
		};
	}
);
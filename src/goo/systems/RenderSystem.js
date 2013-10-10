define( 
	[ "goo/core/System",
	  "goo/components/TransformComponent",
	  "goo/components/MeshDataComponent",
	  "goo/components/MeshRendererComponent" ],

	function( System, TransformComponent, MeshDataComponent, MeshRendererComponent ) {

		"use strict";

		function RenderSystem() {
			System.call( this );
		}


		RenderSystem.prototype = Object.create( System.prototype );

		RenderSystem.prototype.systemInit = System.prototype.init;
		RenderSystem.prototype.init = function( goo ) {
			this.systemInit( goo );
			// to do: setup
			this.goo.registerForComponents( TransformComponent, MeshDataComponent, MeshRendererComponent );
		};

		return RenderSystem;
	}
);
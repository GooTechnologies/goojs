// REVIEW: This is to map GooRunner (which in my opionion should be removed) to Goo and
// adds a global namespace with some cool functions

define( [ 
	"goo/entities/GooRunner",
	"goo/entities/Scene",
	"goo/entities/Entity",
	"goo/entities/components/CameraComponent",
	"goo/entities/components/LightComponent",
	"goo/entities/components/MeshDataComponent",
	"goo/entities/components/MeshRendererComponent",
	"goo/entities/Collection",
	"goo/math/Vector2",
	"goo/math/Vector3",
	"goo/math/Vector4",
	"goo/math/Quaternion",
	"goo/math/Ray",
	"goo/math/Matrix3x3",
	"goo/math/Matrix4x4" ],
	function( 
		GooRunner,
		Scene,
		Entity,
		CameraComponent,
		LightComponent,
		MeshDataComponent,
		MeshRendererComponent,
		Collection,
		Vector2,
		Vector3,
		Vector4,
		Quaternion,
		Ray,
		Matrix3x3,
		Matrix4x4 ) {

		"use strict";

		// REVIEW: to not demand users to use require (which honestly is a bit of hurdle) it might
		// be a good thing to clutter the global scope with a "goo" namespace.

		if( window.goo === undefined ) {
			window.goo = {
				Goo                  : GooRunner,
				Scene                : Scene,
				Entity               : Entity,
				CameraComponent      : CameraComponent,
				LightComponent       : LightComponent,
				MeshDataComponent    : MeshDataComponent,
				MeshRendererComponent: MeshRendererComponent,
				Collection           : Collection,
				Vector2              : Vector2,
				Vector3              : Vector3,
				Vector4              : Vector4,
				Quaternion           : Quaternion,
				Ray                  : Ray,
				Matrix3x3            : Matrix3x3,
				Matrix4x4            : Matrix4x4
			}

			window.goo.createCamera = function( cameraSettings ) {
				return new Entity( new CameraComponent( cameraSettings ));
			};

			window.goo.createLight = function( lightSettings ) {
				return new Entity( new LightComponent( lightSettings ));
			}

			window.goo.createEntity = function() {
				var entity = new Entity();
				entity.add.apply( entity, arguments );
				return entity;
			}
		} 

		return GooRunner;
	}
);
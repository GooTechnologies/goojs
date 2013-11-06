// REVIEW: This is to map GooRunner (which in my opionion should be removed) to Goo and
// adds a global namespace with some cool functions

define( [ 
	"goo/entities/GooRunner",
	"goo/entities/Scene",
	"goo/entities/Entity",
	"goo/entities/components/Component",
	"goo/entities/components/CameraComponent",
	"goo/entities/components/LightComponent",
	"goo/entities/components/MeshDataComponent",
	"goo/entities/components/MeshRendererComponent",
	"goo/entities/components/CSSTransformComponent",
	"goo/entities/components/AnimationComponent",
	"goo/entities/components/OccludeeComponent",
	"goo/entities/components/OccluderComponent",
	"goo/entities/components/ParticleComponent",
	"goo/entities/components/ProximityComponent",
	"goo/entities/components/ScriptComponent",
	"goo/entities/components/TextComponent",
	"goo/entities/components/TransformComponent",
	"goo/entities/Collection",
	"goo/math/Vector2",
	"goo/math/Vector3",
	"goo/math/Vector4",
	"goo/math/Quaternion",
	"goo/math/Ray",
	"goo/math/Matrix3x3",
	"goo/math/Matrix4x4",
	"goo/renderer/Material",
	"goo/renderer/Shader",
	"goo/renderer/shaders/ShaderLib",
	"goo/shapes/Box",
	"goo/shapes/Cylinder",
	"goo/shapes/Disk",
	"goo/shapes/FilledPolygon",
	"goo/shapes/Grid",
	"goo/shapes/PolyLine",
	"goo/shapes/ProjectedGrid",
	"goo/shapes/Quad",
	"goo/shapes/RegularPolygon",
	"goo/shapes/SimpleBox",
	"goo/shapes/Sphere",
	"goo/shapes/Surface",
	"goo/shapes/TextureGrid",
	"goo/shapes/Torus",
	"goo/shapes/Triangle" ],
	
	function( 
		GooRunner,
		Scene,
		Entity,
		Component,
		CameraComponent,
		LightComponent,
		MeshDataComponent,
		MeshRendererComponent,
		CSSTransformComponent,
		AnimationComponent,
		OccludeeComponent,
		OccluderComponent,
		ParticleComponent,
		ProximityComponent,
		ScriptComponent,
		TextComponent,
		TransformComponent,
		Collection,
		Vector2,
		Vector3,
		Vector4,
		Quaternion,
		Ray,
		Matrix3x3,
		Matrix4x4,
		Material,
		Shader,
		ShaderLib,
		Box,
		Cylinder,
		Disk,
		FilledPolygon,
		Grid,
		PolyLine,
		ProjectedGrid,
		Quad,
		RegularPolygon,
		SimpleBox,
		Sphere,
		Surface,
		TextureGrid,
		Torus,
		Triangle ) {

		"use strict";

		// REVIEW: to not demand users to use require (which honestly is a bit of hurdle) it might
		// be a good thing to clutter the global scope with a "goo" namespace.

		if( window.goo === undefined ) {
			window.goo = {
				Goo                  : GooRunner,
				GooRunner            : GooRunner,
				Scene                : Scene,
				Entity               : Entity,
				Component            : Component,
				CameraComponent      : CameraComponent,
				LightComponent       : LightComponent,
				MeshDataComponent    : MeshDataComponent,
				MeshRendererComponent: MeshRendererComponent,
				TransformComponent   : TransformComponent,
				CSSTransformComponent: CSSTransformComponent,
				AnimationComponent   : AnimationComponent,
				OccludeeComponent    : OccludeeComponent,
				OccluderComponent    : OccluderComponent,
				ParticleComponent    : ParticleComponent,
				ProximityComponent   : ProximityComponent,
				ScriptComponent      : ScriptComponent,
				TextComponent        : TextComponent,
				Collection           : Collection,
				Vector2              : Vector2,
				Vector3              : Vector3,
				Vector4              : Vector4,
				Quaternion           : Quaternion,
				Ray                  : Ray,
				Matrix3x3            : Matrix3x3,
				Matrix4x4            : Matrix4x4,
				Material             : Material,
				Shader               : Shader,
				ShaderLib            : ShaderLib,
				Box                  : Box,
				Cylinder             : Cylinder,
				Disk                 : Disk,
				FilledPolygon        : FilledPolygon,
				Grid                 : Grid,
				PolyLine             : PolyLine,
				ProjectedGrid        : ProjectedGrid,
				Quad                 : Quad,
				RegularPolygon       : RegularPolygon,
				SimpleBox            : SimpleBox,
				Sphere               : Sphere,
				Surface              : Surface,
				TextureGrid          : TextureGrid,
				Torus                : Torus,
				Triangle             : Triangle
			};

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
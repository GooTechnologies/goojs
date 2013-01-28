require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
	}
});
require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/entities/components/LightComponent', 'goo/renderer/Light', 'goo/renderer/Camera',
		'goo/entities/components/CameraComponent', 'goo/scripts/BasicControlScript', 'goo/math/Vector3', 'goo/renderer/Util'], function(World,
	Entity, System, TransformSystem, RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData,
	Renderer, Material, Shader, GooRunner, TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, LightComponent,
	Light, Camera, CameraComponent, BasicControlScript, Vector3, Util) {
	"use strict";

	var resourcePath = "../resources";

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 5, 10);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		// loadModels(goo);
		var meshData = ShapeCreator.createTeapot();
		createMesh(goo, meshData, 0, 0, 0);
	}

	function createMesh(goo, meshData, x, y, z) {
		var world = goo.world;

		// Create entity
		var entity = world.createEntity();

		entity.transformComponent.transform.translation.set(x, y, z);

		// Create meshdata component using above data
		var meshDataComponent = new MeshDataComponent(meshData);
		entity.setComponent(meshDataComponent);

		// Create meshrenderer component with material and shader
		var meshRendererComponent = new MeshRendererComponent();

		var material = Material.createMaterial(Material.shaders.textured);
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/pitcher.jpg');
		material.textures.push(texture);

		var wireframeMaterial = Material.createMaterial(Material.shaders.textured);
		wireframeMaterial.wireframe = true;

		meshRendererComponent.materials.push(material);
		meshRendererComponent.materials.push(wireframeMaterial);
		entity.setComponent(meshRendererComponent);

		entity.setComponent(new ScriptComponent(new BasicControlScript()));

		entity.addToWorld();
	}

	function loadModels(goo) {
		var importer = new JSONImporter(goo.world);

		// Load asynchronous with callback
		importer.load(resourcePath + '/girl.model', resourcePath + '/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(0.15, 0.15, 0.15);
				entities[0].transformComponent.transform.translation.x = -20;
				entities[0].transformComponent.transform.translation.y = -10;
			},
			onError : function(error) {
				console.error(error);
			}
		});

		// Load asynchronous with callback
		importer.load(resourcePath + '/head.model', resourcePath + '/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(40, 40, 40);
				entities[0].transformComponent.transform.translation.x = 0;
			},
			onError : function(error) {
				console.error(error);
			}
		});

		// Load asynchronous with callback
		importer.load(resourcePath + '/shoes/shoes_compressed.json', resourcePath + '/shoes/textures/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(1.0, 1.0, 1.0);
				entities[0].transformComponent.transform.translation.x = 20;
			},
			onError : function(error) {
				console.error(error);
			}
		});
	}

	function createShader() {
		return {
			attributes : {
				vertexPosition : MeshData.POSITION,
				center : 'center'
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
			},
			vshader : [ //
			'precision highp float;',//

			'attribute vec3 vertexPosition;', //
			'attribute vec4 center;', //

			'uniform mat4 viewMatrix;', //
			'uniform mat4 projectionMatrix;',//
			'uniform mat4 worldMatrix;',//

			'varying vec4 vCenter;', //

			'void main() {', //
			'	vCenter = center;', //
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
			'}', //
			].join('\n'),
			fshader : [//
			'precision highp float;',//
			// 'precision mediump float;',//

			'#extension GL_OES_standard_derivatives : enable',//

			'varying vec4 vCenter;',//

			'float edgeFactorTri() {',//
			'	vec3 d = fwidth( vCenter.xyz );',//
			'	vec3 a3 = smoothstep( vec3( 0.0 ), d * 1.5, vCenter.xyz );',//
			'	return min( min( a3.x, a3.y ), a3.z );',//
			'}',//

			'float edgeFactorQuad1() {',//
			'	vec2 d = fwidth( vCenter.xy );',//
			'	vec2 a2 = smoothstep( vec2( 0.0 ), d * 1.5, vCenter.xy );',//
			'	return min( a2.x, a2.y );',//
			'}',//

			'float edgeFactorQuad2() {',//
			'	vec2 d = fwidth( 1.0 - vCenter.xy );',//
			'	vec2 a2 = smoothstep( vec2( 0.0 ), d * 1.5, 1.0 - vCenter.xy );',//
			'	return min( a2.x, a2.y );',//
			'}',//

			'void main() {',//
			'	if ( vCenter.w == 0.0 ) {',//
			'		gl_FragColor.rgb = mix( vec3( 1.0 ), vec3( 0.2 ), edgeFactorTri() );',//
			'	} else {',//
			'		gl_FragColor.rgb = mix( vec3( 1.0 ), vec3( 0.2 ), min( edgeFactorQuad1(), edgeFactorQuad2() ) );',//
			'	}',//
			'	gl_FragColor.a = 1.0;',//
			'}',//
			].join('\n')
		};
	}

	init();
});

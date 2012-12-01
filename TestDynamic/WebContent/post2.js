require(
	['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
			'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
			'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData',
			'goo/renderer/Renderer', 'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator',
			'goo/renderer/Loader', 'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI',
			'goo/shapes/ShapeCreator', 'goo/entities/EntityUtils', 'goo/entities/components/LightComponent', 'goo/renderer/Light',
			'goo/scripts/BasicControlScript', 'goo/entities/EventHandler', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent',
			'goo/renderer/pass/Composer', 'goo/renderer/pass/RenderPass', 'goo/renderer/pass/FullscreenPass', 'goo/renderer/Util',
			'goo/renderer/pass/RenderTarget', 'goo/renderer/pass/BloomPass', 'goo/math/Vector3', 'goo/math/Vector4',
			'goo/renderer	/shaders/ShaderFragments', 'goo/renderer/pass/DepthPass'], function(World, Entity, System, TransformSystem, RenderSystem,
		TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner,
		TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, LightComponent, Light, BasicControlScript,
		EventHandler, Camera, CameraComponent, Composer, RenderPass, FullscreenPass, Util, RenderTarget, BloomPass, Vector3, Vector4,
		ShaderFragments, DepthPass) {
		"use strict";

		function init() {
			// Create typical goo application
			var goo = new GooRunner({
				showStats : true
			});
			goo.renderer.domElement.id = 'goo';
			document.body.appendChild(goo.renderer.domElement);

			var camera = new Camera(45, 1, 1, 1000);
			camera.translation.set(0, 5, 25);
			camera.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
			var cameraEntity = goo.world.createEntity("CameraEntity");
			cameraEntity.setComponent(new CameraComponent(camera));
			cameraEntity.addToWorld();

			// Examples of model loading
			loadModels(goo);

			// Disable normal rendering
			goo.world.getSystem('RenderSystem').doRender = false;

			// Scene render
			var unpackDepth = {
				attributes : {
					vertexPosition : MeshData.POSITION,
					vertexUV0 : MeshData.TEXCOORD0
				},
				uniforms : {
					viewMatrix : Shader.VIEW_MATRIX,
					projectionMatrix : Shader.PROJECTION_MATRIX,
					worldMatrix : Shader.WORLD_MATRIX,
					depthMap : Shader.TEXTURE0,
					diffuseMap : Shader.TEXTURE1
				},
				vshader : [ //
				'attribute vec3 vertexPosition;', //
				'attribute vec2 vertexUV0;', //

				'uniform mat4 viewMatrix;', //
				'uniform mat4 projectionMatrix;',//
				'uniform mat4 worldMatrix;',//

				'varying vec2 texCoord0;',//

				'void main(void) {', //
				'	texCoord0 = vertexUV0;',//
				'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
				'}'//
				].join('\n'),
				fshader : [//
				'precision mediump float;',//

				'uniform sampler2D depthMap;',//
				'uniform sampler2D diffuseMap;',//

				'varying vec2 texCoord0;',//

				ShaderFragments.methods.unpackDepth,//

				'void main(void)',//
				'{',//
				'	vec4 depthCol = texture2D(depthMap, texCoord0);',//
				'	vec4 diffuseCol = texture2D(diffuseMap, texCoord0);',//
				'	float depth = unpackDepth(depthCol);',//
				'	gl_FragColor = diffuseCol * vec4(depth);',//
				'}',//
				].join('\n')
			};

			var renderPass = new RenderPass(goo.world.getSystem('PartitioningSystem').renderList);
			renderPass.clearColor = new Vector4(0.1, 0.1, 0.1, 0.0);

			var depthPass = new DepthPass(goo.world.getSystem('PartitioningSystem').renderList, unpackDepth);

			// Regular copy
			var shader = Util.clone(Material.shaders.copy);
			var outPass = new FullscreenPass(shader);
			outPass.renderToScreen = true;

			// Create composer with same size as screen
			var composer = new Composer();
			composer.addPass(renderPass);
			composer.addPass(depthPass);
			composer.addPass(outPass);

			goo.callbacks.push(function(tpf) {
				composer.render(goo.renderer, tpf);
			});
		}

		function loadModels(goo) {
			var importer = new JSONImporter(goo.world);

			importer.load('resources/head.model', 'resources/', {
				onSuccess : function(entities) {
					for ( var i in entities) {
						entities[i].addToWorld();
					}
					entities[0].transformComponent.transform.scale.set(40, 40, 40);

					entities[0].setComponent(new ScriptComponent(new BasicControlScript()));
				},
				onError : function(error) {
					console.error(error);
				}
			});
		}

		init();
	});

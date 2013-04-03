require.config({
    baseUrl : "./",
    paths : {
        goo : "../src/goo",
		'goo/lib': '../lib'
    }
});
require([
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/entities/GooRunner',
	'goo/renderer/TextureCreator',
	'goo/loaders/JSONImporter',
	'goo/entities/components/ScriptComponent',
	'goo/shapes/ShapeCreator',
	'goo/entities/EntityUtils',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/renderer/pass/Composer',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/Util',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/scripts/MouseLookControlScript',
	'goo/scripts/WASDControlScript',
	'goo/renderer/shaders/ShaderFragment',
	'goo/renderer/pass/DepthPass',
	'goo/renderer/pass/DoGPass',
	'goo/renderer/shaders/ShaderLib'
],

function (
	MeshData,
	Material,
	Shader,
	GooRunner,
	TextureCreator,
	JSONImporter,
	ScriptComponent,
	ShapeCreator,
	EntityUtils,
	Camera,
	CameraComponent,
	Composer,
	RenderPass,
	FullscreenPass,
	Util,
	Vector3,
	Vector4,
	MouseLookControlScript,
	WASDControlScript,
	ShaderFragment,
	DepthPass,
	DoGPass,
	ShaderLib
) {
		"use strict";

		var resourcePath = "../resources";

		function init() {
			// Create typical goo application
			var goo = new GooRunner({
				showStats : true
			});
			goo.renderer.domElement.id = 'goo';
			document.body.appendChild(goo.renderer.domElement);

			var camera = new Camera(45, 1, 1, 100);
			var cameraEntity = goo.world.createEntity("CameraEntity");
			cameraEntity.transformComponent.transform.translation.set(0, 5, 25);
			cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
			cameraEntity.setComponent(new CameraComponent(camera));
			cameraEntity.addToWorld();
			cameraEntity.setComponent(new ScriptComponent([new MouseLookControlScript(), new WASDControlScript({'crawlSpeed' : 5.0, 'walkSpeed' : 18.0})]));

			// Examples of model loading
			loadModels(goo);

			var boxEntity = createBoxEntity(goo);
			boxEntity.addToWorld();

			// Scene render
			/*var unpackDepth = {
				attributes : {
					vertexPosition : MeshData.POSITION,
					vertexUV0 : MeshData.TEXCOORD0
				},
				uniforms : {
					viewMatrix : Shader.VIEW_MATRIX,
					projectionMatrix : Shader.PROJECTION_MATRIX,
					worldMatrix : Shader.WORLD_MATRIX,
					depthMap : Shader.TEXTURE0,
					diffuseMap : Shader.TEXTURE1,
					blurMap : Shader.TEXTURE2,
					nearPlane : Shader.NEAR_PLANE,
					// farPlane : Shader.FAR_PLANE,
					farPlane : 100
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
				'uniform sampler2D blurMap;',//

				'uniform float nearPlane;',//
				'uniform float farPlane;',//

				'varying vec2 texCoord0;',//

				ShaderFragment.methods.unpackDepth,//

				'void main(void)',//
				'{',//
				'	vec4 diffuseCol = texture2D(diffuseMap, texCoord0);',//
				'	vec4 blurCol = texture2D(blurMap, texCoord0);',//

				'	vec4 depthCol = texture2D(depthMap, texCoord0);',//
				'	float depth = unpackDepth(depthCol);',//

				' if (depth == 0.0) depth = 1.0; //should be farplane',//
				// ' depth = depth * (farPlane - nearPlane);',//
				// ' depth = depth * farPlane;',//
				' depth = abs(depth - 30.0/farPlane);',//
				' depth = pow(depth, 1.5)*10.0;',//
				' depth = clamp(depth, 0.0, 1.0);',//
				// ' gl_FragColor = vec4(depth);',//
				' gl_FragColor = mix(diffuseCol, blurCol, depth);',//
				'}'
				].join('\n')
			};*/

			var renderPass = new RenderPass(goo.world.getSystem('RenderSystem').renderList);
			renderPass.clearColor = new Vector4(0.1, 0.1, 0.1, 0.0);

			//var depthPass = new DepthPass(goo.world.getSystem('RenderSystem').renderList, unpackDepth);

			var dogPass = new DoGPass({'threshold' : 0.005, 'sigma' : 0.8, 'width' : 1024, 'height' : 1024});

			// Regular copy
			var shader = Util.clone(ShaderLib.copy);
			var outPass = new FullscreenPass(shader);
			outPass.renderToScreen = true;

			// Create composer with same size as screen
			var composer = new Composer();
			composer.addPass(renderPass);
			composer.addPass(dogPass);
			//composer.addPass(depthPass);
			composer.addPass(outPass);

			goo.renderSystem.composers.push(composer);
		}

		function loadModels(goo) {
			var importer = new JSONImporter(goo.world);

			importer.load(resourcePath + '/head.model', resourcePath + '/', {
				onSuccess : function(entities) {
					for ( var i in entities) {
						entities[i].addToWorld();
					}
					entities[0].transformComponent.transform.scale.set(40, 40, 40);
					// entities[0].setComponent(new ScriptComponent(new BasicControlScript()));
				},
				onError : function(error) {
					console.error(error);
				}
			});
		}

		function createBoxEntity(goo) {
			var meshData = ShapeCreator.createBox(250, 5, 250, 20, 20);
			var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
			entity.transformComponent.transform.translation.y = -5;
			entity.name = "Box";

			var material = new Material('TestMaterial');
			material.shader = Material.createShader(ShaderLib.texturedLit, 'BoxShader');

			var texture = new TextureCreator().loadTexture2D(resourcePath + '/pitcher.jpg');
			material.textures.push(texture);

			entity.meshRendererComponent.materials.push(material);

			return entity;
		}

		init();
	});

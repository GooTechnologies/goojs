"use strict";

require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/entities/components/LightComponent', 'goo/renderer/Light', 'goo/scripts/BasicControlScript',
		'goo/entities/EventHandler', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent', 'goo/renderer/pass/Composer',
		'goo/renderer/pass/RenderPass', 'goo/renderer/pass/FullscreenPass', 'goo/renderer/Util', 'goo/renderer/pass/RenderTarget'], function(World,
	Entity, System, TransformSystem, RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData,
	Renderer, Material, Shader, GooRunner, TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, LightComponent,
	Light, BasicControlScript, EventHandler, Camera, CameraComponent, Composer, RenderPass, FullscreenPass, Util, RenderTarget) {

	function init() {
		// Create typical goo application
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		// var ui = new DebugUI(goo);

		var camera = new Camera(45, 1, 1, 1000);
		camera.position.set(0, 5, 25);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		// Examples of model loading
		loadModels(goo);

		// Disable normal rendering
		goo.world.getSystem('RenderSystem').doRender = false;

		var size = Math.min(window.innerWidth, window.innerHeight);
		size = Util.nearestPowerOfTwo(size);
		var renderTarget = new RenderTarget(size, size);
		var composer = new Composer(renderTarget);
		// var composer = new Composer();

		var renderPass = new RenderPass(goo.world.getSystem('PartitioningSystem').renderList);

		var shader = {
			bindings : {
				timeX : {
					type : 'float',
					value : function() {
						return Math.sin(goo.world.time * 1.0) * 0.01;
					}
				},
				timeY : {
					type : 'float',
					value : function() {
						return Math.cos(goo.world.time * 1.0) * 0.01;
					}
				},
			},
			vshader : [ //
			'attribute vec3 vertexPosition; //!POSITION', //
			'attribute vec2 vertexUV0; //!TEXCOORD0', //

			'uniform mat4 viewMatrix; //!VIEW_MATRIX', //
			'uniform mat4 projectionMatrix; //!PROJECTION_MATRIX',//
			'uniform mat4 worldMatrix; //!WORLD_MATRIX',//

			'varying vec2 texCoord0;',//

			'void main(void) {', //
			'texCoord0 = vertexUV0;',//
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
			'}'//
			].join('\n'),
			fshader : [//
			'precision mediump float;',//

			'uniform sampler2D diffuseMap; //!TEXTURE0',//

			'uniform float timeX;',//
			'uniform float timeY;',//

			'varying vec2 texCoord0;',//

			'void main(void)',//
			'{',//
			'	vec4 t1 = texture2D(diffuseMap, texCoord0+vec2(-0.01+timeX,-0.01+timeY));',//
			'	vec4 t2 = texture2D(diffuseMap, texCoord0+vec2(0.01+timeX,-0.01+timeY));',//
			'	vec4 t3 = texture2D(diffuseMap, texCoord0+vec2(0.01+timeX,0.01+timeY));',//
			'	vec4 t4 = texture2D(diffuseMap, texCoord0+vec2(-0.01+timeX,0.01+timeY));',//
			'	gl_FragColor = (t1+t2+t3+t4)/vec4(4.0);',//
			'}',//
			].join('\n')
		};
		var coolPass = new FullscreenPass(Material.createDefaultMaterial(shader));
		// coolPass.renderToScreen = true;

		var outPass = new FullscreenPass(Material.createDefaultMaterial(Material.shaders.copy));
		outPass.renderToScreen = true;

		composer.addPass(renderPass);
		composer.addPass(coolPass);
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

require.config({
    baseUrl : "./",
    paths : {
        goo : "../src/goo",
        'goo/lib': '../lib'
    }
});
require(
	['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
			'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
			'goo/entities/components/MeshRendererComponent', 'goo/renderer/MeshData',
			'goo/renderer/Renderer', 'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator',
			'goo/loaders/Loader', 'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI',
			'goo/shapes/ShapeCreator', 'goo/entities/EntityUtils', 'goo/entities/components/LightComponent', 'goo/renderer/light/PointLight',
			'goo/scripts/BasicControlScript', 'goo/entities/EventHandler', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent',
			'goo/renderer/pass/Composer', 'goo/renderer/pass/RenderPass', 'goo/renderer/pass/FullscreenPass', 'goo/renderer/Util',
			'goo/renderer/pass/RenderTarget', 'goo/renderer/pass/BloomPass', 'goo/math/Vector3', 'goo/math/Vector4',
			'goo/renderer	/shaders/ShaderFragments', 'goo/renderer/pass/DepthPass', 'goo/renderer/pass/SSAOPass', 'goo/renderer/shaders/ShaderLib',
			'goo/util/Rc4Random', 'goo/scripts/OrbitCamControlScript'], function(World, Entity, System, TransformSystem, RenderSystem,
		TransformComponent, MeshDataComponent, MeshRendererComponent, MeshData, Renderer, Material, Shader, GooRunner,
		TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, LightComponent, PointLight, BasicControlScript,
		EventHandler, Camera, CameraComponent, Composer, RenderPass, FullscreenPass, Util, RenderTarget, BloomPass, Vector3, Vector4,
		ShaderFragments, DepthPass, SSAOPass, ShaderLib, Rc4Random, OrbitCamControlScript) {
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
			
			cameraEntity.setComponent(new ScriptComponent(new OrbitCamControlScript({
				domElement : goo.renderer.domElement,
				spherical : new Vector3(30, Math.PI / 2, 0),
				minAscent : -0.1,
				maxAscent : 1,
				maxZoomDistance : 50	
			})));

			// Examples of model loading
			loadModels(goo);

			var rc4Rand = new Rc4Random("seed");
			var vec = new Vector3();
			for ( var i = 0; i < 200; i++) {
				var x = rc4Rand.getRandomNumber() * 80 - 40;
				var y = 5;
				var z = rc4Rand.getRandomNumber() * 80 - 40;
				var length = vec.set(x, y, z).length();
				var size = (rc4Rand.getRandomNumber() * 3 + 2) * length / (50);
				size *= size;
				var boxEntity = createBoxEntity(goo, size, size, size, 1, 1);
				boxEntity.transformComponent.transform.translation.set(x, y, z);
			}

			var boxEntity = createBoxEntity(goo, 250, 5, 250, 20, 20);
			boxEntity.transformComponent.transform.translation.y = -5;

			// Scene render
			var renderPass = new RenderPass(goo.world.getSystem('RenderSystem').renderList);
			renderPass.clearColor = new Vector4(0.1, 0.1, 0.1, 0.0);

			var ssaoPass = new SSAOPass(goo.world.getSystem('RenderSystem').renderList);

			// Regular copy
			var shader = Util.clone(ShaderLib.copy);
			var outPass = new FullscreenPass(shader);
			outPass.renderToScreen = true;

			// Create composer with same size as screen
			var width = window.innerWidth/4;
			var height = window.innerHeight/4;
			var composerTarget = new RenderTarget(width, height, {
//				magFilter : 'NearestNeighbor',
//				minFilter : 'NearestNeighborNoMipMaps'
			});

			var composer = new Composer(composerTarget);

			composer.addPass(renderPass);
			composer.addPass(ssaoPass);
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

		function createBoxEntity(goo, w, h, l, t1, t2) {
			var meshData = ShapeCreator.createBox(w, h, l, t1, t2);
			var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
			var material = new Material('TestMaterial');
			material.shader = Material.createShader(ShaderLib.texturedLit, 'BoxShader');
			var texture = new TextureCreator().loadTexture2D(resourcePath + '/pitcher.jpg');
			material.textures.push(texture);
			entity.meshRendererComponent.materials.push(material);
			entity.addToWorld();
			return entity;
		}

		init();
	});

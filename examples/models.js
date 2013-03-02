require.config({
    baseUrl : "./",
    paths : {
        goo : "../src/goo",
        'goo/lib': '../lib'
    }
});
require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/loaders/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/entities/components/LightComponent', 'goo/renderer/light/PointLight', 'goo/renderer/Camera',
		'goo/entities/components/CameraComponent', 'goo/scripts/OrbitCamControlScript', 'goo/math/Vector3', 'goo/renderer/shaders/ShaderLib'], function(World, Entity, System,
	TransformSystem, RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, MeshData, Renderer, Material,
	Shader, GooRunner, TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, LightComponent, PointLight, Camera,
	CameraComponent, OrbitCamControlScript, Vector3, ShaderLib) {
	"use strict";

	var resourcePath = "../resources";

	function init() {
		var goo = new GooRunner({
			showStats : true,
			antialias : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(80, Math.PI*0.6, Math.PI / 8),
			maxZoomDistance : 200,
		}));
		cameraEntity.setComponent(scripts);

		// Setup light
		var light = new PointLight();
		var entity = createBox(goo);
		entity.setComponent(new LightComponent(light));
		var script = {
			run: function (entity) {
				var transformComponent = entity.transformComponent;
				transformComponent.transform.translation.x = Math.sin(World.time * 1.0) * 30;
				transformComponent.transform.translation.y = 20;
				transformComponent.transform.translation.z = Math.cos(World.time * 1.0) * 30;
				transformComponent.setUpdated();
			}
		};
		entity.setComponent(new ScriptComponent(script));
		entity.addToWorld();

		// Examples of model loading
		loadModels(goo);
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
				entities[0].transformComponent.transform.translation.x = -16;
				entities[0].transformComponent.transform.translation.y = -8;
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
				entities[0].transformComponent.transform.translation.x = 17;
				entities[0].transformComponent.transform.translation.y = 0;
			},
			onError : function(error) {
				console.error(error);
			}
		}, function () {
			return Material.createShader(ShaderLib.toon);
		});

		// Load asynchronous with callback
		importer.load(resourcePath + '/shoes/shoes_compressed.json', resourcePath + '/shoes/textures/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(1.0, 1.0, 1.0);
				entities[0].transformComponent.transform.translation.x = 0;
				entities[0].transformComponent.transform.translation.y = -5;
			},
			onError : function(error) {
				console.error(error);
			}
		});
	}

	function createBox(goo) {
		var meshData = ShapeCreator.createBox(1, 1, 1);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		var material = Material.createMaterial(ShaderLib.simple, 'mat');
		entity.meshRendererComponent.materials.push(material);
		return entity;
	}

	init();
});

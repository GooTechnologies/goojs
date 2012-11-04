"use strict";

require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/entities/components/LightComponent', 'goo/renderer/Light', 'goo/renderer/Camera',
		'goo/entities/components/CameraComponent', 'goo/scripts/BasicControlScript'], function(World, Entity, System, TransformSystem, RenderSystem,
	TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner,
	TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, LightComponent, Light, Camera, CameraComponent,
	BasicControlScript) {

	function init() {
		// Create typical goo application
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		// var ui = new DebugUI(goo);

		var camera = new Camera(45, 1, 1, 1000);
		camera.position.set(0, 5, 60);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.setComponent(new ScriptComponent(new BasicControlScript()));
		cameraEntity.addToWorld();

		// Setup light
		var light = new Light();
		var entity = goo.world.createEntity('Light1');
		entity.setComponent(new LightComponent(light));
		var transformComponent = entity.transformComponent;
		transformComponent.transform.translation.x = 80;
		transformComponent.transform.translation.y = 50;
		transformComponent.transform.translation.z = 80;
		entity.addToWorld();

		// Examples of model loading
		loadModels(goo);
	}

	function loadModels(goo) {
		var importer = new JSONImporter(goo.world);

		// Load asynchronous with callback
		importer.load('resources/girl.model', 'resources/', {
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
		importer.load('resources/head.model', 'resources/', {
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
		importer.load('resources/shoes/shoes_compressed.json', 'resources/shoes/textures/', {
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

	init();
});

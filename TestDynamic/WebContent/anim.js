require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/entities/components/LightComponent', 'goo/renderer/Light', 'goo/renderer/Camera',
		'goo/entities/components/CameraComponent', 'goo/scripts/BasicControlScript', 'goo/math/Vector3', 'goo/util/Handy'], function(World, Entity,
	System, TransformSystem, RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer,
	Material, Shader, GooRunner, TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, LightComponent, Light,
	Camera, CameraComponent, BasicControlScript, Vector3, Handy) {
	"use strict";

	function init() {
		// Create typical goo application
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var camera = new Camera(45, 1, 1, 1000);
		camera.position.set(0, 20, 150);
		camera.lookAt(new Vector3(0, 40, 0));
		camera.updateWorld();
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
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
		importer.load('resources/skeleton.model', 'resources/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(1, 1, 1);
				entities[0].setComponent(new ScriptComponent(new BasicControlScript()));
			},
			onError : function(error) {
				console.error(error);
			}
		});
	}

	init();
});

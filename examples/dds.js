require({
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
		'goo/entities/components/CameraComponent', 'goo/scripts/BasicControlScript', 'goo/math/Vector3'], function(World, Entity, System,
	TransformSystem, RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material,
	Shader, GooRunner, TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, LightComponent, Light, Camera,
	CameraComponent, BasicControlScript, Vector3) {
	"use strict";

	var resourcePath = "../resources";

	function createBox(size, x, y, textureUrl, goo) {
		var meshData = ShapeCreator.createBox(size, size, size, 1, 1);
		var box = EntityUtils.createTypicalEntity(goo.world, meshData);
		var texture = new TextureCreator({
			verticalFlip : true
		}).loadTexture2D(resourcePath + textureUrl);

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(Material.shaders.texturedLit, 'BoxShader');
		material.textures.push(texture);

		box.meshRendererComponent.materials.push(material);
		box.addToWorld();

		box.transformComponent.transform.translation.set(x, y, 0);

		var axis = new Vector3(1, 1, 0.5).normalize();
		goo.callbacks.push(function(tpf) {
			// rotate
			var t = box._world.time;
			box.transformComponent.transform.rotation.fromAngleNormalAxis(t, axis.x, axis.y, axis.z);
			box.transformComponent.setUpdated();
		});
	}

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var camera = new Camera(45, 1, 1, 1000);
		camera.translation.set(0, 5, 60);
		camera.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
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

		createBox(10, -10, 15, '/lena/lena.jpg', goo);
		createBox(10, 10, 15, '/lena/lena_uncompressed.dds', goo);
		createBox(10, -20, 0, '/lena/lena_dxt1.dds', goo);
		createBox(10, 0, 0, '/lena/lena_dxt3.dds', goo);
		createBox(10, 20, 0, '/lena/lena_dxt5_BC3.dds', goo);
		// createBox(10, -10, -15, '/lena/lena_dxt5_RXGB.dds', goo);
		createBox(10, 10, -15, '/lena/lena_dxt5_YCoCg.dds', goo);

		// NB: YCoCg -> RGB
		// ' gl_FragColor.r = (texCol.r * 1.0) + (texCol.g * -1.0) + (texCol.b * (0.0 * 256.0 / 255.0)) + (texCol.a * 1.0); ', //
		// ' gl_FragColor.g = (texCol.r * 0.0) + (texCol.g * 1.0) + (texCol.b * (-0.5 * 256.0 / 255.0)) + (texCol.a * 1.0); ', //
		// ' gl_FragColor.b = (texCol.r * -1.0) + (texCol.g * -1.0) + (texCol.b * (1.0 * 256.0 / 255.0)) + (texCol.a * 1.0); ', //

	}

	init();
});

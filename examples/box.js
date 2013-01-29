require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
	}
});
require(['goo/entities/GooRunner', 'goo/entities/EntityUtils', 'goo/renderer/Material', 'goo/renderer/Camera',
		'goo/entities/components/CameraComponent', 'goo/shapes/ShapeCreator', 'goo/renderer/TextureCreator',
		'goo/entities/components/ScriptComponent'], function(GooRunner, EntityUtils, Material, Camera, CameraComponent, ShapeCreator, TextureCreator,
	ScriptComponent) {
	"use strict";

	var resourcePath = "../resources";

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		// Add box
		var boxEntity = createBoxEntity(goo);

		// Add spin
		boxEntity.setComponent(new ScriptComponent({
			run : function(entity) {
				var tpf = entity._world.tpf;
				boxEntity.transformComponent.transform.rotation.y += tpf * 2.0;
				boxEntity.transformComponent.transform.rotation.x += tpf * 1.2;
				boxEntity.transformComponent.setUpdated();
			}
		}));
		boxEntity.addToWorld();

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
	}

	function createBoxEntity(goo) {
		var meshData = ShapeCreator.createBox(1, 1, 1);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		entity.transformComponent.transform.translation.z = -5;
		entity.name = "Box";

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(Material.shaders.texturedLit, 'BoxShader');
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
		material.textures.push(texture);

		entity.meshRendererComponent.materials.push(material);

		return entity;
	}

	init();
});

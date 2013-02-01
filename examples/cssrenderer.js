require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
	}
});
require(['goo/entities/GooRunner', 'goo/entities/EntityUtils', 'goo/renderer/Material', 'goo/renderer/Camera',
		'goo/entities/components/CameraComponent', 'goo/shapes/ShapeCreator', 'goo/renderer/TextureCreator',
		'goo/entities/components/ScriptComponent', "goo/entities/Entity", "goo/entities/components/TransformComponent", "goo/entities/components/CSSTransformComponent"], function(GooRunner, EntityUtils, Material, Camera, CameraComponent, ShapeCreator, TextureCreator,
	ScriptComponent, Entity, TransformComponent, CSSTransformComponent) {
	"use strict";

	var resourcePath = "../resources";

	function main() {
		var goo = new GooRunner();

		goo.renderer.domElement.id = "goo";
		document.body.appendChild(goo.renderer.domElement);

		var domEntity = EntityUtils.createDOMEntity(goo.world, document.querySelector("#tobecontrolled"));

				domEntity.transformComponent.transform.translation.x = 200;
				domEntity.transformComponent.transform.translation.y = 200;

		domEntity.setComponent(new ScriptComponent({
			run : function (entity) {
				var tpf = goo.world.tpf;
				var time = goo.world.time;

				domEntity.transformComponent.transform.scale.x = 0.75 + Math.cos(time * 5.0) * 0.25;
				domEntity.transformComponent.transform.scale.y = 0.75 + Math.sin(time * 5.0) * 0.25;
				domEntity.transformComponent.transform.translation.z = -2.00 + Math.cos(time) * 1.00;
				domEntity.transformComponent.setUpdated();
			}
		}));

		domEntity.addToWorld();

		var cameraEntity = goo.world.createEntity("CameraEntity");

		cameraEntity.setComponent(new CameraComponent(new Camera(45, 1, 1, 1000)));
		cameraEntity.addToWorld();
	}

	main();
});

require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
		'goo/lib': '../lib'
	}
});
require([
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/Material',
	'goo/entities/GooRunner',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/shapes/ShapeCreator',
	'goo/entities/EntityUtils',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/math/Vector3',
	'goo/renderer/shaders/ShaderLib',
	'goo/util/MeshBuilder',
	'goo/math/Transform',
	'goo/scripts/OrbitCamControlScript',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent'
], function (
	MeshDataComponent,
	MeshRendererComponent,
	Material,
	GooRunner,
	TextureCreator,
	ScriptComponent,
	ShapeCreator,
	EntityUtils,
	Camera,
	CameraComponent,
	Vector3,
	ShaderLib,
	MeshBuilder,
	Transform,
	OrbitCamControlScript,
	PointLight,
	LightComponent
) {
	"use strict";

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);
		goo.renderer.setClearColor(0.0,0.0,0.0,1.0);

		createShapes(goo);

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 10);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(50, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);

		var entity = createBox(goo, 1, 1, ShaderLib.simple, 1);
		var light = new PointLight();
		entity.setComponent(new LightComponent(light));
		entity.addToWorld();
		var script = {
			run: function (entity) {
				var t = entity._world.time * 0.4;

				var transformComponent = entity.transformComponent;
				transformComponent.transform.translation.x = Math.sin(t * 1.0) * 200;
				transformComponent.transform.translation.y = 200;
				transformComponent.transform.translation.z = Math.cos(t * 1.0) * 200;
				transformComponent.setUpdated();
			}
		};
		entity.setComponent(new ScriptComponent(script));
	}

	// Create simple quad
	function createShapes(goo) {
		var sphereData = ShapeCreator.createSphere(10, 10, 1);
		var boxData = ShapeCreator.createBox(1, 1, 1);
		var torusData = ShapeCreator.createTorus(10, 6, 0.5, 1.0);

		var meshBuilder = new MeshBuilder();
		var transform = new Transform();
		var spread = 30.0;
		var count = 5000;
		for (var x=0;x<count;x++) {
			transform.translation.x = (Math.random() * 2.0 - 1.0) * spread;
			transform.translation.y = (Math.random() * 2.0 - 1.0) * spread;
			transform.translation.z = (Math.random() * 2.0 - 1.0) * spread;
			transform.setRotationXYZ(0, Math.random() * Math.PI * 2, 0);
			transform.update();
			
			if (x < count/3) {
				meshBuilder.addMeshData(boxData, transform);
			} else if (x < count*2/3) {
				meshBuilder.addMeshData(sphereData, transform);
			} else {
				meshBuilder.addMeshData(torusData, transform);
			}
		}
		var meshDatas = meshBuilder.build();

		var material = Material.createMaterial(ShaderLib.texturedLit, 'test');
		var texture = new TextureCreator().loadTexture2D('../resources/fieldstone-c.jpg');
		material.textures.push(texture);
		for (var key in meshDatas) {
			var entity = goo.world.createEntity();
			var meshDataComponent = new MeshDataComponent(meshDatas[key]);
			entity.setComponent(meshDataComponent);
			var meshRendererComponent = new MeshRendererComponent();
			meshRendererComponent.materials.push(material);
			entity.setComponent(meshRendererComponent);
			entity.addToWorld();
		}
	}

	function createBox (goo, w, h, shader, tile) {
		var meshData = ShapeCreator.createBox(w, h, w, tile, tile);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		entity.name = "Floor";

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(shader, 'Floorhader');

		entity.meshRendererComponent.materials.push(material);

		return entity;
	}

	init();
});

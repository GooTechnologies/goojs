require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
		'goo/lib': '../lib'
	}
});
require([
	'goo/entities/GooRunner',
	'goo/entities/EntityUtils',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/shapes/ShapeCreator',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/World',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3'
], function (
	GooRunner,
	EntityUtils,
	Material,
	Camera,
	CameraComponent,
	ShapeCreator,
	TextureCreator,
	ScriptComponent,
	ShaderLib,
	World,
	OrbitCamControlScript,
	Vector3) {
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
				boxEntity.transformComponent.transform.setRotationXYZ(
					World.time * 1.2,
					World.time * 2.0,
					0
				);
				boxEntity.transformComponent.setUpdated();
			}
		}));

		// Add entity to world
		boxEntity.addToWorld();

		// Add camera
		var camera = new Camera(45, 1, 0.1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		// Add orbit camera
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(5, 0, 0)
		}));
		cameraEntity.setComponent(scripts);
	}

	function createBoxEntity(goo) {
		// Create box mesh
		var meshData = ShapeCreator.createBox(1, 1, 1);

		// Create entity with meshdata and common components setup
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);

		// Create material
		var material = Material.createMaterial(ShaderLib.texturedLit, 'BoxMaterial');

		// Create texture and add to material
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
		material.textures.push(texture);
		entity.meshRendererComponent.materials.push(material);

		return entity;
	}

	init();
});

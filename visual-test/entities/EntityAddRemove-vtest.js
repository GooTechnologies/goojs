require.config({
	paths: {
		"goo": "../../../src/goo"
	}
});

require([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/EntityUtils',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/TextureCreator'
], function(
	GooRunner,
	World,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	OrbitCamControlScript,
	EntityUtils,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	DirectionalLight,
	TextureCreator
) {
	'use strict';

	var resourcePath = "../resources";

	var gui = new window.dat.GUI();

	function anisotropicDemo(goo) {
		var boxEntity1 = createBoxEntity(goo, 3);
		boxEntity1.transform.setTranslation(0, 0, 0);

		var boxEntity2 = createBoxEntity(goo, 2);
		boxEntity2.transform.setTranslation(3, 0, 0);
		boxEntity1.attachChild(boxEntity2);

		var boxEntity3 = createBoxEntity(goo, 1);
		boxEntity3.transform.setTranslation(2, 0, 0);
		boxEntity2.attachChild(boxEntity3);

		boxEntity1.addToWorld();
		boxEntity1.addComponent(ScriptComponent).addScript({
			run: function (entity) {
				var t = entity._world.time;
				entity.transform.setRotation(t, 0, 0);
			}
		});

		var lightEntity = goo.world.createEntity('light');
		lightEntity.addComponent(DirectionalLight);
		lightEntity.transform.setTranslation(1, 10, 1);
		lightEntity.transform.lookAt(Vector3.ZERO, Vector3.UNIT_Y);
		lightEntity.addToWorld();

		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.addComponent(Camera);
		var scriptComponent = cameraEntity.addComponent(ScriptComponent);
		scriptComponent.addScript(new OrbitCamControlScript({
			domElement: goo.renderer.domElement,
			spherical: new Vector3(15, Math.PI / 2, 0.3)
		}));
		cameraEntity.addToWorld();

		var data = {
			add_remove: true
		};
		var controller = gui.add(data, 'add_remove');
		controller.onChange(function(val) {
			if (val) {
				boxEntity1.addToWorld();
			} else {
				boxEntity1.removeFromWorld();
			}
		});
	}

	function createBoxEntity(goo, size) {
		var meshData = ShapeCreator.createBox(size, size, size);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);

		var material = Material.createMaterial(ShaderLib.texturedLit, 'BoxMaterial');
		TextureCreator.clearCache();
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/check.png');
		material.setTexture('DIFFUSE_MAP', texture);
		entity.meshRendererComponent.materials.push(material);

		return entity;
	}

	function init() {
		var goo = new GooRunner({
			showStats: true,
			logo: 'bottomleft'
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		anisotropicDemo(goo);
	}

	init();
});
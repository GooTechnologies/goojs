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
	'goo/renderer/TextureCreator',
	'goo/entities/components/LightComponent',
	'../../lib/V'
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
	TextureCreator,
	LightComponent,
	V
) {
	'use strict';

	var resourcePath = "../../resources";

	var gui = new window.dat.GUI();

	function anisotropicDemo(goo) {
		var boxEntity1 = createBoxEntity(goo, 3);
		//boxEntity1.setTranslation(0, 0, 0);

		var boxEntity2 = createBoxEntity(goo, 2, [3, 0, 0]);
		//boxEntity2.setTranslation(3, 0, 0);
		boxEntity1.transformComponent.attachChild(boxEntity2.transformComponent);

		var boxEntity3 = createBoxEntity(goo, 1, [2, 0, 0]);
		//boxEntity3.setTranslation(2, 0, 0);
		boxEntity2.transformComponent.attachChild(boxEntity3.transformComponent);

		boxEntity1.addToWorld();
		boxEntity1.setComponent(new ScriptComponent({
			run: function (entity) {
				var t = entity._world.time;
				entity.transformComponent.setRotation(t, 0, 0);
			}
		}));

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

		var light = new DirectionalLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.setTranslation(1, 10, 1);
		lightEntity.lookAt(Vector3.ZERO, Vector3.UNIT_Y);
		lightEntity.addToWorld();

		V.addOrbitCamera(goo, new Vector3(15, Math.PI / 2, 0.3));
	}

	function createBoxEntity(goo, size, position) {
		var meshData = ShapeCreator.createBox(size, size, size);
		var entity = goo.world.createEntity(meshData, position);

		var material = Material.createMaterial(ShaderLib.texturedLit, 'BoxMaterial');
		TextureCreator.clearCache();
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/check.png');
		material.setTexture('DIFFUSE_MAP', texture);
		entity.setComponent(new MeshRendererComponent());
		entity.meshRendererComponent.materials.push(material);

		return entity;
	}

	function init() {
		var goo = new GooRunner({
			showStats: true,
			toolMode: true,
			logo: 'bottomleft'
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		anisotropicDemo(goo);
	}

	init();
});
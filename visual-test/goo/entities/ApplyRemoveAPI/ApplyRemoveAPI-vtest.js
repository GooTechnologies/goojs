require([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/Box',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/TextureCreator',
	'goo/entities/components/LightComponent',
	'lib/V'
], function(
	GooRunner,
	World,
	Material,
	ShaderLib,
	Camera,
	Box,
	CameraComponent,
	OrbitCamControlScript,
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

	var resourcePath = '../../../resources';

	var gui = new window.dat.GUI();

	function createBoxEntity(goo, size) {
		var meshData = new Box(size, size, size);
		var material = new Material(ShaderLib.texturedLit, 'BoxMaterial');
		var entity = goo.world.createEntity(meshData, material);

		TextureCreator.clearCache();
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/check.png');
		material.setTexture('DIFFUSE_MAP', texture);

		return entity;
	}

	function applyRemoveAPIDemo() {
		var goo = V.initGoo();

		var boxEntity1 = createBoxEntity(goo, 3);
		boxEntity1.setTranslation(0, 0, 0);

		var boxEntity2 = createBoxEntity(goo, 2);
		boxEntity2.setTranslation(3, 0, 0);
		boxEntity1.transformComponent.attachChild(boxEntity2.transformComponent);

		var boxEntity3 = createBoxEntity(goo, 1);
		boxEntity3.setTranslation(2, 0, 0);
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

		V.addLights();

		V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));
	}

	applyRemoveAPIDemo();
});
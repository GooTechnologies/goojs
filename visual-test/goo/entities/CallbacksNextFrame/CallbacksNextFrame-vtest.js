require([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
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

	function callbacksNextFrameDemo() {
		var goo = V.initGoo();

		var boxEntity1 = createBoxEntity(goo, 3, [0, 0, 0]);
		//boxEntity1.setTranslation(0, 0, 0);

		var boxEntity2 = createBoxEntity(goo, 2, [3, 0, 0]);
		//boxEntity2.setTranslation(3, 0, 0);
		boxEntity1.transformComponent.attachChild(boxEntity2.transformComponent);

		var boxEntity3 = createBoxEntity(goo, 1, [2, 0, 0]);
		//boxEntity3.setTranslation(2, 0, 0);
		boxEntity2.transformComponent.attachChild(boxEntity3.transformComponent);

		boxEntity1.addToWorld();

		// adding callbacks from a callback
		goo.callbacksNextFrame.push(function updateRotation() {
			boxEntity1.transformComponent.setRotation(World.time, 0, 0);
			goo.callbacksNextFrame.push(updateRotation);
		});

		// older example when callbacks could not be scheduled from within a callback
		/*
		var updateRotation = function (tpf) {
			boxEntity1.transformComponent.setRotation(World.time, 0, 0);
		};

		// this continuously pushes the previous function to execute next frame
		goo.callbacksPreProcess.push(function () {
			goo.callbacksNextFrame.push(updateRotation);
		});
		 */

		V.addLights();

		V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));
	}

	function createBoxEntity(goo, size, position) {
		var meshData = ShapeCreator.createBox(size, size, size);
		var entity = goo.world.createEntity(meshData, position);

		var material = Material.createMaterial(ShaderLib.simpleLit, 'BoxMaterial');
		//TextureCreator.clearCache();
		//var texture = new TextureCreator().loadTexture2D(resourcePath + '/check.png');
		//material.setTexture('DIFFUSE_MAP', texture);
		entity.setComponent(new MeshRendererComponent());
		entity.meshRendererComponent.materials.push(material);

		return entity;
	}

	callbacksNextFrameDemo();
});
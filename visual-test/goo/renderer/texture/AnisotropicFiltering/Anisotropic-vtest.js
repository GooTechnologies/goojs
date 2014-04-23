require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/Box',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/components/ScriptComponent',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'lib/V'
], function(
	Material,
	ShaderLib,
	Camera,
	Box,
	OrbitCamControlScript,
	ScriptComponent,
	Vector3,
	TextureCreator,
	V
) {
	'use strict';

	var resourcePath = '../../../../resources/';

	var goo = V.initGoo();
	var world = goo.world;

	var textureCreator = new TextureCreator();

	var boxEntity = createBoxEntity();
	boxEntity.set([-50, -0.5, 0]).addToWorld();

	boxEntity = createBoxEntity(goo.renderer.capabilities.maxAnisotropy);
	boxEntity.set([50, -0.5, 0]).addToWorld();

	V.addLights();

	var cameraEntity = world.createEntity('CameraEntity', new Camera(45, 1, 0.1)).addToWorld();
	cameraEntity.set(new OrbitCamControlScript({
		domElement: goo.renderer.domElement,
		spherical: new Vector3(1, Math.PI / 2, 0.1),
		minAscent: 0.1,
		turnSpeedHorizontal: 0.001,
		turnSpeedVertical: 0.001
	}));

	function createBoxEntity(anisotropy) {
		var meshData = new Box(100, 1, 100, 200, 200);
		var material = new Material(ShaderLib.texturedLit);
		var entity = world.createEntity(meshData, material);

		var texture = textureCreator.loadTexture2D(resourcePath + 'font.png', { anisotropy: anisotropy });
		material.setTexture('DIFFUSE_MAP', texture);

		return entity;
	}
});
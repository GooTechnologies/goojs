require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/TextureCreator',
	'goo/util/Skybox',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Vector3,
	PointLight,
	TextureCreator,
	Skybox,
	V
	) {
	'use strict';

	V.describe('A cube and a skybox with checkered textures');

	function addBox() {
		var boxMeshData = new Box(1, 1, 1);
		var boxMaterial = new Material(ShaderLib.simpleLit);
		goo.world.createEntity(boxMeshData, boxMaterial).addToWorld();
	}

	var goo = V.initGoo();

	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));

	addBox();

	var images = [
		'../../../resources/check.png',
		'../../../resources/check-alt.png',
		'../../../resources/check.png',
		'../../../resources/check-alt.png',
		'../../../resources/check.png',
		'../../../resources/check-alt.png'
	];
	var skybox = new Skybox(Skybox.BOX, images, null, 0);
	goo.world.createEntity(
		skybox.transform,
		skybox.materials[0],
		skybox.meshData
	).addToWorld();

	V.process();
});
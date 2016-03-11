
	'use strict';

	V.describe('A cube and a skybox with checkered textures');

	function addBox() {
		var boxMeshData = new Box(1, 1, 1);
		var boxMaterial = new Material(ShaderLib.simpleLit);
		gooRunner.world.createEntity(boxMeshData, boxMaterial).addToWorld();
	}

	var gooRunner = V.initGoo();

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
	gooRunner.world.createEntity(
		skybox.transform,
		skybox.materials[0],
		skybox.meshData
	).addToWorld();

	V.process();
});

	'use strict';

	V.describe('boxes with different texture modes');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	var textureCreator = new TextureCreator();

	var materialUniform = new Material(ShaderLib.texturedLit);
	textureCreator.loadTexture2D('../../../resources/check.png').then(function (textureUniform) {
		materialUniform.setTexture('DIFFUSE_MAP', textureUniform);
	});

	var materialUnfolded = new Material(ShaderLib.texturedLit);
	textureCreator.loadTexture2D('../../../resources/unfolded.png').then(function (textureUnfolded) {
		materialUnfolded.setTexture('DIFFUSE_MAP', textureUnfolded);
	});

	// add uniform mapped box
	var uniformBoxMeshData = new Box(1, 1, 1, 1, 1, Box.TextureModes.Uniform);
	var uniformBoxEntity = world.createEntity(
		uniformBoxMeshData,
		materialUniform,
		'Uniform',
		[-4.5, 0, 0]
	).addToWorld();
	V.showNormals(uniformBoxEntity);

	// add unfolded mapped box
	var unfoldedBoxMeshData = new Box(1, 1, 1, 1, 1, Box.TextureModes.Unfolded);
	var unfoldedBoxEntity = world.createEntity(
		unfoldedBoxMeshData,
		materialUnfolded,
		'Unfolded',
		[4.5, 0, 0]
	).addToWorld();
	V.showNormals(unfoldedBoxEntity);

	V.addLights();

	V.addOrbitCamera(new Vector3(25, Math.PI / 2, 0));

	V.process();
});

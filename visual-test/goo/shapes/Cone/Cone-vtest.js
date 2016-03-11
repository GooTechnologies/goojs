
	'use strict';

	V.describe('cones of different heights');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	var material = new Material(ShaderLib.texturedLit);
	new TextureCreator().loadTexture2D('../../../resources/cone.png').then(function	(texture) {
		material.setTexture('DIFFUSE_MAP', texture);
	});

	// add normal cone
	var normalConeMeshData = new Cone(8, 4, 8);
	var normalConeEntity = world.createEntity(normalConeMeshData, material, 'Pointy Cone', [-4.5, 0, 0]).addToWorld();
	V.showNormals(normalConeEntity);

	// add flat cone
	var flatConeMeshData = new Cone(64, 4, 0);
	var flatConeEntity = world.createEntity(flatConeMeshData, material, 'Flat Cone', [4.5, 0, 0]).addToWorld();
	V.showNormals(flatConeEntity);

	V.addLights();

	V.addOrbitCamera(new Vector3(25, Math.PI / 2, 0));

	V.process();
});

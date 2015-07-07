require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'goo/shapes/Cone',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	TextureCreator,
	Cone,
	V
	) {
	'use strict';

	V.describe('cones of different heights');

	var goo = V.initGoo();
	var world = goo.world;

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

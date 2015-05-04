require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'goo/shapes/Cylinder',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	TextureCreator,
	Cylinder,
	V
	) {
	'use strict';

	V.describe('Cylinders of different heights');

	var goo = V.initGoo();
	var world = goo.world;

	var material = new Material(ShaderLib.texturedLit);
	new TextureCreator().loadTexture2D('../../../resources/cylinder.png').then(function (texture) {
		material.setTexture('DIFFUSE_MAP', texture);
	});

	// add normal cylinder
	var normalCylinderMeshData = new Cylinder(8, 4, 4, 8);
	var normalCylinderEntity = world.createEntity(normalCylinderMeshData, material, 'Pointy Cylinder', [-4.5, 0, 0]).addToWorld();
	V.showNormals(normalCylinderEntity);

	// add flatter cylinder
	var flatCylinderMeshData = new Cylinder(64, 4, 4, 1);
	var flatCylinderEntity = world.createEntity(flatCylinderMeshData, material, 'Flat Cylinder', [4.5, 0, 0]).addToWorld();
	V.showNormals(flatCylinderEntity);

	// add pointier cylinder
	var pointyCylinderMeshData = new Cylinder(12, 1, 2, 8);
	var pointyCylinderEntity = world.createEntity(pointyCylinderMeshData, material, 'Pointy Cylinder', [11, 0, 0]).addToWorld();
	V.showNormals(pointyCylinderEntity);

	// add cylinder with just 4 segments
	var lowPolyCylinderMeshData = new Cylinder(4, 1, 3, 8);
	var lowPolyCylinderEntity = world.createEntity(lowPolyCylinderMeshData, material, 'LowPoly Cylinder', [16, 0, 0]).addToWorld();
	V.showNormals(lowPolyCylinderEntity);

	V.addLights();

	V.addOrbitCamera(new Vector3(25, Math.PI / 2, 0));

	V.process();
});

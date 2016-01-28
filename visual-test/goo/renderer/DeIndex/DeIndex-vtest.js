require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/renderer/MeshData',
	'goo/renderer/TextureCreator',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Quad,
	Sphere,
	Vector3,
	MeshData,
	TextureCreator,
	V
	) {
	'use strict';

	V.describe('Alters all attributes but marks only position as dirty');

	var goo = V.initGoo({
		showStats: true
	});
	var world = goo.world;

	V.addOrbitCamera(new Vector3(6, Math.PI / 2, 0));
	V.addLights();

	var material = new Material(ShaderLib.uber);
	new TextureCreator().loadTexture2D('../../../resources/check.png').then(function (texture) {
		material.setTexture('DIFFUSE_MAP', texture);
	});

	var sphere0 = new Sphere(32, 32);
	var sphere1 = new Sphere(100, 100);
	var sphere2 = new Sphere(140, 140);

	world.createEntity(sphere0, material, [-1.2, 0, 0]).addToWorld();
	world.createEntity(sphere1, material, [0, 0, 0]).addToWorld();
	world.createEntity(sphere2, material, [1.2, 0, 0]).addToWorld();

	sphere1.deIndex();
	sphere2.deIndex();

	V.process();
});
require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'goo/shapes/Sphere',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	TextureCreator,
	Sphere,
	V
	) {
	'use strict';

	V.describe('spheres with different texture modes');

	var goo = V.initGoo();
	var world = goo.world;

	var textureCreator = new TextureCreator();
	var texture = textureCreator.loadTexture2D('../../../resources/check.png');

	var material = new Material(ShaderLib.texturedLit);
	material.setTexture('DIFFUSE_MAP', texture);

	var polarSphereMeshData = new Sphere(32, 32, 0.5, Sphere.TextureModes.Polar);
	world.createEntity(polarSphereMeshData, material, 'Polar', [-6, 0, 0]).addToWorld();

	var projectedSphereMeshData = new Sphere(32, 32, 0.5, Sphere.TextureModes.Projected);
	world.createEntity(projectedSphereMeshData, material, 'Projected', [-2, 0, 0]).addToWorld();

	var linearSphereMeshData = new Sphere(32, 32, 0.5, Sphere.TextureModes.Linear);
	world.createEntity(linearSphereMeshData, material, 'Linear', [2, 0, 0]).addToWorld();

	var chromeballSphereMeshData = new Sphere(32, 32, 0.5, Sphere.TextureModes.Chromeball);
	world.createEntity(chromeballSphereMeshData, material, 'Chromeball', [6, 0, 0]).addToWorld();

	V.addLights();

	V.addOrbitCamera(new Vector3(25, Math.PI / 2, 0));

	V.process();
});

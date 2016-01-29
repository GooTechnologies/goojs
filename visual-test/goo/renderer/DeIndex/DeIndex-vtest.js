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

	V.describe('Click any key to run deIndex() on the bottom row mesh datas. This converts the mesh into a vertex only mesh (no indices).');

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

	var quad = new Quad(1, 1);
	var sphere1 = new Sphere(100, 100);
	var sphere2 = new Sphere(140, 140);

	world.createEntity(quad, material, [-1.2, -0.8, 0]).addToWorld();
	world.createEntity(sphere1, material, [0, -0.8, 0]).addToWorld();
	world.createEntity(sphere2, material, [1.2, -0.8, 0]).addToWorld();

	world.createEntity(quad.clone(), material, [-1.2, 0.8, 0]).addToWorld();
	world.createEntity(sphere1.clone(), material, [0, 0.8, 0]).addToWorld();
	world.createEntity(sphere2.clone(), material, [1.2, 0.8, 0]).addToWorld();

	var splitListener = function (evt) {
		switch (evt.keyCode) {
			default:
				quad.deIndex();
				sphere1.deIndex();
				sphere2.deIndex();
				break;
		}
	};
	document.addEventListener('keydown', splitListener, false);
	document.addEventListener('touchstart', splitListener, false);

	V.process();
});
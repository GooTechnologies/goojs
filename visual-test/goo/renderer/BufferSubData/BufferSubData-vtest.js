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

	var goo = V.initGoo();
	var world = goo.world;

	V.addOrbitCamera(new Vector3(2, Math.PI / 2, 0));
	V.addLights();

	var material = new Material(ShaderLib.uber);
	var texture = new TextureCreator().loadTexture2D('../../../resources/check.png');
	material.setTexture('DIFFUSE_MAP', texture);

	var sphere0 = new Sphere(32, 32);
	var sphere1 = new Sphere(32, 32);
	var sphere2 = new Sphere(32, 32);

	world.createEntity(sphere0, material, [ 0, 0, 0]).addToWorld();
	world.createEntity(sphere1, material, [ 1.2, 0, 0]).addToWorld();
	world.createEntity(sphere2, material, [-1.2, 0, 0]).addToWorld();

	function noiseIt(mesh) {
		// altering the vertex positions
		mesh.applyFunction(MeshData.POSITION, function (vertex) {
			vertex.scale(0.95 + Math.random() * 0.1);
			return [
				vertex.x,
				vertex.y,
				vertex.z
			];
		});

		// altering the texture coordinates
		mesh.applyFunction(MeshData.TEXCOORD0, function (vertex) {
			return [
				vertex.x + Math.random() * 0.08,
				vertex.y + Math.random() * 0.08
			];
		});
	}

	setTimeout(function () {
		noiseIt(sphere1);
		// update only the vertex positions on one sphere
		sphere1.setAttributeDataUpdated(MeshData.POSITION);
	}, 500);

	setTimeout(function () {
		noiseIt(sphere2);
		// update only the texture coords on the other sphere
		sphere2.setAttributeDataUpdated(MeshData.TEXCOORD0);
	}, 1000);

	V.process();
});
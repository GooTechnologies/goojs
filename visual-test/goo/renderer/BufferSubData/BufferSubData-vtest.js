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

	var sphere1 = new Sphere(32, 32);
	var sphere2 = new Sphere(32, 32);

	world.createEntity(sphere1, material, [ 1, 0, 0]).addToWorld();
	world.createEntity(sphere2, material, [-1, 0, 0]).addToWorld();

	function noiseIt() {
		// altering the vertex positions
		sphere1.applyFunction(MeshData.POSITION, function (vertex) {
			return [
				vertex.x + Math.random() * 0.05,
				vertex.y + Math.random() * 0.05,
				vertex.z + Math.random() * 0.05
			];
		});

		// altering the texture coordinates
		sphere1.applyFunction(MeshData.TEXCOORD0, function (vertex) {
			return [
				vertex.x + 0.1,
				vertex.y + 0.1
			];
		});

		// only updating the vertex positions
		sphere1.setAttributeDataUpdated(MeshData.POSITION);
	}

	setTimeout(noiseIt, 1000);

	V.process();
});
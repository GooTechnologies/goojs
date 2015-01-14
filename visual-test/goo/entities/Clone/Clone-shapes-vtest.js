require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/shapes/Box',
	'goo/shapes/Cone',
	'goo/shapes/Cylinder',
	'goo/shapes/Disk',
	'goo/shapes/Grid',
	'goo/shapes/Quad',
	'goo/shapes/SimpleBox',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	Box,
	Cone,
	Cylinder,
	Disk,
	Grid,
	Quad,
	SimpleBox,
	Sphere,
	Torus,
	V
) {
	'use strict';

	V.describe('Cloning shapes');

	var goo = V.initGoo();
	var world = goo.world;

	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));
	V.addLights();


	// create one of each
	var originalShapes = [Box, Cone, Cylinder, Disk, Grid, Quad, SimpleBox, Sphere, Torus].map(function (shapeConstructor, i) {
		var meshData = new shapeConstructor();
		world.createEntity(meshData, new Material(ShaderLib.simpleLit), [(i - 4) * 2, -3, 0]).addToWorld();
		return meshData;
	});

	//clone them all
	originalShapes.forEach(function (originalShape, i) {
		var clonedShape = originalShape.clone();
		world.createEntity(clonedShape, new Material(ShaderLib.simpleLit), [(i - 4) * 2,  3, 0]).addToWorld();
	});


	V.process();
});
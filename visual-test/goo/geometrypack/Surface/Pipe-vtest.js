require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/geometrypack/PolyLine',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/shapes/Cone',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	PolyLine,
	Sphere,
	Box,
	Cone,
	V
	) {
	'use strict';

	V.describe('Extruding a path along another path');

	var goo = V.initGoo();
	var world = goo.world;

	var path = PolyLine.fromCubicSpline([
		-1,  0,  0,

		-1, -1,  0,
		-1, -1,  1,
		 0, -1,  1,

		 1, -1,  1,
		 1, -1,  2,
		 1,  0,  2,

		 1,  1,  2,
		 1,  1,  3,
		 0,  1,  3,

		-1,  1,  3,
		-1,  1,  4,
		-1,  0,  4
	], 32);

	var section = new PolyLine.fromCubicSpline([
		-0.1,  0.00, 0,

		-0.1, -0.04, 0,
		-0.0, -0.04, 0,
		 0.0, -0.04, 0,

		 0.1, -0.04, 0,
		 0.1, -0.04, 0,
		 0.1,  0.00, 0,

		 0.1,  0.04, 0,
		 0.1,  0.04, 0,
		 0.0,  0.04, 0,

		-0.1,  0.04, 0,
		-0.1,  0.04, 0,
		-0.1,  0.00, 0
	], 6);

	var pipeMeshData = path.pipe(section, function (progress) {
		return Math.sin(progress * Math.PI * 10) * 0.4 + 1.0;
	});

	var material = new Material(ShaderLib.simpleLit);
	world.createEntity(pipeMeshData, material).addToWorld();


	V.addLights();

	V.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));

	V.process();
});

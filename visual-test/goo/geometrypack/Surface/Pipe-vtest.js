require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/geometrypack/PolyLine',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	PolyLine,
	V
) {
	'use strict';

	V.describe('Extruding a path along another path');

	var goo = V.initGoo();

	goo._addDebugKeys();
	var world = goo.world;

	var path = PolyLine.fromCubicSpline([
		-1,  0,  0.0,

		-1, -1,  0.0,
		-1, -1,  0.2,
		 0, -1,  0.2,

		 1, -1,  0.2,
		 1, -1,  0.4,
		 1,  0,  0.4,

		 1,  1,  0.4,
		 1,  1,  0.6,
		 0,  1,  0.6,

		-1,  1,  0.6,
		-1,  1,  0.8,
		-1,  0,  0.8
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

	var pipeMeshData = path.pipe(section, {
		scale: function (progress) {
			return Math.sin(progress * Math.PI * 10) * 0.6 + 1.0;
		},
		twist: function (progress) {
			return progress * 8;
		}
	});

	var material = new Material(ShaderLib.simpleLit);
	world.createEntity(pipeMeshData, material).addToWorld();


	V.addLights();

	V.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));

	V.process();
});

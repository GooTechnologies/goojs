require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/math/Spline',
	'goo/geometrypack/PolyLine',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Sphere,
	Vector3,
	Spline,
	PolyLine,
	V
) {
	'use strict';

	V.describe('...');

	function getSplineMesh(controlPoints, nSteps) {
		var spline = new Spline(controlPoints);

		var cursor = new Vector3();

		var splinePoints = [];

		var stepLength = 1 / nSteps;
		for (var i = 0, t = 0; i <= nSteps; i++, t += stepLength) {
			spline.getPoint(t, cursor);
			splinePoints.push(cursor.x, cursor.y, cursor.z);
		}

		return new PolyLine(splinePoints);
	}

	var goo = V.initGoo();
	var world = goo.world;

	var splineMesh = getSplineMesh([
		new Vector3(0, 0, 0),
		new Vector3(1, 0, 0),
		new Vector3(1, 0.5, 0),
		new Vector3(0, 1, 0),
		new Vector3(-1, 1.5, 0),
		new Vector3(-1, 2, 0),
		new Vector3(0, 2, 0)
	], 40);

	world.createEntity(splineMesh, V.getColoredMaterial()).addToWorld();

	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));
	V.addLights();

	V.process();
});
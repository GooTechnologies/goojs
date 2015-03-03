require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/math/splines/Spline',
	'goo/geometrypack/PolyLine',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Sphere,
	Box,
	Vector3,
	Spline,
	PolyLine,
	V
) {
	'use strict';

	V.describe('From left to right: cubic interpolation, spline interpolation, quadratic interpolation');

	var goo = V.initGoo();
	var world = goo.world;

	var lineMaterial = V.getColoredMaterial();



	var dot = (function () {
		var mesh = new Sphere(16, 16, 0.05);
		var material = V.getColoredMaterial();

		return function (x, y, z) {
			world.createEntity(mesh, material, [x, y, z]).addToWorld();
		};
	})();

	var box = (function () {
		var mesh = new Box(0.1, 0.1, 0.1);
		var material = V.getColoredMaterial();

		return function (x, y, z) {
			world.createEntity(mesh, material, [x, y, z]).addToWorld();
		};
	})();

	var line = function (from, to, ends) {
		var mesh = new PolyLine([from.x, from.y, from.z, to.x, to.y, to.z]);
		world.createEntity(mesh, lineMaterial).addToWorld();

		if (ends === 'start') {
			box(from.x, from.y, from.z);
		} else if (ends === 'end') {
			box(to.x, to.y, to.z);
		} else {
			box(from.x, from.y, from.z);
			box(to.x, to.y, to.z);
		}
	};

	function splineHelpers(controlPoints) {
		var segments = (controlPoints.length - 1) / 3;

		for (var i = 0; i < segments; i++) {
			var p0 = controlPoints[i * 3 + 0];
			var p1 = controlPoints[i * 3 + 1];
			var p2 = controlPoints[i * 3 + 2];
			var p3 = controlPoints[i * 3 + 3];

			line(p0, p1, 'end');
			line(p3, p2, 'end');
		}
	}

	function spline(controlPoints, nSteps) {
		var spline = new Spline(controlPoints);

		var cursor = new Vector3();

		var points = [];

		var stepLength = 1 / nSteps;
		for (var i = 0, t = 0; i <= nSteps; i++, t += stepLength) {
			spline.getPoint(t, cursor);
			points.push(cursor.x, cursor.y, cursor.z);

			dot(cursor.x, cursor.y, cursor.z);
		}

		world.createEntity(new PolyLine(points), lineMaterial).addToWorld();
	}

	function cubicBezierHelpers(controlPoints) {
		line(controlPoints[0], controlPoints[1], 'end');
		line(controlPoints[3], controlPoints[2], 'end');
	}

	function cubicBezier(controlPoints, nSteps) {
		var getPoint = Spline.cubicInterpolation.bind(
			null, controlPoints[0], controlPoints[1], controlPoints[2], controlPoints[3]
		);

		var cursor = new Vector3();

		var points = [];

		var stepLength = 1 / nSteps;
		for (var i = 0, t = 0; i <= nSteps; i++, t += stepLength) {
			getPoint(t, cursor);
			points.push(cursor.x, cursor.y, cursor.z);

			dot(cursor.x, cursor.y, cursor.z);
		}

		world.createEntity(new PolyLine(points), lineMaterial).addToWorld();
	}

	function quadraticBezierHelpers(controlPoints) {
		line(controlPoints[0], controlPoints[1], 'end');
		line(controlPoints[2], controlPoints[1], 'end');
	}

	function quadraticBezier(controlPoints, nSteps) {
		var getPoint = Spline.quadraticInterpolation.bind(
			null, controlPoints[0], controlPoints[1], controlPoints[2]
		);

		var cursor = new Vector3();

		var points = [];

		var stepLength = 1 / nSteps;
		for (var i = 0, t = 0; i <= nSteps; i++, t += stepLength) {
			getPoint(t, cursor);
			points.push(cursor.x, cursor.y, cursor.z);

			dot(cursor.x, cursor.y, cursor.z);
		}

		world.createEntity(new PolyLine(points), lineMaterial).addToWorld();
	}

	var splineControlPoints = [
		new Vector3(-1, -1, 0),
		new Vector3(1, -1, 0),
		new Vector3(1, 0.5, 0),
		new Vector3(0, 1, 0),
		new Vector3(-1, 1.5, 0),
		new Vector3(-0.5, 2.25, 0),
		new Vector3(0, 2, 0)
	];

	var cubicBezierControlPoints = [
		new Vector3(-4, -1, 0),
		new Vector3(-5, 1, 0),
		new Vector3(-2, 1, 0),
		new Vector3(-3, -1, 0)
	];

	var quadraticBezierControlPoints = [
		new Vector3(5, -1, 0),
		new Vector3(3, -1, 0),
		new Vector3(3, 0, 0)
	];


	spline(splineControlPoints, 20);
	splineHelpers(splineControlPoints);

	cubicBezier(cubicBezierControlPoints, 16);
	cubicBezierHelpers(cubicBezierControlPoints);

	quadraticBezier(quadraticBezierControlPoints, 14);
	quadraticBezierHelpers(quadraticBezierControlPoints);


	V.addOrbitCamera(new Vector3(7, Math.PI / 2, 0));
	V.addLights();

	V.process();
});
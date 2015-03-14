require([
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/math/splines/Spline',
	'goo/math/splines/SplineWalker',
	'goo/geometrypack/PolyLine',
	'lib/V'
], function (
	Sphere,
	Box,
	Vector3,
	Spline,
	SplineWalker,
	PolyLine,
	V
) {
	'use strict';

	V.describe([
		'The spheres on the spline to the left distributed by interpolating with a constant increment on `t`.',
		'The spheres on the spline to the right are distributed uniformly by using a SplineWalker.'
	].join(''));

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

	function basicSpline(controlPoints, nSteps) {
		var spline = new Spline(controlPoints);

		var cursor = new Vector3();

		var splinePoints = [];

		var stepLength = 1 / nSteps;
		for (var i = 0, t = 0; i <= nSteps; i++, t += stepLength) {
			spline.getPoint(t, cursor);
			splinePoints.push(cursor.x, cursor.y, cursor.z);

			dot(cursor.x, cursor.y, cursor.z);
		}

		world.createEntity(new PolyLine(splinePoints), lineMaterial).addToWorld();
	}

	function betterSpline(controlPoints, distance) {
		var spline = new Spline(controlPoints);
		var splineWalker = new SplineWalker(spline);

		var cursor = controlPoints[0].clone();
		dot(cursor.x, cursor.y, cursor.z);

		var splinePoints = [];

		while (splineWalker.canWalk()) {
			splineWalker.advance(distance, cursor);
			splinePoints.push(cursor.x, cursor.y, cursor.z);

			dot(cursor.x, cursor.y, cursor.z);
		}

		world.createEntity(new PolyLine(splinePoints), lineMaterial).addToWorld();
	}


	var controlPoints0 = [
		new Vector3(-1, -1, 0),
		new Vector3(1, -1, 0),
		new Vector3(1, 0.5, 0),
		new Vector3(0, 1, 0),
		new Vector3(-1, 1.5, 0),
		new Vector3(-0.5, 2.25, 0),
		new Vector3(0, 2, 0)
	];

	function displace(x, y, z) {
		return function (point) {
			return point.clone().addDirect(x, y, z);
		};
	}

	var controlPoints1 = controlPoints0.map(displace(-1.5, -0.5, 0));
	basicSpline(controlPoints1, 20);
	splineHelpers(controlPoints1);

	var controlPoints2 = controlPoints0.map(displace(1.5, -0.5, 0));
	betterSpline(controlPoints2, 0.2);
	splineHelpers(controlPoints2);

	V.addOrbitCamera(new Vector3(6, Math.PI / 2, 0));
	V.addLights();

	V.process();
});
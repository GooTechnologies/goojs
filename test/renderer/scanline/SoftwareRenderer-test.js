define(
[
	'goo/renderer/scanline/SoftwareRenderer',
	'goo/math/Vector3',
	'goo/math/Vector2'
], function (SoftwareRenderer, Vector3, Vector2) {
	'use strict';

	describe('SoftwareRenderer', function () {

		var renderer = new SoftwareRenderer({"width" : 256, "height" : 114});

		describe('calculateIntersectionRatio', function() {

			it('calculates the intersection correctly at 50%', function() {

				// The vertices are in camera space at the point for this check in the graphics pipeline.
				// Thus the z-coordinates are in the range of [0, -far(+-boundingModel size)].

				var origin = new Vector3(-2345.12345, 0.2848, -1.5);
				var target = new Vector3(2935.2829, -3510.12958, -0.5);
				var near = 1;
				var ratio = renderer._calculateIntersectionRatio(origin, target, near);
				expect(ratio).toEqual(0.5);
			});
		});

		describe('isBackFacingProjected', function () {

			// The vertices are transformed into perspective space and homogeneous divided at this point
			// in the graphics pipeline in SoftwareRenderer.

			// The x- and y-coordinates are in the range of [-1, 1], origin is in the center of the screen.
			// But since only near plane clipping is performed, the vertices could be outside this range.

			// The z-coordinates are in the range of [-near, far(+-boundingModel size)].
			// But they are not used in this check so they could be anything.

			// Three vertices inside the projected space.
			var v1 = new Vector3(0.5, -0.2, 13.5);
			var v2 = new Vector3(-0.5, 0.3, 23.5);
			var v3 = new Vector3(0.7, 0.7, 73.5);

			it('This face inside the space should be back face culled', function () {
				expect(renderer._isBackFacingProjected(v1, v2, v3)).toEqual(true);
			});

			it('This face inside the space should be visible', function() {
				expect(renderer._isBackFacingProjected(v1, v3, v2)).toEqual(false);
			});

			// Make the v1 and v2 vertex go outside the space to test this case.
			v1.x = 1.3;
			v3.z = 2.0;
			it('This face outside the space should be visible', function () {
				expect(renderer._isBackFacingProjected(v1, v3, v2)).toEqual(false);
			});

			it('This face outside the space should be back face culled', function () {
				expect(renderer._isBackFacingProjected(v1, v2, v3)).toEqual(true);
			});

		});

		describe('categorizeVertices', function () {

			// Vertices are here in camera space.

			// The nearplane is set on the camera to 1. This means the plane is located at -1 z-coordinate during this test.
			var nearPlaneInWorldCoordinateZ = -1.0;

			it('One vertex outside, two inside', function () {

				var outsideVerts = [];
				var insideVerts = [];

				var v1 = new Vector3(-1.0, 23.5, nearPlaneInWorldCoordinateZ - Math.random() * 100);
				var v2 = new Vector3(-1664.0, 13.5, nearPlaneInWorldCoordinateZ + Math.random() * 100);
				var v3 = new Vector3(-31.0, 27.521, nearPlaneInWorldCoordinateZ - Math.random() * 100);

				var vertices = [v1, v2, v3];

				renderer._categorizeVertices(outsideVerts, insideVerts, vertices, nearPlaneInWorldCoordinateZ);
				expect(outsideVerts.length).toEqual(1);
				expect(insideVerts.length).toEqual(2);
			});


			it('One vertex inside, two outside', function () {

				var outsideVerts = [];
				var insideVerts = [];

				var v1 = new Vector3(-1.0, 23.5,  nearPlaneInWorldCoordinateZ + Math.random() * 100);
				var v2 = new Vector3(-1664.0, 13.5, nearPlaneInWorldCoordinateZ + Math.random() * 100);
				var v3 = new Vector3(-31.0, 27.521, nearPlaneInWorldCoordinateZ - Math.random() * 100);

				var vertices = [v1, v2, v3];

				renderer._categorizeVertices(outsideVerts, insideVerts, vertices, nearPlaneInWorldCoordinateZ);
				expect(outsideVerts.length).toEqual(2);
				expect(insideVerts.length).toEqual(1);
			});


			it('All outside', function () {

				var outsideVerts = [];
				var insideVerts = [];

				var v1 = new Vector3(-1.0, 23.5,  nearPlaneInWorldCoordinateZ + Math.random() * 100);
				var v2 = new Vector3(-1664.0, 13.5, nearPlaneInWorldCoordinateZ + Math.random() * 100);
				var v3 = new Vector3(-31.0, 27.521, nearPlaneInWorldCoordinateZ + Math.random() * 100);

				var vertices = [v1, v2, v3];

				renderer._categorizeVertices(outsideVerts, insideVerts, vertices, nearPlaneInWorldCoordinateZ);
				expect(outsideVerts.length).toEqual(3);
				expect(insideVerts.length).toEqual(0);
			});

			it('All inside', function () {

				var outsideVerts = [];
				var insideVerts = [];

				var v1 = new Vector3(-1.0, 23.5,  nearPlaneInWorldCoordinateZ - Math.random() * 100);
				var v2 = new Vector3(-1664.0, 13.5, nearPlaneInWorldCoordinateZ - Math.random() * 100);
				var v3 = new Vector3(-31.0, 27.521, nearPlaneInWorldCoordinateZ - Math.random() * 100);

				var vertices = [v1, v2, v3];

				renderer._categorizeVertices(outsideVerts, insideVerts, vertices, nearPlaneInWorldCoordinateZ);
				expect(outsideVerts.length).toEqual(0);
				expect(insideVerts.length).toEqual(3);
			});

			it('Vertex on near plane is inside', function () {

				var outsideVerts = [];
				var insideVerts = [];

				var v1 = new Vector3(-1.0, 23.5,  nearPlaneInWorldCoordinateZ - Math.random() * 100);
				var v2 = new Vector3(-1664.0, 13.5, nearPlaneInWorldCoordinateZ);
				var v3 = new Vector3(-31.0, 27.521, nearPlaneInWorldCoordinateZ);

				var vertices = [v1, v2, v3];

				renderer._categorizeVertices(outsideVerts, insideVerts, vertices, nearPlaneInWorldCoordinateZ);
				expect(outsideVerts.length).toEqual(0);
				expect(insideVerts.length).toEqual(3);
			});
		});

		describe('isCoordinateInsideScreen', function () {

			it('Totally outside screen', function () {
				var coordinate = new Vector2(renderer.width - 100, renderer.height + 20);
				expect(renderer._isCoordinateInsideScreen(coordinate)).toEqual(false);
			});

			it('Y outside screen, X inside', function () {
				var coordinate = new Vector2(renderer.width - renderer.width / 2, renderer.height + 20);
				expect(renderer._isCoordinateInsideScreen(coordinate)).toEqual(false);
			});

			it('Totally Inside screen', function () {
				var coordinate = new Vector2(renderer.width - renderer.width / 5, renderer.height - renderer.height / 3);
				console.log(coordinate.data);
				expect(renderer._isCoordinateInsideScreen(coordinate)).toEqual(true);
			});

			it('Y Inside screen, X outside', function () {
				var coordinate = new Vector2(renderer.width + 200, renderer.height - renderer.height / 3);
				expect(renderer._isCoordinateInsideScreen(coordinate)).toEqual(false);
			});

			it('Totally Inside screen', function () {
				var coordinate = new Vector2(renderer.width / 5, renderer.height - renderer.height / 3);
				expect(renderer._isCoordinateInsideScreen(coordinate)).toEqual(true);
			});

			it('X On edge of screen, Y inside', function () {
				var coordinate = new Vector2(renderer._clipX, renderer.height / 3);
				expect(renderer._isCoordinateInsideScreen(coordinate)).toEqual(true);
			});

			it('Y On edge of screen, X inside', function () {
				var coordinate = new Vector2(renderer.width / 2, renderer._clipY);
				expect(renderer._isCoordinateInsideScreen(coordinate)).toEqual(true);
			});
		});

	});
});

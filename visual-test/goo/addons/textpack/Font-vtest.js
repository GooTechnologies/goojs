require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/passpack/ShaderLibExtra',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/geometrypack/FilledPolygon',
	'goo/geometrypack/PolyLine',
	'goo/addons/textpack/FontGenerator',
	'lib/V'
], function (
	Material,
	ShaderLib,
	ShaderLibExtra,
	Box,
	Quad,
	Sphere,
	Vector3,
	PointLight,
	FilledPolygon,
	PolyLine,
	FontGenerator,
	V
) {
	'use strict';

	function testTri() {
		var contour = [
			new poly2tri.Point(100, 100),
			new poly2tri.Point(100, 300),
			new poly2tri.Point(300, 300),
			new poly2tri.Point(300, 100)
		];
		contour.forEach(function (point, index) { point._index = index; });
		var swctx = new poly2tri.SweepContext(contour);


		var hole = [
			new poly2tri.Point(200, 200),
			new poly2tri.Point(200, 250),
			new poly2tri.Point(250, 250)
		];
		hole.forEach(function (point, index) { point._index = index + contour.length; });
		swctx.addHole(hole);


		swctx.triangulate();
		var triangles = swctx.getTriangles();

		console.log(triangles);
		triangles.forEach(function (triangle) {
			console.log(triangle.getPoint(0)._index, triangle.getPoint(1)._index, triangle.getPoint(2)._index);
		});
	}

	testTri();


	V.describe('...');

	var canvas = document.getElementById('can');
	var con2d = canvas.getContext('2d');
	con2d.strokeStyle = 'green';
	con2d.translate(10, 400);
	FontGenerator.setCon2d(con2d);

	var goo = V.initGoo();
	var world = goo.world;

	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));
	V.addLights();

	var letterEntityCounter = -3;


	function getVerts(polygon) {
		var verts = [];
		polygon.forEach(function (point) {
			verts.push(point.x, point.y, 0);
		});
		return verts;
	}

	function getIndices(polygon) {
		return polygon.map(function (point) {
			return point.index;
		});
	}

	function printIndices(points) {
		var str = points.map(function (point) { return point._index; }).join(', ');
		console.log(str);
	}

	opentype.load('Roboto-Black.ttf', function (err, font) {
		if (err) { throw err; }

		window.letter = function (letter) {
			con2d.fillStyle = 'white';
			con2d.fillRect(0, -400, 1024, 512);
			//console.log(font);


			var glyph = font.charToGlyph(letter);
			con2d.save();
			var result = FontGenerator.meshFromGlyph(glyph, 400);

			var swctx = new poly2tri.SweepContext(result.contour.slice(0));
			result.holes.forEach(function (hole) { swctx.addHole(hole.slice(0)); });


			swctx.triangulate();
			var triangles = swctx.getTriangles();

			// ---
			var surfaceIndices = [];
			triangles.forEach(function (triangle) {
				surfaceIndices.push(
					triangle.getPoint(0)._index,
					triangle.getPoint(1)._index,
					triangle.getPoint(2)._index
				);
			});
			// ---



			var allPoints = [];
			allPoints = result.contour.slice(0);
			result.holes.forEach(function (hole) {
				Array.prototype.push.apply(allPoints, hole);
			});


			//printIndices(allPoints);

			// or use a reverse mapping
			allPoints.sort(function (a, b) { return a._index - b._index; });
			//console.log(allPoints.map(function (p) { return p._index; }));

			printIndices(allPoints);

			var surfaceVerts = getVerts(allPoints);
			//var surfaceIndices = getIndices(result.surface);

			//console.log(result.contour);
			//console.log(surfaceVerts);
			//console.log(surfaceIndices);


			var material = V.getColoredMaterial();
			material.cullState.enabled = false;

			// face
			var faceMesh = new FilledPolygon(surfaceVerts, surfaceIndices);
			var frontEntity = world.createEntity(faceMesh, material).addToWorld();
			frontEntity.set([letterEntityCounter * 22, 0, 0]);
			frontEntity.setScale(0.1, -0.1, 0.1);

			// extrusion
			function extrude(contour) {
				var contourVerts = getVerts(contour);
				contourVerts.push(contourVerts[0], contourVerts[1], contourVerts[2]);
				var contourPolyLine = new PolyLine(contourVerts, true);
				var thirdSpace = new PolyLine([0, 0, -100, 0, 0, 0]);
				var extrusionMesh = contourPolyLine.mul(thirdSpace);
				var extrusionEntity = world.createEntity(extrusionMesh, material).addToWorld();
				extrusionEntity.set([letterEntityCounter * 22, 0, 0]);
				extrusionEntity.setScale(0.1, 0.1, 0.1);
			}

			//result.holes.forEach(extrude);
			//extrude(result.contour);

			// back
			//var backMesh = new FilledPolygon(surfaceVerts);
			//var backEntity = world.createEntity(backMesh, material).addToWorld();
			//backEntity.set([letterEntityCounter * 22, 0, -10]);
			//backEntity.setScale(0.1, 0.1, 0.1);

			letterEntityCounter++;

			con2d.restore();
		};

		letter('2');
	});

	V.process();
});
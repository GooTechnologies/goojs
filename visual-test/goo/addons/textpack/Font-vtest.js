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


			var material = V.getColoredMaterial();
			material.cullState.enabled = false;

			// face
			var faceMesh = new FilledPolygon(result.surfaceVerts, result.surfaceIndices);
			var frontEntity = world.createEntity(faceMesh, material).addToWorld();
			frontEntity.set([letterEntityCounter * 22, 0, 0]);
			frontEntity.setScale(0.1, -0.1, 0.1);

			// extrusion
			//function extrude(contour) {
			//	var contourVerts = getVerts(contour);
			//	contourVerts.push(contourVerts[0], contourVerts[1], contourVerts[2]);
			//	var contourPolyLine = new PolyLine(contourVerts, true);
			//	var thirdSpace = new PolyLine([0, 0, -100, 0, 0, 0]);
			//	var extrusionMesh = contourPolyLine.mul(thirdSpace);
			//	var extrusionEntity = world.createEntity(extrusionMesh, material).addToWorld();
			//	extrusionEntity.set([letterEntityCounter * 22, 0, 0]);
			//	extrusionEntity.setScale(0.1, 0.1, 0.1);
			//}

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
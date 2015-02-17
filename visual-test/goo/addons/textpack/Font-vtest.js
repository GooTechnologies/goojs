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

	//V.describe('...');

	var goo = V.initGoo();
	var world = goo.world;

	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));
	V.addLights();

	function addCharEntity(data, thickness, offsetX) {
		var material = V.getColoredMaterial();
		material.cullState.enabled = false;

		// face
		var faceMesh = new FilledPolygon(data.surfaceVerts, data.surfaceIndices);
		var frontEntity = world.createEntity(faceMesh, material).addToWorld();
		frontEntity.set([offsetX, 0, 0]);
		//frontEntity.setScale(0.1, -0.1, 0.1);


		function getVerts(points) {
			var verts = [];
			points.forEach(function (point) {
				verts.push(point.x, point.y, 0);
			});
			return verts;
		}

		// extrusions
		function extrude(polygon) {
			var contourVerts = getVerts(polygon);
			contourVerts.push(contourVerts[0], contourVerts[1], contourVerts[2]);
			var contourPolyLine = new PolyLine(contourVerts, true);
			var thirdSpace = new PolyLine([0, 0, -thickness, 0, 0, 0]);
			var extrusionMesh = contourPolyLine.mul(thirdSpace);
			var extrusionEntity = world.createEntity(extrusionMesh, material).addToWorld();
			extrusionEntity.set([offsetX, 0, 0]);
			//extrusionEntity.setScale(0.1, -0.1, 0.1);
		}

		//data.extrusions.forEach(extrude);

		// back
		//var backMesh = new FilledPolygon(data.surfaceVerts, data.surfaceIndices);
		//var backEntity = world.createEntity(backMesh, material).addToWorld();
		//backEntity.set([offsetX, 0, -thickness]);
		//backEntity.setScale(0.1, -0.1, 0.1);

		world.createEntity()
			.attachChild(frontEntity)
			//.attachChild(backEntity) // extrusions
			//.attachChild(frontEntity)
			.setScale(0.1, -0.1, 0.1)
			.setTag('letter')
			.addToWorld();

	}

	opentype.load('Roboto-Black.ttf', function (err, font) {
		if (err) { throw err; }

		var fontSize = 72;

		window.letter = function (letter) {
			world.by.tag('letter').forEach(function (entity) { entity.removeFromWorld(); });
			font.forEachGlyph(letter, 0, 0, fontSize, {}, function (glyph, x, y, fontSize, options) {
				if (glyph.path.commands.length > 0) {
					var data = FontGenerator.meshFromGlyph(glyph, fontSize, { stepLength: 1 });

					addCharEntity(data, 8, x);
				}
			});
		};

		letter('asd');
	});

	V.process();
});
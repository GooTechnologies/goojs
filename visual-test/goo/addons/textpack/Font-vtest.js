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

	V.describe('Text extrusion');

	var goo = V.initGoo();
	var world = goo.world;

	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));
	V.addLights();

	opentype.load('Roboto-Black.ttf', function (err, font) {
		if (err) { throw err; }

		window.letter = function (text) {
			// remove previous text
			world.by.tag('text').forEach(function (entity) { entity.removeFromWorld(); });

			var material = V.getColoredMaterial();
			material.cullState.enabled = false;

			var meshDatas = FontGenerator.meshesForText(text, font);
			meshDatas.forEach(function (meshData) {
				world.createEntity(meshData, material)
					.setTag('text')
					.addToWorld();
			});
		};

		letter('asd');
	});

	V.process();
});
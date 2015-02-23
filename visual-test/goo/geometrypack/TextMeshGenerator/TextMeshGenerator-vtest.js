require([
	'goo/math/Vector3',
	'goo/geometrypack/text/TextMeshGenerator',
	'lib/V'
], function (
	Vector3,
	TextMeshGenerator,
	V
) {
	'use strict';

	V.describe('The text mesh is generated based on a font-file');

	var goo = V.initGoo();
	var world = goo.world;

	V.addOrbitCamera(new Vector3(110, Math.PI / 2, 0));
	V.addLights();

	// cycling through colors
	V.rng.nextFloat();
	V.rng.nextFloat();

	opentype.load('Roboto-Black.ttf', function (err, font) {
		if (err) { throw err; }

		function print(text, x, y, extrusion) {

			var material = V.getColoredMaterial();

			var meshDatas = TextMeshGenerator.meshesForText(text, font, {
				extrusion: extrusion
			});

			meshDatas.forEach(function (meshData) {
				world.createEntity(meshData, material, [x, y, 0])
					.setTag('text')
					.addToWorld();
			});
		}

		print('yummy', -76, 8, 0);
		print('cookie', -70, -32, 4);
	});

	V.process();
});
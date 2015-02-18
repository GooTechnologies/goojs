require([
	'goo/math/Vector3',
	'goo/geometrypack/TextMeshGenerator',
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

	V.addOrbitCamera(new Vector3(90, Math.PI / 2, 0));
	V.addLights();

	// cycling through colors
	V.rng.nextFloat();
	V.rng.nextFloat();

	opentype.load('Roboto-Black.ttf', function (err, font) {
		if (err) { throw err; }

		window.letter = function (text) {
			// remove previous text
			world.by.tag('text').forEach(function (entity) { entity.removeFromWorld(); });

			var material = V.getColoredMaterial();

			var meshDatas = TextMeshGenerator.meshesForText(text, font);
			meshDatas.forEach(function (meshData) {
				world.createEntity(meshData, material, [-70, -16, 0])
					.setTag('text')
					.addToWorld();
			});
		};

		letter('cookie');
	});

	V.process();
});
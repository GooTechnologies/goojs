
	goo.V.attachToGlobal();

	V.describe('The text mesh is generated based on a font-file');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	V.addOrbitCamera(new Vector3(110, Math.PI / 2, 0));
	V.addLights();

	// cycling through colors
	V.rng.nextFloat();
	V.rng.nextFloat();

	opentype.load('../../../lib/Roboto-Black.ttf', function (err, font) {
		if (err) { throw err; }

		function print(text, y, extrusion) {
			var material = V.getColoredMaterial();

			var meshDatas = TextMeshGenerator.meshesForText(text, font, {
				extrusion: extrusion
			});

			meshDatas.forEach(function (meshData) {
				world.createEntity(meshData, material, [0, y, 0])
					.setTag('text')
					.addToWorld();
			});
		}

		print('yummy', 8, 0);
		print('cookie', -32, 4);
	});

	V.process();

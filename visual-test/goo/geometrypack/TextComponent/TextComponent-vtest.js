
	goo.V.attachToGlobal();

	V.describe('The text mesh comes from a text component attached on an entity; the text is "zxc" and it should change to "asd" after one second');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	opentype.load('../../../lib/Roboto-Black.ttf', function (err, font) {
		if (err) { throw err; }

		var textComponent = new TextComponent();
		textComponent.setFont(font);

		var material = V.getColoredMaterial();

		world.createEntity(textComponent, material, [0, -10, 0]).addToWorld();

		textComponent.setText('zxc');

		setTimeout(function () {
			textComponent.setText('asd');
		}, 1000);
	});

	V.addOrbitCamera(new Vector3(90, Math.PI / 2, 0));
	V.addLights();

	V.process();

require([
	'goo/geometrypack/text/TextComponent',
	'goo/math/Vector3',
	'lib/V'
], function (
	TextComponent,
	Vector3,
	V
) {
	'use strict';

	V.describe('TextComponent');

	var goo = V.initGoo();
	var world = goo.world;

	opentype.load('Roboto-Black.ttf', function (err, font) {
		if (err) { throw err; }

		var textComponent = new TextComponent(font);

		var material = V.getColoredMaterial();

		world.createEntity(textComponent, material).addToWorld();

		textComponent.setText('zxc');
	});

	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));
	V.addLights();

	V.process();
});
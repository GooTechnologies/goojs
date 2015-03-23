require([
	'goo/renderer/Material',
	'goo/passpack/ShaderLibExtra',
	'goo/math/Vector3',
	'goo/entities/components/TextComponent',
	'goo/renderer/TextureCreator',
	'goo/entities/systems/TextSystem',
	'lib/V'
], function (
	Material,
	ShaderLibExtra,
	Vector3,
	TextComponent,
	TextureCreator,
	TextSystem,
	V
	) {
	'use strict';

	V.describe('Tests the TextComponent, which uses an image of the alphabet to display text.');

	var resourcesPath = '../../../../resources/';

	var goo = V.initGoo();
	var world = goo.world;

	V.addLights();
	V.addOrbitCamera();

	// add text system to world
	world.setSystem(new TextSystem());

	// get a font
	var material = new Material(ShaderLibExtra.billboard);
	var texture = new TextureCreator().loadTexture2D(resourcesPath + 'font.png');
	material.setTexture('DIFFUSE_MAP', texture);
	material.blendState.blending = 'AlphaBlending';

	// create text component with an initial text
	var textComponent = new TextComponent('Vivos brunneis vulpes\nsalit super\npiger canis');

	// create text entity
	var textEntity = world.createEntity(material, textComponent, [3, 3, 0]).addToWorld();

	// change text
	var text = 'The quick brown fox\njumps over\nthe lazy dog ';
	var counter = 0;
	setInterval(function () {
		counter++;
		if (counter > text.length) { counter = 1; }

		textEntity.textComponent.setText(text.substr(0, counter));
	}, 100);

	V.process();
});

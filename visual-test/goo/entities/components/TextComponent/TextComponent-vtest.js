goo.V.attachToGlobal();

	V.describe('Tests the TextComponent, which uses an image of the alphabet to display text.');

	var resourcesPath = '../../../../resources/';

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	V.addLights();
	V.addOrbitCamera(new Vector3(50, Math.PI / 2, 0));

	// add text system to world
	world.setSystem(new TextSystem());

	// get a font
	var material1 = new Material(ShaderLib.uber);
	new TextureCreator().loadTexture2D(resourcesPath + 'font.png').then(function (texture) {
		material1.setTexture('TRANSPARENCY_MAP', texture);

	});
	material1.blendState.blending = 'TransparencyBlending';
	material1.uniforms.materialDiffuse = [0, 0, 0, 1];
	material1.uniforms.materialEmissive = [1, 1, 1, 1];
	material1.uniforms.useBWTransparency = true;
	material1.uniforms.discardThreshold = 0.01;
	material1.renderQueue = 2000;

	var material2 = new Material(ShaderLib.uber);
	new TextureCreator().loadTexture2D(resourcesPath + 'font.png').then(function (texture) {
		material2.setTexture('EMISSIVE_MAP', texture);
	});
	material2.uniforms.materialDiffuse = [0, 0, 0, 1];
	material2.uniforms.materialEmissive = [1, 1, 1, 1];

	var material3 = new Material(ShaderLib.uber);
	new TextureCreator().loadTexture2D(resourcesPath + 'font.png').then(function (texture) {
		material3.setTexture('TRANSPARENCY_MAP', texture);
	});
	material3.blendState.blending = 'TransparencyBlending';
	material3.uniforms.materialDiffuse = [0, 0, 0, 1];
	material3.uniforms.materialEmissive = [1, 1, 1, 1];
	material3.uniforms.useBWTransparency = true;
	material3.uniforms.discardThreshold = 0.5;

	// create text component with an initial text
	var textComponent = new TextComponent('ABCDEFGHIJKLMNOPQRSTUVXYZ\nabcdefghijklmnopqrstuvxyz\n0123456789');
	world.createEntity(material1, textComponent, [0, 6, 0]).addToWorld();

	textComponent = new TextComponent('ABCDEFGHIJKLMNOPQRSTUVXYZ\nabcdefghijklmnopqrstuvxyz\n0123456789');
	world.createEntity(material2, textComponent, [0, 2, 0]).addToWorld();

	textComponent = new TextComponent('ABCDEFGHIJKLMNOPQRSTUVXYZ\nabcdefghijklmnopqrstuvxyz\n0123456789');
	world.createEntity(material3, textComponent, [0, -2, 0]).addToWorld();

	textComponent = new TextComponent('ABCDEFGHIJKLMNOPQRSTUVXYZ\nabcdefghijklmnopqrstuvxyz\n0123456789');
	var textEntity = world.createEntity(material3, textComponent, [0, -6, 0]).addToWorld();

	// change text
	var text = 'The quick brown fox\njumps over\nthe lazy dog ';
	var counter = 0;
	setInterval(function () {
		counter++;
		if (counter > text.length) { counter = 1; }

		textEntity.textComponent.setText(text.substr(0, counter));
	}, 100);

	V.process();
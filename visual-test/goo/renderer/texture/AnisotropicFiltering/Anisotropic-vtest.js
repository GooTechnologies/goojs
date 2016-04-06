
	goo.V.attachToGlobal();

	V.describe([
		'Half of the visible surface has a texture with anisotropic filtering on and the other half without. The effect is most visible when the surface is viewed at a low angle.'
	].join('\n'));

	var resourcePath = '../../../../resources/';

	function createBoxEntity(anisotropy) {
		var meshData = new Box(100, 1, 100, 200, 200);
		var material = new Material(ShaderLib.texturedLit);
		var entity = world.createEntity(meshData, material);

		textureCreator.loadTexture2D(resourcePath + 'font.png', { anisotropy: anisotropy }).then(function (texture) {
			material.setTexture('DIFFUSE_MAP', texture);
		});

		return entity;
	}

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	var textureCreator = new TextureCreator();

	var boxEntity = createBoxEntity();
	boxEntity.set([-50, -0.5, 0]).addToWorld();

	boxEntity = createBoxEntity(Capabilities.maxAnisotropy);
	boxEntity.set([50, -0.5, 0]).addToWorld();

	V.addLights();

	V.addOrbitCamera(new Vector3(10, Math.PI / 2, 0), new Vector3(0, 0.5, 0));

	V.process();
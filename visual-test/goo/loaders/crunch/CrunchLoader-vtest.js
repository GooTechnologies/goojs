
	goo.V.attachToGlobal();

	V.describe('The cubes\' textures are compressed using the crunch algorithm');

	var resourcePath = '../../../resources';

	function createBox(size, x, y, textureUrl, goo) {
		var meshData = new Box(size, size, size, 1, 1);

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(ShaderLib.texturedLit, 'BoxShader');
		new TextureCreator({
			verticalFlip : true
		}).loadTexture2D(resourcePath + textureUrl).then(function (texture) {
			material.setTexture('DIFFUSE_MAP', texture);
		}, function (err) {
			console.error(err);
		});

		gooRunner.world.createEntity(meshData, material, [x, y, 0]).addToWorld();
	}

	// Create typical goo application
	var gooRunner = V.initGoo();
	document.body.appendChild(gooRunner.renderer.domElement);

	V.addOrbitCamera();

	// Setup light
	var light = new PointLight();
	var entity = gooRunner.world.createEntity('Light1');
	entity.setComponent(new LightComponent(light));
	var transformComponent = entity.transformComponent;
	transformComponent.transform.translation.x = 80;
	transformComponent.transform.translation.y = 50;
	transformComponent.transform.translation.z = 80;
	entity.addToWorld();

	createBox(10, -10, 10, '/Pot_Diffuse.dds', goo);
	createBox(10, 10, 10, '/Pot_Diffuse.crn', goo);
	createBox(10, -10, -10, '/collectedBottles_diffuse_1024.dds', goo);
	createBox(10, 10, -10, '/collectedBottles_diffuse_1024.crn', goo);

	V.process();

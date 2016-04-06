
	goo.V.attachToGlobal();

	V.describe([
		'Tests that WebCam texture works. Should display a sphere the webcam content on it.'
	].join('\n'));

	var gooRunner = V.initGoo();

	function createSphereEntity(texture) {
		var meshData = new Sphere(32, 32, 3);
		var material = new Material(ShaderLib.textured);

		if (texture) {
			material.setTexture('DIFFUSE_MAP', texture);
		}

		var entity = gooRunner.world.createEntity(meshData, material);

		return entity.addToWorld();
	}

	new TextureCreator().loadTextureWebCam().then(function (texture) {
		createSphereEntity(texture);
	}, function (err) {
		createSphereEntity();
		console.error('Error loading webcam texture:', err);
	});

	V.addLights();

	V.addOrbitCamera(new Vector3(10, Math.PI / 2, 0), new Vector3(0, 0, 0));

	V.process();
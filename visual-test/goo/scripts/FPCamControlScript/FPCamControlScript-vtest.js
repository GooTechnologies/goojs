
	goo.V.attachToGlobal();

	var gooRunner = V.initGoo();

	V.addLights();

	V.addColoredSpheres();

	// add camera
	var camera = new Camera();
	var cameraEntity = gooRunner.world.createEntity(camera, 'CameraEntity', [0, 0, 20]).lookAt([0, 0, 0]).addToWorld();

	// camera control set up
	var scripts = new ScriptComponent();

	var wasdScript = Scripts.create('WASD', {
		domElement: gooRunner.renderer.domElement,
		walkSpeed: 25.0,
		crawlSpeed: 10.0
	});

	var fpScript = Scripts.create('MouseLookScript', {
		domElement: gooRunner.renderer.domElement,
		maxAscent: 89,
		minAscent: -89,
		speed: 0.5,
		button: 'None'
	});

	scripts.scripts.push(wasdScript, fpScript);

	cameraEntity.setComponent(scripts);
});
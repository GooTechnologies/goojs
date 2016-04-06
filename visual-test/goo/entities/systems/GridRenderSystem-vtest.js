goo.V.attachToGlobal();

	V.describe('GridRenderSystem Test');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	var gridRenderSystem = new GridRenderSystem();
	gooRunner.renderSystems.push(gridRenderSystem);
	world.setSystem(gridRenderSystem);

	V.addLights();

	document.body.addEventListener('keypress', function (e) {
		switch (e.keyCode) {
			case 49:
				break;
			case 50:
				break;
			case 51:
				break;
		}
	});

	// camera 1 - spinning
	// var cameraEntity = V.addOrbitCamera(new Vector3(25, 0, 0));
	// cameraEntity.cameraComponent.camera.setFrustumPerspective(null, null, 1, 10000);

	// add camera
	var camera = new Camera(undefined, undefined, 1, 10000);
	var cameraEntity = gooRunner.world.createEntity(camera, 'CameraEntity', [0, 10, 20]).lookAt([0, 0, 0]).addToWorld();

	// camera control set up
	var scripts = new ScriptComponent();
	var wasdScript = Scripts.create('WASD', {
		domElement: gooRunner.renderer.domElement,
		walkSpeed: 1000,
		crawlSpeed: 20
	});

	// WASD control script to move around
	scripts.scripts.push(wasdScript);

	// the FPCam script itself that locks the pointer and moves the camera
	var fpScript = Scripts.create('MouseLookScript', {
		domElement: gooRunner.renderer.domElement
	});
	scripts.scripts.push(fpScript);

	cameraEntity.setComponent(scripts);

	world.createEntity('Box', new Box(20, 0.1, 20), new Material(ShaderLib.simpleLit)).addToWorld();
	world.createEntity('Sphere', new Sphere(8, 8, 1), new Material(ShaderLib.simpleLit)).addToWorld();

	V.process();
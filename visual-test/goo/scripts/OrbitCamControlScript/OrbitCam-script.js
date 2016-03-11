
	'use strict';

	var gooRunner = V.initGoo();

	V.addLights();

	V.addColoredSpheres();

	// add camera
	var camera = new Camera();
	var cameraEntity = gooRunner.world.createEntity(camera, 'CameraEntity', [0, 0, 20]).lookAt([0, 0, 0]).addToWorld();

	// camera control set up
	var scripts = new ScriptComponent();

	var wasdScript = Scripts.create(OrbitCamControlScript, {
		domElement: gooRunner.renderer.domElement,
		lookAtDistance: 20
	});

	scripts.scripts.push(wasdScript);

	cameraEntity.setComponent(scripts);
});
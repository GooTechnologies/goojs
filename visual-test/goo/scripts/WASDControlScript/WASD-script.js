
	'use strict';

	//! schteppe: Already covered in other tests. Delete?

	function WasdControlScriptDemo() {
		var gooRunner = V.initGoo();

		V.addLights();

		V.addColoredSpheres();

		// add camera
		var camera = new Camera();
		var cameraEntity = gooRunner.world.createEntity(camera, 'CameraEntity', [0, 0, 20]).lookAt([0, 0, 0]).addToWorld();

		// camera control set up
		var scripts = new ScriptComponent();
		var wasdScript = Scripts.create('WASD', {
			domElement: gooRunner.renderer.domElement
		});

		// WASD control script to move around
		scripts.scripts.push(wasdScript);

		// the FPCam script itself that locks the pointer and moves the camera
		var fpScript = Scripts.create('MouseLookScript', {
			domElement: gooRunner.renderer.domElement
		});
		scripts.scripts.push(fpScript);

		cameraEntity.setComponent(scripts);
	}

	WasdControlScriptDemo();
});
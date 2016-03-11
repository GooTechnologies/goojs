
	goo.V.attachToGlobal();

	function pickAndRotateScriptDemo() {
		var gooRunner = V.initGoo();

		V.addLights();

		V.addColoredBoxes();

		// add camera
		var camera = new Camera();
		var cameraEntity = gooRunner.world.createEntity(camera, 'CameraEntity', [0, 0, 20]).lookAt([0, 0, 0]).addToWorld();

		// camera control set up
		var scripts = new ScriptComponent();

		// WASD control script to move around
		scripts.scripts.push(Scripts.create('WASD', {
			domElement: gooRunner.renderer.domElement,
			walkSpeed: 25.0,
			crawlSpeed: 10.0
		}));

		var pickAndRotateScript = Scripts.create('PickAndRotateScript');
		scripts.scripts.push(pickAndRotateScript);

		cameraEntity.setComponent(scripts);
	}

	pickAndRotateScriptDemo();
});
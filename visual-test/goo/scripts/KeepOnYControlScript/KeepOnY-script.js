
	'use strict';


	var keepOnYControlScript = function () {
		var externals = {
			name: 'KeepOnY',
			description: 'Locks the entity on a plane parallel to the ground',
			parameters: [{
				key: 'y',
				name: 'Y',
				'default': 0,
				min: 0,
				max: 10,
				type: 'float',
				control: 'slider'
			}]
		};

		var entity;

		function setup(parameters, env) {
			ScriptUtils.fillDefaultValues(parameters, externals.parameters);
			entity = env.entity;
		}

		function update(parameters) {
			entity.transformComponent.transform.translation.y = parameters.y;
		}

		return {
			setup: setup,
			update: update,
			externals: externals
		};
	};

	function keepOnYControlScriptDemo() {
		var gooRunner = V.initGoo();

		V.addLights();

		V.addColoredSpheres();

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

		// the FPCam script itself that locks the pointer and moves the camera
		var fpScript = Scripts.create('MouseLookScript');
		scripts.scripts.push(fpScript);

		var keepOnYScript = keepOnYControlScript();
		keepOnYScript.parameters = {};
		scripts.scripts.push(keepOnYScript);

		cameraEntity.setComponent(scripts);
	}

	keepOnYControlScriptDemo();
});
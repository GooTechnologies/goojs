require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'goo/scripts/WASDControlScript',
	'goo/scripts/FPCamControlScript',
	'goo/scripts/newwave/FPCamControlScript',
	'goo/scripts/ScriptUtils',
	'lib/V'
], function (
	GooRunner,
	Material,
	ShaderLib,
	Camera,
	CameraComponent,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	PointLight,
	LightComponent,
	WASDControlScript,
	FPCamControlScript,
	NewWaveFPCamControlScript,
	ScriptUtils,
	V
	) {
	'use strict';


	var keepOnYControlScript = function () {
		var externals = {
			name: 'KeepOnY',
			description: 'Locks the entity on a plane parallel to the ground',
			parameters: [{
				key: 'y',
				'default': 0,
				min: 0,
				max: 10,
				type: 'float',
				control: 'slider'
			}]
		};

		var entity;

		function setup(parameters, env) {
			ScriptUtils.fillDefaultValues(parameters, external.parameters);
			entity = env.getEntity();
		}

		function update(parameters, env) {
			entity.transformComponent.transform.translation.y = parameters.y;
		}

		return {
			setup: setup,
			update: update,
			externals: externals
		};
	};

	function keepOnYControlScriptDemo() {
		var goo = V.initGoo();

		V.addLights();

		V.addColoredSpheres();

		// add camera
		var camera = new Camera();
		var cameraEntity = goo.world.createEntity(camera, 'CameraEntity', [0, 0, 20]).lookAt([0, 0, 0]).addToWorld();

		// camera control set up
		var scripts = new ScriptComponent();

		// WASD control script to move around
		scripts.scripts.push(new WASDControlScript({
			domElement: goo.renderer.domElement,
			walkSpeed: 25.0,
			crawlSpeed: 10.0
		}));

		// the FPCam script itself that locks the pointer and moves the camera
		var fpScript = NewWaveFPCamControlScript();
		fpScript.parameters = {
			domElement: goo.renderer.domElement
		};
		scripts.scripts.push(fpScript);

		var keepOnYScript = keepOnYControlScript();
		keepOnYScript.parameters = {};
		scripts.scripts.push(keepOnYScript);

		cameraEntity.setComponent(scripts);
	}

	keepOnYControlScriptDemo();
});
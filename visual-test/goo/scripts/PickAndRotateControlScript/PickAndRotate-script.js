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
	'goo/scripts/ScriptUtils',
	'goo/math/Vector',
	'goo/scripts/Scripts',
	'lib/V',
	'goo/scriptpack/ScriptRegister'
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
	ScriptUtils,
	Vector,
	Scripts,
	V
	/*ScriptRegister*/
	) {
	'use strict';

	function pickAndRotateScriptDemo() {
		var goo = V.initGoo();

		V.addLights();

		V.addColoredBoxes();

		// add camera
		var camera = new Camera();
		var cameraEntity = goo.world.createEntity(camera, 'CameraEntity', [0, 0, 20]).lookAt([0, 0, 0]).addToWorld();

		// camera control set up
		var scripts = new ScriptComponent();

		// WASD control script to move around
		scripts.scripts.push(Scripts.create('WASD', {
			domElement: goo.renderer.domElement,
			walkSpeed: 25.0,
			crawlSpeed: 10.0
		}));

		var pickAndRotateScript = Scripts.create('PickAndRotateScript');
		scripts.scripts.push(pickAndRotateScript);

		cameraEntity.setComponent(scripts);
	}

	pickAndRotateScriptDemo();
});
require.config({
	paths: {
		"goo": "../../../src/goo"
	}
});

require([
	'goo/entities/GooRunner',
	'goo/loaders/DynamicLoader',
	'goo/statemachine/FSMSystem',
	'goo/util/Skybox',
	'goo/renderer/Camera',
	'goo/math/Vector3',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/ScriptComponent',
	'goo/scripts/OrbitCamControlScript'
], function (
	GooRunner,
	DynamicLoader,
	FSMSystem,
	Skybox,
	Camera,
	Vector3,
	CameraComponent,
	ScriptComponent,
	OrbitCamControlScript
	) {
	'use strict';

	function addCamera(goo) {
		var camera = new Camera(45, 1, 1, 1000);

		var cameraEntity = goo.world.createEntity("UserCameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 3);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);

		var cameraComponent = new CameraComponent(camera);
		cameraComponent.isMain = true;
		cameraEntity.setComponent(cameraComponent);

		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(25, Math.PI / 4, 0)
		}));
		cameraEntity.setComponent(scripts);

		cameraEntity.addToWorld();

		return camera;
	}

	function sceneHandlerDemo(goo) {
		var loader = new DynamicLoader({
			world: goo.world,
			rootPath: './project/'
		});

		loader.load('test.project').then(function(v) {
			console.log('Success!');
			console.log(v);
			window.goo = goo;
		}).then(null, function(e) {
			console.error('Failed to load scene: ' + e);
		});


		addCamera(goo);
		//addSkyBox(goo);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		sceneHandlerDemo(goo);
	}

	init();
});

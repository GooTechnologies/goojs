require.config({
	baseUrl: "./",
	paths: {
		'goo': '../src/goo',
		'goo/lib': '../lib'
	}
});
require([
	'goo/entities/GooRunner',
	'goo/math/Vector3',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'goo/entities/components/ScriptComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/loaders/Loader',
	'goo/loaders/SceneLoader'

], function(
	GooRunner,
	Vector3,
	Camera,
	CameraComponent,
	PointLight,
	LightComponent,
	ScriptComponent,
	OrbitCamControlScript,
	Loader,
	SceneLoader

) {
	"use strict";
	var resourcePath = "../converter/latest/";

	function init() {
		// GooRunner
		var goo = new GooRunner({
			showStats: true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		// Camera
		var camera = new Camera(45, 1, 1, 1000);

		var cameraEntity = goo.world.createEntity('CameraEntity');
		cameraEntity.transformComponent.transform.translation.set(0, 20, 150);
		cameraEntity.transformComponent.transform.lookAt(
			new Vector3(0, 0, 0), Vector3.UNIT_Y);

		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		// Camera control
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			baseDistance : 150,
			spherical : new Vector3(150, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);

		// Light
		var light = new PointLight();
		var entity = goo.world.createEntity('Light');
		entity.setComponent(new LightComponent(light));
		entity.transformComponent.transform.translation.set(80, 50, 80);
		entity.addToWorld();

		// Creating loader
		var loader = new Loader({
			rootPath: resourcePath
		});
		var sceneLoader = new SceneLoader({
			loader: loader,
			world: goo.world
		});

		// Loading Megan
		sceneLoader.load('megan.scene.json').then(function(payload) {
			console.log(payload);
		},
		function(err) {
			console.log('error:',err);
		});

	}


	init();
});
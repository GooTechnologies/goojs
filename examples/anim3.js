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
	'goo/loaders/Loader',
	'goo/loaders/SceneLoader'

], function(
	GooRunner,
	Vector3,
	Camera,
	CameraComponent,
	PointLight,
	LightComponent,
	Loader,
	SceneLoader

) {
	"use strict";
	var resourcePath = "../converter/new/";

	function init() {
		var goo = new GooRunner({
			showStats: true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var camera = new Camera(45, 1, 1, 1000);

		var cameraEntity = goo.world.createEntity('CameraEntity');
		cameraEntity.transformComponent.transform.translation.set(0, 20, 150);
		cameraEntity.transformComponent.transform.lookAt(
			new Vector3(0, 0, 0), Vector3.UNIT_Y);

		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		var light = new PointLight();
		var entity = goo.world.createEntity('Light');
		entity.setComponent(new LightComponent(light));
		entity.transformComponent.transform.translation.set(80, 50, 80);
		entity.addToWorld();

		var loader = new Loader({
			rootPath: resourcePath
		});
		var sceneLoader = new SceneLoader({
			loader: loader,
			world: goo.world
		});

		sceneLoader.load('megan.scene.json').then(function(payload) {
			console.log(payload);
		}, function(msg) {
			console.log(msg);
		});

	}


	init();
});
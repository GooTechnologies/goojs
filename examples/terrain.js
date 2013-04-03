require.config({
	baseUrl: "./",
	paths: {
		goo: "../src/goo",
		'goo/lib': '../lib'
	}
});
require([
	'goo/entities/GooRunner',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/addons/terrain/Terrain'
], function(
	GooRunner,
	ScriptComponent,
	Camera,
	CameraComponent,
	OrbitCamControlScript,
	Vector3,
	Terrain
) {
	"use strict";

	function init() {
		var goo = new GooRunner({
			showStats: true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var camera = new Camera(45, 1, 1, 10000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement: goo.renderer.domElement,
			spherical: new Vector3(500, Math.PI / 2, 0),
			maxZoomDistance: 10000
		}));
		cameraEntity.setComponent(scripts);
		cameraEntity.addToWorld();

		var terrain = new Terrain(goo.world);
	}

	init();
});
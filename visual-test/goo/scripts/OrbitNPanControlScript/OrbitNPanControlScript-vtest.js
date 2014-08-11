require([
	'goo/renderer/Camera',
	'goo/entities/components/ScriptComponent',
	'goo/scripts/Scripts',
	'goo/math/Vector3',
	'lib/V',
	'goo/scriptpack/ScriptRegister'
], function (
	Camera,
	ScriptComponent,
	Scripts,
	Vector3,
	V
	/* ScriptRegister */
	) {
	'use strict';

	var goo = V.initGoo();

	V.addLights();

	V.addColoredBoxes();

	// add camera
	var camera = new Camera();
	var cameraEntity = goo.world.createEntity(camera, 'CameraEntity').addToWorld();

	var script = Scripts.create('OrbitNPanControlScript', {
		// Orbit
		dragButton: 'Right',
		lookAtDistance: null,
		spherical: [30, 60, 5],
		whenUsed : true,
		orbitSpeed : 0.005,
		zoomSpeed : 1,
		inertia: 0.9,
		smoothness: 0.4,
		drag : 0,
		minZoomDistance : 0.001,
		maxZoomDistance : 1000,
		minAscent : -89,
		maxAscent : 89,
		clampAzimuth : false,
		minAzimuth : 90,
		maxAzimuth : 270,
		lookAtPoint : [0, 0, 0],

		// Pan
		panButton: 'Middle',
		panSpeed : 0.005
	});

	// camera control set up
	var scriptComponent = new ScriptComponent();
	scriptComponent.scripts.push(script);

	cameraEntity.setComponent(scriptComponent);
});
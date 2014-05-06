require([
	'goo/entities/GooRunner',
	'goo/renderer/Camera',
	'goo/entities/components/ScriptComponent',
	'goo/scripts/WASDScript',
	'goo/scripts/FPCamControlScript',
	'lib/V',
	'goo/scripts/Scripts'
], function (
	GooRunner,
	Camera,
	ScriptComponent,
	WASDControlScript,
	FPCamControlScript,
	V,
	Scripts
) {
	'use strict';

	var goo = V.initGoo();

	V.addLights();

	V.addColoredSpheres();

	// add camera
	var camera = new Camera();
	var cameraEntity = goo.world.createEntity(camera, 'CameraEntity', [0, 0, 20]).lookAt([0, 0, 0]).addToWorld();

	// camera control set up
	var scripts = new ScriptComponent();

	var wasdScript = Scripts.create('OrbitCamControlScript', {
		domElement: goo.renderer.domElement,
	});

	scripts.scripts.push(wasdScript);

	cameraEntity.setComponent(scripts);
});
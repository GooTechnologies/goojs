require([
	'goo/entities/GooRunner',
	'goo/renderer/Camera',
	'goo/entities/components/ScriptComponent',
	'lib/V',
	'goo/scripts/ScriptUtils',
	'goo/scripts/Scripts',
	'goo/scriptpack/ScriptRegister'
], function (
	GooRunner,
	Camera,
	ScriptComponent,
	V,
	ScriptUtils,
	Scripts
	/*ScriptRegister*/
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

	var wasdScript = Scripts.create('WASD', {
		domElement: goo.renderer.domElement,
		walkSpeed: 25.0,
		crawlSpeed: 10.0
	});

	var fpScript = Scripts.create('MouseLookScript', {
		domElement: goo.renderer.domElement,
		maxAscent: 89,
		minAscent: -89,
		speed: 0.5,
		button: 'None'
	});

	scripts.scripts.push(wasdScript, fpScript);

	cameraEntity.setComponent(scripts);
});
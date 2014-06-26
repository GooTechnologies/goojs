require([
	'goo/entities/GooRunner',
	'goo/renderer/Camera',
	'goo/entities/components/ScriptComponent',
	'lib/V',
	'goo/scripts/Scripts',
	'goo/scriptpack/LensFlareScript'
], function (
	GooRunner,
	Camera,
	ScriptComponent,
	V,
	Scripts,
	LensFlareScript
) {
	'use strict';

	var goo = V.initGoo();

	V.addLights();

	var sphereEntity = V.addColoredSpheres().first();

	// add camera
	V.addOrbitCamera();

	// camera control set up
	var scripts = new ScriptComponent();

	var lensFlareScript = Scripts.create(LensFlareScript, {
		domElement: goo.renderer.domElement,
		edgeDampen: 1
	});

	scripts.scripts.push(lensFlareScript);

	sphereEntity.setComponent(scripts);
});
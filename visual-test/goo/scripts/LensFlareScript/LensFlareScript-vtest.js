
	goo.V.attachToGlobal();

	var gooRunner = V.initGoo();

	V.addLights();

	var sphereEntity = V.addColoredSpheres().first();

	// add camera
	V.addOrbitCamera();

	// camera control set up
	var scripts = new ScriptComponent();

	var lensFlareScript = Scripts.create(LensFlareScript, {
		domElement: gooRunner.renderer.domElement,
		edgeDampen: 1
	});

	scripts.scripts.push(lensFlareScript);

	sphereEntity.setComponent(scripts);
});
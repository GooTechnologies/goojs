goo.V.attachToGlobal();

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	world.setSystem(new ParticleSystemSystem());

	var entity = world.createEntity([0, 0, 0], new ParticleSystemComponent({
		paused: true
	})).addToWorld();

	setTimeout(function(){
		entity.particleSystemComponent.play();
	}, 2000);

	V.addOrbitCamera(new Vector3(40, 0, Math.PI / 4));
	gooRunner.renderer.setClearColor(0, 0, 0, 1);
	V.process();
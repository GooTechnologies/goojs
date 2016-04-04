goo.V.attachToGlobal();

	V.describe('Cloning camera components');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	var debugRenderSystem = new DebugRenderSystem();
	debugRenderSystem.doRender.CameraComponent = true;
	gooRunner.renderSystems.push(debugRenderSystem);
	world.setSystem(debugRenderSystem);

	V.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));
	V.addLights();


	var originalCameraComponent = new CameraComponent(new Camera());

	var clonedCameraComponent1 = originalCameraComponent.clone();
	clonedCameraComponent1.camera.aspect = 0.2;

	var clonedCameraComponent2 = originalCameraComponent.clone();
	clonedCameraComponent2.camera.setFrustumPerspective(10, 2, 10, 1);

	world.createEntity(clonedCameraComponent1, [-2, 0, 0]).addToWorld();
	world.createEntity(originalCameraComponent, [ 0, 0, 0]).addToWorld();
	world.createEntity(clonedCameraComponent2, [ 2, 0, 0]).addToWorld();

	V.process();
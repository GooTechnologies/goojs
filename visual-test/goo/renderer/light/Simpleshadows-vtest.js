
	goo.V.attachToGlobal();

	V.describe('Simple shadow test');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	var debugRenderSystem = new DebugRenderSystem();
	debugRenderSystem.doRender.LightComponent = true;
	gooRunner.renderSystems.push(debugRenderSystem);
	world.setSystem(debugRenderSystem);

	V.addShapes(1, new Sphere(15, 15, 1)).each(function (sphere) {
		sphere.meshRendererComponent.castShadows = true;
	});
	var boxEntity = gooRunner.world.createEntity(
		new Box(30, 30, 0.5),
		V.getColoredMaterial(1, 1, 1, 1),
		[0, 0, -1]
	).addToWorld();
	boxEntity.meshRendererComponent.castShadows = false;

	var directionalLight = new DirectionalLight(new Vector3(0.1, 1, 0.1));
	directionalLight.intensity = 0.25;
	directionalLight.shadowCaster = true;
	directionalLight.shadowSettings.size = 5;
	directionalLight.shadowSettings.resolution = [128, 128];
	directionalLight.shadowSettings.shadowType = 'Basic';
	directionalLight.shadowSettings.shadowOffset = -0.003;
	var directionalLightEntity = gooRunner.world.createEntity('directionalLight', directionalLight, [0, -5, 3]).addToWorld();
	directionalLightEntity.lookAt(new Vector3(0, 0, 0));

	var spotLight = new SpotLight(new Vector3(1, 0.1, 0.1));
	spotLight.range = 1000;
	spotLight.shadowCaster = true;
	spotLight.shadowSettings.resolution = [128, 128];
	// spotLight.shadowSettings.near = 1;
	// spotLight.shadowSettings.far = 100;
	spotLight.shadowSettings.shadowType = 'Basic';
	spotLight.shadowSettings.shadowOffset = -0.003;
	var spotLightEntity = gooRunner.world.createEntity('spotLight', spotLight, [0, 3, 2]).addToWorld();
	spotLightEntity.lookAt(new Vector3(0, 0, 0));

	var splitListener = function (evt) {
		switch (evt.keyCode) {
			case 49: // 1
				spotLight.shadowSettings.shadowType = 'Basic';
				break;
			case 50: // 2
				spotLight.shadowSettings.shadowType = 'PCF';
				break;
			case 51: // 3
				spotLight.shadowSettings.shadowType = 'VSM';
				break;

			case 52: // 4
				directionalLight.shadowSettings.shadowType = 'Basic';
				break;
			case 53: // 5
				directionalLight.shadowSettings.shadowType = 'PCF';
				break;
			case 54: // 6
				directionalLight.shadowSettings.shadowType = 'VSM';
				break;
			default:
				break;
		}
	};
	document.addEventListener('keydown', splitListener, false);
	document.addEventListener('touchstart', splitListener, false);

	V.addOrbitCamera(new Vector3(25, Math.PI / 3, 0));
	V.process();
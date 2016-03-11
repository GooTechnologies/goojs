
	'use strict';

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
	gooRunner.world.createEntity(
		new Box(30, 30, 0.5),
		V.getColoredMaterial(1, 1, 1, 1),
		[0, 0, -6]
	).addToWorld();

	var directionalLight = new DirectionalLight(new Vector3(0.1, 1, 0.1));
	directionalLight.intensity = 0.25;
	directionalLight.shadowCaster = true;
	directionalLight.shadowSettings.size = 10;
	directionalLight.shadowSettings.shadowType = 'PCF';
	gooRunner.world.createEntity('directionalLight', directionalLight, [0, 0, 5]).addToWorld();

	var spotLight = new SpotLight(new Vector3(1, 0.1, 0.1));
	spotLight.range = 15;
	spotLight.shadowCaster = true;
	spotLight.shadowSettings.shadowType = 'Basic';
	gooRunner.world.createEntity('spotLight', spotLight, [0, 0, 5]).addToWorld();

	V.addOrbitCamera(new Vector3(25, Math.PI / 3, 0));
	V.process();
});
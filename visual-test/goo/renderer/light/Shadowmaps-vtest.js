require([
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/debugpack/systems/DebugRenderSystem',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'lib/V'
], function (
	Vector3,
	PointLight,
	DirectionalLight,
	SpotLight,
	DebugRenderSystem,
	Box,
	Sphere,
	V
) {
	'use strict';

	V.describe('All implemented shadow types');

	function addPointLight() {
		var pointLight = new PointLight(new Vector3(0.9, 0.0, 0.2));
		pointLight.range = 5;
		pointLight.shadowSettings.shadowType = 'PCF';

		goo.world.createEntity('pointLight', pointLight, [0, 0, 3]).addToWorld();


		var pointlightGui = gui.addFolder('Point Light');
		var data = {
			color: [pointLight.color.x * 255, pointLight.color.y * 255, pointLight.color.z * 255]
		};
		var controller = pointlightGui.addColor(data, 'color');
		controller.onChange(function () {
			pointLight.color.seta(data.color).div(255);
			pointLight.changedColor = true;
		});
		var controller = pointlightGui.add(pointLight, 'intensity', 0, 1);
		controller.onChange(function () {
			pointLight.changedProperties = true;
		});
		var controller = pointlightGui.add(pointLight, 'range', 0, 10);
		controller.onChange(function () {
			pointLight.changedProperties = true;
		});
		pointlightGui.add(pointLight, 'shadowCaster');

		pointlightGui.open();
	}

	function addDirectionalLight() {
		var directionalLight = new DirectionalLight(new Vector3(0.2, 0.9, 0.0));
		directionalLight.intensity = 0.05;
		directionalLight.shadowSettings.size = 10;
		directionalLight.shadowSettings.shadowType = 'PCF';

		goo.world.createEntity('directionalLight', directionalLight, [0, -5, 3]).addToWorld();


		var directionallightGui = gui.addFolder('Directional Light');
		var data = {
			color: [directionalLight.color.x * 255, directionalLight.color.y * 255, directionalLight.color.z * 255]
		};
		var controller = directionallightGui.addColor(data, 'color');
		controller.onChange(function () {
			directionalLight.color.seta(data.color).div(255);
			directionalLight.changedColor = true;
		});
		var controller = directionallightGui.add(directionalLight, 'intensity', 0, 1);
		controller.onChange(function () {
			directionalLight.changedProperties = true;
		});
		directionallightGui.add(directionalLight, 'shadowCaster');

		directionallightGui.open();
	}

	var ind = 0;
	function addSpotLight() {
		var spotLight = new SpotLight(new Vector3(0.2, 0.4, 1.0));
		spotLight.angle = 35;
		spotLight.penumbra = 0;
		spotLight.range = 20;
		spotLight.shadowSettings.shadowType = 'PCF';

		var spotLightEntity = goo.world.createEntity('spotLight', spotLight, [0, 5, 5]).addToWorld();


		var spotLightGui = gui.addFolder('Spot Light' + ind++);
		var data = {
			color: [spotLight.color.x * 255, spotLight.color.y * 255, spotLight.color.z * 255]
		};
		var controller = spotLightGui.addColor(data, 'color');
		controller.onChange(function () {
			spotLight.color.seta(data.color).div(255);
			spotLight.changedColor = true;
		});
		var controller = spotLightGui.add(spotLight, 'angle', 0, 90);
		controller.onChange(function () {
			spotLight.changedProperties = true;
		});
		var controller = spotLightGui.add(spotLight, 'penumbra', 0, 90);
		controller.onChange(function () {
			spotLight.changedProperties = true;
		});
		var controller = spotLightGui.add(spotLight, 'intensity', 0, 2);
		controller.onChange(function () {
			spotLight.changedProperties = true;
		});
		var controller = spotLightGui.add(spotLight, 'range', 0, 30);
		controller.onChange(function () {
			spotLight.changedProperties = true;
		});
		spotLightGui.add(spotLight, 'shadowCaster');

		spotLightGui.open();

		return spotLightEntity;
	}

	var gui = new window.dat.GUI();
	var goo = V.initGoo();
	var world = goo.world;

	var debugRenderSystem = new DebugRenderSystem();
	debugRenderSystem.doRender.LightComponent = true;
	goo.renderSystems.push(debugRenderSystem);
	world.setSystem(debugRenderSystem);

	// add some spheres to cast the light on
	V.addShapes(5, new Sphere(32, 32, 0.5)).each(function (sphere) {
		sphere.meshRendererComponent.castShadows = true;
	});

	var plane = goo.world.createEntity(
		new Box(30, 30, 0.5),
		V.getColoredMaterial(1, 1, 1, 1),
		[0, 0, -6]
	).addToWorld();

	gui.add(plane.meshRendererComponent, 'receiveShadows');

	addPointLight(goo);
	addDirectionalLight(goo);
	addSpotLight(goo);

	addSpotLight(goo)
		.set([3, -4, 5])
		.lookAt(Vector3.ZERO, Vector3.UNIT_Y);

	// camera
	V.addOrbitCamera(new Vector3(25, Math.PI / 3, 0));

	V.process();
});
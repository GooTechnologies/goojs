require([
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/entities/components/LightComponent',
	'goo/debugpack/systems/DebugRenderSystem',
	'lib/V'
], function(
	Sphere,
	Vector3,
	PointLight,
	DirectionalLight,
	SpotLight,
	LightComponent,
	DebugRenderSystem,
	V
) {
	'use strict';

	V.describe('Shows visual feedback for lights using the DebugRenderSystem\nKeys 1 to 3 switch light on/off');

	var lightsState = {
		pointLightOn: false,
		directionalLightOn: false,
		spotLightOn: false
	};

	function addSpin(entity /*, radiusX, radiusZ, speed, altitude*/ ) {
		var offset = V.rng.nextFloat() * 12;
		entity.set(function(entity) {
			var light = entity.getComponent('LightComponent').light;

			light.color.x = Math.cos(world.time + offset) * 0.5 + 0.5;
			light.color.y = Math.cos(world.time + offset + Math.PI * 2 / 3) * 0.5 + 0.5;
			light.color.z = Math.cos(world.time + offset + Math.PI * 2 / 3 * 2) * 0.5 + 0.5;

			if (light.range !== undefined) {
				light.range = (Math.cos(world.time) * 0.5 + 0.5) * 6 + 2;
			}

			light.changedProperties = true;
			light.changedColor = true;
		});
	}

	function addPointLight() {
		var pointLight = new PointLight(new Vector3(0.9, 0.0, 0.2));
		pointLight.range = 8;

		var pointLightOrbitRadius = 5;
		var pointLightOrbitSpeed = 0.5;
		var pointLightAltitude = 0;

		var pointLightEntity = world.createEntity('pointLight', pointLight, [0, 0, 3]);

		addSpin(pointLightEntity, pointLightOrbitRadius, pointLightOrbitRadius, pointLightOrbitSpeed, pointLightAltitude);
		pointLightEntity.addToWorld();
		world.process();

		lightsState.pointLightOn = true;
	}

	function addDirectionalLight() {
		var directionalLight = new DirectionalLight(new Vector3(0.2, 0.9, 0.0));
		directionalLight.intensity = 0.25;

		var directionalLightOrbitRadius = 0;
		var directionalLightOrbitSpeed = 0.7;
		var directionalLightAltitude = -5;

		var directionalLightEntity = world.createEntity('directionalLight', directionalLight, [0, -5, 3]);

		addSpin(directionalLightEntity, directionalLightOrbitRadius, directionalLightOrbitRadius, directionalLightOrbitSpeed, directionalLightAltitude);
		directionalLightEntity.addToWorld();
		world.process();

		lightsState.directionalLightOn = true;
	}

	function addSpotLight() {
		var spotLight = new SpotLight(new Vector3(0.2, 0.4, 1.0));
		spotLight.angle = 15;
		spotLight.range = 10;
		spotLight.exponent = 0.0;

		var spotLightOrbitRadius = 5;
		var spotLightOrbitSpeed = 0.3;
		var spotLightAltitude = 5;

		var spotLightEntity = world.createEntity('spotLight', spotLight, [0, 5, 5]);

		addSpin(spotLightEntity, spotLightOrbitRadius, spotLightOrbitRadius * 2, spotLightOrbitSpeed, spotLightAltitude);
		spotLightEntity.addToWorld();
		world.process();

		lightsState.spotLightOn = true;
	}

	function removePointLight() {
		world.entityManager.getEntityByName('pointLight').removeFromWorld();
		lightsState.pointLightOn = false;
	}

	function removeDirectionalLight() {
		world.entityManager.getEntityByName('directionalLight').removeFromWorld();
		lightsState.directionalLightOn = false;
	}

	function removeSpotLight() {
		world.entityManager.getEntityByName('spotLight').removeFromWorld();
		lightsState.spotLightOn = false;
	}

	var goo = V.initGoo();
	var world = goo.world;

	var debugRenderSystem = new DebugRenderSystem();
	debugRenderSystem.doRender.CameraComponent = true;
	debugRenderSystem.doRender.LightComponent = true;
	goo.renderSystems.push(debugRenderSystem);
	world.setSystem(debugRenderSystem);

	// add spheres to cast light on
	V.addSpheres();

	addPointLight();
	addDirectionalLight();
	addSpotLight();

	document.body.addEventListener('keypress', function(e) {
		switch (e.keyCode) {
			case 49:
				if (lightsState.spotLightOn) {
					removeSpotLight();
				} else {
					addSpotLight();
				}
				break;
			case 50:
				if (lightsState.pointLightOn) {
					removePointLight();
				} else {
					addPointLight();
				}
				break;
			case 51:
				if (lightsState.directionalLightOn) {
					removeDirectionalLight();
				} else {
					addDirectionalLight();
				}
				break;
		}
	});

	// camera
	V.addOrbitCamera(new Vector3(25, Math.PI / 3, 0));

	V.process();
});
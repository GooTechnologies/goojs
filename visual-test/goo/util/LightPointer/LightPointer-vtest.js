require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/entities/components/LightComponent',
	'goo/debug/LightPointer',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Camera,
	CameraComponent,
	OrbitCamControlScript,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	PointLight,
	DirectionalLight,
	SpotLight,
	LightComponent,
	LightPointer,
	V
	) {
	'use strict';

	var lightsState = {
		pointLightOn: false,
		directionalLightOn: false,
		spotLightOn: false};

	function addSpin(entity, radiusX, radiusZ, speed, altitude) {
		entity.setComponent(new ScriptComponent({
			run: function (entity) {
				entity.setTranslation(
					Math.cos(World.time * speed) * radiusX,
					altitude,
					Math.sin(World.time * speed) * radiusZ
				);
				entity.setRotation(
					0,
					-World.time * speed - Math.PI/4,
					0
				);
			}
		}));
	}

	function addPointLight() {
		var pointLight = new PointLight(new Vector3(0.9, 0.0, 0.2));
		pointLight.range = 8;

		var pointLightOrbitRadius = 5;
		var pointLightOrbitSpeed = 0.5;
		var pointLightAltitude = 0;

		var pointLightEntity = world.createEntity(pointLight, 'pointLight');

		LightPointer.attachPointer(pointLightEntity);

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

		var directionalLightEntity = world.createEntity(directionalLight, 'directionalLight');

		LightPointer.attachPointer(directionalLightEntity);

		addSpin(directionalLightEntity, directionalLightOrbitRadius, directionalLightOrbitRadius, directionalLightOrbitSpeed, directionalLightAltitude);
		directionalLightEntity.addToWorld();
		world.process();

		lightsState.directionalLightOn = true;
	}

	function addSpotLight() {
		var spotLight = new SpotLight(new Vector3(0.2, 0.4, 1.0));
		spotLight.angle = 15;
		spotLight.range = 10;

		var spotLightOrbitRadius = 2;
		var spotLightOrbitSpeed = 0.3;
		var spotLightAltitude = 5;

		var spotLightEntity = world.createEntity(spotLight, 'spotLight');

		LightPointer.attachPointer(spotLightEntity);

		addSpin(spotLightEntity, spotLightOrbitRadius, spotLightOrbitRadius * 2, spotLightOrbitSpeed, spotLightAltitude);
		spotLightEntity.addToWorld();
		world.process();

		lightsState.spotLightOn = true;
	}

	function removePointLight() {
		pointLight.removeFromWorld();
		lightsState.pointLightOn = false;
	}

	function removeDirectionalLight() {
		directionalLight.removeFromWorld();
		lightsState.directionalLightOn = false;
	}

	function removeSpotLight() {
		spotLight.removeFromWorld();
		lightsState.spotLightOn = false;
	}

	var goo = V.initGoo();
	var world = goo.world;

	// add spheres to cast light on
	V.addSpheres();

	var pointLight = addPointLight();
	var directionalLight = addDirectionalLight();
	var spotLight = addSpotLight();

	document.body.addEventListener('keypress', function (e) {
		switch (e.keyCode) {
			case 49:
				if (lightsState.spotLightOn) { removeSpotLight(); }
				else { pointLight = addSpotLight(); }
				break;
			case 50:
				if (lightsState.pointLightOn) { removePointLight(); }
				else { directionalLight = addPointLight(); }
				break;
			case 51:
				if (lightsState.directionalLightOn) { removeDirectionalLight(); }
				else { spotLight = addDirectionalLight(); }
				break;
			default:
				console.log('Keys 1 to 3 switch light on/off');
		}
	});

	V.addOrbitCamera();

	V.process();
});

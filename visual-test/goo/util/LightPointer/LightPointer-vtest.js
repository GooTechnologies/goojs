require([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
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
	'goo/debug/LightPointer'
], function (
	GooRunner,
	World,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
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
	LightPointer
	) {
	'use strict';

	var lightsState = {
		pointLightOn: false,
		directionalLightOn: false,
		spotLightOn: false};

	function addSpin(entity, radiusX, radiusZ, speed, altitude) {
		entity.setComponent(new ScriptComponent({
			run: function (entity) {
				entity.transformComponent.transform.translation.setd(
					Math.cos(World.time * speed) * radiusX,
					altitude,
					Math.sin(World.time * speed) * radiusZ
				);
				entity.transformComponent.transform.setRotationXYZ(
					0,
					-World.time * speed - Math.PI/4,
					0
				);
				entity.transformComponent.setUpdated();
			}
		}));
	}

	function addPointLight(goo) {
		var pointLight = new PointLight();
		pointLight.color.data[0] = 0.9;
		pointLight.color.data[1] = 0.0;
		pointLight.color.data[2] = 0.2;
		pointLight.range = 8;

		var pointLightOrbitRadius = 5;
		var pointLightOrbitSpeed = 0.5;
		var pointLightAltitude = 0;

		var pointLightEntity = goo.world.createEntity('pointLight');
		pointLightEntity.setComponent(new LightComponent(pointLight));

		LightPointer.attachPointer(pointLightEntity);

		addSpin(pointLightEntity, pointLightOrbitRadius, pointLightOrbitRadius, pointLightOrbitSpeed, pointLightAltitude);
		pointLightEntity.addToWorld();
		goo.world.process();

		lightsState.pointLightOn = true;
	}

	function addDirectionalLight(goo) {
		var directionalLight = new DirectionalLight();
		directionalLight.color.data[0] = 0.2;
		directionalLight.color.data[1] = 0.9;
		directionalLight.color.data[2] = 0.0;
		directionalLight.intensity = 0.25;

		var directionalLightOrbitRadius = 0;
		var directionalLightOrbitSpeed = 0.7;
		var directionalLightAltitude = -5;

		var directionalLightEntity = goo.world.createEntity('directionalLight');
		directionalLightEntity.setComponent(new LightComponent(directionalLight));

		LightPointer.attachPointer(directionalLightEntity);

		addSpin(directionalLightEntity, directionalLightOrbitRadius, directionalLightOrbitRadius, directionalLightOrbitSpeed, directionalLightAltitude);
		directionalLightEntity.addToWorld();
		goo.world.process();

		lightsState.directionalLightOn = true;
	}

	function addSpotLight(goo) {
		var spotLight = new SpotLight();
		spotLight.color.data[0] = 0.2;
		spotLight.color.data[1] = 0.4;
		spotLight.color.data[2] = 1.0;
		spotLight.angle = 15;
		spotLight.range = 10;

		var spotLightOrbitRadius = 5;
		var spotLightOrbitSpeed = 0.3;
		var spotLightAltitude = 5;

		var spotLightEntity = goo.world.createEntity('spotLight');
		spotLightEntity.setComponent(new LightComponent(spotLight));

		LightPointer.attachPointer(spotLightEntity);

		addSpin(spotLightEntity, spotLightOrbitRadius, spotLightOrbitRadius * 2, spotLightOrbitSpeed, spotLightAltitude);
		spotLightEntity.addToWorld();
		goo.world.process();

		lightsState.spotLightOn = true;
	}

	function removePointLight(goo) {
		goo.world.entityManager.getEntityByName('pointLight').removeFromWorld();
		lightsState.pointLightOn = false;
	}

	function removeDirectionalLight(goo) {
		goo.world.entityManager.getEntityByName('directionalLight').removeFromWorld();
		lightsState.directionalLightOn = false;
	}

	function removeSpotLight(goo) {
		goo.world.entityManager.getEntityByName('spotLight').removeFromWorld();
		lightsState.spotLightOn = false;
	}

	function lightPointerDemo(goo) {
		// add spheres to cast light on
		var sphereMeshData = ShapeCreator.createSphere(32, 32);

		var sphereMaterial = Material.createMaterial(ShaderLib.simpleLit, 'SphereMaterial');

		var nSpheres = 15;
		for (var i = 0; i < nSpheres; i++) {
			for (var j = 0; j < nSpheres; j++) {
				goo.world.createEntity(sphereMeshData, sphereMaterial, [i - nSpheres/2, j - nSpheres/2, 0]).addToWorld();
			}
		}

		addPointLight(goo);
		addDirectionalLight(goo);
		addSpotLight(goo);

		document.body.addEventListener('keypress', function(e) {
			switch (e.keyCode) {
				case 49:
					if (lightsState.spotLightOn) { removeSpotLight(goo); }
					else { addSpotLight(goo); }
					break;
				case 50:
					if (lightsState.pointLightOn) { removePointLight(goo); }
					else { addPointLight(goo); }
					break;
				case 51:
					if (lightsState.directionalLightOn) { removeDirectionalLight(goo); }
					else { addDirectionalLight(goo); }
					break;
				default:
					console.log('Keys 1 to 3 switch light on/off');
			}
		});

		// camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(20, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		lightPointerDemo(goo);
	}

	init();
});

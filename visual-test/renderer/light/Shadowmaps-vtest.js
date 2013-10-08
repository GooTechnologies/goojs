require([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/EntityUtils',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/entities/components/LightComponent',
	'goo/debug/LightPointer',
	'goo/entities/components/LightDebugComponent'
], function (
	GooRunner,
	World,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	OrbitCamControlScript,
	EntityUtils,
	ScriptComponent,
	MeshData,
	Shader,
	MeshDataComponent,
	MeshRendererComponent,
	Vector3,
	PointLight,
	DirectionalLight,
	SpotLight,
	LightComponent,
	LightPointer,
	LightDebugComponent
	) {
	'use strict';

	var gui = new window.dat.GUI();

	function addPointLight(goo) {
		var pointLight = new PointLight();
		pointLight.color.data[0] = 0.9;
		pointLight.color.data[1] = 0.0;
		pointLight.color.data[2] = 0.2;
		pointLight.range = 5;

		var pointLightEntity = goo.world.createEntity('pointLight');
		pointLightEntity.setComponent(new LightComponent(pointLight));

		pointLightEntity.setComponent(new LightDebugComponent());

		pointLightEntity.transformComponent.transform.translation.setd(0, 0, 3);

		pointLightEntity.addToWorld();

		var pointlightGui = gui.addFolder('Point Light');
		var data = {
			color: [pointLight.color.data[0] * 255, pointLight.color.data[1] * 255, pointLight.color.data[2] * 255]
		};
		var controller = pointlightGui.addColor(data, 'color');
		controller.onChange(function() {
			pointLight.color.seta(data.color).div(255);
			pointLight.changedColor = true;
		});
		var controller = pointlightGui.add(pointLight, 'intensity', 0, 1);
		controller.onChange(function() {
			pointLight.changedProperties = true;
		});
		var controller = pointlightGui.add(pointLight, 'range', 0, 10);
		controller.onChange(function() {
			pointLight.changedProperties = true;
		});
		pointlightGui.add(pointLight, 'shadowCaster');

		pointlightGui.open();
	}

	function addDirectionalLight(goo) {
		var directionalLight = new DirectionalLight();
		directionalLight.color.data[0] = 0.2;
		directionalLight.color.data[1] = 0.9;
		directionalLight.color.data[2] = 0.0;
		directionalLight.intensity = 0.25;
		directionalLight.shadowSettings.size = 10;

		var directionalLightEntity = goo.world.createEntity('directionalLight');
		directionalLightEntity.setComponent(new LightComponent(directionalLight));

		directionalLightEntity.setComponent(new LightDebugComponent());

		directionalLightEntity.transformComponent.transform.translation.setd(0, -5, 3);

		directionalLightEntity.addToWorld();

		var directionallightGui = gui.addFolder('Directional Light');
		var data = {
			color: [directionalLight.color.data[0] * 255, directionalLight.color.data[1] * 255, directionalLight.color.data[2] * 255]
		};
		var controller = directionallightGui.addColor(data, 'color');
		controller.onChange(function() {
			directionalLight.color.seta(data.color).div(255);
			directionalLight.changedColor = true;
		});
		var controller = directionallightGui.add(directionalLight, 'intensity', 0, 1);
		controller.onChange(function() {
			directionalLight.changedProperties = true;
		});
		directionallightGui.add(directionalLight, 'shadowCaster');

		directionallightGui.open();
	}

	var ind = 0;
	function addSpotLight(goo) {
		var spotLight = new SpotLight();
		spotLight.color.data[0] = 0.6;
		spotLight.color.data[1] = 0.8;
		spotLight.color.data[2] = 1.0;
		spotLight.angle = 35;
		spotLight.penumbra = 0;
		spotLight.range = 20;

		var spotLightEntity = goo.world.createEntity('spotLight');
		spotLightEntity.setComponent(new LightComponent(spotLight));

		spotLightEntity.setComponent(new LightDebugComponent());

		spotLightEntity.transformComponent.transform.translation.setd(0, 0, 5);

		spotLightEntity.addToWorld();

		var spotLightGui = gui.addFolder('Spot Light' + ind++);
		var data = {
			color: [spotLight.color.data[0] * 255, spotLight.color.data[1] * 255, spotLight.color.data[2] * 255]
		};
		var controller = spotLightGui.addColor(data, 'color');
		controller.onChange(function() {
			spotLight.color.seta(data.color).div(255);
			spotLight.changedColor = true;
		});
		var controller = spotLightGui.add(spotLight, 'angle', 0, 90);
		controller.onChange(function() {
			spotLight.changedProperties = true;
		});
		var controller = spotLightGui.add(spotLight, 'penumbra', 0, 90);
		controller.onChange(function() {
			spotLight.changedProperties = true;
		});
		var controller = spotLightGui.add(spotLight, 'intensity', 0, 2);
		controller.onChange(function() {
			spotLight.changedProperties = true;
		});
		var controller = spotLightGui.add(spotLight, 'range', 0, 30);
		controller.onChange(function() {
			spotLight.changedProperties = true;
		});
		spotLightGui.add(spotLight, 'shadowCaster');

		spotLightGui.open();

		return spotLightEntity;
	}

	function lightPointerDemo(goo) {
		// add spheres to cast light on
		var sphereMeshData = ShapeCreator.createSphere(16, 16, 0.5);
		var sphereMaterial = Material.createMaterial(ShaderLib.simpleLit, 'SphereMaterial');

		var nSpheres = 5;
		for(var i = 0; i < nSpheres; i++) {
			for(var j = 0; j < nSpheres; j++) {
				var sphereEntity = EntityUtils.createTypicalEntity(goo.world, sphereMeshData);
				sphereEntity.transformComponent.transform.translation.set(i - nSpheres/2, j - nSpheres/2, 0);
				sphereEntity.meshRendererComponent.materials.push(sphereMaterial);
				sphereEntity.meshRendererComponent.castShadows = true;
				sphereEntity.addToWorld();
			}
		}

		var boxMeshData = ShapeCreator.createBox(30, 30, 0.5);
		var boxEntity = EntityUtils.createTypicalEntity(goo.world, boxMeshData);
		boxEntity.transformComponent.transform.translation.set(0, 0, -6);
		boxEntity.meshRendererComponent.materials.push(sphereMaterial);
		boxEntity.addToWorld();

		addPointLight(goo);
		addDirectionalLight(goo);
		addSpotLight(goo);
		var spot = addSpotLight(goo);
		spot.transformComponent.transform.translation.setd(3, -4, 5);
		spot.transformComponent.transform.lookAt(Vector3.ZERO, Vector3.UNIT_Y);

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
		var goo = new GooRunner({
			showStats: true,
			logo: 'bottomleft'
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		lightPointerDemo(goo);
	}

	init();
});

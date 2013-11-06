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
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/entities/components/LightComponent',
	'goo/logic/LogicLayer',
	'goo/logic/LogicNodeTime',
	'goo/logic/LogicNodeSine',
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
	MeshRendererComponent,
	Vector3,
	PointLight,
	DirectionalLight,
	SpotLight,
	LightComponent,
	LogicLayer,
	LogicNodeTime,
	LogicNodeSine,
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

		pointlightGui.open();
		return pointLightEntity;
	}

	function addDirectionalLight(goo) {
		var directionalLight = new DirectionalLight();
		directionalLight.color.data[0] = 0.2;
		directionalLight.color.data[1] = 0.9;
		directionalLight.color.data[2] = 0.0;
		directionalLight.intensity = 0.25;

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

		directionallightGui.open();
		return directionalLightEntity;
	}

	function addSpotLight(goo) {
		var spotLight = new SpotLight();
		spotLight.color.data[0] = 0.2;
		spotLight.color.data[1] = 0.4;
		spotLight.color.data[2] = 1.0;
		spotLight.angle = 25;
		spotLight.range = 10;
		spotLight.penumbra = 5;

		var spotLightEntity = goo.world.createEntity('spotLight');
		spotLightEntity.setComponent(new LightComponent(spotLight));

		spotLightEntity.setComponent(new LightDebugComponent());

		spotLightEntity.transformComponent.transform.translation.setd(0, 5, 5);

		spotLightEntity.addToWorld();
		
		
                		
		

		var spotLightGui = gui.addFolder('Spot Light');
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
		var controller = spotLightGui.add(spotLight, 'intensity', 0, 1);
		controller.onChange(function() {
			spotLight.changedProperties = true;
		});
		var controller = spotLightGui.add(spotLight, 'range', 0, 10);
		controller.onChange(function() {
			spotLight.changedProperties = true;
		});

		spotLightGui.open();
		return spotLightEntity;
	}

	function lightPointerDemo(goo) {
		// add spheres to cast light on
		var sphereMeshData = ShapeCreator.createSphere(32, 32);

		var sphereMaterial = Material.createMaterial(ShaderLib.simpleLit, 'SphereMaterial');

		var nSpheres = 15;
		for(var i = 0; i < nSpheres; i++) {
			for(var j = 0; j < nSpheres; j++) {
				var sphereEntity = EntityUtils.createTypicalEntity(goo.world, sphereMeshData);
				sphereEntity.transformComponent.transform.translation.set(i - nSpheres/2, j - nSpheres/2, 0);
				sphereEntity.meshRendererComponent.materials.push(sphereMaterial);
				sphereEntity.addToWorld();
			}
		}

		var l1 = addPointLight(goo);
		var l2 = addDirectionalLight(goo);
		var l3 = addSpotLight(goo);


		var lbTime = new LogicNodeTime();
		lbTime.addToWorldLogic(goo.world);
		
		var lbSine = new LogicNodeSine();
		lbSine.addToWorldLogic(goo.world);
		
		
		var ll = goo.world.logicLayer;
		ll.connectObjectsWithLogic(lbTime, LogicNodeTime.outPropTime, lbSine, LogicNodeSine.inportPhase);
		ll.connectObjectsWithLogic(lbTime, LogicNodeTime.outEventReached1, lbTime, LogicNodeTime.inEventReset);

		ll.connectObjectsWithLogic(lbSine, LogicNodeSine.outportSine, l1.lightComponent, LightComponent.inportIntensity);
		ll.connectObjectsWithLogic(lbSine, LogicNodeSine.outportSine, l2.lightComponent, LightComponent.inportIntensity);
		ll.connectObjectsWithLogic(lbSine, LogicNodeSine.outportSine, l3.lightComponent, LightComponent.inportIntensity);
		
		/*
		goo.world.connectComponents(entityF.functionGeneratorComponent, FunctionGeneratorComponent.outportSine, l1.lightComponent, LightComponent.inportIntensity);
		goo.world.connectComponents(entityF.functionGeneratorComponent, FunctionGeneratorComponent.outportSine, l2.lightComponent, LightComponent.inportIntensity);
		goo.world.connectComponents(entityF.functionGeneratorComponent, FunctionGeneratorComponent.outportSine, l3.lightComponent, LightComponent.inportIntensity);
		*/
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
			toolMode: true,
			logo: 'bottomleft'
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		lightPointerDemo(goo);
	}

	init();
});

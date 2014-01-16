require.config({
	paths: {
		"goo": "../../../src/goo"
	}
});

require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/entities/EntityUtils',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'goo/scripts/WASDControlScript',
	'goo/scripts/FPCamControlScript'
], function (
	GooRunner,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	EntityUtils,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	PointLight,
	LightComponent,
	WASDControlScript,
	FPCamControlScript
	) {
	'use strict';

	function addSpheres(goo) {
		var sphereMeshData = ShapeCreator.createSphere(32, 32);

		var nSpheres = 15;
		for (var i = 0; i < nSpheres; i++) {
			for (var j = 0; j < nSpheres; j++) {
				var sphereMaterial = Material.createMaterial(ShaderLib.simpleColored, 'SphereMaterial' + i + '_' + j);
				sphereMaterial.uniforms.color = [i / nSpheres, j / nSpheres, 0.3];
				var sphereEntity = EntityUtils.createTypicalEntity(goo.world, sphereMeshData, sphereMaterial);
				sphereEntity.transformComponent.transform.translation.set(i - nSpheres/2, j - nSpheres/2, 0);
				sphereEntity.addToWorld();
			}
		}
	}

	function fpCamControlScriptDemo(goo) {
		// add spheres
		addSpheres(goo);

		// add light
		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.transform.translation.set(0, 100, 0);
		lightEntity.addToWorld();

		// add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 20);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		// camera control set up
		var scripts = new ScriptComponent();

		// WASD control script to move around
		scripts.scripts.push(new WASDControlScript({
			domElement: goo.renderer.domElement,
			walkSpeed: 25.0,
			crawlSpeed: 10.0
		}));

		// the FPCam script itself that locks the pointer and moves the camera
		scripts.scripts.push(new FPCamControlScript({
			domElement: goo.renderer.domElement
		}));

		cameraEntity.setComponent(scripts);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		fpCamControlScriptDemo(goo);
	}

	init();
});

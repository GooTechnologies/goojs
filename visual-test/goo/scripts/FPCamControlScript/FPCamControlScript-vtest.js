require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'goo/scripts/WASDControlScript',
	'goo/scripts/FPCamControlScript',
	'../../lib/V'
], function (
	GooRunner,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	PointLight,
	LightComponent,
	WASDControlScript,
	FPCamControlScript,
	V
	) {
	'use strict';

	var goo = V.initGoo();

	V.addColoredSpheres();

	V.addColoredSpheres();

	V.addLights();

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
});

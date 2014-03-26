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
	'goo/scripts/newwave/FPCamControlScript',
	'lib/V'
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
	NewWaveFPCamControlScript,
	V
	) {
	'use strict';

	var goo = V.initGoo();

	V.addLights();

	V.addColoredSpheres();

	// add camera
	var camera = new Camera();
	var cameraEntity = goo.world.createEntity(camera, 'CameraEntity', [0, 0, 20]).lookAt([0, 0, 0]).addToWorld();

	// camera control set up
	var scripts = new ScriptComponent();

	// WASD control script to move around
	scripts.scripts.push(new WASDControlScript({
		domElement: goo.renderer.domElement,
		walkSpeed: 25.0,
		crawlSpeed: 10.0
	}));

	// the FPCam script itself that locks the pointer and moves the camera
	var fpScript = NewWaveFPCamControlScript();
	fpScript.parameters = { domElement: goo.renderer.domElement };
	scripts.scripts.push(fpScript);

	cameraEntity.setComponent(scripts);
});
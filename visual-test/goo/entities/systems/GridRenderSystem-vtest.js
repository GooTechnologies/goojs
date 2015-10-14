require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/Sphere',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/components/ScriptComponent',
	'goo/math/Vector3',
	'goo/entities/systems/GridRenderSystem',
	'goo/entities/SystemBus',
	'lib/V'
], function(
	Material,
	ShaderLib,
	Camera,
	Sphere,
	CameraComponent,
	OrbitCamControlScript,
	ScriptComponent,
	Vector3,
	GridRenderSystem,
	SystemBus,
	V
) {
	'use strict';

	V.describe('Keys 1, 2 switch main camera\nkey 3 starts/stops the spinning of camera 1');

	var goo = V.initGoo();
	var world = goo.world;

	var gridRenderSystem = new GridRenderSystem();
	gridRenderSystem.surface.materials[0].uniforms.opacity = 0.0;
	goo.renderSystems.push(gridRenderSystem);
	world.setSystem(gridRenderSystem);

	// add spheres to have the cameras view them
	V.addColoredSpheres();

	// add light
	V.addLights();

	document.body.addEventListener('keypress', function(e) {
		switch (e.keyCode) {
			case 49:
				break;
			case 50:
				break;
			case 51:
				break;
		}
	});

	// camera 1 - spinning
	var cameraEntity = V.addOrbitCamera(new Vector3(25, Math.PI / 3, 0));

	V.process();
});
require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/renderer/Camera',
	'goo/debugpack/systems/DebugRenderSystem',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Vector3,
	Camera,
	DebugRenderSystem,
	V
) {
	'use strict';

	V.describe('Cloning lights');

	var goo = V.initGoo();
	var world = goo.world;

	var debugRenderSystem = new DebugRenderSystem();
	debugRenderSystem.doRender.CameraComponent = true;
	goo.renderSystems.push(debugRenderSystem);
	world.setSystem(debugRenderSystem);

	V.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));
	V.addLights();


	var originalCamera = new Camera();

	var clonedCamera1 = originalCamera.clone();
	clonedCamera1.aspect = 0.2;

	var clonedCamera2 = originalCamera.clone();
	clonedCamera2.setFrustumPerspective(10, 2, 10, 1);

	world.createEntity(clonedCamera1, [-2, 0, 0]).addToWorld();
	world.createEntity(originalCamera, [ 0, 0, 0]).addToWorld();
	world.createEntity(clonedCamera2, [ 2, 0, 0]).addToWorld();


	V.process();
});
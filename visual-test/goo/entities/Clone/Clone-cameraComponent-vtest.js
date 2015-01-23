require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/debugpack/systems/DebugRenderSystem',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Vector3,
	Camera,
	CameraComponent,
	DebugRenderSystem,
	V
) {
	'use strict';

	V.describe('Cloning camera components');

	var goo = V.initGoo();
	var world = goo.world;

	var debugRenderSystem = new DebugRenderSystem();
	debugRenderSystem.doRender.CameraComponent = true;
	goo.renderSystems.push(debugRenderSystem);
	world.setSystem(debugRenderSystem);

	V.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));
	V.addLights();


	var originalCameraComponent = new CameraComponent(new Camera());

	var clonedCameraComponent1 = originalCameraComponent.clone();
	clonedCameraComponent1.camera.aspect = 0.2;

	var clonedCameraComponent2 = originalCameraComponent.clone();
	clonedCameraComponent2.camera.setFrustumPerspective(10, 2, 10, 1);

	world.createEntity(clonedCameraComponent1, [-2, 0, 0]).addToWorld();
	world.createEntity(originalCameraComponent, [ 0, 0, 0]).addToWorld();
	world.createEntity(clonedCameraComponent2, [ 2, 0, 0]).addToWorld();


	V.process();
});
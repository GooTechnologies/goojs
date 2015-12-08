require([
	'lib/V',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/debugpack/systems/DebugRenderSystem',
	'goo/math/Vector3'
], function (
	V,
	Material,
	ShaderLib,
	Box,
	DebugRenderSystem,
	Vector3
) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;

	var debugRenderSystem = new DebugRenderSystem();
	debugRenderSystem.doRender.CameraComponent = true;
	debugRenderSystem.doRender.LightComponent = true;
	goo.renderSystems.push(debugRenderSystem);
	world.setSystem(debugRenderSystem);

	V.addOrbitCamera(new Vector3(40, Math.PI / 3, Math.PI / 5));
	V.addOrbitCamera(new Vector3(40, Math.PI / 3, Math.PI / 5));
	V.addLights();

	var material1 = new Material(ShaderLib.uber);

	var material2 = new Material(ShaderLib.uber);
	material2.uniforms.opacity = 0.25;
	material2.renderQueue = 2000;
	material2.blendState.blending = 'CustomBlending';

	var numBoxes = 10;
	var size = 0.7;
	var box = new Box(size, size, size);
	for (var i = 0; i < numBoxes; i++) {
		for (var j = 0; j < numBoxes; j++) {
			for (var k = 0; k < numBoxes; k++) {
				var position = [size * (i - numBoxes / 2) * 1.1, size * (j - numBoxes / 2) * 1.1, size * (k - numBoxes / 2) * 1.1];
				var material = Math.random() < 0.75 ? material1 : material2;
				var entity = world.createEntity(position, box, material);
				entity.addToWorld();
			}
		}
	}
});

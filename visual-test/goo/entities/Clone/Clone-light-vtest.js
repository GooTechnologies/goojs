require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/renderer/light/SpotLight',
	'goo/debugpack/systems/DebugRenderSystem',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Vector3,
	SpotLight,
	DebugRenderSystem,
	V
	) {
	'use strict';

	V.describe('Cloning lights');

	var goo = V.initGoo();
	var world = goo.world;

	var debugRenderSystem = new DebugRenderSystem();
	debugRenderSystem.doRender.LightComponent = true;
	goo.renderSystems.push(debugRenderSystem);
	world.setSystem(debugRenderSystem);

	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));


	world.createEntity(new Box(), new Material(ShaderLib.simpleLit), [-2, 0, 0]).addToWorld();
	world.createEntity(new Box(), new Material(ShaderLib.simpleLit), [ 0, 0, 0]).addToWorld();
	world.createEntity(new Box(), new Material(ShaderLib.simpleLit), [ 2, 0, 0]).addToWorld();


	var originalLight = new SpotLight(new Vector3(1, 0, 0));
	originalLight.range = 10;
	world.createEntity(originalLight, [0, 0, 5]).addToWorld();

	var cloneLight1 = originalLight.clone();
	cloneLight1.color.set(0, 1, 0);
	world.createEntity(cloneLight1, [-2, 0, 5]).addToWorld();

	var cloneLight2 = originalLight.clone();
	cloneLight2.color.set(0, 0, 1);
	world.createEntity(cloneLight2, [ 2, 0, 5]).addToWorld();


	V.process();
});
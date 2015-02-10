require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/renderer/light/SpotLight',
	'goo/entities/components/LightComponent',
	'goo/debugpack/systems/DebugRenderSystem',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Vector3,
	SpotLight,
	LightComponent,
	DebugRenderSystem,
	V
) {
	'use strict';

	V.describe('Cloning light components');

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


	var originalLightComponent = new LightComponent(new SpotLight(new Vector3(1, 0, 0)));
	originalLightComponent.light.range = 10;
	world.createEntity(originalLightComponent, [0, 0, 5]).addToWorld();

	var clonedLightComponent1 = originalLightComponent.clone();
	clonedLightComponent1.light.range = 5;
	clonedLightComponent1.light.color.set(0, 1, 0);
	world.createEntity(clonedLightComponent1, [-2, 0, 5]).addToWorld();

	var clonedLightComponent2 = originalLightComponent.clone();
	clonedLightComponent2.light.angle = 10;
	clonedLightComponent2.light.color.set(0, 0, 1);
	world.createEntity(clonedLightComponent2, [ 2, 0, 5]).addToWorld();


	V.process();
});
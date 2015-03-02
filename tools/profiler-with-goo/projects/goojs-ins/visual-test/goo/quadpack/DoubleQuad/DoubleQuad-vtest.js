require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'goo/quadpack/DoubleQuad',
	'lib/V',
	'goo/debugpack/systems/DebugRenderSystem',
	'goo/renderer/light/PointLight'
], function (
	Material,
	ShaderLib,
	Vector3,
	TextureCreator,
	DoubleQuad,
	V,
	DebugRenderSystem,
	PointLight
	) {
	'use strict';

	V.describe('The double-faced quad');

	var goo = V.initGoo();
	var world = goo.world;

	var debugRenderSystem = new DebugRenderSystem();
	goo.renderSystems.push(debugRenderSystem);
	world.setSystem(debugRenderSystem);

	var material = new Material(ShaderLib.uber);
	material.blendState.blending = 'CustomBlending';	// Needed if the quad has transparency
	material.renderQueue = 2000;
	material.uniforms.discardThreshold = 0.1;
	var texture = new TextureCreator().loadTexture2D('../../../resources/check.png');
	material.setTexture('DIFFUSE_MAP', texture);

	var normalConeMeshData = new DoubleQuad();
	var normalConeEntity = world.createEntity(normalConeMeshData, material).addToWorld();
	V.showNormals(normalConeEntity);

	world.createEntity([0, 0, -10], new PointLight()).addToWorld();
	//V.addLights();

	V.addOrbitCamera(new Vector3(25, Math.PI / 2, 0));

	V.process();
});

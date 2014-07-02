require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'goo/quadpack/DoubleQuad',
	'lib/V',
	'goo/renderer/light/PointLight',
	'goo/debugpack/components/LightDebugComponent',
	'goo/debugpack/systems/LightDebugSystem'
], function (
	Material,
	ShaderLib,
	Vector3,
	TextureCreator,
	DoubleQuad,
	V,
	PointLight,
	LightDebugComponent,
	LightDebugSystem
	) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;

	world.setSystem(new LightDebugSystem());

	var material = new Material(ShaderLib.uber);
	material.blendState.blending = 'CustomBlending';	// Needed if the quad has transparency
	material.renderQueue = 2000;
	material.uniforms.discardThreshold = 0.1;
	var texture = new TextureCreator().loadTexture2D('../../../resources/check.png');
	material.setTexture('DIFFUSE_MAP', texture);

	var normalConeMeshData = new DoubleQuad();
	var normalConeEntity = world.createEntity(normalConeMeshData, material).addToWorld();
	V.showNormals(normalConeEntity);

	world.createEntity(new LightDebugComponent(), [0, 0, -10], new PointLight()).addToWorld();
	//V.addLights();

	V.addOrbitCamera(new Vector3(25, Math.PI / 2, 0));

	V.process();
});

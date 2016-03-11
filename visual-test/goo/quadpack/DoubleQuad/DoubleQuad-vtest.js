
	'use strict';

	V.describe('The double-faced quad');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	var debugRenderSystem = new DebugRenderSystem();
	gooRunner.renderSystems.push(debugRenderSystem);
	world.setSystem(debugRenderSystem);

	var material = new Material(ShaderLib.uber);
	material.blendState.blending = 'CustomBlending';	// Needed if the quad has transparency
	material.renderQueue = 2000;
	material.uniforms.discardThreshold = 0.1;
	new TextureCreator().loadTexture2D('../../../resources/check.png').then(function (texture) {
		material.setTexture('DIFFUSE_MAP', texture);
	});

	var normalConeMeshData = new DoubleQuad();
	var normalConeEntity = world.createEntity(normalConeMeshData, material).addToWorld();
	V.showNormals(normalConeEntity);

	world.createEntity([0, 0, -10], new PointLight()).addToWorld();
	//V.addLights();

	V.addOrbitCamera(new Vector3(25, Math.PI / 2, 0));

	V.process();
});

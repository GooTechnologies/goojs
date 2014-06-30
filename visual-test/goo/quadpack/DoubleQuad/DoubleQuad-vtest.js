require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'goo/quadpack/DoubleQuad',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	TextureCreator,
	DoubleQuad,
	V
	) {
	'use strict';

	V.describe('The double-faced quad');

	var goo = V.initGoo();
	var world = goo.world;

	var material = new Material(ShaderLib.texturedLit);
	var texture = new TextureCreator().loadTexture2D('../../../resources/check.png');
	material.setTexture('DIFFUSE_MAP', texture);

	var normalConeMeshData = new DoubleQuad();
	var normalConeEntity = world.createEntity(normalConeMeshData, material).addToWorld();
	V.showNormals(normalConeEntity);

	V.addLights();

	V.addOrbitCamera(new Vector3(25, Math.PI / 2, 0));

	V.process();
});

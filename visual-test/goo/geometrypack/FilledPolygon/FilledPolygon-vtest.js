require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/geometrypack/FilledPolygon',
	'goo/renderer/TextureCreator',
	'../../goo/lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	FilledPolygon,
	TextureCreator,
	V
	) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;

	var verts = [
		0, 0, 0,
		1, 0, 0,
		1 + 0.1, 1 - 0.1, 0,
		2, 1, 0,
		2, 2, 0,
		0, 2, 0
	];
	var meshData = new FilledPolygon(verts);
	var material = new Material(ShaderLib.texturedLit);
	var texture = new TextureCreator().loadTexture2D('../../goo/resources/check.png');
	material.setTexture('DIFFUSE_MAP', texture);

	world.createEntity(meshData, material).addToWorld();

	V.addLights();

	V.addOrbitCamera();
});

require([
	'lib/V',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3'
], function (
	V,
	Material,
	ShaderLib,
	Box,
	Vector3
) {
	'use strict';

	V.describe('Skeleton Animation Test');

	var goo = V.initGoo();

	var world = goo.world;

	var boxEntity = world.createEntity(new Box(), new Material(ShaderLib.uber));
	boxEntity.addToWorld();

	V.addLights();

	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));

	V.process();
});

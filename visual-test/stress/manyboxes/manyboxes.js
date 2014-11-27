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

	var goo = V.initGoo();
	var world = goo.world;
	V.addOrbitCamera(new Vector3(40, Math.PI / 3, Math.PI / 5));
	V.addLights();

	var numBoxes = 20;
	// var material = V.getColoredMaterial(1, 1, 1, 1);
	var material = new Material(ShaderLib.uber);
	var size = 0.7;
	var box = new Box(size, size, size);
	for (var i = 0; i < numBoxes; i++) {
		for (var j = 0; j < numBoxes; j++) {
			for (var k = 0; k < numBoxes; k++) {
				var position = [size * (i - numBoxes / 2) * 1.1, size * (j - numBoxes / 2) * 1.1, size * (k - numBoxes / 2) * 1.1];
				var entity = world.createEntity(position, box, material);
				entity.addToWorld();
			}
		}
	}
});

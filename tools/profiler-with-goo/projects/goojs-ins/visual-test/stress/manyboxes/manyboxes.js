require([
	'lib/V',
	'goo/shapes/Box',
	'goo/math/Vector3'
], function (
	V,
	Box,
	Vector3
) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;
	V.addOrbitCamera();
	V.addLights();

	var numBoxes = 10;
	var material = V.getColoredMaterial(1, 1, 1, 1);
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

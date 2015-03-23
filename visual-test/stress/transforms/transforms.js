require([
	'lib/V',
	'goo/shapes/Box'
], function (
	V,
	Box
) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;
	V.addOrbitCamera();
	V.addLights();

	var numBoxes = 1000;
	var material = V.getColoredMaterial(1, 1, 1, 1);
	var size = 0.001;
	var box = new Box(size, 30 * size, 30 * size);
	var entities = [];
	var lastEntity;
	for (var i = 0; i < numBoxes; i++) {
		var entity = world.createEntity([i === 0 ? 0 : size * 1.1, 0, 0], box, material);
		entity.addToWorld();

		if (lastEntity) {
			//lastEntity.attachChild(entity);
			entity.attachChild(lastEntity);
		}

		lastEntity = entity;

		entities.push(entity);
	}

	goo.callbacks.push(function () {
		for (var i = 0; i < numBoxes; i++) {
			var entity = entities[i];
			entity.setRotation(0, 0, Math.sin(world.time) / numBoxes * 2);
		}
	});
});

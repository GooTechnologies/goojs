require(['../../../src/goo/Goo'], function() {
	'use strict';

	var engine = new goo.Goo({ domContainer: document.body });
	var scene = engine.getScene();
	scene.createLight({ color: [0, 0, 1] });

	var camera = scene.getCamera();
	camera.position.set(0, 0, 10);

	var anotherLight = goo.createLight({ color: [1, 1, 1] });
	var sphereMesh = new goo.Sphere();
	var sphereMaterial = new goo.Material({ shader: 'texturedLit', textures: { DIFFUSE_MAP: '../../resources/check.png' } });

	scene.add(
		anotherLight,
		new goo.Entity(sphereMesh, sphereMaterial),
		new goo.Entity(sphereMesh, sphereMaterial),
		new goo.Entity(sphereMesh, sphereMaterial),
		new goo.Entity(sphereMesh, sphereMaterial),
		new goo.Entity(sphereMesh, sphereMaterial)
	);

	var entities = scene.get('@renderable');

	engine.start(function (deltaTime, processParameters) {
		var time = processParameters.time * 0.005;
		entities.each(function (entity) {
			entity.setPosition(Math.cos(time) * 2, Math.cos(time * 1.5) * 2, Math.sin(time) * 2);
			time += Math.PI * 0.15;
		});
	});
});
require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/light/PointLight',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'../../lib/V'
], function(
	GooRunner,
	Material,
	ShaderLib,
	PointLight,
	Box,
	Sphere,
	V
) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;

	var box = new Box();
	var sphere = new Sphere(32, 32);
	var material = Material.createMaterial(ShaderLib.simpleLit);
	var light = new PointLight();
	var script = function (entity, tpf) {
		entity.transformComponent.transform.rotation.rotateX(tpf * 2);
		entity.transformComponent.setUpdated();
	};

	var sphereEntity = world.createEntity().set(sphere, material, [2, 0, 0]).addToWorld();
	var lightEntity = world.createEntity().set(light, [0, 1, 0]).addToWorld();
	var spinningEntity = world.createEntity().set(box, material, [-2, 0, 0], script).addToWorld();

	V.addOrbitCamera();
});
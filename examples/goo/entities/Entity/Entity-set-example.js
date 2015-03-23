require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/light/PointLight',
	'goo/renderer/Camera',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/entities/Entity'
], function(
	GooRunner,
	Material,
	ShaderLib,
	PointLight,
	Camera,
	Box,
	Sphere,
	Entity
) {
	'use strict';

	// initialize the engine and attach the rendering canvas to the page
	var goo = new GooRunner();
	goo.renderer.domElement.id = 'goo';
	document.body.appendChild(goo.renderer.domElement);

	var world = goo.world;

	var box = new Box();
	var sphere = new Sphere(32, 32);
	var material = new Material(ShaderLib.simpleLit);
	var light = new PointLight();
	var script = function (entity, tpf) {
		entity.transformComponent.transform.rotation.rotateX(tpf * 2);
		entity.transformComponent.setUpdated();
	};

	var sphereEntity = new Entity(world).set(sphere, material, [2, 0, 0]).addToWorld();
	var lightEntity = new Entity(world).set(light, [0, 1, 0]).addToWorld();
	var spinningEntity = new Entity(world).set(box, material, [-2, 0, 0], script).addToWorld();

	// add a camera
	world.createEntity(new Camera(), [0, 0, 15]).addToWorld();
});
require([
	'lib/V',
	'goo/addons/gamepad/GamepadSystem',
	'goo/addons/gamepad/GamepadComponent',
	'goo/shapes/Box',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/entities/GooRunner',
	'goo/renderer/light/PointLight',
	'goo/renderer/Camera'
], function(
	V,
	GamepadSystem,
	GamepadComponent,
	Box,
	Material,
	ShaderLib,
	Vector3,
	GooRunner,
	PointLight,
	Camera
	) {

	'use strict';

	var goo = new GooRunner();
	goo.renderer.domElement.id = 'goo';
	document.body.appendChild(goo.renderer.domElement);

	var world = goo.world;

	world.setSystem(new GamepadSystem());

	var boxMesh = new Box();
	var material = new Material(ShaderLib.simpleLit);
	var box1 = world.createEntity(boxMesh, material);

	var gamepadComponent = new GamepadComponent();
	gamepadComponent.setLeftStickFunction(function(entity, vec, amount) {
		entity.transformComponent.addTranslation(vec.x * amount, 0, vec.y * amount);
	});
	box1.setComponent(gamepadComponent);
	box1.addToWorld();

	world.createEntity(new PointLight(), [ 100, 100, 100]).addToWorld();
	world.createEntity(new PointLight(), [-100, -100, -100]).addToWorld();
	world.createEntity(new PointLight(), [-100, 100, -100]).addToWorld();

	var camera = new Camera();
	camera.lookAt(Vector3.ZERO, Vector3.UNIT_Y);
	world.createEntity(camera, [0, 2, 10]).addToWorld();

});
require([
	'lib/V',
	'goo/addons/gamepadpack/GamepadSystem',
	'goo/addons/gamepadpack/GamepadComponent',
	'goo/shapes/Box',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/entities/GooRunner',
	'goo/entities/EntityUtils',
	'goo/renderer/light/PointLight',
	'goo/renderer/Camera'
], function (
	V,
	GamepadSystem,
	GamepadComponent,
	Box,
	Material,
	ShaderLib,
	Vector3,
	GooRunner,
	EntityUtils,
	PointLight,
	Camera
	) {

	'use strict';

	V.describe('Use a gamepad to control the box.');

	var options = {
		logo: {
			position: 'bottomright',
			color: '#FFF'
		},
		manuallyStartGameLoop: true,
		showStats: true
	};
	var goo = new GooRunner(options);
	goo.renderer.domElement.id = 'goo';
	document.body.appendChild(goo.renderer.domElement);

	var world = goo.world;

	world.setSystem(new GamepadSystem());

	var boxMesh = new Box();
	var material = new Material(ShaderLib.simpleLit);
	var box1 = world.createEntity(boxMesh, material);

	var gamepadComponent = new GamepadComponent(0);
	gamepadComponent.setLeftStickFunction(function(entity, vec, amount, rawData) {
		var xrot =  - vec.x * amount * Math.PI * 0.25;
		var currentRotation = entity.getRotation();
		entity.setRotation(currentRotation.x, currentRotation.y, xrot);
		entity.setTranslation(rawData[0] * 0.2, -rawData[1] * 0.5, 0);
	});

	gamepadComponent.setRightStickFunction(function(entity, vec, amount, rawData) {
		var xrot = vec.x * amount * Math.PI * 0.25;
		var zrot = vec.y * amount * Math.PI * 0.25;
		var currentRotation = entity.getRotation();
		entity.transformComponent.setRotation(zrot, xrot, currentRotation.z);

		var absX = Math.abs(rawData[0]);
		var absY = Math.abs(rawData[1]);
		if (absX > 0.01 || absY > 0.01) {
			entity.setDiffuse(absX, absY, 0.0);
		} else {
			entity.setDiffuse(1, 1, 1);
		}
	});

	gamepadComponent.setButtonDownFunction(0, function(entity, value) {
		var childCount = entity.children().toArray().length;
		if (childCount == 0) {
			entity.setScale(1, 0.5, 1);
		}
	});

	gamepadComponent.setButtonUpFunction(0, function(entity, value) {
		entity.setScale(1, 1, 1);
	});

	gamepadComponent.setButtonPressedFunction(0, function(entity, value) {
		var childCount = entity.children().toArray().length;
		if (childCount == 0) {
			var cloneBaby = EntityUtils.clone(world, entity, {cloneHierarchy: false});
			cloneBaby.setTranslation(0, 0, 0);
			var offsetEntity = world.createEntity();
			var downScale = 0.8;
			var offset = 1.0;
			offsetEntity.setScale(downScale, downScale, downScale);
			offsetEntity.setTranslation(0, offset, 0);
			offsetEntity.attachChild(cloneBaby);
			offsetEntity.addToWorld();
			entity.attachChild(offsetEntity);
		}
	});

	gamepadComponent.setButtonPressedFunction(1, function(entity, value) {
		location.reload();
	});


	box1.setComponent(gamepadComponent);
	box1.addToWorld();

	world.createEntity(new PointLight(), [ 100, 100, 100]).addToWorld();
	world.createEntity(new PointLight(), [-100, -100, -100]).addToWorld();
	world.createEntity(new PointLight(), [-100, 100, -100]).addToWorld();

	var camera = new Camera();
	camera.lookAt(Vector3.ZERO, Vector3.UNIT_Y);
	var camEntity = world.createEntity(camera, [0, 3, 10]);
	camEntity.addToWorld();

	goo.startGameLoop();
});
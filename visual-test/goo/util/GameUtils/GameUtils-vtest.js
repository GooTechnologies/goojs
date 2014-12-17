require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/shapes/Box',
	'goo/util/GameUtils',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	Box,
	GameUtils,
	V
) {
	'use strict';

	V.describe('1 = requestFullScreen, 2 = exitFullScreen, 3 = toggleFullScreen\n' +
				'4 = requestPointerLock, 5 = exitPointerLock, 6 = togglePointerLock');

	var goo = V.initGoo();

	var box = new Box(0.3, 1, 1.6);
	goo.world.createEntity(box, new Material(ShaderLib.uber), function (entity, tpf) {
		entity.addRotation(0, tpf, 0);
	}).addToWorld();

	V.button('requestFullScreen', function () {
		GameUtils.requestFullScreen();
	});
	V.button('exitFullScreen', function () {
		GameUtils.exitFullScreen();
	});
	V.button('toggleFullScreen', function () {
		GameUtils.toggleFullScreen();
	});

	V.button('requestPointerLock', function () {
		GameUtils.requestPointerLock();
	});
	V.button('exitPointerLock', function () {
		GameUtils.exitPointerLock();
	});
	V.button('togglePointerLock', function () {
		GameUtils.togglePointerLock();
	});

	document.addEventListener('keydown', function (evt) {
		switch (evt.keyCode) {
			case 49: // 1
				GameUtils.requestFullScreen();
				break;
			case 50: // 2
				GameUtils.exitFullScreen();
				break;
			case 51: // 3
				GameUtils.toggleFullScreen();
				break;

			case 52: // 4
				GameUtils.requestPointerLock();
				break;
			case 53: // 5
				GameUtils.exitPointerLock();
				break;
			case 54: // 6
				GameUtils.togglePointerLock();
				break;

			default:
				break;
		}
	}, false);

	V.addLights();

	V.addOrbitCamera(new Vector3(10, Math.PI / 2, Math.PI / 8));

	V.process();
});

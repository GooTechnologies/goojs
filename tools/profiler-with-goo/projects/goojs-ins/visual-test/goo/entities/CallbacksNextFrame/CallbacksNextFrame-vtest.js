require([
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'lib/V'
], function(
	World,
	Material,
	ShaderLib,
	Box,
	Vector3,
	TextureCreator,
	V
) {
	'use strict';

	V.describe([
		'Every frame a callback will spin the boxes a bit and schedule itself to execute one more time, the next frame.',
		'The boxes should therefore spin smoothly/continuously'
	].join('\n'));

	function createBoxEntity(size, position) {
		var meshData = new Box(size, size, size);
		var material = new Material(ShaderLib.simpleLit);
		return goo.world.createEntity(meshData, material, position);
	}

	var goo = V.initGoo();

	var boxEntity1 = createBoxEntity(3, [0, 0, 0]);

	var boxEntity2 = createBoxEntity(2, [3, 0, 0]);
	boxEntity1.attachChild(boxEntity2);

	var boxEntity3 = createBoxEntity(1, [2, 0, 0]);
	boxEntity2.attachChild(boxEntity3);

	boxEntity1.addToWorld();

	// adding callbacks from a callback
	goo.callbacksNextFrame.push(function updateRotation() {
		boxEntity1.transformComponent.setRotation(World.time, 0, 0);
		goo.callbacksNextFrame.push(updateRotation);
	});

	V.addLights();

	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));

	V.process();
});
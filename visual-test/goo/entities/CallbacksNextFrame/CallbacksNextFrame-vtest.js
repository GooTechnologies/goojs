goo.V.attachToGlobal();

	V.describe([
		'Every frame a callback will spin the boxes a bit and schedule itself to execute one more time, the next frame.',
		'The boxes should therefore spin smoothly/continuously'
	].join('\n'));

	function createBoxEntity(size, position) {
		var meshData = new Box(size, size, size);
		var material = new Material(ShaderLib.simpleLit);
		return gooRunner.world.createEntity(meshData, material, position);
	}

	var gooRunner = V.initGoo();

	var boxEntity1 = createBoxEntity(3, [0, 0, 0]);

	var boxEntity2 = createBoxEntity(2, [3, 0, 0]);
	boxEntity1.attachChild(boxEntity2);

	var boxEntity3 = createBoxEntity(1, [2, 0, 0]);
	boxEntity2.attachChild(boxEntity3);

	boxEntity1.addToWorld();

	// adding callbacks from a callback
	gooRunner.callbacksNextFrame.push(function updateRotation() {
		boxEntity1.transformComponent.setRotation(World.time, 0, 0);
		gooRunner.callbacksNextFrame.push(updateRotation);
	});

	V.addLights();

	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));

	V.process();
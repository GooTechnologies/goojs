goo.V.attachToGlobal();

	function getFSMComponent(ballEntity, dx, dy) {
		var fsmComponent = new StateMachineComponent();

		(function () {
			// ball mover
			var machineBall = new Machine('ball');
			fsmComponent.addMachine(machineBall);

			var stateSingular = new State('singular');
			machineBall.addState(stateSingular);
			stateSingular.addAction(new AddPositionAction(null, { position: ['dx', 'dy', 0] }));
		})();

		(function () {
			// ball collider
			var machineWall = new Machine('wall');
			fsmComponent.addMachine(machineWall);

			var stateMoving = new State('moving');

			fsmComponent.defineVariable('px', 0);
			fsmComponent.defineVariable('py', 0);
			fsmComponent.defineVariable('dx', 9);
			fsmComponent.defineVariable('dy', 11);

			machineWall.addState(stateMoving);
			stateMoving.addAction(new AddPositionAction(null, { entity: ballEntity, amountX: 'dx', amountY: 'dy', everyFrame: true }));
			stateMoving.addAction(new GetPositionAction(null, { entity: ballEntity, variableX: 'px', variableY: 'py' }));
			stateMoving.addAction(new NumberCompareAction(null, { leftHand: 'px', rightHand: -dx / 2, transitions: { less: 'toFlipX' } }));
			stateMoving.addAction(new NumberCompareAction(null, { leftHand: 'px', rightHand:  dx / 2, transitions: { greater: 'toFlipX' } }));
			stateMoving.addAction(new NumberCompareAction(null, { leftHand: 'py', rightHand: -dy / 2, transitions: { less: 'toFlipY' } }));
			stateMoving.addAction(new NumberCompareAction(null, { leftHand: 'py', rightHand:  dy / 2, transitions: { greater: 'toFlipY' } }));
			stateMoving.setTransition('toFlipX', 'flipX');
			stateMoving.setTransition('toFlipY', 'flipY');

			var stateFlipX = new State('flipX');
			machineWall.addState(stateFlipX);
			stateFlipX.addAction(new MultiplyVariableAction(null, { variable: 'dx', amount: -1 }));
			//stateFlipX.addAction(new EmitAction({ event: 'toMoving' }));
			stateFlipX.addAction(new NumberCompareAction(null, { leftHand: 0, rightHand: 1, transitions: { less: 'toMoving' } }));
			stateFlipX.setTransition('toMoving', 'moving');

			var stateFlipY = new State('flipY');
			machineWall.addState(stateFlipY);
			stateFlipY.addAction(new MultiplyVariableAction(null, { variable: 'dy', amount: -1 }));
			//stateFlipY.addAction(new EmitAction({ event: 'toMoving' }));
			stateFlipY.addAction(new NumberCompareAction(null, { leftHand: 0, rightHand: 1, transitions: { less: 'toMoving' } }));
			stateFlipY.setTransition('toMoving', 'moving');
		})();

		return fsmComponent;
	}

	function addWall(x, y, dx, dy) {
		var boxMeshData = new Box(dx, dy, 1);
		var boxMaterial = new Material(ShaderLib.simpleLit);
		var boxEntity = world.createEntity(boxMeshData, boxMaterial, [x, y, 0]);
		//boxEntity.setComponent(getFSMComponent(boxEntity)); //enable this for weirdness
		boxEntity.addToWorld();
	}

	function addWalls(dx, dy) {
		addWall(-dx / 2,       0,      1, dy + 1);
		addWall(      0,  dy / 2, dx + 1,      1);
		addWall( dx / 2,       0,      1, dy + 1);
		addWall(      0, -dy / 2, dx + 1,      1);
	}

	function getColor(x, y, z) {
		var step = 1.9;
		return [
			Math.cos(x + y + z) / 2 + 0.5,
			Math.cos(x + y + z + step) / 2 + 0.5,
			Math.cos(x + y + z + step * 2) / 2 + 0.5
		];
	}

	function addBall(x, y, z) {
		var color = getColor(x, y, z);

		var lampMeshData = new Sphere(32, 32);
		var lampMaterial = new Material(ShaderLib.simpleColored);
		lampMaterial.uniforms.color = color;

		var light = new PointLight(Vector3.fromArray(color));
		light.range = 10;

		return world.createEntity(lampMeshData, lampMaterial, 'lamp1', [x, y, z], light).addToWorld();
	}

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	world.setSystem(new StateMachineSystem(gooRunner));

	V.addOrbitCamera();

	addWalls(32, 32);

	var ballEntity = addBall(3, 3, 0);

	ballEntity.setComponent(getFSMComponent(ballEntity, 30, 30));

	V.process();
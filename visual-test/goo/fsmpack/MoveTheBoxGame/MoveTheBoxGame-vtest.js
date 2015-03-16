require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'lib/V',

	'goo/fsmpack/statemachine/StateMachineComponent',
	'goo/fsmpack/statemachine/StateMachineSystem',
	'goo/fsmpack/statemachine/State',
	'goo/fsmpack/statemachine/Machine',
	'goo/fsmpack/statemachine/actions/KeyDownAction',
	'goo/fsmpack/statemachine/actions/KeyUpAction',
	'goo/fsmpack/statemachine/actions/AddPositionAction'
], function (
	Material,
	ShaderLib,
	Sphere,
	Box,
	Vector3,
	PointLight,
	V,

	FSMComponent,
	FSMSystem,
	State,
	Machine,
	KeyDownAction,
	KeyUpAction,
	AddPositionAction
	) {
	'use strict';

	function getFSMComponent(entity) {
		var fsmComponent = new FSMComponent();
		// create action tied to listen to pick events
		// tie pick event to a channel

		var speed = 10;

		// horizontal moving
		var machine1 = new Machine('horizontalMoving');
		fsmComponent.addMachine(machine1);

		var stateIdle = new State('idle');
		machine1.addState(stateIdle);
		stateIdle.addAction(new KeyDownAction(null, { key: 'a', transitions: { keydown: 'toMovingLeft' } }));
		stateIdle.addAction(new KeyDownAction(null, { key: 'd', transitions: { keydown: 'toMovingRight' } }));
		stateIdle.setTransition('toMovingLeft', 'movingLeft');
		stateIdle.setTransition('toMovingRight', 'movingRight');

		var stateMovingLeft = new State('movingLeft');
		machine1.addState(stateMovingLeft);
		stateMovingLeft.addAction(new KeyUpAction(null, { key: 'a', transitions: { keyup: 'toIdle' } }));
		stateMovingLeft.addAction(new AddPositionAction(null, { entity: entity, amountX: -speed }));
		stateMovingLeft.setTransition('toIdle', 'idle');

		var stateMovingRight = new State('movingRight');
		machine1.addState(stateMovingRight);
		stateMovingRight.addAction(new KeyUpAction(null, { key: 'd', transitions: { keyup: 'toIdle' } }));
		stateMovingRight.addAction(new AddPositionAction(null, { entity: entity, amountX: speed }));
		stateMovingRight.setTransition('toIdle', 'idle');

		// vertical moving
		var machine2 = new Machine('verticalMoving');
		fsmComponent.addMachine(machine2);

		var stateIdle = new State('idle');
		machine2.addState(stateIdle);
		stateIdle.addAction(new KeyDownAction(null, { key: 'w', transitions: { keydown: 'toMovingUp' } }));
		stateIdle.addAction(new KeyDownAction(null, { key: 's', transitions: { keydown: 'toMovingDown' } }));
		stateIdle.setTransition('toMovingUp', 'movingUp');
		stateIdle.setTransition('toMovingDown', 'movingDown');

		var stateMovingUp = new State('movingUp');
		machine2.addState(stateMovingUp);
		stateMovingUp.addAction(new KeyUpAction(null, { key: 'w', transitions: { keyup: 'toIdle' } }));
		stateMovingUp.addAction(new AddPositionAction(null, { entity: entity, amountZ: -speed }));
		stateMovingUp.setTransition('toIdle', 'idle');

		var stateMovingDown = new State('movingDown');
		machine2.addState(stateMovingDown);
		stateMovingDown.addAction(new KeyUpAction(null, { key: 's', transitions: { keyup: 'toIdle' } }));
		stateMovingDown.addAction(new AddPositionAction(null, { entity: entity, amountZ: speed }));
		stateMovingDown.setTransition('toIdle', 'idle');

		return fsmComponent;
	}

	function addCharacter(x, y, z) {
		var boxEntity = world.createEntity(new Box(), new Material(ShaderLib.simpleLit), [x, y, z]);

		boxEntity.setComponent(getFSMComponent(boxEntity)).addToWorld();
	}

	function getColor(x, y, z) {
		var step = 1.9;
		return [
			Math.cos(x + y + z) / 2 + 0.5,
			Math.cos(x + y + z + step) / 2 + 0.5,
			Math.cos(x + y + z + step * 2) / 2 + 0.5];
	}

	function addLamp(x, y, z) {
		var color = getColor(x, y, z);

		var lampMeshData = new Sphere(32, 32);
		var lampMaterial = new Material(ShaderLib.simpleColored);
		lampMaterial.uniforms.color = color;

		var light = new PointLight(Vector3.fromArray(color));
		light.range = 10;

		var lampEntity = world.createEntity(lampMeshData, lampMaterial, light, 'lamp1', [x, y, z]).addToWorld();

		return lampEntity;
	}

	function addLamps() {
		var nLamps = 1;
		var lampEntities = [];
		for (var i = 0; i < nLamps; i++) {
			lampEntities.push(addLamp((i - ((nLamps - 1) / 2)) * 4, 5, 0));
		}
		return lampEntities;
	}

	var goo = V.initGoo();
	var world = goo.world;

	world.setSystem(new FSMSystem(goo));

	V.addOrbitCamera();
	addLamps();

	addCharacter(0, 0, 0);

	V.process();
});

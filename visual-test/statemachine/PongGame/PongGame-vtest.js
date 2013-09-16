require.config({
	paths: {
		"goo": "../../../src/goo"
	}
});

require([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/EntityUtils',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'goo/statemachine/FSMComponent',
	'goo/statemachine/FSMSystem',
	'goo/statemachine/State',
	'goo/statemachine/Machine',
	'goo/statemachine/actions/KeyDownAction',
	'goo/statemachine/actions/KeyUpAction',
	'goo/statemachine/actions/AddPositionAction',
	'goo/statemachine/actions/NumberCompareAction',
	'goo/statemachine/actions/MouseMoveAction',
	'goo/statemachine/actions/MultiplyVariableAction',
	'goo/statemachine/actions/GetPositionAction',
	'goo/statemachine/actions/SetNumberAction'
], function (
	GooRunner,
	World,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	OrbitCamControlScript,
	EntityUtils,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	PointLight,
	LightComponent,
	FSMComponent,
	FSMSystem,
	State,
	Machine,
	KeyDownAction,
	KeyUpAction,
	AddPositionAction,
	NumberCompareAction,
	MouseMoveAction,
	MultiplyVariableAction,
	GetPositionAction,
	SetNumberAction
	) {
	'use strict';

	function getFSMComponent(ballEntity, paddleEntity, dx, dy) {
		var fsmComponent = new FSMComponent();

		(function() {
			// paddle
			var machinePaddle = new Machine('paddle');
			fsmComponent.addMachine(machinePaddle);

			var stateSingular = new State('singular');
			machinePaddle.addState(stateSingular);
			stateSingular.addAction(new MouseMoveAction({ variable: 'mousePos' }));
		}); //();

		(function() {
			// ball mover
			var machineBall = new Machine('ball');
			fsmComponent.addMachine(machineBall);

			var stateSingular = new State('singular');
			machineBall.addState(stateSingular);
			stateSingular.addAction(new AddPositionAction({ position: ['dx', 'dy', 0] }));
		})();

		(function() {
			// ball collider
			var machineWall = new Machine('wall');
			fsmComponent.addMachine(machineWall);

			var stateMoving = new State('moving');
			machineWall.addState(stateMoving);
			stateMoving.addAction(new SetNumberAction({ variable: 'dx', value: 9 }));
			stateMoving.addAction(new SetNumberAction({ variable: 'dy', value: 11 }));
			stateMoving.addAction(new AddPositionAction({ entity: ballEntity, position: [ 'dx', 'dy', 0] }));
			stateMoving.addAction(new GetPositionAction({ entity: ballEntity, position: [ 'px', 'py'] }));
			stateMoving.addAction(new NumberCompareAction({ float1Variable: 'px', float2: -dx/2, lessThanEvent: 'toFlipX' }));
			stateMoving.addAction(new NumberCompareAction({ float1Variable: 'px', float2:  dx/2, greaterThanEvent: 'toFlipX' }));
			stateMoving.addAction(new NumberCompareAction({ float1Variable: 'py', float2: -dy/2, lessThanEvent: 'toFlipY' }));
			stateMoving.addAction(new NumberCompareAction({ float1Variable: 'py', float2:  dy/2, greaterThanEvent: 'toFlipY' }));
			stateMoving.setTransition('toFlipX', 'flipX');
			stateMoving.setTransition('toFlipY', 'flipY');

			var stateFlipX = new State('flipX');
			machineWall.addState(stateFlipX);
			stateFlipX.addAction(new MultiplyVariableAction({ variable: 'dx', amount: -1 }));
			//stateFlipX.addAction(new EmmitAction({ event: 'toMoving' }));
			stateFlipX.addAction(new NumberCompareAction({ float1: 0, float2: 1, lessThanEvent: 'toMoving' }));
			stateFlipX.setTransition('toMoving', 'moving');

			var stateFlipY = new State('flipY');
			machineWall.addState(stateFlipY);
			stateFlipY.addAction(new MultiplyVariableAction({ variable: 'dy', amount: -1 }));
			//stateFlipY.addAction(new EmmitAction({ event: 'toMoving' }));
			stateFlipY.addAction(new NumberCompareAction({ float1: 0, float2: 1, lessThanEvent: 'toMoving' }));
			stateFlipY.setTransition('toMoving', 'moving');
		})();

		return fsmComponent;
	}

	function addWall(goo, x, y, dx, dy) {
		var boxMeshData = ShapeCreator.createBox(dx, dy, 1);
		var boxMaterial = Material.createMaterial(ShaderLib.simpleLit, 'mat');
		var boxEntity = EntityUtils.createTypicalEntity(goo.world, boxMeshData, boxMaterial);
		boxEntity.transformComponent.transform.translation.setd(x, y, 0);
		//boxEntity.setComponent(getFSMComponent(boxEntity)); //enable this for weirdness
		boxEntity.addToWorld();
	}

	function addWalls(goo, dx, dy) {
		addWall(goo, -dx/2,     0,  1, dy + 1);
		addWall(goo,     0,  dy/2, dx + 1,  1);
		addWall(goo,  dx/2,     0,  1, dy + 1);
		addWall(goo,     0, -dy/2, dx + 1,  1);
	}

	function addPaddle(goo, x, y, z) {
		var boxMeshData = ShapeCreator.createBox(1, 1, 1);
		var boxMaterial = Material.createMaterial(ShaderLib.simpleLit, 'mat');
		var boxEntity = EntityUtils.createTypicalEntity(goo.world, boxMeshData, boxMaterial);
		boxEntity.transformComponent.transform.translation.setd(x, y, z);
		boxEntity.setComponent(getFSMComponent(boxEntity));
		boxEntity.addToWorld();

		return boxEntity;
	}

	function getColor(x, y, z) {
		var step = 1.9;
		return [
			Math.cos(x + y + z) / 2 + 0.5,
			Math.cos(x + y + z + step) / 2 + 0.5,
			Math.cos(x + y + z + step * 2) / 2 + 0.5];
	}

	function addBall(goo, x, y, z) {
		var color = getColor(x, y, z);

		var lampMeshData = ShapeCreator.createSphere(32, 32);
		var lampMaterial = Material.createMaterial(ShaderLib.simpleColored, '');
		lampMaterial.uniforms.color = color;
		var lampEntity = EntityUtils.createTypicalEntity(goo.world, lampMeshData, lampMaterial, 'lamp1');

		var light = new PointLight();
		light.color = new Vector3(color[0], color[1], color[2]);
		light.range = 10;
		lampEntity.setComponent(new LightComponent(light));
		lampEntity.transformComponent.transform.translation.setd(x, y, z);
		lampEntity.addToWorld();

		return lampEntity;
	}

	function addCamera(goo) {
		// camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 3);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(60, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);
	}

	function pongGame(goo) {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		goo.world.setSystem(new FSMSystem(goo));

		addCamera(goo);

		addWalls(goo, 32, 32);

		var ballEntity = addBall(goo, 3, 3, 0);

		ballEntity.setComponent(getFSMComponent(ballEntity, null, 30, 30));

		window.ball = ballEntity;
		//var paddleEntity = addPaddle(goo, 0, 0, 0);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		pongGame(goo);
	}

	init();
});

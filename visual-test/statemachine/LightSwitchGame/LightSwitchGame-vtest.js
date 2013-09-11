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
	'goo/statemachine/actions/MouseClickAction',
	'goo/statemachine/actions/SetLightRangeAction'
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
	MouseClickAction,
	SetLightRangeAction
	) {
	'use strict';

	function getFSMComponent(entity) {
		var fsmComponent = new FSMComponent();
		// create action tied to listen to pick events
		// tie pick event to a channel

		var machine = new Machine('switch');

		var stateOn = new State('on');
		stateOn.addAction(new MouseClickAction({ jumpTo: 'off' }));
		stateOn.addAction(new SetLightRangeAction({ entity: entity, range: 1 }));

		var stateOff = new State('off');
		stateOff.addAction(new MouseClickAction({ jumpTo: 'on' }));
		stateOff.addAction(new SetLightRangeAction({ entity: entity, range: 10 }));

		machine.addState(stateOn);
		machine.addState(stateOff);

		fsmComponent.machines.push(machine);

		return fsmComponent;
	}

	function addBox(goo, x, y, z, lightEntity) {
		var boxMeshData = ShapeCreator.createBox(1, 1, 1);
		var boxMaterial = Material.createMaterial(ShaderLib.simpleLit, 'mat');
		var boxEntity = EntityUtils.createTypicalEntity(goo.world, boxMeshData, boxMaterial);
		boxEntity.transformComponent.transform.translation.setd(x, y, z);
		boxEntity.setComponent(getFSMComponent(lightEntity));
		boxEntity.addToWorld();
	}

	function addBoxes(goo, lightEntity) {
		var nBoxes = 1;
		for(var i = 0; i < nBoxes; i++) {
			addBox(goo, (i - ((nBoxes - 1) / 2)) * 4, 0, 0, lightEntity);
		}
	}

	function getColor(x, y, z) {
		var step = 1.9;
		return [
			Math.cos(x + y + z) / 2 + 0.5,
			Math.cos(x + y + z + step) / 2 + 0.5,
			Math.cos(x + y + z + step * 2) / 2 + 0.5];
	}

	function addLamp(goo, x, y, z) {
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

	function addLamps(goo) {
		var nLamps = 1;
		var lampEntities = [];
		for(var i = 0; i < nLamps; i++) {
			lampEntities.push(addLamp(goo, (i - ((nLamps - 1) / 2)) * 4, 5, 0));
		}
		return lampEntities;
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

	function lightSwitchGame(goo) {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		goo.world.setSystem(new FSMSystem(goo));

		addCamera(goo);
		var lampEntities = addLamps(goo);

		/*var boxEntities = */addBoxes(goo, lampEntities[0]);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		lightSwitchGame(goo);
	}

	init();
});

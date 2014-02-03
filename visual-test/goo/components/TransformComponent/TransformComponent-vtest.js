require([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/entities/components/LightComponent',
	'goo/addons/box2d/systems/Box2DSystem',
	'goo/addons/box2d/components/Box2DComponent',
	'goo/math/MathUtils',
	'goo/debug/Debugger',
	'../../lib/V'
], function (
	GooRunner,
	World,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	OrbitCamControlScript,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	PointLight,
	DirectionalLight,
	LightComponent,
	Box2DSystem,
	Box2DComponent,
	MathUtils,
	Debugger,
	V
	) {
	'use strict';

	var box11, box12, box13, box14, box15;
	var box21, box22, box23, box24, box25;
	var boxMeshData;
	var goo, world;

	function getColoredMaterial(r, g, b) {
		var material = Material.createMaterial(ShaderLib.simpleLit, '');
		material.materialState.diffuse = [r, g, b, 1];
		return material;
	}

	function addLight(goo) {
		var light = new PointLight();
		var lightEntity = goo.world.createEntity(light, [40, 40, 40]);
		lightEntity.addToWorld();
	}

	function addOriginShape(goo) {
		var world = goo.world;
		var boxMeshData = ShapeCreator.createBox();
		var box;

		box = world.createEntity(boxMeshData, getColoredMaterial(0, 0, 0));
		box.transformComponent.setScale(1.5, 0.1, 0.1);
		box.addToWorld();

		box = world.createEntity(boxMeshData, getColoredMaterial(0, 0, 0));
		box.transformComponent.setScale(0.1, 1.5, 0.1);
		box.addToWorld();

		box = world.createEntity(boxMeshData, getColoredMaterial(0, 0, 0));
		box.transformComponent.setScale(0.1, 0.1, 1.5);
		box.addToWorld();
	}

	function createBoxTower1() {
		// keepTransform = false; --------------------
		box11 = world.createEntity(boxMeshData, getColoredMaterial(1, 0, 0), [-2, 0, 0]);
		box11.transformComponent.setRotation(0, Math.PI/4, 0);
		box11.transformComponent.setScale(1.5, 1, 1);
		box11.addToWorld();

		box12 = world.createEntity(boxMeshData, getColoredMaterial(1, 0.5, 0), [-2, 1, 0]);
		box12.transformComponent.setRotation(0, Math.PI/4, 0);
		box12.transformComponent.setScale(1.5, 1, 1);
		box12.addToWorld();

		box13 = world.createEntity(boxMeshData, getColoredMaterial(1, 1, 0), [-2, 2, 0]);
		box13.transformComponent.setRotation(0, Math.PI/4, 0);
		box13.transformComponent.setScale(1.5, 1, 1);
		box13.addToWorld();

		box14 = world.createEntity(boxMeshData, getColoredMaterial(0, 1, 0), [-2, 3, 0]);
		box14.transformComponent.setRotation(0, Math.PI/4, 0);
		box14.transformComponent.setScale(1.5, 1, 1);
		box14.addToWorld();

		box15 = world.createEntity(boxMeshData, getColoredMaterial(0, 0, 1), [-2, 4, 0]);
		box15.transformComponent.setRotation(0, Math.PI/4, 0);
		box15.transformComponent.setScale(1.5, 1, 1);
		box15.addToWorld();
	}

	function createBoxTower2() {
		// keepTransform = true; ---------------------
		box21 = world.createEntity(boxMeshData, getColoredMaterial(1, 0, 0), [2, 0, 0]);
		box21.transformComponent.setRotation(0, Math.PI/4, 0);
		box21.transformComponent.setScale(1.5, 1, 1);
		box21.addToWorld();

		box22 = world.createEntity(boxMeshData, getColoredMaterial(1, 0.5, 0), [2, 1, 0]);
		box22.transformComponent.setRotation(0, Math.PI/4, 0);
		box22.transformComponent.setScale(1.5, 1, 1);
		box22.addToWorld();

		box23 = world.createEntity(world, boxMeshData, getColoredMaterial(1, 1, 0), [2, 2, 0]);
		box23.transformComponent.setRotation(0, Math.PI/4, 0);
		box23.transformComponent.setScale(1.5, 1, 1);
		box23.addToWorld();

		box24 = world.createEntity(world, boxMeshData, getColoredMaterial(0, 1, 0), [2, 3, 0]);
		box24.transformComponent.setRotation(0, Math.PI/4, 0);
		box24.transformComponent.setScale(1.5, 1, 1);
		box24.addToWorld();

		box25 = world.createEntity(world, boxMeshData, getColoredMaterial(0, 0, 1), [2, 4, 0]);
		box25.transformComponent.setRotation(0, Math.PI/4, 0);
		box25.transformComponent.setScale(1.5, 1, 1);
		box25.addToWorld();
	}

	function assembleBoxTower1() {
		// loops are so yesterday!
		box11.transformComponent.attachChild(box12.transformComponent);
		box12.transformComponent.attachChild(box13.transformComponent);
		box13.transformComponent.attachChild(box14.transformComponent);
		box14.transformComponent.attachChild(box15.transformComponent);

		box11.transformComponent.setUpdated();
		box12.transformComponent.setUpdated();
		box13.transformComponent.setUpdated();
		box14.transformComponent.setUpdated();
		box15.transformComponent.setUpdated();
	}

	function collapseBoxTower1() {
		box11.transformComponent.detachChild(box12.transformComponent);
		box12.transformComponent.detachChild(box13.transformComponent);
		box13.transformComponent.detachChild(box14.transformComponent);
		box14.transformComponent.detachChild(box15.transformComponent);

		box11.transformComponent.setUpdated();
		box12.transformComponent.setUpdated();
		box13.transformComponent.setUpdated();
		box14.transformComponent.setUpdated();
		box15.transformComponent.setUpdated();
	}

	function assembleBoxTower2() {
		box21.transformComponent.attachChild(box22.transformComponent, true);
		box22.transformComponent.attachChild(box23.transformComponent, true);
		box23.transformComponent.attachChild(box24.transformComponent, true);
		box24.transformComponent.attachChild(box25.transformComponent, true);

		box21.transformComponent.setUpdated();
		box22.transformComponent.setUpdated();
		box23.transformComponent.setUpdated();
		box24.transformComponent.setUpdated();
		box25.transformComponent.setUpdated();
	}

	function collapseBoxTower2() {
		box21.transformComponent.detachChild(box22.transformComponent, true);
		box22.transformComponent.detachChild(box23.transformComponent, true);
		box23.transformComponent.detachChild(box24.transformComponent, true);
		box24.transformComponent.detachChild(box25.transformComponent, true);

		box21.transformComponent.setUpdated();
		box22.transformComponent.setUpdated();
		box23.transformComponent.setUpdated();
		box24.transformComponent.setUpdated();
		box25.transformComponent.setUpdated();
	}

	function setupGUI() {
		var gui = new window.dat.GUI();

		var data = {
			add_remove: false
		};

		var controller = gui.add(data, 'add_remove');

		controller.onChange(function(val) {
			if (val) {
				console.log('assembling the tower');
				assembleBoxTower1();
				assembleBoxTower2();
			} else {
				console.log('collapsing the tower');
				collapseBoxTower1();
				collapseBoxTower2();
			}
		});
	}

	function transformComponentDemo() {
		world = goo.world;

		boxMeshData = ShapeCreator.createBox();

		// marking the origin
		addOriginShape(goo);

		// create the towers
		createBoxTower1();
		createBoxTower2();

		// add light
		addLight(goo);

		// add camera
		V.addOrbitCamera(goo, new Vector3(30, Math.PI / 2, 0.3), new Vector3(0, 0, 0));

		setupGUI();

		new Debugger(true, true).inject(goo);
	}

	function init() {
		goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		transformComponentDemo();
	}

	init();
});

require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/math/MathUtils',
	'goo/debugpack/Debugger',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Vector3,
	MathUtils,
	Debugger,
	V
	) {
	'use strict';

	V.describe([
		'One of the box towers are assembled with the preserve-transform option enabled and one without.',
		'After repeated assembling/disassembling the boxes should remain in their initial positions.'
	].join('\n'));

	var box11, box12, box13, box14, box15;
	var box21, box22, box23, box24, box25;
	var boxMeshData;
	var goo, world;

	function getColoredMaterial(r, g, b) {
		var material = new Material(ShaderLib.simpleLit);
		material.uniforms.materialDiffuse = [r, g, b, 1];
		return material;
	}

	function addOriginShape(goo) {
		var world = goo.world;
		var boxMeshData = new Box();
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
		box11.transformComponent.setRotation(0, Math.PI / 4, 0);
		box11.transformComponent.setScale(1.5, 1, 1);
		box11.addToWorld();

		box12 = world.createEntity(boxMeshData, getColoredMaterial(1, 0.5, 0), [-2, 1, 0]);
		box12.transformComponent.setRotation(0, Math.PI / 4, 0);
		box12.transformComponent.setScale(1.5, 1, 1);
		box12.addToWorld();

		box13 = world.createEntity(boxMeshData, getColoredMaterial(1, 1, 0), [-2, 2, 0]);
		box13.transformComponent.setRotation(0, Math.PI / 4, 0);
		box13.transformComponent.setScale(1.5, 1, 1);
		box13.addToWorld();

		box14 = world.createEntity(boxMeshData, getColoredMaterial(0, 1, 0), [-2, 3, 0]);
		box14.transformComponent.setRotation(0, Math.PI / 4, 0);
		box14.transformComponent.setScale(1.5, 1, 1);
		box14.addToWorld();

		box15 = world.createEntity(boxMeshData, getColoredMaterial(0, 0, 1), [-2, 4, 0]);
		box15.transformComponent.setRotation(0, Math.PI / 4, 0);
		box15.transformComponent.setScale(1.5, 1, 1);
		box15.addToWorld();
	}

	function createBoxTower2() {
		// keepTransform = true; ---------------------
		box21 = world.createEntity(boxMeshData, getColoredMaterial(1, 0, 0), [2, 0, 0]);
		box21.transformComponent.setRotation(0, Math.PI / 4, 0);
		box21.transformComponent.setScale(1.5, 1, 1);
		box21.addToWorld();

		box22 = world.createEntity(boxMeshData, getColoredMaterial(1, 0.5, 0), [2, 1, 0]);
		box22.transformComponent.setRotation(0, Math.PI / 4, 0);
		box22.transformComponent.setScale(1.5, 1, 1);
		box22.addToWorld();

		box23 = world.createEntity(world, boxMeshData, getColoredMaterial(1, 1, 0), [2, 2, 0]);
		box23.transformComponent.setRotation(0, Math.PI / 4, 0);
		box23.transformComponent.setScale(1.5, 1, 1);
		box23.addToWorld();

		box24 = world.createEntity(world, boxMeshData, getColoredMaterial(0, 1, 0), [2, 3, 0]);
		box24.transformComponent.setRotation(0, Math.PI / 4, 0);
		box24.transformComponent.setScale(1.5, 1, 1);
		box24.addToWorld();

		box25 = world.createEntity(world, boxMeshData, getColoredMaterial(0, 0, 1), [2, 4, 0]);
		box25.transformComponent.setRotation(0, Math.PI / 4, 0);
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


	goo = V.initGoo();
	world = goo.world;

	boxMeshData = new Box();

	// marking the origin
	addOriginShape(goo);

	// create the towers
	createBoxTower1();
	createBoxTower2();

	// add light
	V.addLights();

	// add camera
	V.addOrbitCamera(new Vector3(30, Math.PI / 2, 0.3));

	setupGUI();

	new Debugger(true, true).inject(goo);

	V.process();
});

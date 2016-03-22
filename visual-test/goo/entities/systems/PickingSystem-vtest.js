require([
	'goo/entities/systems/PickingSystem',
	'goo/math/Ray',
	'goo/picking/PrimitivePickLogic',
	'goo/shapes/Torus',
	'goo/shapes/Sphere',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'lib/V'
], function (
	PickingSystem,
	Ray,
	PrimitivePickLogic,
	Torus,
	Sphere,
	Material,
	ShaderLib,
	V
) {
	'use strict';

	V.describe('PickingSystem Test. Key 1 = Triangle picking, Key 2 = Bounding picking');

	var goo = V.initGoo();

	var sphere = new Sphere(16, 16, 0.2);
	var torus = new Torus(20, 20);
	var material = new Material(ShaderLib.uber);

	var sphereEntity1 = goo.world.createEntity(sphere, material).addToWorld();
	sphereEntity1.meshRendererComponent.isPickable = false;

	var pickLogic = new PrimitivePickLogic();

	var pickingSystem = new PickingSystem({
		pickLogic: pickLogic
	});
	pickingSystem.passive = false;
	pickingSystem.pickRay = new Ray();
	pickingSystem.onPick = function (pickList) {
		if (pickList.length > 0) {
			document.getElementById('pick').innerText = pickList[0].entity.name;
			sphereEntity1.setTranslation(pickList[0].intersection.points[0]);
		} else {
			document.getElementById('pick').innerText = 'None';
		}
	};
	goo.world.setSystem(pickingSystem);

	// V.addColoredSpheres(5);

	goo.world.createEntity(torus, material, [0, 1, 2]).setRotation(0, Math.PI/2, Math.PI/4).addToWorld();
	goo.world.createEntity(torus, material, [0, -2, 5]).setScale(0.4, 0.7, 0.3).setRotation(Math.PI/2, 0, Math.PI/4).addToWorld();
	goo.world.createEntity(torus, material, [-3, 0, 3]).setRotation(Math.PI/3, Math.PI/4, 0).addToWorld();

	V.addLights();
	V.addOrbitCamera([30, -Math.PI/3, 0]);

	function key1() {
		pickingSystem.pickLogic = pickLogic;
	}

	function key2() {
		pickingSystem.pickLogic = null;
	}

	V.button('Triangle Picking', key1);
	V.button('Bounding Picking', key2);

	document.addEventListener('keydown', function (e) {
		switch (e.which) {
			case 49: // 1
				key1();
				break;
			case 50: // 2
				key2();
				break;
		}
	});

	var mouseListener = function (event) {
		if (!goo.renderSystem.camera) {
			return;
		}

		var x, y;
		var domTarget = goo.renderer.domElement;
		if (event.type === 'touchmove') {
			x = event.changedTouches[0].pageX - domTarget.getBoundingClientRect().left;
			y = event.changedTouches[0].pageY - domTarget.getBoundingClientRect().top;
		} else {
			var rect = domTarget.getBoundingClientRect();
			x = event.clientX - rect.left;
			y = event.clientY - rect.top;
		}

		goo.renderSystem.camera.getPickRay(x, y, domTarget.offsetWidth, domTarget.offsetHeight, pickingSystem.pickRay);
	};

	document.addEventListener('mousemove', mouseListener);
	document.addEventListener('touchstart', mouseListener);

	V.process();
});
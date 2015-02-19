require([
	'lib/V',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/math/Vector3'
], function(
	V,
	Material,
	ShaderLib,
	Box,
	Sphere,
	Vector3
) {
	'use strict';

	V.describe('Testing activate/deactivate and show/hide.');

	var goo = V.initGoo({
		showStats: true
	});
	var world = goo.world;
	V.addOrbitCamera(new Vector3(30, Math.PI / 3, Math.PI / 5));
	V.addLights();

	var material = new Material(ShaderLib.uber);

	var count = 10;
	var size = 0.7;
	var box = new Box(size, size, size);
	var sphere = new Sphere(10, 10, count/2);

	function createBoxes(numBoxes, position) {
		var parent = world.createEntity(position, sphere, material).addToWorld();
		for (var i = 0; i < numBoxes; i++) {
			for (var j = 0; j < numBoxes; j++) {
				for (var k = 0; k < numBoxes; k++) {
					var position = [size * (i - (numBoxes - 1) / 2) * 1.1, size * (j - (numBoxes - 1) / 2) * 1.1, size * (k - (numBoxes - 1) / 2) * 1.1];
					var entity = world.createEntity(position, box, material).addToWorld();
					parent.attachChild(entity);
				}
			}
		}
		return parent;
	}

	var v1 = createBoxes(count, [-count, 0, 0]);
	var v2 = createBoxes(count, [count, 0, 0]);
	var v3 = createBoxes(count, [0, 0, -count]);
	var v4 = createBoxes(count, [0, 0, count]);

	var root = world.createEntity(sphere, material).addToWorld();
	root.attachChild(v1);
	root.attachChild(v2);
	root.attachChild(v3);
	root.attachChild(v4);

	var targetEntity = root;
	var oldX = -1, oldY = -1;

	var onDown = function(evt) {
		oldX = evt.x;
		oldY = evt.y;
	};
	var onUp = function(evt) {
		if (Math.abs(evt.x - oldX) < 5 && Math.abs(evt.y - oldY) < 5) {
			console.log(evt);
			targetEntity = evt.entity;
		}
	};

	goo.addEventListener('mousedown', onDown);
	goo.addEventListener('click', onUp);

	document.addEventListener('keypress', function(e) {
		if (!targetEntity) {
			return;
		}

		// console.profile('flip');
		console.time('flip');
		switch (e.which) {
			case 49: // 1
				targetEntity.hide();
				break;
			case 50: // 2
				targetEntity.show();
				break;
			case 51: // 3
				targetEntity.hide(true);
				break;
			case 52: // 4
				targetEntity.show(true);
				break;

			case 53: // 5
				targetEntity.deactivate();
				break;
			case 54: // 6
				targetEntity.activate();
				break;
		}
		goo.world.processEntityChanges();
		console.timeEnd('flip');
		// console.profileEnd('flip');

		for (var i = 0; i < goo.world._systems.length; i++) {
			var system = goo.world._systems[i];
			console.log(system.type, system._activeEntities.length);
		}
		console.log('-------------------');
	});

	V.button('Hide', function() {
		targetEntity.hide();
	});
	V.button('Show', function() {
		targetEntity.show();
	});
	V.button('Deactivate', function() {
		targetEntity.deactivate();
	});
	V.button('Activate', function() {
		targetEntity.activate();
	});
});
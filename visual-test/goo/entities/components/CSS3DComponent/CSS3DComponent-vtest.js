require([
	'goo/renderer/Camera',
	'goo/entities/components/CSS3DComponent',
	'goo/entities/systems/CSS3DSystem',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/util/gizmopack/GizmoRenderSystem',
	'lib/V'
], function (
	Camera,
	CSS3DComponent,
	CSS3DSystem,
	Material,
	ShaderLib,
	Box,
	Vector3,
	Transform,
	GizmoRenderSystem,
	V
	) {
	'use strict';

	V.describe('Testing the matching of CSS3D transformed DOM elements to our entities');

	var gizmoRenderSystem;

	function key1() {
		console.log('translation');
		gizmoRenderSystem.setActiveGizmo(0);
	}

	function key2() {
		console.log('rotation');
		gizmoRenderSystem.setActiveGizmo(1);
	}

	function key3() {
		console.log('scale');
		gizmoRenderSystem.setActiveGizmo(2);
	}

	function setupKeys() {
		document.body.addEventListener('keypress', function (e) {
			switch (e.which) {
				case 49: // 1
					key1();
					break;
				case 50: // 2
					key2();
					break;
				case 51: // 3
					key3();
					break;
				case 52: // 4
					var component = gizmoRenderSystem.entity.cSS3DComponent;
					component.setSize(component.width - 0.01, component.height - 0.01);
					break;
				case 53: // 5
					var component = gizmoRenderSystem.entity.cSS3DComponent;
					component.setSize(component.width + 0.01, component.height + 0.01);
					break;
				default:
					console.log('1: translate gizmo\n2: rotate gizmo\n3: scale gizmo');
			}
		});
	}

	function setupMouse() {
		function onPick(e) {
			if (e.domEvent.button !== 0) { return; }
			if (e.domEvent.shiftKey || e.domEvent.altKey) { return; }

			if (e.id < 16000) {
				if (e.id >= 0) {
					console.log('selected', e.id);
					var entitySelected = goo.world.entityManager.getEntityByIndex(e.id);
					gizmoRenderSystem.show(entitySelected);
				} else {
					console.log('deselected');
					gizmoRenderSystem.show(); // actually hides
				}
			} else if (e.id < 16100) {
				gizmoRenderSystem.activate(e.id, e.x, e.y);
			}
		}

		goo.addEventListener('mousedown', onPick);
		goo.addEventListener('touchstart', onPick);

		function onUnpick() {
			gizmoRenderSystem.deactivate();
		}

		document.addEventListener('mouseup', onUnpick);
		document.addEventListener('touchend', onUnpick);
	}

	function setupGizmos() {
		gizmoRenderSystem = new GizmoRenderSystem();
		gizmoRenderSystem.setActiveGizmo(0);
		goo.setRenderSystem(gizmoRenderSystem);
	}

	var goo = V.initGoo();
	var world = goo.world;

	V.addLights();
	V.addOrbitCamera(new Vector3(10, Math.PI/1.5, Math.PI/8), new Vector3(), 'Right');

	world.setSystem(new CSS3DSystem(goo.renderer));

	var material = new Material(ShaderLib.uber);

	var numBoxes = 4;
	var spread = 10.0;
	// var size = 2.5;
	// var box = new Box(size*4, size, size*0.2);
	var size = 1;
	var box = new Box(size, size, 0);
	var transform = new Transform();
	transform.translation.z = -box.zExtent;
	transform.update();
	box.applyTransform('POSITION', transform);
	for (var i = 0; i < numBoxes; i++) {
		for (var j = 0; j < numBoxes; j++) {
			for (var k = 0; k < numBoxes; k++) {
				var domElement = document.createElement('div');

				if (V.rng.nextFloat() > 0.5) {
					domElement.style.backgroundImage = 'url(https://dl.dropboxusercontent.com/u/640317/screenshot.jpg)';
				} else {
					domElement.className = 'object';
					domElement.innerText = 'Gooooo';
				}

				var width = (0.5+V.rng.nextFloat()*3);
				var height = (0.5+V.rng.nextFloat()*3);
				var htmlComponent = new CSS3DComponent(domElement, {
					width: width,
					height: height
					// backfaceVisibility: 'visible'
				});

				// Make some elements face the camera
				htmlComponent.faceCamera = V.rng.nextFloat() > 0.95;

				var position = [
					size * (i - numBoxes / 2) * spread,
					size * (j - numBoxes / 2) * spread,
					size * (k - numBoxes / 2) * spread
				];
				var entity = world.createEntity(position, material, htmlComponent);
				var entity = world.createEntity(position, box, material, htmlComponent);
				entity.setScale(width, height, 0.5+V.rng.nextFloat()*2);
				// entity.setScale(width, height, 1);
				entity.addToWorld();

				// var script = function (entity) {
					// entity.setScale(Math.sin(world.time)+1, 1, 1);
				// };
				// entity.set(script);

				// if (V.rng.nextFloat() > 0.7) {
				// 	var r1 = V.rng.nextFloat();
				// 	var r2 = V.rng.nextFloat();
				// 	(function(r1, r2) {
				// 		var script = function (entity) {
				// 			entity.setRotation(world.time * r1, world.time * r2, 0);
				// 		};
				// 		entity.set(script);
				// 	})(r1, r2);
				// }
			}
		}
	}

	// add the gizmo render system
	setupGizmos();

	// allow using the mouse to select what entity to transform
	setupMouse();

	setupKeys();

	V.process();
});

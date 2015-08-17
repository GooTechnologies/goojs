require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'goo/util/gizmopack/GizmoRenderSystem',
	'lib/V'
], function(
	Material,
	ShaderLib,
	Vector3,
	Box,
	Sphere,
	Torus,
	GizmoRenderSystem,
	V
) {
	'use strict';

	V.describe([
		'Select and entity and transform it using the transform gizmos.',
		'Change the active gizmo by hitting 1, 2, 3, 4 or 5.'
	].join('\n'));

	V.button('1', key1);
	V.button('2', key2);
	V.button('3', key3);
	V.button('4', key4);
	V.button('5', key5);

	function key1() {
		console.log('translation, global');
		gizmoRenderSystem.global = true;
		gizmoRenderSystem.setActiveGizmo(0);
	}

	function key2() {
		console.log('translation, local');
		gizmoRenderSystem.global = false;
		gizmoRenderSystem.setActiveGizmo(0);
	}

	function key3() {
		console.log('rotation, local');
		gizmoRenderSystem.setActiveGizmo(1);
	}

	function key4() {
		console.log('rotation, global');
		gizmoRenderSystem.setActiveGizmo(2);
	}

	function key5() {
		console.log('scale');
		gizmoRenderSystem.setActiveGizmo(3);
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
					key4();
					break;
				case 53: // 5
					key5();
					break;
				default:
					console.log([
						'1: translate gizmo, global',
						'2: translate gizmo, local',
						'3: rotate gizmo, global',
						'4: rotate gizmo, local',
						'5: scale gizmo'
					].join('\n'));
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

	// initialise goo
	var goo = V.initGoo();
	var world = goo.world;

	var gizmoRenderSystem;

	// add some lights
	V.addLights();

	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3), new Vector3(), 'Right');

	// standard material
	var material = new Material(ShaderLib.simpleLit);

	// add some entities
	world.createEntity(new Box(), material, [3, 0, 0]).addToWorld();
	var sphereEntity = world.createEntity(new Sphere(32, 32), material, [0, 0, 0]).addToWorld();
	world.createEntity(new Torus(32, 32, 0.1, 0.5), material, [-3, 0, 0]).addToWorld();

	// add the gizmo render system
	setupGizmos();

	// allow using the mouse to select what entity to transform
	setupMouse();

	// allow switching of active gizmo with the 1, 2 and 3 keys
	setupKeys();

	gizmoRenderSystem.show(sphereEntity);

	console.log('Pick entities to select them and press 1, 2, 3 to switch between transform gizmos');

	V.process();
});
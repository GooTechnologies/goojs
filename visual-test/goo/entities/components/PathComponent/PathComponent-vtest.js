require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/util/gizmopack/GizmoRenderSystem',
	'goo/entities/components/MeshDataComponent',
	'lib/V',
	'Path',
	'PathAnchor',
	'PathAnchorControl'
], function (
	Material,
	ShaderLib,
	Vector3,
	GizmoRenderSystem,
	MeshDataComponent,
	V,
	Path,
	PathAnchor,
	PathAnchorControl
) {
	'use strict';

	V.describe('Path component');

	var goo = V.initGoo();
	var world = goo.world;
	var gizmoRenderSystem;

	function setupMouse() {
		function onPick(e) {
			if (e.domEvent.button !== 0) { return; }
			if (e.domEvent.shiftKey || e.domEvent.altKey) { return; }

			if (e.id < 16000) {
				var isDraggable = false;

				if (e.id >= 0) {
					var entitySelected = goo.world.entityManager.getEntityByIndex(e.id);
					if (entitySelected instanceof PathAnchor ||
						entitySelected instanceof PathAnchorControl) {
						isDraggable = true;
						gizmoRenderSystem.show(entitySelected);
					}
				}

				if (!isDraggable) {
					gizmoRenderSystem.show();
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

	//--------------------------------------------------------------------------

	var path = new Path(world).addToWorld();
	path.addAnchor([0, 0, 0]);
	path.addAnchor([0, 0, 2]);
	path.addAnchor([0, 0, 4]);
	path.addAnchor([0, 0, 6]);
	path.addAnchor([0, 0, 8]);
	path.update();

	goo.callbacks.push(path.update.bind(path));

	V.addLights();
	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3), new Vector3(), 'Right');

	setupGizmos();
	setupMouse();
	gizmoRenderSystem.show(path[0]);

	V.process();
});

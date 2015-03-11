require([
	'goo/renderer/Camera',
	'goo/entities/components/CSS3DComponent',
	'goo/entities/systems/CSS3DSystem',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/util/gizmopack/GizmoRenderSystem',
	'goo/util/Skybox',
	'lib/V'
], function (
	Camera,
	CSS3DComponent,
	CSS3DSystem,
	Material,
	ShaderLib,
	Box,
	Quad,
	Vector3,
	Transform,
	GizmoRenderSystem,
	Skybox,
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
					console.log('selected', e);
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

	var goo = V.initGoo({
		alpha: true
	});
	var world = goo.world;

	V.addLights();
	var camEntity = V.addOrbitCamera(new Vector3(150, Math.PI/1.5, Math.PI/8), new Vector3(), 'Right');
	camEntity.cameraComponent.camera.setFrustumPerspective(null, null, 1, 10000);

	var css3dSystem = new CSS3DSystem(goo.renderer);
	world.setSystem(css3dSystem);

	var material = new Material(ShaderLib.uber);
	material.renderQueue = 2;
	material.uniforms.opacity = 0;
	material.uniforms.materialAmbient = [0, 0, 0, 0];
	material.uniforms.materialDiffuse = [0, 0, 0, 0];
	// material.cullState.enabled = false;

	var material2 = new Material(ShaderLib.uber);
	var box2 = new Box(50, 50, 50);
	var entity = world.createEntity([0,0,0], box2, material2).addToWorld();

	var numBoxes = 4;
	var spread = 50.0;
	for (var i = 0; i < numBoxes; i++) {
		for (var j = 0; j < numBoxes; j++) {
			for (var k = 0; k < numBoxes; k++) {
				var domElement;
				var width = (0.5+V.rng.nextFloat()*3)*100;
				var height = (0.5+V.rng.nextFloat()*3)*100;
				var rand = V.rng.nextFloat();
				if (rand > 0.6) {
					domElement = document.createElement('div');
					domElement.style.backgroundImage = 'url(https://dl.dropboxusercontent.com/u/640317/screenshot.jpg)';
				} else if (rand > 0.1) {
					domElement = document.createElement('div');
					domElement.className = 'object';
					domElement.innerText = 'Gooooo';
					domElement.style.border	= '1px solid black';
					domElement.style.backgroundColor = 'blue';
					domElement.style.padding = '20px';
				} else {
					width = 768;
					height = 640;
					domElement = document.createElement('iframe');
					domElement.src = 'https://get.webgl.org/';
					domElement.style.border	= 'none';
					domElement.style.width = '100%';
					domElement.style.height = '100%';
				}

				var htmlComponent = new CSS3DComponent(domElement, {
					width: width,
					height: height
					// backfaceVisibility: 'visible'
				});

				// Make some elements face the camera
				// htmlComponent.faceCamera = V.rng.nextFloat() > 0.95;

				var position = [
					(i - (numBoxes / 2)) * spread,
					(j - (numBoxes / 2)) * spread,
					(k - (numBoxes / 2)) * spread
				];
				var quad = new Quad(width, height);
				var entity = world.createEntity(position, quad, material, htmlComponent);
				entity.setScale(0.1, 0.1, 1);
				entity.addToWorld();

				// var script = function (entity) {
					// entity.setScale(Math.sin(world.time)+1, 1, 1);
				// };
				// entity.set(script);

				if (V.rng.nextFloat() > 0.7) {
					var r1 = V.rng.nextFloat();
					var r2 = V.rng.nextFloat();
					(function(r1, r2) {
						var script = function (entity) {
							entity.setRotation(world.time * r1, world.time * r2, 0);
						};
						entity.set(script);
					})(r1, r2);
				}
			}
		}
	}

	// add the gizmo render system
	setupGizmos();

	// allow using the mouse to select what entity to transform
	setupMouse();

	setupKeys();

	// var environmentPath = '../../../addons/Water/resources/skybox/';
	// var images = [
	// 	environmentPath + '1.jpg',
	// 	environmentPath + '3.jpg',
	// 	environmentPath + '6.jpg',
	// 	environmentPath + '5.jpg',
	// 	environmentPath + '4.jpg',
	// 	environmentPath + '2.jpg'
	// ];
	// var skybox = new Skybox(Skybox.BOX, images, null, 0);
	// goo.world.createEntity(
	// 	skybox.transform,
	// 	skybox.materials[0],
	// 	skybox.meshData
	// ).addToWorld();

	V.process();
});

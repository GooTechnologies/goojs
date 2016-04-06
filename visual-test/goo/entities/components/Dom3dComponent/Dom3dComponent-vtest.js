goo.V.attachToGlobal();

	// V.describe('Testing the matching of CSS3D transformed DOM elements to our entities');

	var gizmoRenderSystem;
	var entitySelected;
	var gooRunner;

	function key1() {
		gizmoRenderSystem.setActiveGizmo(0);
	}

	function key2() {
		gizmoRenderSystem.setActiveGizmo(2);
	}

	function key3() {
		gizmoRenderSystem.setActiveGizmo(4);
	}

	function setupKeys() {
		document.body.addEventListener('keypress', function(e) {
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
					gooRunner.renderer.domElement.style.pointerEvents = 'none';
					break;
				case 53: // 5
					gooRunner.renderer.domElement.style.pointerEvents = 'inherit';
					break;
				case 54: // 6
					if (entitySelected) {
						var w = entitySelected.dom3dComponent.width;
						var h = entitySelected.dom3dComponent.height;
						entitySelected.dom3dComponent.setSize(w/2, h/2);
					}
					break;
				case 55: // 7
					if (entitySelected) {
						var w = entitySelected.dom3dComponent.width;
						var h = entitySelected.dom3dComponent.height;
						entitySelected.dom3dComponent.setSize(w*2, h*2);
					}
					break;
				case 56: // 8
					if (entitySelected) {
						entitySelected.dom3dComponent.useTransformComponent = !entitySelected.dom3dComponent.useTransformComponent;
					}
					break;

				default:
					console.log('1: translate gizmo\n2: rotate gizmo\n3: scale gizmo');
			}
		});
	}

	function setupMouse() {
		function onPick(e) {
			if (e.domEvent.button !== 0) {
				return;
			}
			if (e.domEvent.shiftKey || e.domEvent.altKey) {
				return;
			}

			if (e.id < 16000) {
				if (e.id >= 0) {
					entitySelected = world.entityManager.getEntityByIndex(e.id);
					gizmoRenderSystem.show(entitySelected);
				} else {
					gizmoRenderSystem.show(); // actually hides
				}
			} else if (e.id < 16100) {
				gizmoRenderSystem.activate(e.id, e.x, e.y);
			}
		}

		gooRunner.addEventListener('mousedown', onPick);
		gooRunner.addEventListener('touchstart', onPick);

		function onUnpick() {
			gizmoRenderSystem.deactivate();
		}

		document.addEventListener('mouseup', onUnpick);
		document.addEventListener('touchend', onUnpick);
	}

	function setupGizmos() {
		gizmoRenderSystem = new GizmoRenderSystem();
		gizmoRenderSystem.setActiveGizmo(0);
		gooRunner.setRenderSystem(gizmoRenderSystem);
	}

	function addOrbitCamera(spherical, lookAt, dragButton) {
		spherical = new Vector3(spherical);
		lookAt = new Vector3(lookAt);

		// Convert to degrees since the script uses degrees
		spherical.y = MathUtils.degFromRad(spherical.y);
		spherical.z = MathUtils.degFromRad(spherical.z);

		var camera = new Camera();

		var orbitCamOptions = {
			domElement: gooRunner.renderer.domElement,
			releaseVelocity: true,
			interpolationSpeed: 7,
			dragButton: dragButton || 'Any',
			lookAtDistance: null,
			spherical: spherical,
			whenUsed : true,
			orbitSpeed : 0.005,
			zoomSpeed : 1,
			inertia: 0.9,
			smoothness: 0.4,
			drag : 0,
			minZoomDistance : 0.001,
			maxZoomDistance : 1000,
			minAscent : -89,
			maxAscent : 89,
			clampAzimuth : false,
			minAzimuth : 90,
			maxAzimuth : 270,
			lookAtPoint: lookAt,

			// Pan
			panButton: 'Middle',
			panSpeed : 0.005
		};

		var orbitScript = Scripts.create(OrbitNPanControlScript, orbitCamOptions);
		var entity = gooRunner.world.createEntity(camera, orbitScript, 'CameraEntity').addToWorld();
		return entity;
	}

	function loadProject(gooRunner) {

		// The loader takes care of loading the data.
		var loader = new DynamicLoader({
			world: gooRunner.world,
			rootPath: 'res'
		});

		return loader.load('root.bundle', {
			preloadBinaries: true,
			//progressCallback: progressCallback
		}).then(function(result) {
			var project = null;

			// Try to get the first project in the bundle.
			for (var key in result) {
				if (/\.project$/.test(key)) {
					project = result[key];
					break;
				}
			}

			if (!project || !project.id) {
				alert('Error: No project in bundle'); // Should never happen.
				return null;
			}

			return loader.load(project.id);
		});
	}

	gooRunner = V.initGoo({
		alpha: true,
		showStats: true
	});
	var world = gooRunner.world;
	world.add(new AnimationSystem());
	world.add(new StateMachineSystem(gooRunner));
	world.add(new Dom3dSystem(gooRunner.renderer));
	world.add(new TimelineSystem());
	// var Dom3dSystem = new Dom3dSystem(gooRunner.renderer);
	// world.setSystem(Dom3dSystem);

	var transformSystem = world.getSystem('TransformSystem');
	var cameraSystem = world.getSystem('CameraSystem');
	var lightingSystem = world.getSystem('LightingSystem');
	var boundingSystem = world.getSystem('BoundingUpdateSystem');
	var renderSystem = world.getSystem('RenderSystem');
	var renderer = gooRunner.renderer;

	SystemBus.addListener('gooRunner.dom3d.enabled', function (val) {
		if (val) {
			gooRunner.renderer.domElement.style.pointerEvents = 'none';
		} else {
			gooRunner.renderer.domElement.style.pointerEvents = '';
		}
	});

	// Load the project
	loadProject(gooRunner).then(function() {
		world.processEntityChanges();
		transformSystem._process();
		lightingSystem._process();
		cameraSystem._process();
		boundingSystem._process();
		if (Renderer.mainCamera) {
			gooRunner.renderer.checkResize(Renderer.mainCamera);
		}
	}).then(function() {
		// var goon = world.by.name('goon_mesh').first();
		// goon.meshRendererComponent.isReflectable = true;
		// goon.setTranslation(0, -1000, 3000);
		// goon.setScale(20, 20, 20);
		// goon.hide();

		gooRunner.renderSystems[0].composers.length = 0;

		// add the gizmo render system
		setupGizmos();

		// allow using the mouse to select what entity to transform
		setupMouse();

		setupKeys();

		V.addLights();
		var camEntity = addOrbitCamera(new Vector3(15, Math.PI / 1.5, Math.PI / 6), new Vector3(), 'Right');
		camEntity.cameraComponent.camera.setFrustumPerspective(null, null, 1, 1000);
		camEntity.setAsMainCamera();

		// console.log(window.WindowHelper);
		// window.WindowHelper.install(Dom3dSystem.rootDom, gooRunner.renderer.domElement);

		var material2 = new Material(ShaderLib.uber);
		material2.uniforms.materialDiffuse = [0.3, 0.3, 0.3, 1];
		var box2 = new Box(10, 1, 10);
		world.createEntity([0, -0.6, 0], box2, material2).addToWorld();

		function createIFrame(width, height, position, rotation, src) {
			var domElement = document.createElement('iframe');
			domElement.src = src;
			domElement.style.border = 'none';
			domElement.style.width = '100%';
			domElement.style.height = '100%';

			var dom3dComponent = new Dom3dComponent(domElement, {
				width: width,
				height: height
			});
			var entity = world.createEntity(position, dom3dComponent);
			var aspect = width / height;
			entity.setScale(3 * aspect, 3, 1);
			entity.setRotation(rotation);
			entity.addToWorld();
		}

		var domElement = document.createElement('div');
		domElement.innerText = 'Blaha blaha';
		var dom3dComponent = new Dom3dComponent(domElement, {
			width: 200,
			height: 100
		});
		var entity = world.createEntity([0, 0, 0], dom3dComponent);
		entity.setScale(dom3dComponent.width / dom3dComponent.height * 2, 2, 1);
		entity.setRotation([-Math.PI / 2, 0, 0]);
		entity.addToWorld();

		createIFrame(500, 281, [-4, 2, -2], [0, Math.PI / 4, 0], 'https://player.vimeo.com/video/77588448?title=0&byline=0&portrait=0');
		createIFrame(768, 640, [4, 2, -2], [0, -Math.PI / 4, 0], 'https://gootechnologies.com');
		createIFrame(1000, 1000, [0, 2, -4], [0, 0, 0], 'https://duckduckgo.com/');

		var environmentPath = '../../../addons/Water/resources/skybox/';
		var images = [
			environmentPath + '1.jpg',
			environmentPath + '3.jpg',
			environmentPath + '6.jpg',
			environmentPath + '5.jpg',
			environmentPath + '4.jpg',
			environmentPath + '2.jpg'
		];
		var skybox = new Skybox(Skybox.BOX, images, null, 0);
		var skyEnt = world.createEntity(
			skybox.transform,
			skybox.materials[0],
			skybox.meshData
		).addToWorld();
		skyEnt.meshRendererComponent.cullMode = 'Never';

		return renderer.precompileShaders(renderSystem._activeEntities, renderSystem.lights);
	}).then(function() {
		return renderer.preloadMaterials(renderSystem._activeEntities);
	}).then(function() {
		// Start the rendering loop!
		V.process();
	}).then(null, function(e) {
		// If something goes wrong, 'e' is the error message from the engine.
		alert('Failed to load project: ' + e);
	});

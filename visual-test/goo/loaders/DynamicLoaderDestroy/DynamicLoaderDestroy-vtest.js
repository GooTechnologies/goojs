require([
	'goo/entities/GooRunner',
	'goo/animationpack/systems/AnimationSystem',
	'goo/fsmpack/statemachine/StateMachineSystem',
	'goo/entities/systems/HtmlSystem',
	'goo/timelinepack/TimelineSystem',
	'goo/loaders/DynamicLoader',
	'goo/util/combine/EntityCombiner',
	'goo/renderer/Renderer',
	'lib/V',
	'goo/util/rsvp',

	'CanvasWrapper',
	'WebGLSupport',

	'goo/animationpack/handlers/AnimationHandlers',

	'goo/fsmpack/StateMachineHandlers',
	'goo/timelinepack/TimelineComponentHandler',
	'goo/passpack/PosteffectsHandler',
	'goo/quadpack/QuadComponentHandler',
	'goo/scriptpack/ScriptHandlers',
	'goo/scriptpack/ScriptRegister',
	'goo/scripts/GooClassRegister'
], function (
	GooRunner,
	AnimationSystem,
	StateMachineSystem,
	HtmlSystem,
	TimelineSystem,
	DynamicLoader,
	EntityCombiner,
	Renderer,
	V
) {
	'use strict';

	V.describe([
		'A scene with a goon and the bloom post effect is loaded and unloaded repeatedly.',
		'All resources should be deallocated on unload and with time the memory usage should not go up.',
		'Use a webgl inspector to track how many textures/buffers/programs are used at any time.',
	].join('\n'));

	// to replace this scene with another, just clean the res folder and drop new assets in it

	var gooRunner;
	function init() {

		// Init the GooEngine
		gooRunner = initGoo();
		var world = gooRunner.world;

		var transformSystem = world.getSystem('TransformSystem');
		var cameraSystem = world.getSystem('CameraSystem');
		var boundingSystem = world.getSystem('BoundingUpdateSystem');
		var renderSystem = world.getSystem('RenderSystem');
		var renderer = gooRunner.renderer;

		// Load the project
		loadProject(gooRunner).then(function (loader) {
			world.processEntityChanges();
			transformSystem._process();
			cameraSystem._process();
			boundingSystem._process();
			if (Renderer.mainCamera) { gooRunner.renderer.checkResize(Renderer.mainCamera); }
		}).then(function () {
			new EntityCombiner(world).combine();
			world.processEntityChanges();
			transformSystem._process();
			cameraSystem._process();
			boundingSystem._process();
			renderSystem._process();

			return renderer.precompileShaders(renderSystem._activeEntities, renderSystem.lights);
		}).then(function () {
			return renderer.preloadMaterials(renderSystem._activeEntities);
		}).then(function () {
			// Start the rendering loop!
			gooRunner.startGameLoop();
			gooRunner.renderer.domElement.focus();
		}).then(null, function (e) {
			// If something goes wrong, 'e' is the error message from the engine.
			alert('Failed to load project: ' + e);
		});
	}

	function initGoo() {

		// Create typical Goo application.
		var gooRunner = new GooRunner({
			antialias: true,
			manuallyStartGameLoop: true,
			useDevicePixelRatio: true,
			logo: false
		});

		document.body.appendChild(gooRunner.renderer.domElement);

		gooRunner.world.add(new AnimationSystem());
		gooRunner.world.add(new StateMachineSystem(gooRunner));
		gooRunner.world.add(new HtmlSystem(gooRunner.renderer));
		gooRunner.world.add(new TimelineSystem());

		return gooRunner;
	}


	function loadProject(gooRunner) {

		// The loader takes care of loading the data.
		var loader = new DynamicLoader({
			world: gooRunner.world,
			rootPath: 'res'
		});

		setInterval(function () {
			console.log('clearing!');

			// clear everything and reload
			loader.clear().then(function () {
				gooRunner.world.process();
				gooRunner.world.process();
				return loader.load('root.bundle', { preloadBinaries: true });
			}).then(function (result) {

				gooRunner.world.process();
				gooRunner.world.process();

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

				console.log('loading!');
				return loader.load(project.id);
			});
		}, 5000);

		// The loader takes care of loading the data.
		var loader = new DynamicLoader({
			world: gooRunner.world,
			rootPath: 'res'
		});

		return loader.load('root.bundle', {
			preloadBinaries: true
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

			// Setup the canvas configuration (sizing mode, resolution, aspect
			// ratio, etc).
			/*var scene = result[project.mainSceneRef];
			var canvasConfig = scene ? scene.canvas : {};
			CanvasWrapper.setup(gooRunner.renderer.domElement, canvasConfig);
			CanvasWrapper.add();
			CanvasWrapper.hide();
			*/

			return loader.load(project.id);
		});
	}
	init();
});
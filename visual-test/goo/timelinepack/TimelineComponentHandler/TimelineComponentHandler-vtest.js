require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'lib/V',

	'goo/loaders/DynamicLoader',

	'goo/timelinepack/TimelineComponentHandler',
	'goo/timelinepack/TimelineSystem',

	'goo/entities/SystemBus'
], function (
	Material,
	ShaderLib,
	Vector3,
	Box,
	Sphere,
	Torus,
	V,

	DynamicLoader,
	TimelineComponentHandler,
	TimelineSystem,

	SystemBus
) {
	'use strict';

	V.describe('The sphere has a timeline component which was loadd using the dynamic loader.');

	function setupGUI() {
		var buttonReset = document.createElement('button');
		buttonReset.innerHTML = 'reset';
		buttonReset.addEventListener('click', TimelineSystem.prototype.reset.bind(timelineSystem));
		document.body.appendChild(buttonReset);

		var buttonPause = document.createElement('button');
		buttonPause.innerHTML = 'pause';
		buttonPause.addEventListener('click', TimelineSystem.prototype.pause.bind(timelineSystem));
		document.body.appendChild(buttonPause);

		var buttonResume = document.createElement('button');
		buttonResume.innerHTML = 'play';
		buttonResume.addEventListener('click', TimelineSystem.prototype.play.bind(timelineSystem));
		document.body.appendChild(buttonResume);
	}

	function setupEventListener() {
		SystemBus.addListener('eventchannel1', function (data) {
			console.log('Got message on', 'eventchannel1', ':', data);
		});
	}

	var goo = V.initGoo({
		manuallyStartGameLoop: true
	});

	var world = goo.world;
	var timelineSystem = new TimelineSystem();
	world.add(timelineSystem);

	// The loader takes care of loading the data
	var loader = new DynamicLoader({
		world: world,
		rootPath: './'
	});

	loader.load('root.bundle', {
		preloadBinaries: true
	}).then(function (result) {
		// Grab the first project in the bundle.
		var bundleKeys = Object.keys(result);
		var projectIds = bundleKeys.filter(function(k) {
			return /\.project$/.test(k);
		});
		var projectId = projectIds[0];
		if (!projectId) {
			alert('Error: No project in bundle'); // Should never happen
			return null;
		}

		setupGUI();
		setupEventListener();

		return loader.load(projectId);
	}).then(function () {
		// This code will be called when the project has finished loading.
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		goo.world.process();

		// Application code goes here!

		// Start the rendering loop!
		goo.startGameLoop();

	}).then(null, function (e) {

	});
});
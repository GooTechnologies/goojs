require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/components/MeshDataComponent',
	'goo/math/Vector3',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'goo/math/Matrix3x3',
	'lib/V',

	'goo/loaders/DynamicLoader',

	'goo/timelinepack/TimelineComponentHandler',
	'goo/timelinepack/TimelineSystem'
], function (
	GooRunner,
	Material,
	ShaderLib,
	MeshDataComponent,
	Vector3,
	Box,
	Sphere,
	Torus,
	Matrix3x3,
	V,

	DynamicLoader,
	TimelineComponentHandler,
	TimelineSystem
) {
	'use strict';

	var goo = V.initGoo({
		antialias: true,
		manuallyStartGameLoop: true
	});

	var world = goo.world;

	world.add(new TimelineSystem());

	// The loader takes care of loading the data
	var loader = new DynamicLoader({
		world: world,
		rootPath: './'
	});

	loader.load('root.bundle', {
		preloadBinaries: true
	}).then(function(result) {
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

		return loader.load(projectId);
	}).then(function() {
		// This code will be called when the project has finished loading.
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		goo.world.process();

		// Application code goes here!

		/*
		 To get a hold of entities, one can use the World's selection functions:
		 var allEntities = goo.world.getEntities();                  // all
		 var entity      = goo.world.by.name('EntityName').first();  // by name
		 */

		// Start the rendering loop!
		goo.startGameLoop();

	}).then(null, function(e) {
		// If something goes wrong, 'e' is the error message from the engine.
		//alert('Failed to load project: ' + e);
	});
});
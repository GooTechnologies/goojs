
	goo.V.attachToGlobal();

	V.describe('Html component handler');

	var gooRunner = V.initGoo();

	var world = gooRunner.world;
	var htmlSystem = new HtmlSystem(gooRunner.renderer);
	world.add(htmlSystem);

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

		return loader.load(projectId);
	}).then(function () {
		// This code will be called when the project has finished loading.
		gooRunner.renderer.domElement.id = 'goo';
		document.body.appendChild(gooRunner.renderer.domElement);
	}).then(null, function (e) {
		throw e;
	});

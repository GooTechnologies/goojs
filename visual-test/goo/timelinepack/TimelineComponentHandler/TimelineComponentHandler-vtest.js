
	goo.V.attachToGlobal();

	V.describe('The sphere has a timeline component which was loadd using the dynamic loader.');

	function setupGUI() {
		var buttonReset = document.createElement('button');
		buttonReset.innerHTML = 'reset';
		buttonReset.addEventListener('click', function(){
			timelineSystem.stop();
		});
		document.body.appendChild(buttonReset);

		var buttonPause = document.createElement('button');
		buttonPause.innerHTML = 'pause';
		buttonPause.addEventListener('click', function(){
			timelineSystem.pause();
		});
		document.body.appendChild(buttonPause);

		var buttonResume = document.createElement('button');
		buttonResume.innerHTML = 'play';
		buttonResume.addEventListener('click', function(){
			timelineSystem.play();
		});
		document.body.appendChild(buttonResume);
	}

	function setupEventListener() {
		SystemBus.addListener('eventchannel1', function (data) {
			console.log('Got message on', 'eventchannel1', ':', data);
		});
	}

	var gooRunner = V.initGoo({
		manuallyStartGameLoop: true
	});

	var world = gooRunner.world;
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
		gooRunner.renderer.domElement.id = 'goo';
		document.body.appendChild(gooRunner.renderer.domElement);

		gooRunner.world.process();

		// Application code goes here!

		// Start the rendering loop!
		gooRunner.startGameLoop();

	}).then(null, function (e) {

	});

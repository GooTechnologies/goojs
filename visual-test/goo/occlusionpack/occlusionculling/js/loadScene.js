require.config({
	baseUrl : './',
	paths : {
		"goo": "../../../src/goo"
	}
});
require([
	'goo/entities/GooRunner',
	'goo/statemachine/FSMSystem',
	'goo/addons/howler/systems/HowlerSystem',
	'goo/loaders/DynamicLoader',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/ScriptComponent',
	'goo/scripts/FlyControlScript',
	'goo/shapes/ShapeCreator',
	'goo/math/Vector3',

	'goo/renderer/OcclusionPartitioner',
	'goo/entities/components/OccluderComponent',
	'goo/entities/components/OccludeeComponent'
], function (
	GooRunner,
	FSMSystem,
	HowlerSystem,
	DynamicLoader,
	Camera,
	CameraComponent,
	ScriptComponent,
	FlyControlScript,
	ShapeCreator,
	Vector3,

	OcclusionPartitioner,
	OccluderComponent,
	OccludeeComponent
) {
	'use strict';

	var goo;

	var defaultPartitioner, occlusionPartitioner;

	var cameraEntity;
	var sunOriginalPos;
	var workerVec = new Vector3();

	function addCamera() {
		var camera = new Camera(90, 1, 1, 1000);
		cameraEntity = goo.world.createEntity('CameraEntity');
		cameraEntity.setComponent(new CameraComponent(camera));
		var cameraScript = new ScriptComponent();
		var speed = 20;
		cameraScript.scripts.push(new FlyControlScript({
			domElement: document.body, // Had to add this to override over the debug canvas element, which otherwise takes over the events.
			walkSpeed: speed,
			crawlSpeed: speed * 0.1,
			maxSpeed: speed * 0.2
		}));
		cameraEntity.setComponent(cameraScript);
		cameraEntity.transformComponent.transform.translation.set(0, 1.79, 10);
		cameraEntity.addToWorld();
		return camera;
	}

	function setupOcclusionCullingSystem(camera) {

		// Defines the resolution which is used by the software renderer.
		// Higher is more precise, but slower.
		var WIDTH = 64;
		var HEIGHT = 32;

		var debugcanvas = document.createElement('canvas');
		debugcanvas.width = WIDTH;
		debugcanvas.height = HEIGHT;
		debugcanvas.id = "debugcanvas";
		document.body.appendChild(debugcanvas);
		var debugContext = debugcanvas.getContext('2d');


		// Buffer memory for the software renderer.
		var maxNumberOfOccluderVertices = 104;
		var maxTrianglesPerOccluder = 32;
		var maxNumberOfOccluderIndices = 3 * maxTrianglesPerOccluder;
		occlusionPartitioner = new OcclusionPartitioner({
			"width": WIDTH,
			"height": HEIGHT,
			"camera": camera,
			"maxVertCount": maxNumberOfOccluderVertices,
			"maxIndexCount": maxNumberOfOccluderIndices
			//"debugContext": debugContext // Uncomment this to enable the debug canvas.
		});

		defaultPartitioner = goo.renderSystem.partitioner;

		// Override the current renderList for rendering in the GooRunner.
		goo.renderSystem.partitioner = occlusionPartitioner;
	}

	function generateCrateTown(crate) {
		var width, height;
		width = height = 1400;
		var instanceDensity = width / 20;
		var randomRadius = instanceDensity * 0.1;
		var MAX_SCALE = 10;

		var yExtent = crate.meshDataComponent.modelBound.yExtent;

		for (var w = -width/2; w < width/2; w += instanceDensity) {
			for (var h = -height/2; h < height/2; h += instanceDensity) {
				var clone = EntityUtils.clone(goo.world, crate);
				var tc = clone.transformComponent;

				// Add some random offset in a circle from the destination
				var alpha = Math.random() * Math.PI * 2;
				var xpos = w + randomRadius * Math.sin(alpha);
				var zpos = h + randomRadius * Math.cos(alpha);

				var scale = Math.random() * MAX_SCALE + 1;

				var translation = tc.transform.translation;

				var rotation = Math.random() * 360;

				translation[0] = xpos;
				translation[1] += yExtent * scale;
				translation[2] = zpos;
				tc.setTranslation(translation);
				tc.setScale([scale, scale, scale]);
				tc.setRotation([0, rotation, 0]);
				clone.addToWorld();
			}
		}
	}

	function init() {

		// If you try to load a scene without a server, you're gonna have a bad time
		if (window.location.protocol==='file:') {
			alert('You need to run this webpage on a server. Check the code for links and details.');
			return;

			/*

			Loading scenes uses AJAX requests, which require that the webpage is accessed via http. Setting up
			a web server is not very complicated, and there are lots of free options. Here are some suggestions
			that will do the job and do it well, but there are lots of other options.

			- Windows

			There's Apache (http://httpd.apache.org/docs/current/platform/windows.html)
			There's nginx (http://nginx.org/en/docs/windows.html)
			And for the truly lightweight, there's mongoose (https://code.google.com/p/mongoose/)

			- Linux
			Most distributions have neat packages for Apache (http://httpd.apache.org/) and nginx
			(http://nginx.org/en/docs/windows.html) and about a gazillion other options that didn't
			fit in here.
			One option is calling 'python -m SimpleHTTPServer' inside the unpacked folder if you have python installed.


			- Mac OS X

			Most Mac users will have Apache web server bundled with the OS.
			Read this to get started: http://osxdaily.com/2012/09/02/start-apache-web-server-mac-os-x/

			*/
		}

		// Make sure user is running Chrome/Firefox and that a WebGL context works
		var isChrome, isFirefox, isIE, isOpera, isSafari, isCocoonJS;
		isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
			isFirefox = typeof InstallTrigger !== 'undefined';
			isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
			isChrome = !!window.chrome && !isOpera;
			isIE = false || document.documentMode;
			isCocoonJS = navigator.appName === "Ludei CocoonJS";
		if (!(isFirefox || isChrome || isSafari || isCocoonJS || isIE === 11)) {
			alert("Sorry, but your browser is not supported.\nGoo works best in Google Chrome or Mozilla Firefox.\nYou will be redirected to a download page.");
			window.location.href = 'https://www.google.com/chrome';
		} else if (!window.WebGLRenderingContext) {
			alert("Sorry, but we could not find a WebGL rendering context.\nYou will be redirected to a troubleshooting page.");
			window.location.href = 'http://get.webgl.org/troubleshooting';
		} else {

			// Preventing browser peculiarities to mess with our control
			document.body.addEventListener('touchstart', function(event) {
				event.preventDefault();
			}, false);
			// Loading screen callback
			var progressCallback = function (handled, total) {
				var loadedPercent = (100*handled/total).toFixed();
				var loadingOverlay = document.getElementById("loadingOverlay");
				var progressBar = document.getElementById("progressBar");
				var progress = document.getElementById("progress");
				var loadingMessage = document.getElementById("loadingMessage");
				loadingOverlay.style.display = "block";
				loadingMessage.style.display = "block";
				progressBar.style.display = "block";
				progress.style.width = loadedPercent + "%";
			};

			// Create typical Goo application
			goo = new GooRunner({
				antialias: true,
				manuallyStartGameLoop: true,
				debugKeys: true,
				showStats: true
			});
			var fsm = new FSMSystem(goo);
			goo.world.setSystem(fsm);
			goo.world.setSystem(new HowlerSystem());

			// The loader takes care of loading the data
			var loader = new DynamicLoader({
				world: goo.world,
				rootPath: 'res',
				progressCallback: progressCallback});

			loader.loadFromBundle('project.project', 'root.bundle', {recursive: false, preloadBinaries: true}).then(function(configs) {
				// This code will be called when the project has finished loading.
				console.log(configs);

				// Sets and adds the canvas to the DOM.
				goo.renderer.domElement.id = 'goo';
				document.body.appendChild(goo.renderer.domElement);

				var camera = addCamera();
				setupOcclusionCullingSystem(camera);

				var sun = loader.getCachedObjectForRef('entities/DirectionalLight.entity');
				var sunScripts = new ScriptComponent();
				sunOriginalPos = new Vector3(sun.transformComponent.transform.translation);
				sunScripts.scripts.push({run : function (entity, tpf, env) {
					var camt = cameraEntity.transformComponent.transform.translation;
					Vector3.addv(camt, sunOriginalPos, workerVec);
					entity.transformComponent.setTranslation(workerVec);
				}});
				sun.setComponent(sunScripts);

				var crate = loader.getCachedObjectForRef('crate/entities/Crate_001_Mesh_0.entity');
				crate.removeFromWorld();
				// Create a occluder mesh, a box will do fine, since the crate is a box....
				// Here we are using the crate's bound to create a big enough mesh.
				// NOTE : THE OCCLUDER MESH MUST BE CONTAINED INSIDE THE ACTUAL VISIBLE MESH.
				var size = crate.meshDataComponent.modelBound.xExtent * 1.9;
				var occluderMesh = ShapeCreator.createBox(size, size, size);
				// Set the crate to be an occluder
				crate.setComponent(new OccluderComponent(occluderMesh));

				// Set objects to be occludees, i.e. to be removed by occluding entities.
				// Using bounding box of the occludees' shapes to check for occlusion.
				var useBoundingBox = true;

				// The entities which should be used here are the ones with the meshDataComponent.
				var occludeeEntities = [];
				var logo = loader.getCachedObjectForRef('goo_logo/entities/goo_logo_mesh_0.entity');
				var logoScripts = new ScriptComponent();
				logoScripts.scripts.push({run: function(entity, tpf, env){
					workerVec.data[0] = 0;
					workerVec.data[1] = goo.world.time * 0.5;
					workerVec.data[2] = 0;
					entity.transformComponent.setRotation(workerVec);
				}});
				logo.setComponent(logoScripts);

				occludeeEntities.push(logo);
				// also add the crate as an occludee
				occludeeEntities.push(crate);

				// Add an OccludeeComponent to each of the entites.
				for (var i = 0, _len = occludeeEntities.length; i < _len; i++) {
					var entity = occludeeEntities[i];
					entity.setComponent(new OccludeeComponent(entity.meshDataComponent.meshData, useBoundingBox));
				}

				generateCrateTown(crate);


				// Start the rendering loop!
				goo.startGameLoop();

			}).then(null, function(e) {
				// If something goes wrong, 'e' is the error message from the engine.
				alert('Failed to load scene: ' + e);
			});

		}
	}

	init();
});

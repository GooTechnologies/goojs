require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/renderer/Renderer',
	'goo/math/Plane',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Camera,
	Sphere,
	Box,
	Vector3,
	PointLight,
	DirectionalLight,
	SpotLight,
	Renderer,
	Plane,
	V
	) {
	'use strict';

	V.describe([
		'This vtest shows how to get an image from a canvas.',
		'Press A to slice the scene in several images display them and kill the goo renderer.'
	].join('\n'));

	V.button('A', keyA);

	// --- setting up some a scene
	function addPointLight() {
		var pointLight = new PointLight(new Vector3(0.9, 0.0, 0.2));
		pointLight.range = 5;

		world.createEntity(pointLight, 'pointLight', [0, 0, 3]).addToWorld();
	}

	function addDirectionalLight() {
		var directionalLight = new DirectionalLight(new Vector3(0.2, 0.9, 0.0));
		directionalLight.intensity = 0.1;

		world.createEntity(directionalLight, 'directionalLight', [0, -5, 3]).addToWorld();
	}

	function addSpotLight() {
		var spotLight = new SpotLight(new Vector3(0.2, 0.4, 1.0));
		spotLight.angle = 25;
		spotLight.range = 10;
		spotLight.penumbra = 5;

		world.createEntity(spotLight, 'spotLight', [0, 5, 5]).addToWorld();
	}

	function addSpheres(nSpheres) {
		var sphereMeshData = new Sphere(32, 32);

		for (var i = 0; i < nSpheres; i++) {
			for (var j = 0; j < nSpheres; j++) {
				var sphereMaterial = new Material(ShaderLib.simpleLit);
				goo.world.createEntity(sphereMeshData, sphereMaterial, [i - nSpheres / 2, j - nSpheres / 2, 0]).addToWorld();
			}
		}
	}
	// ---


	// --- screenshot assembling
	var allEntities = [];
	var shots = [];
	var nShots = 3;

	function assembleShots() {
		// stop goo
		goo.stopGameLoop();

		// remove the webgl canvas
		goo.renderer.domElement.parentNode.removeChild(goo.renderer.domElement);

		// start animatinig the shots
		var angle = 0;
		setInterval(function () {
			angle += 0.1;
			var dx = Math.cos(angle);
			var dy = Math.sin(angle);

			shots.forEach(function (img, index) {
				index = shots.length - index - 1;

				var tx = dx * (index + 2) * 5;
				var ty = dy * (index + 2) * 5;

				// translate it via css transforms
				img.style['-webkit-transform'] = 'translate3d(' + tx + 'px,' + ty + 'px, 0px)';
			});
		}, 33);
	}

	// set only entities in a specific range as visible
	function visibleInRange(start, end) {
		var camera = Renderer.mainCamera;
		var normal = camera._direction;
		var plane = new Plane(normal, camera.translation.length());

		allEntities.forEach(function (entity) {
			if (entity.meshRendererComponent) {
				var translation = entity.transformComponent.worldTransform.translation;
				var distance = plane.pseudoDistance(translation);
				entity.meshRendererComponent.hidden = !(distance > start && distance < end);
			}
		});
	}

	// takes a screenshot of only the entities in a specific rage (relative to the camera)
	function takeShotInRange(start, end, i) {
		visibleInRange(start, end);

		goo.renderer.clear(true, true, true);
		goo.world.getSystem('RenderSystem').render(goo.renderer);
		var dataURI = goo.renderer.domElement.toDataURL();

		// create an image to hold our screenshot
		var img = document.createElement('img');
		img.style.position = 'absolute';
		img.style.zIndex = 3000 - i;
		img.src = dataURI;

		// attach it to the page
		document.body.appendChild(img);

		// and store it for further use
		shots.push(img);

		// if all shots have been taken then process to animating them
		if (shots.length === nShots) {
			assembleShots();
		}
	}

	// take all shots and animate them when done
	function takeAllShots() {
		var camera = Renderer.mainCamera;
		var normal = camera._direction;
		var plane = new Plane(normal, camera.translation.length());

		// search for the nearest and farthest entities that are renderable
		var max = -Infinity, min = Infinity;
		allEntities.forEach(function (entity) {
			if (entity.meshRendererComponent) {
				var translation = entity.transformComponent.worldTransform.translation;
				var distance = plane.pseudoDistance(translation);

				if (distance > max) { max = distance; }
				if (distance < min) { min = distance; }
			}
		});

		// making some fine adjustments so that the absolute first and last entities also get rendered
		min -= 0.1;
		max += 0.1;

		var zInterval = (max - min) / nShots;
		for (var i = 0, zOffset = min; i < nShots; i++, zOffset += zInterval) {
			goo.world.process();
			takeShotInRange(zOffset, zOffset + zInterval, i);
		}
	}
	// ---

	// --- setting up everything
	var goo = V.initGoo({
		antialias: false, // for some reason lines don't render nice when using antialias on some hardware
		alpha: true,
		logo: { position: 'bottomright', color: '#FFF' }
	});

	var world = goo.world;

	// we don't want any scrollbars when the images will be moving
	document.body.style.overflow = 'hidden';

	// add a bunch of spheres
	addSpheres(15);

	// and some lights
	addPointLight();
	addDirectionalLight();
	addSpotLight();

	// camera
	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));

	goo.renderer.setClearColor(0.05, 0.05, 0.05, 0.0);

	function keyA() {
		// getting all entities in an array
		allEntities = goo.world.getEntities();

		takeAllShots();
	}

	// listen for 'A'
	window.addEventListener('keyup', function (e) {
		if (e.which === 65) {
			keyA();
		} else {
			console.log('A - take screenshots and animate');
		}
	});

	console.log('A - take screenshots and animate');
	// ---
});
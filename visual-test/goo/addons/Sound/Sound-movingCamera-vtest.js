require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/entities/components/ScriptComponent',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'goo/util/SoundCreator',
	'goo/entities/components/SoundComponent',
	'lib/V',
	'goo/scripts/OrbitCamControlScript',
	'goo/renderer/Camera'
], function (
	Material,
	ShaderLib,
	Sphere,
	Box,
	ScriptComponent,
	Vector3,
	TextureCreator,
	SoundCreator,
	SoundComponent,
	V,
	OrbitCamControlScript,
	Camera
	) {
	'use strict';

	var resourcePath = '../../../resources/';

	var goo = V.initGoo();
	var world = goo.world;

	// create panning cube
	var meshData;
	var material = new Material(ShaderLib.texturedLit);
	var texture = new TextureCreator().loadTexture2D(resourcePath + 'check.png');
	material.setTexture('DIFFUSE_MAP', texture);

	meshData = new Sphere(32, 32);
	var sphereEntity = world.createEntity(meshData, material, [0, 0, 0]).addToWorld();

	var urls = ['sfx1', 'sfx2'].map(function (fileName) { return resourcePath + fileName + '.wav'; });
	var sounds = [];

	var soundCreator = new SoundCreator();
	urls.forEach(loadSound);

	function loadSound(url) {
		soundCreator.loadSound(url, {}, function (sound) {
			sounds.push(sound);
			if (sounds.length >= urls.length) {
				allLoaded();
			}
		});
	}

	V.addLights();

	var spherical = new Vector3(20, Math.PI / 2, 0);
	var lookAt = new Vector3(0, 0, 0);

	var camera = new Camera();

	var orbitCamOpetions = {
		domElement        : V.goo.renderer.domElement,
		spherical         : spherical,
		lookAtPoint       : lookAt,
		drag              : 5.0,
		releaseVelocity   : true,
		interpolationSpeed: 2,
		dragButton        : -1
	};

	orbitCamOpetions.demoMode = false;
	/*
	orbitCamOpetions.moveInterval = 1000;
	orbitCamOpetions.moveInitialDelay = 200;
	*/

	var orbitScript = new OrbitCamControlScript(orbitCamOpetions);
	var cameraEntity = V.goo.world.createEntity(camera, [0, 0, 0], orbitScript, 'CameraEntity').addToWorld();

	function allLoaded() {
		console.log('all loaded');

		var soundComponent = new SoundComponent();
		soundComponent.addSound(sounds[0]);
		soundComponent.isCamera = true;
		cameraEntity.set(soundComponent);

		soundComponent = new SoundComponent();
		soundComponent.isCamera = false;
		soundComponent.addSound(sounds[1]);
		sphereEntity.set(soundComponent);

		setupKeys();
	}

	function setupKeys() {
		document.body.addEventListener('keypress', function(e) {
			switch(e.keyCode) {
				case 49:
					cameraEntity.soundComponent.sounds[0].play()
						.then(function () {
							console.log('boing ended');
						});
					console.log('boing');
					break;
				case 50:
					sphereEntity.soundComponent.sounds[0].play()
						.then(function () {
							console.log('boing ended');
						});
					console.log('squigly');
					break;
				case 51:
					cameraEntity.soundComponent.sounds[0].pause();
					console.log('boing pause');
					break;
				case 52:
					sphereEntity.soundComponent.sounds[0].pause();
					console.log('squigly pause');
					break;
				default:
					console.log('1: boing\n2: squigly\n3: pause boing\n4: pause squigly');
			}
		});
	}

	var soundSystem = world.getSystem('SoundSystem');
	soundSystem.updateConfig({
		//dopplerFactor:0.5
	});

	var time = 0;
	goo.callbacks.push(function(tpf){
		time += tpf;
		cameraEntity.transformComponent.setTranslation(0,0,/*5*Math.sin(10*time)+*/10);
		sphereEntity.transformComponent.setTranslation(Math.sin(time)*10,0,/*Math.sin(time)*10*/0);
	});

	V.process();
});

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
	'../../lib/V'
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
	V
	) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;

	// create panning cube
	var meshData = new Box();
	var material = new Material(ShaderLib.texturedLit);
	var texture = new TextureCreator().loadTexture2D('../../resources/check.png');
	material.setTexture('DIFFUSE_MAP', texture);

	var cubeEntity = world.createEntity(meshData, material).addToWorld();

	cubeEntity.set(function (entity) {
			entity.setRotation(world.time * 1.2, world.time * 2.0, 0)
				.set([Math.cos(world.time) * 10, 0, 0]);
		});

	meshData = new Sphere(32, 32);
	var sphereEntity = world.createEntity(meshData, material, [0, 0, 5]).addToWorld();

	var resourceUrl = '../../resources/';
	var urls = ['sfx1', 'sfx2'].map(function (fileName) { return resourceUrl + fileName + '.wav'; });
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

	function allLoaded() {
		console.log('all loaded');

		var soundComponent = new SoundComponent();
		soundComponent.addSound(sounds[0]);
		cubeEntity.set(soundComponent);

		soundComponent = new SoundComponent();
		soundComponent.addSound(sounds[1]);
		sphereEntity.set(soundComponent);

		setupKeys();
	}

	function setupKeys() {
		document.body.addEventListener('keypress', function(e) {
			switch(e.keyCode) {
				case 49:
					cubeEntity.soundComponent.sounds[0].play()
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
					cubeEntity.soundComponent.sounds[0].pause();
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

	V.addLights();

	V.addOrbitCamera();

	V.process();
});

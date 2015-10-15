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
	'lib/V'
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

	var resourcePath = '../../../resources/';

	var goo = V.initGoo();
	var world = goo.world;

	var soundSystem = world.getSystem('SoundSystem');
	console.log(soundSystem);

	// create panning cube
	var meshData = new Box();
	var material = new Material(ShaderLib.texturedLit);
	new TextureCreator().loadTexture2D(resourcePath + 'check.png').then(function (texture) {
		material.setTexture('DIFFUSE_MAP', texture);
	});

	var cubeEntity = world.createEntity(meshData, material).addToWorld();

	cubeEntity.set(function (entity) {
			entity.setRotation(world.time * 1.2, world.time * 2.0, 0)
				.set([Math.cos(world.time) * 10, 0, 0]);
		});

	meshData = new Sphere(32, 32);
	var sphereEntity = world.createEntity(meshData, material, [0, 0, 5]).addToWorld();

	var urls = ['sfx1', 'sfx2'].map(function (fileName) { return resourcePath + fileName + '.wav'; });
	var sounds = [];

	var soundCreator = new SoundCreator();

	function loadSound(url, loop) {
		soundCreator.loadSound(url).then(function (sound) {
			// Make the sounds loop when played.
			sound._loop = loop;
			sounds.push(sound);
			if (sounds.length >= urls.length) {
				allLoaded();
			}
		});
	}

	loadSound(urls[0], true);
	loadSound(urls[1], false);

	function allLoaded() {
		console.log('all loaded');

		var soundComponent = new SoundComponent();
		soundComponent.addSound(sounds[0]);
		cubeEntity.set(soundComponent);

		soundComponent = new SoundComponent();
		soundComponent.addSound(sounds[1]);
		sphereEntity.set(soundComponent);

		// Start playing the booing sound automatically.
		key1();

		setupKeys();
	}

	// ---
	function key1() {
		cubeEntity.soundComponent.sounds[0].play()
			.then(function () {
				console.log('boing ended');
			});
		console.log('boing');
	}

	function key2() {
		sphereEntity.soundComponent.sounds[0].play()
			.then(function () {
				console.log('squigly ended');
			});
		console.log('squigly');
	}

	function key3() {
		cubeEntity.soundComponent.sounds[0].pause();
		console.log('boing pause');
	}

	function key4() {
		sphereEntity.soundComponent.sounds[0].pause();
		console.log('squigly pause');
	}

	function key5() {
		cubeEntity.removeFromWorld();
		console.log('Remove cube');
	}

	function key6() {
		cubeEntity.addToWorld();
		cubeEntity.soundComponent.sounds[0].play();
		console.log('Add cube');
	}
	// ---

	function setupKeys() {
		document.body.addEventListener('keypress', function (e) {
			switch(e.which) {
				case 49: key1(); break;
				case 50: key2(); break;
				case 51: key3(); break;
				case 52: key4(); break;
				case 53: key5(); break;
				case 54: key6(); break;
				default:
					console.log('1: boing\n2: squigly\n3: pause boing\n4: pause squigly');
			}
		});
	}

	V.addLights();

	V.addOrbitCamera();

	V.describe([
		'Both the sphere and the cube have sound components (boing is looping, squigly is not)',
		'',
		'Controls:',
		'1: boing',
		'2: squigly',
		'3: pause boing',
		'4: pause squigly',
		'5: remove cube',
		'6: add cube'
	].join('\n'));

	V.button('1', key1);
	V.button('2', key2);
	V.button('3', key3);
	V.button('4', key4);
	V.button('5', key5);
	V.button('6', key6);

	V.process();
});

goo.V.attachToGlobal();

	var resourcePath = '../../../resources/';

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	var soundSystem = world.getSystem('SoundSystem');

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

	function loadSound(url, spatialize) {
		soundCreator.loadSound(url).then(function (sound) {
			// Make the sounds loop when played.
			sound._loop = true;
			sound.spatialize = spatialize;
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
				console.log('box ended');
			});
		console.log('box');
	}

	function key2() {
		sphereEntity.soundComponent.sounds[0].play()
			.then(function () {
				console.log('sphere ended');
			});
		console.log('sphere');
	}

	function key3() {
		cubeEntity.soundComponent.sounds[0].pause();
		console.log('box pause');
	}

	function key4() {
		sphereEntity.soundComponent.sounds[0].pause();
		console.log('sphere pause');
	}
	// ---

	function setupKeys() {
		document.body.addEventListener('keypress', function (e) {
			switch(e.which) {
				case 49: key1(); break;
				case 50: key2(); break;
				case 51: key3(); break;
				case 52: key4(); break;
				default:
					console.log('1: play box\n2: play sphere\n3: pause box\n4: pause sphere');
			}
		});
	}

	V.addLights();

	V.addOrbitCamera();

	V.describe([
		'Both the sphere and the cube have sound components. ',
		'',
		'Controls:',
		'1: play box',
		'2: play sphere',
		'3: pause box',
		'4: pause sphere',
	].join('\n'));

	V.button('1', key1);
	V.button('2', key2);
	V.button('3', key3);
	V.button('4', key4);

	V.process();
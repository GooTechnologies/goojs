goo.V.attachToGlobal();

	var resourcePath = '../../../resources/';

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	var soundSystem = world.getSystem('SoundSystem');
	soundSystem.updateConfig({rolloffFactor: 4});
	console.log(soundSystem);

	// create panning cube
	var meshData = new Box();
	var material = new Material(ShaderLib.texturedLit);
	new TextureCreator().loadTexture2D(resourcePath + 'check.png').then(function (texture) {
		material.setTexture('DIFFUSE_MAP', texture);
	});

	var cubeEntity = world.createEntity(meshData, material, [0, 0, -2]).addToWorld();

	cubeEntity.setComponent(new SoundComponent());

	meshData = new Sphere(32, 32);
	var sphereEntity = world.createEntity(meshData, material, [0, 0, 2]).addToWorld();
	sphereEntity.setComponent(new SoundComponent());

	var soundUrl = resourcePath + 'sfx1.wav';
	var soundCreator = new SoundCreator();
	soundCreator.loadSound(soundUrl).then(function (sound) {
		sound.update({loop: true});
		cubeEntity.soundComponent.addSound(sound);
		sphereEntity.soundComponent.addSound(sound)
		setupKeys();
	});

	// ---
	function key1() {
		cubeEntity.soundComponent.sounds[0].play()
			.then(function () {
				console.log('boing ended');
			});
		console.log('boing');
	}

	function key2() {
		sphereEntity.soundComponent.sounds[0].pause()
		console.log('boing pause');
	}
	// ---

	function setupKeys() {
		document.body.addEventListener('keypress', function (e) {
			switch(e.which) {
				case 49: key1(); break;
				case 50: key2(); break;
				default:
					console.log('1: boing\n2: boing pause');
			}
		});
	}

	V.addLights();

	V.addOrbitCamera();

	V.describe([
		'Both the sphere and the cube have sound components and share one sound',
		'',
		'Controls:',
		'1: boing start',
		'2: boing pause',
	].join('\n'));

	V.button('1', key1);
	V.button('2', key2);

	V.process();
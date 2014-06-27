require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/addons/howlerpack/components/HowlerComponent',
	'goo/addons/howlerpack/systems/HowlerSystem',
	'goo/renderer/TextureCreator',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Camera,
	Sphere,
	Box,
	Vector3,
	HowlerComponent,
	HowlerSystem,
	TextureCreator,
	V
	) {
	'use strict';

	V.describe('Both the sphere and the cube have sound components');

	var resourcesPath = '../../../resources/';

	var goo = V.initGoo();
	var world = goo.world;

	var sound1 = new window.Howl({
		urls: [resourcesPath + 'sfx1.wav']
	});

	var sound2 = new window.Howl({
		urls: [resourcesPath + 'sfx2.wav']
	});

	world.setSystem(new HowlerSystem(goo.renderer));

	// create panning cube
	var material = new Material(ShaderLib.texturedLit);
	var texture = new TextureCreator().loadTexture2D(resourcesPath + 'check.png');
	material.setTexture('DIFFUSE_MAP', texture);

	var cubeEntity = world.createEntity(new Box(), material).addToWorld();

	cubeEntity.set(function (entity) {
			entity.setRotation(world.time * 1.2, world.time * 2.0, 0)
				.set([Math.cos(world.time) * 10, 0, 0]);
		});

	// add howler component to the cube
	var howlerComponent = new HowlerComponent();
	howlerComponent.addSound(sound1);
	cubeEntity.set(howlerComponent);

	// create fixed sphere
	var sphereEntity = world.createEntity(new Sphere(32, 32), material, [0, 0, 5]).addToWorld();

	howlerComponent = new HowlerComponent();
	howlerComponent.addSound(sound2);
	sphereEntity.set(howlerComponent);


	V.addLights();

	V.addOrbitCamera();

	// bind keys
	document.body.addEventListener('keypress', function(e) {
		switch(e.keyCode) {
			case 49:
				cubeEntity.howlerComponent.playSound(0);
				console.log('boing');
				break;
			case 50:
				sphereEntity.howlerComponent.playSound(0);
				console.log('squigly');
				break;
			default:
				console.log('1: sound!');
		}
	});

	V.process();
});

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

	var goo = V.initGoo();
	var world = goo.world;

	// create panning cube
	var meshData = new Box();
	var material = new Material(ShaderLib.simpleLit);

	var cubeEntity = world.createEntity(meshData, material).addToWorld();
	cubeEntity.set(function (entity) {
		entity
			.setRotation(world.time * 1.2, world.time * 2.0, 0)
			.set([Math.cos(world.time) * 10, 0, 0]);
	});

	var soundCreator = new SoundCreator();
	soundCreator.loadSound('../../../resources/sfx1.wav').then(function (sound) {
		// Make the sounds loop when played.
		sound.update({ loop: true });
		sound.play();
		var soundComponent = new SoundComponent();
		soundComponent.addSound(sound);
		cubeEntity.set(soundComponent);
		console.log('all loaded');
	});

	V.addLights();
	V.addOrbitCamera();
	V.describe([
		'The distanceModel determines which algorithm will be used to reduce the volume of an audio source as it moves away from the listener. The default is "inverse", but also "linear" and "exponential" are available.'
	].join('\n'));

	var soundSystem = world.getSystem('SoundSystem');
	V.button('inverse', function () {
		soundSystem.updateConfig({
			distanceModel: 'inverse',
			rolloffFactor: 0.4,
			maxDistance: 100,
			refDistance: 1
		});
	});
	V.button('linear', function () {
		soundSystem.updateConfig({
			distanceModel: 'linear',
			rolloffFactor: 5,
			maxDistance: 100,
			refDistance: 0
		});
	});
	V.button('exponential', function () {
		soundSystem.updateConfig({
			distanceModel: 'exponential',
			rolloffFactor: 0.4,
			maxDistance: 100,
			refDistance: 1
		});
	});

	V.process();
});

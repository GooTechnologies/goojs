require([
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'goo/addons/particlepack/ParticleSystem',
	'../configs/defaults/DefaultRendererConfigs',
	'../../../../../src/goo/addons/particlepack/simulation/DefaultSimulationParams',
	'../configs/defaults/DefaultSimulators',
	'../configs/defaults/DefaultSpriteAtlas',
	'../configs/defaults/ExampleEffects',
	'lib/V'
], function (
	Vector3,
	TextureCreator,
	ParticleSystem,
	DefaultRendererConfigs,
	DefaultSimulationParams,
	DefaultSimulators,
	DefaultSpriteAtlas,
	ExampleEffects,
	V
	) {
	'use strict';

	V.describe('Misc particle effects.');

	var posVec = new Vector3();
	var dirVec = new Vector3(0, 1, 0);

	var goo = V.initGoo();

	var world = goo.world;

	var particleSystem = new ParticleSystem({goo:goo});
	world.setSystem(particleSystem);

	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));

	var customCallbacks = {};

	var spawn = function(simConfigs) {

		for (var i = 0; i < simConfigs.simulators.length; i++) {
			var simSettings = simConfigs.simulators[i];
			particleSystem.spawnParticleSimulation(simSettings.id, posVec, dirVec, ExampleEffects.effects[0].effect_data, customCallbacks);
		}

		setTimeout(function() {
			spawn(simConfigs);
		}, 200);
	};

	var txCallback = function(texture) {
		particleSystem.addConfiguredAtlasSystems(DefaultSimulators, DefaultRendererConfigs, DefaultSpriteAtlas.atlases[0], texture);

		setTimeout(function() {
			spawn(DefaultSimulators);
		}, 200);
	};

	new TextureCreator().loadTexture2D('../../../../resources/particle_atlas.png', {}, txCallback);

	V.process();
});
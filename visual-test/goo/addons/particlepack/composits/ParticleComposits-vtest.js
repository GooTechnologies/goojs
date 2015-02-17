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

	var emitterData = {
		tracer:{angle:new Vector3(1, 1, 0)}
	}

	var world = goo.world;

	var particleSystem = new ParticleSystem({goo:goo});
	world.setSystem(particleSystem);

	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));

	var customCallbacks = {};

	var spawn = function(simConfigs, tpf) {

		for (var i = 0; i < effects.length; i++) {
			posVec.setDirect(i*2, 0, -i*5);
			dirVec.setDirect(0, 1, 0);
			if (emitterData[effects[i].id]) {
				if (emitterData[effects[i].id].angle) {
					dirVec.setVector(emitterData[effects[i].id].angle);
				}
			}

			if (effects[i].spawnProbability * tpf > 0.016 * Math.random()) {
				particleSystem.spawnParticleSimulation(effects[i].renderer, posVec, dirVec, effects[i].effect_data, customCallbacks);
			}
		}

	};

	var effects = [];

	for (var i = 0; i < ExampleEffects.effects.length; i++) {
		effects.push(ExampleEffects.effects[i]);
	}


	var tick = function(tpf) {

	//	if (Math.random() < tpf) {
			spawn(DefaultSimulators, tpf);
	//	}

	};

	var txCallback = function(texture) {
		particleSystem.addConfiguredAtlasSystems(DefaultSimulators, DefaultRendererConfigs, DefaultSpriteAtlas.atlases[0], texture);

		goo.callbacksPreProcess.push(tick);

	};

	new TextureCreator().loadTexture2D('../../../../resources/particle_atlas.png', {}, txCallback);




	V.process();


});
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

	V.describe('A comet like effect with a ball and tail');

	var posVec = new Vector3();
	var dirVec = new Vector3(0, 1, 0);

	var goo = V.initGoo();
	
	var world = goo.world;

	var particleSystem = new ParticleSystem({goo:goo});
	world.setSystem(particleSystem);

	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));

	var particleUpdate = function(particle) {
		particle.position.setVector(posVec);
		particle.progress = Math.random();
		particle.lifeSpan = particle.lifeSpanTotal * Math.random();

	};

	var customCallbacks = {
		particleUpdate:particleUpdate
	};

	var spawn = function(effectId) {
		var effect = effects[effectId];
		particleSystem.spawnParticleSimulation(effect.renderer, posVec, dirVec, effect.effect_data, customCallbacks);
	};

	var effects = {};

	for (var i = 0; i < ExampleEffects.effects.length; i++) {
		effects[ExampleEffects.effects[i].id] = ExampleEffects.effects[i];
	}


	var time = 0;
	var tick = function(tpf) {
		time += tpf;
		posVec.setDirect(Math.sin(time) *3, Math.sin(time*2)*2, Math.cos(time) * 3);
	//	if (Math.random() < tpf) {
		//	spawn(DefaultSimulators, tpf);
	//	}

	};

	var txCallback = function(texture) {
		particleSystem.addConfiguredAtlasSystems(DefaultSimulators, DefaultRendererConfigs, DefaultSpriteAtlas.atlases[0], texture);

		goo.callbacksPreProcess.push(tick);
		spawn('firework_blue');
	};

	new TextureCreator().loadTexture2D('../../../../resources/particle_atlas.png', {}, txCallback);




	V.process();


});
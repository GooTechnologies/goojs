require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'goo/shapes/Box',
	'goo/util/ObjectUtil',
	'goo/particlepack/ParticleSystem',
	'goo/particlepack/ParticleBehaviors',
	'goo/particlepack/DefaultConfig',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	TextureCreator,
	Box,
	ObjectUtil,
	ParticleSystem,
	ParticleBehaviors,
	DefaultConfig,
	V
	) {
	'use strict';

	V.describe('particles');

	var goo = V.initGoo();
	var world = goo.world;

	var textureCreator = new TextureCreator();
	textureCreator.loadTexture2D('../../resources/test4clouds.png').then(function (texture) {
	// textureCreator.loadTexture2D('../../resources/cloudsingle.png').then(function (texture) {
		var particleSystem = new ParticleSystem(goo);
		var config = ObjectUtil.clone(DefaultConfig);

		config.poolCount = 1000;

		config.renderers.ParticleRenderer.settings.textureUrl.value = texture;
		config.renderers.ParticleRenderer.settings.poolCount = config.poolCount;
		config.renderers.ParticleRenderer.settings.sort = true;

		config.renderers.ParticleRenderer.settings.tile.tileCountX.value = 2;
		config.renderers.ParticleRenderer.settings.tile.tileCountY.value = 2;
		config.renderers.ParticleRenderer.settings.tile.loopScale.value = 1;
		config.renderers.ParticleRenderer.settings.tile.animated = false;
		config.renderers.ParticleRenderer.settings.tile.enabled.value = true;

		ParticleBehaviors.cloudSpawner = function(simulator) {
			var vec = ParticleBehaviors.vec;
			if (simulator.aliveParticles < simulator.settings.poolCount) {
				var size = 15;
				var x = (Math.random() * 2 - 1) * size;
				var y = (Math.random() * 2 - 1) * size;
				var z = (Math.random() * 2 - 1) * size;
				var particle = simulator.wakeParticle();
				vec.setDirect(x, y, z);
				size = 0.25;
				particle.position.setVector(vec);
				x = (Math.random() * 2 - 1) * size;
				y = (Math.random() * 2 - 1) * size;
				z = (Math.random() * 2 - 1) * size;
				vec.setDirect(x, y, z);
				particle.velocity.setVector(vec);
			}
		};

		ParticleBehaviors.cloudBehavior = function(tpf, particle, settings, simulator) {
		};

		config.behaviors[0] = 'cloudBehavior';
		config.spawner.value = 'cloudSpawner';
		config.lifespan.value[0] = 10;
		config.lifespan.value[1] = 15;
		config.eternal.value = false;
		config.skipFade.value = false;
		config.size.value[0] = 1;
		config.size.value[1] = 2;
		config.growth.value[0] = 0;
		config.growth.value[1] = 0;
		config.rotation.value[0] = -10;
		config.rotation.value[1] = 10;
		config.spin.value[0] = -0.1;
		config.spin.value[1] = 0.1;

		config.renderers.ParticleRenderer.settings.blending.value = 'CustomBlending';

		particleSystem.add(config);

		var simulator = particleSystem.get(config.id);
		for (var i = 0; i < simulator.settings.poolCount; i++) {
			particleSystem.update(1/30);
		}

		goo.callbacks.push(function () {
			particleSystem.update(world.tpf);
		});
	});

	V.addLights();

	V.addOrbitCamera(new Vector3(25, Math.PI / 2, 0));

	V.process();
});

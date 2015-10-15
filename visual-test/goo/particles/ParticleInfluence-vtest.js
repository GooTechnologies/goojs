require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/particles/ParticleLib',
	'goo/particles/ParticleInfluence',
	'goo/util/ParticleSystemUtils',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	ParticleLib,
	ParticleInfluence,
	ParticleSystemUtils,
	V
	) {
	'use strict';

	V.describe('Modify particles with ParticleInfluence. The particles on the left have no influence.');

	function addParticleEntity(translation) {
		var material = new Material(ShaderLib.particles);
		var texture = ParticleSystemUtils.createSnowflakeTexture();
		texture.generateMipmaps = true;
		material.setTexture('DIFFUSE_MAP', texture);
		material.blendState.blending = 'AdditiveBlending';
		material.cullState.enabled = false;
		material.depthState.write = false;
		material.renderQueue = 2002;

		var particleParameters = {
			getEmissionVelocity: function (particle, particleEntity) {
				var vec3 = particle.velocity;
				vec3.x = 0;
				vec3.y = 2;
				vec3.z = 0;
			},
			particleCount: 50,
			releaseRatePerSecond: 1,
			minLifetime: 20.0,
			maxLifetime: 20.0
		};

		var entity = ParticleSystemUtils.createParticleSystemEntity(
			world,
			particleParameters,
			material
		);

		entity.set(translation);
		entity.addToWorld();
		return entity;
	}

	var goo = V.initGoo();
	var world = goo.world;

	V.addOrbitCamera(new Vector3(60, Math.PI / 2, 0));
	
	var entity1 = addParticleEntity([-5, 0, 0]);

	var entity2 = addParticleEntity([5, 0, 0]);
	var spiralInfluence = new ParticleInfluence({
		apply: function (tpf, particle, particleIndex) {
			var pos = particle.position;
			pos.x += Math.sin(particle.age) * 0.1;
			pos.z += Math.cos(particle.age) * 0.1;
		}
	});
	entity2.particleComponent.emitters[0].influences.push(spiralInfluence);

	V.process();
});

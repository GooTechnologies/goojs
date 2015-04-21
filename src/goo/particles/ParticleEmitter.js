define([
	'goo/particles/ParticleUtils',
	'goo/renderer/Renderer',
	'goo/util/ObjectUtil'
], function (
	ParticleUtils,
	Renderer,
	ObjectUtil
) {
	'use strict';

	/**
	 * A Particle Emitter spawns particles - controlling spawn rate, lifetime, initial velocity vector and position of each particle.
	 * @param {Object} [options] Particle emitter options passed as an object
	 * @param {number} [options.totalParticlesToSpawn=-1] Specifies how many particles this emitter should spawn (-1 for an unlimited amount)
	 * @param {number} [options.maxLifetime=3.0] The maximum lifetime of a particle emitted by this emitter (in seconds)
	 * @param {number} [options.minLifetime=2.0] The minimum lifetime of a particle emitted by this emitter (in seconds)
	 * @param {{ color, mass, uvIndex, color, size, spin }[]} [options.timeline] A timeline object describing the transformations that a particle should go through while it 'ages'. This overrides the timeline set on the particle component
	 * @param {ParticleInfluence[]} [options.influences] An array of objects providing functions that alter the particle
	 * @param {Function: (particle, particleEntity) -> Vector3} [options.emissionPoint] A function returning an emission point for a particle
	 * @param {Function: (particle, particleEntity) -> Vector3} [options.getEmissionVelocity] A function returning an emission velocity for a particle
	 * @param {Function: (particle)} [options.getParticleBillboardVectors=ParticleEmitter.CAMERA_BILLBOARD_FUNC] A function that sets the orientation of the particle's billboard
	 * @param {number} [options.releaseRatePerSecond=10] Target number of particles per second to spawn
	 */
	function ParticleEmitter(options) {
		ObjectUtil.copyOptions(this, options, {
			totalParticlesToSpawn: -1,
			maxLifetime: 3.0,
			minLifetime: 2.0,
			timeline: undefined,
			influences: [],
			getEmissionPoint: function (particle, particleEntity) {
				var vec3 = particle.position;
				vec3.setDirect(0, 0, 0);
				return ParticleUtils.applyEntityTransformPoint(vec3, particleEntity);
			},
			getEmissionVelocity: function (particle, particleEntity) {
				var vec3 = particle.velocity;
				vec3.setDirect(0, 1, 0);
				return ParticleUtils.applyEntityTransformVector(vec3, particleEntity);
			},
			getParticleBillboardVectors: ParticleEmitter.CAMERA_BILLBOARD_FUNC,
			releaseRatePerSecond: 10,
			enabled: true
		});

		// used to track fractional parts of particles waiting to be released between frames.
		this.particlesWaitingToRelease = 0.0;
	}

	/**
	 * Sets the billboard coordinates of the particle to face the camera
	 * @param particle
	 */
	// Was: function (particle, particleEntity)
	ParticleEmitter.CAMERA_BILLBOARD_FUNC = function (particle) {
		var camera = Renderer.mainCamera;
		if (camera) {
			particle.bbX.set(camera._left);
			particle.bbY.set(camera._up);
		}
	};

	/**
	 * Returns a number between this.minLifeTime and this.maxLifeTime
	 * @private
	 * @returns {number}
	 */
	//! AT: is it just a glorified rand(min, max) function?
	ParticleEmitter.prototype.nextParticleLifeSpan = function () {
		return this.minLifetime + (this.maxLifetime - this.minLifetime) * Math.random();
	};

	return ParticleEmitter;
});
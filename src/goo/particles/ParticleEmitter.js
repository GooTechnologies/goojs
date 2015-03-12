define(['goo/particles/ParticleUtils', 'goo/renderer/Renderer'], function (ParticleUtils, Renderer) {
	'use strict';

	/**
	 * A Particle Emitter spawns particles - controlling spawn rate, lifetime, initial velocity vector and position of each particle.
	 * @param {Object} [settings] Particle emitter settings passed as an object
	 * @param {number} [settings.totalParticlesToSpawn=-1] Specifies how many particles this emitter should spawn (-1 for an unlimited amount)
	 * @param {number} [settings.maxLifetime=3.0] The maximum lifetime of a particle emitted by this emitter (in seconds)
	 * @param {number} [settings.minLifetime=2.0] The minimum lifetime of a particle emitted by this emitter (in seconds)
	 * @param {{ color, mass, uvIndex, color, size, spin }[]} [settings.timeline] A timeline object describing the transformations that a particle should go through while it 'ages'. This overrides the timeline set on the particle component
	 * @param {ParticleInfluence[]} [settings.influences] An array of objects providing functions that alter the particle
	 * @param {Function: (particle, particleEntity) -> Vector3} [settings.emissionPoint] A function returning an emission point for a particle
	 * @param {Function: (particle, particleEntity) -> Vector3} [settings.getEmissionVelocity] A function returning an emission velocity for a particle
	 * @param {Function: (particle)} [settings.getParticleBillboardVectors=ParticleEmitter.CAMERA_BILLBOARD_FUNC] A function that sets the orientation of the particle's billboard
	 * @param {number} [settings.releaseRatePerSecond=10] Target number of particles per second to spawn
	 */
	function ParticleEmitter(settings) {
		settings = settings || {};

		this.totalParticlesToSpawn = !isNaN(settings.totalParticlesToSpawn) ? settings.totalParticlesToSpawn : -1;
		this.maxLifetime = !isNaN(settings.maxLifetime) ? settings.maxLifetime : 3.0;
		this.minLifetime = !isNaN(settings.minLifetime) ? settings.minLifetime : 2.0;
		this.timeline = settings.timeline ? settings.timeline : undefined;
		this.influences = settings.influences ? settings.influences : [];

		this.getEmissionPoint = settings.getEmissionPoint ? settings.getEmissionPoint : function (particle, particleEntity) {
			var vec3 = particle.position;
			vec3.setDirect(0, 0, 0);
			return ParticleUtils.applyEntityTransformPoint(vec3, particleEntity);
		};

		this.getEmissionVelocity = settings.getEmissionVelocity ? settings.getEmissionVelocity : function (particle, particleEntity) {
			var vec3 = particle.velocity;
			vec3.setDirect(0, 1, 0);
			return ParticleUtils.applyEntityTransformVector(vec3, particleEntity);
		};

		this.getParticleBillboardVectors = settings.getParticleBillboardVectors ? settings.getParticleBillboardVectors
			: ParticleEmitter.CAMERA_BILLBOARD_FUNC;

		this.releaseRatePerSecond = !isNaN(settings.releaseRatePerSecond) ? settings.releaseRatePerSecond : 10;

		// used to track fractional parts of particles waiting to be released between frames.
		this.particlesWaitingToRelease = 0.0;

		/**
		 * Dictates whether this emitter is enabled or not
		 * @type {boolean}
		 */
		this.enabled = settings.enabled !== undefined ? settings.enabled === true : true;
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
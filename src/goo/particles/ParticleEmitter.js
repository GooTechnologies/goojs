define(['goo/particles/ParticleUtils', 'goo/renderer/Renderer'],
/** @lends ParticleEmitter */
function(ParticleUtils, Renderer) {
	"use strict";

	/**
	 * @class A Particle Emitter spawns particles - controlling spawn rate, lifetime, initial velocity vector and position of each particle.
	 */
	function ParticleEmitter(settings) {
		settings = settings || {};

		// How many particles should we spawn before shutting down this emitter. Negative means never shut down.
		this.totalParticlesToSpawn = !isNaN(settings.totalParticlesToSpawn) ? settings.totalParticlesToSpawn : -1;

		// Max lifetime of a particle emitted by this emitter (in seconds)
		this.maxLifetime = !isNaN(settings.maxLifetime) ? settings.maxLifetime : 3.0;

		// Min lifetime of a particle emitted by this emitter (in seconds)
		this.minLifetime = !isNaN(settings.minLifetime) ? settings.minLifetime : 2.0;

		// optional timeline. This overrides the timeline set on the particle component.
		this.timeline = settings.timeline ? settings.timeline : undefined;

		// optional influences.
		this.influences = settings.influences ? settings.influences : [];

		// function returning an emission point for a particle.
		this.getEmissionPoint = settings.getEmissionPoint ? settings.getEmissionPoint : function(particle, particleEntity) {
			var vec3 = particle.position;
			vec3.set(0, 0, 0);
			return ParticleUtils.applyEntityTransformPoint(vec3, particleEntity);
		};

		// function returning an emission velocity for a particle.
		this.getEmissionVelocity = settings.getEmissionVelocity ? settings.getEmissionVelocity : function(particle, particleEntity) {
			var vec3 = particle.velocity;
			vec3.set(0, 1, 0);
			return ParticleUtils.applyEntityTransformVector(vec3, particleEntity);
		};

		// function returning an emission velocity for a particle.
		this.getParticleBillboardVectors = settings.getParticleBillboardVectors ? settings.getParticleBillboardVectors
			: ParticleEmitter.CAMERA_BILLBOARD_FUNC;

		// target number of particles per second to spawn.
		this.releaseRatePerSecond = !isNaN(settings.releaseRatePerSecond) ? settings.releaseRatePerSecond : 10;

		// used to track fractional parts of particles waiting to be released between frames.
		this.particlesWaitingToRelease = 0.0;

		// Enabled flag
		this.enabled = settings.enabled !== undefined ? settings.enabled === true : true;
	}

	ParticleEmitter.CAMERA_BILLBOARD_FUNC = function(particle, particleEntity) {
		var camera = Renderer.mainCamera;
		particle.bbX.set(camera._left);
		particle.bbY.set(camera._up);
	};

	ParticleEmitter.prototype.nextParticleLifeSpan = function() {
		return this.minLifetime + (this.maxLifetime - this.minLifetime) * Math.random();
	};

	return ParticleEmitter;
});
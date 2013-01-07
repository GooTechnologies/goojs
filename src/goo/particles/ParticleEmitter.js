define([ 'goo/particles/ParticleUtils' ], function(ParticleUtils) {
	"use strict";

	/**
	 * @name ParticleEmitter
	 * @class A Particle Emitter spawns particles - controlling spawn rate,
	 *        lifetime, initial velocity vector and position of each particle.
	 */
	function ParticleEmitter(settings) {
		settings = settings || {};

		// How many particles should we spawn before shutting down this emitter.  Negative means never shut down.
		this.totalParticlesToSpawn = !isNaN(settings.totalParticlesToSpawn) ? settings.totalParticlesToSpawn : Infinity;

		// Max lifetime of a particle emitted by this emitter (in seconds)
		this.maxLifetime = !isNaN(settings.maxLifetime) ? settings.maxLifetime : 3.0;

		// Min lifetime of a particle emitted by this emitter (in seconds)
		this.minLifetime = !isNaN(settings.minLifetime) ? settings.minLifetime : 2.0;

		// optional timeline.  This overrides the timeline set on the particle component.
		this.timeline = settings.timeline ? settings.timeline : undefined;
		
		// function returning an emission point for a particle.
		this.getEmissionPoint = settings.getEmissionPoint ? settings.getEmissionPoint : function(vec3, particleEntity) {
			return ParticleUtils.applyEntityTransformPoint(vec3.set(0,0,0), particleEntity);
		};

		// function returning an emission velocity for a particle.
		this.getEmissionVelocity = settings.getEmissionVelocity ? settings.getEmissionVelocity : function(vec3, particleEntity) {
			return ParticleUtils.applyEntityTransformVector(vec3.set(0,1,0), particleEntity);
		};
		
		// target number of particles per second to spawn.
		this.releaseRatePerSecond = !isNaN(settings.releaseRatePerSecond) ? settings.releaseRatePerSecond : 10;
		
		// used to track fractional parts of particles waiting to be released between frames.
		this.particlesWaitingToRelease = 0.0;
	}

	ParticleEmitter.prototype.nextParticleLifeSpan = function() {
		return this.minLifetime + ((this.maxLifetime - this.minLifetime) * Math.random());
	};

	return ParticleEmitter;
});
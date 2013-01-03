define(['goo/entities/systems/System', 'goo/renderer/Renderer'], function (System, Renderer) {
	"use strict";

	/**
	 * @name ParticlesSystem
	 * @class manages and reacts to particle components on entities.
	 */
	function ParticlesSystem() {
		System.call(this, 'ParticlesSystem', ['ParticleComponent']);
		this.passive = false;
	}

	ParticlesSystem.prototype = Object.create(System.prototype);

	ParticlesSystem.prototype.process = function (entities) {
		var tpf = entities && entities.length ? entities[0]._world.tpf : 0;
		if (tpf > 1) return; // ignore, probably was out of focus
		// go through each particle component and update
		for (var i = 0, max = entities.length; i < max; i++) {
			var entity = entities[i];
			var particleComponent = entity.particleComponent;

			if (particleComponent && particleComponent.enabled) {
				this.updateParticles(entity, particleComponent, tpf);
			}
		}
	};

	ParticlesSystem.prototype.updateParticles = function (particleEntity, particleComponent, tpf) {
		var transformComponent = particleEntity.transformComponent;

		// go through any influences and prepare them
		if (particleComponent.influences.length) {
			for (var j = 0, max = particleComponent.influences.length; j < max; j++) {
				// called even is !enabled.  This allows prepare function to control enabled status.
				particleComponent.influences[j].prepare(particleEntity);
			}
		}
		
		var particleIndex = 0;
		var emitterIndex = -1;
		var emitter = undefined;
		var needsUpdate = false;
		var stillAlive = false;

		// step through our particles
		while (particleIndex < particleComponent.particleCount) {
			// watch for emitter changes
			while (emitter === undefined) {
				emitterIndex++;
				if (particleComponent.emitters.length > emitterIndex) {
					emitter = particleComponent.emitters[emitterIndex];
					
					if (emitter.totalParticlesToSpawn > 0) {
						// find out how many particles to create.
						emitter.particlesWaitingToRelease += emitter.releaseRatePerSecond * tpf;
						emitter.particlesWaitingToRelease = Math.max(emitter.particlesWaitingToRelease, 0);
						stillAlive = true;
					}

					// no particles to make this turn, so move on.
					if (emitter.particlesWaitingToRelease < 1) {
						emitter = undefined;
					}
				} else {
					emitter = null;
				}
			}

			// pull the current particle
			var particle = particleComponent.particles[particleIndex];

			// if this particle is alive and we have influences, apply them
			if (particle.alive && particleComponent.influences.length) {
				for (var j = 0, max = particleComponent.influences.length; j < max; j++) {
					if (particleComponent.influences[j].enabled) {
						particleComponent.influences[j].apply(tpf, particle, particleIndex);
					}
				}
			}
			
			// if alive, update the particle along its lifetime - this may kill the particle
			if (particle.alive) {
				particle.update(tpf, transformComponent, Renderer.mainCamera);
				needsUpdate = true;
				stillAlive = true;
			}
			
			// if not alive, see if we want to respawn it at the current emitter (if we have one)
			if (!particle.alive && emitter) {
				emitter.particlesWaitingToRelease--;
				if (emitter.totalParticlesToSpawn !== Infinity) {
					emitter.totalParticlesToSpawn--;
				}
				
				particle.respawnParticle(emitter.nextParticleLifeSpan());
				emitter.getEmissionPoint(particle.position, particleEntity);
				emitter.getEmissionVelocity(particle.velocity, particleEntity);
				
				if (emitter.particlesWaitingToRelease < 1 || emitter.totalParticlesToSpawn <= 0) {
					// setup to pull next emitter, if any
					emitter = undefined;
				}
			}
			
			particleIndex++;
		}
		
		// tell particle meshdata we are updated.
		if (needsUpdate) {
			particleComponent.meshData.vertexData._dataNeedsRefresh = true;
		} 
		if (!stillAlive) {
			particleComponent.enabled = false;
		}
	};

	return ParticlesSystem;
});
define(['goo/entities/systems/System'], function (System) {
	'use strict';

	/**
	 * Manages and reacts to particle components on entities.
	 * @extends System
	 */
	function ParticlesSystem() {
		System.call(this, 'ParticlesSystem', ['TransformComponent', 'MeshRendererComponent', 'MeshDataComponent', 'ParticleComponent']);
		this.passive = false;
	}

	ParticlesSystem.prototype = Object.create(System.prototype);
	ParticlesSystem.prototype.constructor = ParticlesSystem;

	ParticlesSystem.prototype.process = function (entities, tpf) {
		if (tpf > 1) {
			return; // ignore, probably was out of focus
		}
		// go through each particle component and update
		for (var i = 0, max = entities.length; i < max; i++) {
			var entity = entities[i];
			var particleComponent = entity.particleComponent;

			if (this.isUpdatable(particleComponent)) {
				this.updateParticles(entity, particleComponent, tpf);
			}
		}
	};

	ParticlesSystem.prototype.isUpdatable = function (particleComponent) {
		var enabledEmitter = false;
		for (var i = 0, length = particleComponent.emitters.length; i < length; i++) {
			var emitter = particleComponent.emitters[i];
			if (emitter.enabled === true) {
				enabledEmitter = true;
				break;
			}
		}

		return enabledEmitter || particleComponent.enabled;
	};

	ParticlesSystem.prototype.updateParticles = function (particleEntity, particleComponent, tpf) {
		var particleIndex = 0;
		var emitterIndex = -1;
		var emitter;
		var needsUpdate = false;
		var stillAlive = false;

		// step through our particles
		while (particleIndex < particleComponent.particleCount) {
			// watch for emitter changes
			while (emitter === undefined) {
				emitterIndex++;
				if (particleComponent.emitters.length > emitterIndex) {
					emitter = particleComponent.emitters[emitterIndex];

					// go through any influences and prepare them - we can use this to enable / disable the emitter
					if (emitter.influences.length) {
						for (var j = 0, max = emitter.influences.length; j < max; j++) {
							emitter.influences[j].prepare(particleEntity, emitter);
						}
					}

					// check if this emitter is enabled and bail out if not
					if (!emitter.enabled) {
						emitter = undefined;
						continue;
					}

					if (emitter.totalParticlesToSpawn !== 0) {
						// find out how many particles to create.
						emitter.particlesWaitingToRelease += emitter.releaseRatePerSecond * tpf;
						emitter.particlesWaitingToRelease = Math.max(emitter.particlesWaitingToRelease, 0);
						stillAlive = true;
					}

					// no particles to make this turn, so move on.
					if (emitter.particlesWaitingToRelease < 1) {
						emitter = undefined;
						continue;
					}
				} else {
					emitter = null;
				}
			}

			// pull the current particle
			var particle = particleComponent.particles[particleIndex];

			// if this particle is alive and we have influences, apply them
			if (particle.alive && particle.emitter && particle.emitter.influences.length) {
				for ( var j = 0, max = particle.emitter.influences.length; j < max; j++) {
					if (particle.emitter.influences[j].enabled) {
						particle.emitter.influences[j].apply(tpf, particle, particleIndex);
					}
				}
			}

			// if alive, update the particle along its lifetime - this may kill the particle
			if (particle.alive) {
				particle.update(tpf, particleEntity);
				needsUpdate = true;
				stillAlive = true;
			}

			// if not alive, see if we want to respawn it at the current emitter (if we have one)
			if (!particle.alive && emitter) {
				emitter.particlesWaitingToRelease--;
				if (emitter.totalParticlesToSpawn >= 1) {
					emitter.totalParticlesToSpawn--;
				}

				particle.respawnParticle(emitter);
				emitter.getEmissionPoint(particle, particleEntity);
				emitter.getEmissionVelocity(particle, particleEntity);

				if (emitter.particlesWaitingToRelease < 1 || emitter.totalParticlesToSpawn === 0) {
					// setup to pull next emitter, if any
					emitter = undefined;
				}
			}

			particleIndex++;
		}

		// tell particle meshdata we are updated.
		if (needsUpdate) {
			particleComponent.meshData.vertexData._dataNeedsRefresh = true;
			particleEntity.meshDataComponent.autoCompute = true;
		}
		
		particleComponent.enabled = stillAlive;
	};

	ParticlesSystem.prototype.play = function () {
		this.passive = false;
	};

	ParticlesSystem.prototype.pause = function () {
		this.passive = true;
	};

	ParticlesSystem.prototype.resume = ParticlesSystem.prototype.play;

	ParticlesSystem.prototype.stop = ParticlesSystem.prototype.pause;

	return ParticlesSystem;
});
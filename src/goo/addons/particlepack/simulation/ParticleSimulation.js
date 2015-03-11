
define([
	'goo/math/Vector3',
	'goo/addons/particlepack/simulation/SimulationParameters',
	'goo/addons/particlepack/simulation/DefaultSimulationParams'
], function (
	Vector3,
	SimulationParameters,
	DefaultSimulationParams
) {
	"use strict";

	var ParticleSimulation = function () {
		this.resetSimulation();
	};

	ParticleSimulation.prototype.resetSimulation = function () {
		this.renderers = [];
		this.particles = [];
		this.recover = [];
		this.active = false;
		this.onUpdate = null;
		this.particleUpdate = null;
		this.onParticleAdded = null;
		this.onParticleDead = null;
	};

	ParticleSimulation.prototype.initSimulation = function (posVec, normVec, effectData) {
		this.resetSimulation();
		this.params = new SimulationParameters(new Vector3(posVec), new Vector3(normVec), DefaultSimulationParams.particle_params, effectData);
		this.active = true;
	};

	ParticleSimulation.prototype.registerEffectCallbacks = function (callbacks) {
		if (callbacks.onUpdate) {
			this.onUpdate = callbacks.onUpdate;
		}

		if (callbacks.particleUpdate) {
			this.particleUpdate = callbacks.particleUpdate;
		}

		if (callbacks.onParticleAdded) {
			this.onParticleAdded = callbacks.onParticleAdded;
		}

		if (callbacks.onParticleDead) {
			this.onParticleDead = callbacks.onParticleDead;
		}
	};

	ParticleSimulation.prototype.registerParticleRenderer = function (renderer) {
		this.renderers.push(renderer);
	};

	ParticleSimulation.prototype.notifyDied = function (particle) {
		particle.reset();
		for (var i = 0; i < this.renderers.length; i++) {
			this.renderers[i].died(particle);
		}
		if (this.onParticleDead) {
			this.onParticleDead(particle);
		}

		this.recover.push(particle);
	};

	ParticleSimulation.prototype.includeParticle = function (particle, ratio) {
		particle.joinSimulation(this.params, ratio);
		this.particles.push(particle);
		if (this.onParticleAdded) {
			this.onParticleAdded(particle);
		}
	};

	ParticleSimulation.prototype.updateParticle = function (particle, tpf) {
		if (particle.dead) {
			return;
		}

		// Particles need to have a fixed geometry the first frame of their life or things go bonkerz when framerate varies.
		var deduct = tpf;
		if (!particle.frameCount) {
			deduct = 0.016; // REVIEW: This hard coded number appears in a few places
		}

		particle.lifeSpan -= deduct;

		if (this.particleUpdate) {
			this.particleUpdate(particle);
		} else {
			particle.defaultParticleUpdate(deduct);
		}

		if (particle.lifeSpan < 0 || particle.requestKill) {
			this.notifyDied(particle);
			return;
		}

		this.renderParticle(tpf, particle);
	};

	ParticleSimulation.prototype.updateSimParticles = function (tpf) {
		if (this.onUpdate) {
			this.onUpdate(this);
		}

		for (var i = 0; i < this.particles.length; i++) {
			this.updateParticle(this.particles[i], tpf);
		}
	};

	ParticleSimulation.prototype.renderParticle = function (tpf, particle) {
		for (var i = 0; i < this.renderers.length; i++) {
			if (typeof(this.renderers[i].updateParticle) === 'function') {
				this.renderers[i].updateParticle(tpf, particle);
			}
		}
	};

	return ParticleSimulation;
})
;
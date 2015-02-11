"use strict";
define([
	'particle_system/ParticleSystem'
],
	function (
		ParticleSystem
		) {

		var ParticlesAPI = function(gooRunner) {
			this.particleSystem = new ParticleSystem(gooRunner);
		};

		ParticlesAPI.prototype.setEnabled = function(enabled) {
			this.enabled = enabled;
		};

		ParticlesAPI.prototype.requestFrameUpdate = function(tpf) {
			this.particleSystem.update(tpf);
		};

		ParticlesAPI.prototype.spawnParticles = function(id, position, normal, effectData, callbacks) {
			this.particleSystem.spawnParticleSimulation(id, position, normal, effectData, callbacks)
		};

		ParticlesAPI.prototype.createParticleSystems = function(systemConfigs, rendererConfigs, atlasConfig, texture) {
			this.particleSystem.addConfiguredAtlasSystems(systemConfigs, rendererConfigs, atlasConfig, texture)
		};

		ParticlesAPI.prototype.removeParticleSystem = function(id) {
			this.particleSystem.remove(id)
		};

		return ParticlesAPI
	});
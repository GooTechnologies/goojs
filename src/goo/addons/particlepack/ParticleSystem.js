define([
		'goo/entities/systems/System',
		'goo/addons/particlepack/simulation/ParticleSimulator'
],

function (
	System,
	ParticleSimulator
) {
	"use strict";

	function ParticleSystem(settings) {

		System.call(this, 'ParticleSystem', []);

		settings = settings || {};

		this.priority = 1; // make sure it processes after transformsystem

		this.goo = settings.goo;
		this.atlases = {};
		this.simData = {};
		this.simulators = {};
		this.groups = {};

	}

	ParticleSystem.prototype = Object.create(System.prototype);
	ParticleSystem.prototype.constructor = ParticleSystem;

	ParticleSystem.prototype.addConfiguredAtlasSystems = function (simConfigs, rendererConfigs, atlasConfig, texture) {
		for (var i = 0; i < simConfigs.simulators.length; i++) {
			var simSettings = simConfigs.simulators[i];
			var simulator = new ParticleSimulator(this.goo, simSettings, rendererConfigs, atlasConfig, texture);
			this.simulators[simSettings.id] = simulator;
		}
	};

	ParticleSystem.prototype.spawnParticleSimulation = function(id, position, normal, effectData, callbacks) {
		this.simulators[id].addEffectSimulation(position, normal, effectData, callbacks);
	};

	ParticleSystem.prototype.get = function (id) {
		return this.simulators[id];
	};

	ParticleSystem.prototype.remove = function (id) {
		if (this.simulators[id]) {
			this.simulators[id].remove();
			delete this.simulators[id];
		}
	};

	ParticleSystem.prototype.wakeParticle = function(id) {
		var simulator = this.simulators[id];
		if (simulator) {
			return simulator.wakeParticle();
		}
	};

	ParticleSystem.prototype.setVisible = function(id, visible) {
		var simulator = this.simulators[id];
		if (simulator) {
			return simulator.setVisible(visible);
		}
	};

	ParticleSystem.prototype.process = function() {

		var infostr = '';
		for (var simulatorId in this.simulators) {
			var simulator = this.simulators[simulatorId];
			simulator.update(this.goo.world.tpf);
			infostr += simulatorId + ' = ' + simulator.aliveParticles + '<br>';
		}

	};

	return ParticleSystem;
});
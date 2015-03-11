define([
	'goo/entities/systems/System',
	'goo/addons/particlepack/simulation/ParticleSimulator'
], function (
	System,
	ParticleSimulator
) {
	"use strict";

	// REVIEW: make methods with no return value chainable
	// REVIEW: Put systems in an own folder, like the other packs do

	function ParticleSystem(settings) {

		System.call(this, 'ParticleSystem', []);

		settings = settings || {};

		this.priority = 1; // make sure it processes after transformsystem

		// REVIEW: should it not take the world as an argument instead? Then the particle system can do whatever it wants to rule the world!
		this.goo = settings.goo;
		this.atlases = {}; // REVIEW: unused
		this.simData = {}; // REVIEW: unused
		this.simulators = {};
		this.groups = {}; // REVIEW: unused

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

	ParticleSystem.prototype.spawnParticleSimulation = function (id, position, normal, effectData, callbacks) {
		this.simulators[id].addEffectSimulation(position, normal, effectData, callbacks);
	};

	ParticleSystem.prototype.get = function (id) { // REVIEW: get what?
		return this.simulators[id];
	};

	// REVIEW: move these methods to Simulator instead? We can already get a Simulator by id.

	ParticleSystem.prototype.remove = function (id) { // REVIEW: remove what?
		if (this.simulators[id]) {
			this.simulators[id].remove();
			delete this.simulators[id];
		}
	};

	ParticleSystem.prototype.wakeParticle = function (id) {
		var simulator = this.simulators[id];
		if (simulator) {
			return simulator.wakeParticle();
		}
	};

	ParticleSystem.prototype.setVisible = function (id, visible) {
		var simulator = this.simulators[id];
		if (simulator) {
			return simulator.setVisible(visible);
		}
	};

	ParticleSystem.prototype.process = function () {

		var infostr = '';
		for (var simulatorId in this.simulators) { // REVIEW: unoptimized  for-in loop!
			var simulator = this.simulators[simulatorId];
			simulator.update(this.goo.world.tpf);
			infostr += simulatorId + ' = ' + simulator.aliveParticles + '<br>'; // REVIEW: concatenating strings generates garbage. Does this have to be done in our loop?
		}

	};

	return ParticleSystem;
});
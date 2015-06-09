define([
	'goo/particlepack/ParticleSimulator'
],
/** @lends */
function (
	ParticleSimulator
) {
	"use strict";

	function ParticleSystem(goo) {
		this.goo = goo;
		this.simulators = {};
		this.groups = {};
	}

	ParticleSystem.prototype.add = function (settings) {
		var simulator = new ParticleSimulator(this.goo, settings);
		this.simulators[settings.id] = simulator;
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

	ParticleSystem.prototype.update = function(tpf) {
		var infostr = '';
		for (var simulatorId in this.simulators) {
			var simulator = this.simulators[simulatorId];
			simulator.update(tpf);

			infostr += simulatorId + ' = ' + simulator.aliveParticles + '<br>';
		}

		// document.getElementById('particlestats').innerHTML = infostr;
	};

	return ParticleSystem;
});
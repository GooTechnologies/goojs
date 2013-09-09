define([
	'goo/entities/Bus'//,
	//'goo/entities/components/Component'
],
/** @lends */
function (
	Bus//,
	//Component
) {
	"use strict";

	function FSMComponent() {
		this.bus = new Bus();
		this.machines = [];
	}

	FSMComponent.prototype.init = function() {
		for (var i = 0; i < this.machines.length; i++) {
			this.machines[i].reset();
			this.machines[i].enter();
		}
	};

	FSMComponent.prototype.update = function() {
		for (var i = 0; i < this.machines.length; i++) {
			var machine = this.machines[i];
			machine.update();
		}
	};

	return FSMComponent;
});
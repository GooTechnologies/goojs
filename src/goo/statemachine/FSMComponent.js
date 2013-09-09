define([
	'goo/entities/components/Component',
	'goo/entities/Bus'
],
/** @lends */
function (
	Component,
	Bus
) {
	"use strict";

	/**
	 * @class Machines!.
	 */
	function FSMComponent() {
		this.type = 'FSMComponent';

		this.bus = new Bus();
		this.machines = [];
	}

	FSMComponent.prototype = Object.create(Component.prototype);

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
define([
	'goo/statemachine/Util'
],
/** @lends */
function (
	Util
) {
	"use strict";

	function State(uuid) {
		this.uuid = uuid;
		this.actions = [];
		this.machines = [];
		this.vars = {};
	};

	State.prototype.update = function() {
		var jumpUp;

		// do on update of self
		for (var i = 0; i < this.actions.length; i++) {
			jumpUp = this.actions[i].onUpdate(this);
			if(jumpUp) { return jumpUp; }
		}

		// propagate on update
		for (var i = 0; i < this.machines.length; i++) {
			var machine = this.machines[i];
			jumpUp = machine.update();
			if(jumpUp) { return jumpUp; }
		}
	};

	State.prototype.reset = function() {
		for (var i = 0; i < this.machines.length; i++) {
			this.machines.reset();
		}
	};

	State.prototype.kill = function() {
		for (var i = 0; i < this.machines.length; i++) {
			this.machines.kill();
		}
		for (var i = 0; i < this.actions.length; i++) {
			this.actions[i].onExit(this);
		}
	};

	State.prototype.enter = function() {
		// on enter of self
		for (var i = 0; i < this.actions.length; i++) {
			this.actions[i].onEnter();
		}

		// propagate on enter
		for (var i = 0; i < this.machines.length; i++) {
			this.machines.enter();
		}
	};

	return State;
});
define([
	'goo/statemachine/Util'
],
/** @lends */
function (
	Util
) {
	"use strict";

	function Machine() {
		this.states = [];
		this.initialState = 0; // convention: always 0
		this.currentState = null;
	}

	Machine.prototype.update = function() {
		var jumpUp;
		jumpUp = this.currentState.update();

		if (this.contains(jumpUp)) {
			this.curentState.kill();
			this.setState(jumpUp);
		}

		return jumpUp;
	};

	Machine.prototype.contains = function(state) {
		return this.states.indexOf(state) !== -1;
	};

	Machine.prototype.setState = function(state) {
		// change state
		this.activeState = state;

		// reset initial state of child machines
		this.activeState.reset();

		// do on enter of new state
		this.activeState.enter();
	};

	Machine.prototype.reset = function() {
		// reset self
		this.activeState = this.states[this.initialState];

		// propagate reset
		this.activeState.reset();
	};

	Machine.prototype.kill = function() {
		this.currentState.kill();
	};

	Machine.prototype.enter = function() {
		this.activeState.enter();
	};

	return Machine;
});
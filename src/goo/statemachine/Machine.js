define([],
/** @lends */
function (

) {
	"use strict";

	function Machine() {
		this.states = null; //{};
		this.initialState = 'entry';
		this.currentState = null;
	}

	Machine.prototype.update = function() {
		var jumpUp;
		jumpUp = this.currentState.update();

		if (this.contains(jumpUp)) {
			this.currentState.kill();
			this.setState(this.states[jumpUp]);
		}

		return jumpUp;
	};

	Machine.prototype.contains = function(uuid) {
		return !!this.states[uuid];
	};

	Machine.prototype.setState = function(state) {
		// change state
		this.currentState = state;

		// reset initial state of child machines
		this.currentState.reset();

		// do on enter of new state
		this.currentState.enter();
	};

	Machine.prototype.reset = function() {
		// reset self
		this.currentState = this.states[this.initialState];

		// propagate reset
		this.currentState.reset();
	};

	Machine.prototype.kill = function() {
		this.currentState.kill();
	};

	Machine.prototype.enter = function() {
		this.currentState.enter();
	};

	Machine.prototype.addState = function(state) {
		if(!this.states) {
			this.states = {};
			this.initialState = state.uuid;
		}
		this.states[state.uuid] = state;
	};

	return Machine;
});
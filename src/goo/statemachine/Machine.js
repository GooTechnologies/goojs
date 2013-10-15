define([],
/** @lends */
function (

) {
	"use strict";

	function Machine(name) {
		this.name = name;
		this._fsm = null;
		this._states = null;
		this.initialState = 'entry';
		this.currentState = null;
	}

	Machine.prototype.setRefs = function(parentFSM) {
		this._fsm = parentFSM;
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.setRefs(parentFSM);
		}
	};

	Machine.prototype.update = function() {
		var jump = this.currentState.update();

		if (jump && this.contains(jump)) {
			this.currentState.kill();
			this.setState(this._states[jump]);
		}

		return jump;
	};

	Machine.prototype.contains = function(uuid) {
		return !!this._states[uuid];
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
		this.currentState = this._states[this.initialState];

		// propagate reset
		if (this.currentState)
			this.currentState.reset();
	};

	Machine.prototype.kill = function() {
		this.currentState.kill();
	};

	Machine.prototype.enter = function() {
		this.currentState.enter();
	};

	Machine.prototype.addState = function(state) {
		if (!this._states) {
			this._states = {};
			this.initialState = state.uuid;
		}
		state._fsm = this._fsm;
		this._states[state.uuid] = state;
	};

	Machine.prototype.removeState = function(id) {
		if (!this._states[id]) { return; }
		if (this.initialState === id) { throw new Error('Cannot remove initial state'); }
		if (this.currentState === this._states[id]) {
			this.reset();
		}
		delete this._states[id];
	};

	Machine.prototype.setInitialState = function(initialState) {
		this.initialState = initialState;
	};

	return Machine;
});
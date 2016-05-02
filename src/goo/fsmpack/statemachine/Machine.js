var StateMachineComponent = require('./StateMachineComponent');
var State = require('./State');

/**
 * A state machine.
 * @param {object} [options]
 * @param {string} [options.id]
 * @param {string} [options.name]
 * @param {number} [options.maxLoopDepth=100]
 * @param {number} [options.asyncMode=false]
 */
function Machine(options) {
	options = options || {};

	/**
	 * @type {string}
	 */
	this.id = options.id;

	/**
	 * @type {string}
	 */
	this.name = options.name || 'Machine';

	/**
	 * @type {object}
	 */
	this.states = {};

	/**
	 * Initial state. Set it using .setInitialState()
	 * @type {State|null}
	 */
	this.initialState = null;

	/**
	 * Current state. Set it using .setState()
	 * @type {State|null}
	 */
	this.currentState = null;

	/**
	 * @type {StateMachineComponent|State}
	 */
	this.parent = null;

	/**
	 * @type {number}
	 */
	this.maxLoopDepth = options.maxLoopDepth !== undefined ? options.maxLoopDepth : 100;

	/**
	 * @type {boolean}
	 */
	this.asyncMode = options.asyncMode !== undefined ? options.asyncMode : false;
}

Machine.prototype.getEntity = function () {
	if (this.parent instanceof State) {
		return this.parent.machine.getEntity();
	} else if (this.parent instanceof StateMachineComponent) {
		return this.parent.entity;
	}
};

Machine.prototype.containsState = function (state) {
	return !!this.states[state.id];
};

Machine.prototype.getStateById = function (id) {
	return this.states[id];
};

Machine.prototype.setInitialState = function (state) {
	this.initialState = state;
};

Machine.prototype.setState = function (state) {
	// change state
	this.currentState = state;

	// reset initial state of child machines
	this.currentState.reset();

	// do on enter of new state
	this.currentState.enter();
};

Machine.prototype.reset = function () {
	// reset self
	this.currentState = this.initialState;

	// propagate reset
	if (this.currentState) {
		this.currentState.reset();
	}
};

Machine.prototype.ready = function () {
	var keys = Object.keys(this.states);
	for (var i = 0; i < keys.length; i++) {
		var state = this.states[keys[i]];
		state.ready();
	}
};

Machine.prototype.cleanup = function () {
	var keys = Object.keys(this.states);
	for (var i = 0; i < keys.length; i++) {
		var state = this.states[keys[i]];
		state.cleanup();
	}
};

Machine.prototype.enter = function () {
	var keys = Object.keys(this.states);
	for (var i = 0; i < keys.length; i++) {
		var state = this.states[keys[i]];
		state.resetDepth();
	}
	if (this.currentState) {
		this.currentState.enter();
	}
};

Machine.prototype.update = function () {
	var keys = Object.keys(this.states);
	for (var i = 0; i < keys.length; i++) {
		var state = this.states[keys[i]];
		state.resetDepth();
	}
	if (this.currentState) {
		if (!this.asyncMode) {
			this.currentState.update();
		} else {
			// old async mode
			var jumpState = this.currentState.update();

			if (jumpState) {
				this.currentState.kill();
				this.setState(jumpState);
			}

			return jumpState;
		}
	}
};

Machine.prototype.kill = function () {
	if (this.currentState) {
		this.currentState.kill();
	}
};

Machine.prototype.addState = function (state) {
	state.machine = this;
	this.states[state.id] = state;
};

Machine.prototype.removeFromParent = function () {
	if (this.parent && this.parent instanceof StateMachineComponent) {
		this.parent.removeMachine(this);
	}
};

Machine.prototype.recursiveRemove = function () {
	var keys = Object.keys(this.states);
	for (var i = 0; i < keys.length; i++) {
		var state = this.states[keys[i]];
		state.recursiveRemove();
	}
	for (var key in this.states) {
		delete this.states[key];
	}
};

Machine.prototype.removeState = function (state) {
	var id = state.id;
	if (!this.states[id]) {
		return;
	}
	if (this.initialState === state) {
		throw new Error('Cannot remove initial state');
	}
	if (this.currentState === state) {
		this.reset();
	}
	delete this.states[id];
};

module.exports = Machine;

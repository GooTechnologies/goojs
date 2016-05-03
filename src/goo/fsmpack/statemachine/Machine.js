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
	 * @type {Set}
	 */
	this.states = new Set();

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
	 * @type {StateMachineComponent|State|null}
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

/**
 * Add a state
 * @param {State} state
 * @returns {Machine}
 */
Machine.prototype.addState = function (state) {
	state.machine = this;
	this.states.add(state);
	return this;
};

/**
 * Remove a state
 * @param {State} state
 * @returns {Machine}
 */
Machine.prototype.removeState = function (state) {
	if (!this.states.has(state)) {
		return;
	}
	if (this.initialState === state) {
		throw new Error('Cannot remove initial state');
	}
	if (this.currentState === state) {
		this.reset();
	}
	delete this.states.delete(state);
	return this;
};

/**
 * @return {Entity}
 */
Machine.prototype.getEntity = function () {
	if (this.parent instanceof State) {
		return this.parent.machine.getEntity();
	} else if (this.parent instanceof StateMachineComponent) {
		return this.parent.entity;
	}
};

/**
 * @param {State} state
 * @return {boolean}
 */
Machine.prototype.containsState = function (state) {
	return this.states.has(state);
};

/**
 * @param {string} id
 * @return {State}
 */
Machine.prototype.getStateById = function (id) {
	var result;
	this.states.forEach(function (state) {
		if (state.id === id) {
			result = state;
		}
	});
	return result;
};

/**
 * @param {State} state
 * @return {Machine}
 */
Machine.prototype.setInitialState = function (state) {
	this.initialState = state;
	return this;
};

/**
 * Set current state.
 * @param {State} state
 * @return {Machine}
 */
Machine.prototype.setState = function (state) {
	// change state
	this.currentState = state;

	// reset initial state of child machines
	this.currentState.reset();

	// do on enter of new state
	this.currentState.enter();

	return this;
};

/**
 * Reset the machine.
 * @return {Machine}
 */
Machine.prototype.reset = function () {
	// reset self
	this.currentState = this.initialState;

	// propagate reset
	if (this.currentState) {
		this.currentState.reset();
	}

	return this;
};

/**
 * @returns {Machine}
 */
Machine.prototype.ready = function () {
	this.states.forEach(function (state) {
		state.ready();
	});
	return this;
};

/**
 * @returns {Machine}
 */
Machine.prototype.cleanup = function () {
	this.states.forEach(function (state) {
		state.cleanup();
	});
	return this;
};

function resetDepth(state) {
	state.resetDepth();
}

/**
 * @returns {Machine}
 */
Machine.prototype.enter = function () {
	this.states.forEach(resetDepth);
	if (this.currentState) {
		this.currentState.enter();
	}
	return this;
};

Machine.prototype.update = function () {
	this.states.forEach(resetDepth);

	if (this.currentState) {
		if (!this.asyncMode) {
			this.currentState.update();
		} else {
			// old async mode
			var jumpState = this.currentState.update();

			if (jumpState) {
				this.currentState.exit();
				this.setState(jumpState);
			}

			return jumpState;
		}
	}
};

/**
 * @returns {Machine}
 */
Machine.prototype.exit = function () {
	if (this.currentState) {
		this.currentState.exit();
	}
	return this;
};

module.exports = Machine;

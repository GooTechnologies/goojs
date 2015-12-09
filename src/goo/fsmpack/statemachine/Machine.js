define([], function (

) {
	'use strict';

	function Machine(name) {
		this.name = name;
		this._states = {};
		this._fsm = null;
		this.initialState = 'entry';
		this.currentState = null;
		this.parent = null;
	}

	Machine.prototype.setRefs = function (parentFSM) {
		this._fsm = parentFSM;
		this.forEachState(function (state) {
			state.setRefs(parentFSM);
		});
	};

	/**
	 * Updates the state machine and triggers any state changes that might need
	 * to occur.
	 *
	 * @returns {boolean}
	 *          Whether a jump ocurred.
	 */
	Machine.prototype.update = function () {
		if (this.currentState) {
			var jump = this.currentState.update();

			if (jump && this.hasState(jump)) {
				this.currentState.kill();
				this.setState(this._states[jump]);
			}

			return jump;
		}
	};

	/**
	 * Enters the specified state of the machine.
	 *
	 * @param {State} state
	 *        The state which is to be entered.
	 *
	 * @returns {Machine}
	 *          The machine itself.
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
	 * Resets the machine to its default state.
	 *
	 * @return {Machine}
	 *         The machine itself.
	 */
	Machine.prototype.reset = function () {
		// reset self
		this.currentState = this._states[this.initialState];

		// propagate reset
		if (this.currentState) {
			this.currentState.reset();
		}

		return this;
	};

	/**
	 * Kills the machine.
	 *
	 * @return {Machine}
	 *         The machine itself.
	 */
	Machine.prototype.kill = function () {
		if (this.currentState) {
			this.currentState.kill();
		}

		return this;
	};

	/**
	 * Marks all the states in the machine as ready.
	 *
	 * @return {Machine}
	 *         The machine itself.
	 */
	Machine.prototype.ready = function () {
		this.forEachState(function (state) {
			state.ready();
		});

		return this;
	};

	/**
	 * Cleans up all the states of the machine.
	 *
	 * @return {Machine}
	 *         The machine itself.
	 */
	Machine.prototype.cleanup = function () {
		this.forEachState(function (state) {
			state.cleanup();
		});

		return this;
	};

	/**
	 * Enters the current state of the machine.
	 *
	 * @return {Machine}
	 *         The machine itself.
	 */
	Machine.prototype.enter = function () {
		if (this.currentState) {
			this.currentState.enter();
		}

		return this;
	};

	/**
	 * Gets the current state of the machine.
	 *
	 * @return {State}
	 */
	Machine.prototype.getCurrentState = function () {
		return this.currentState;
	};

	/**
	 * Adds the specified state to the machine.
	 *
	 * @param {State} state
	 *        The state which is to be added.
	 *
	 * @returns {Machine}
	 *          The machine itself.
	 */
	Machine.prototype.addState = function (state) {
		if (!this.hasStates()) {
			this.initialState = state.uuid;
		}
		state.parent = this;
		state.setParentFSM(this._fsm);
		this._states[state.uuid] = state;

		return this;
	};

	/**
	 * Removes the machine from its parent machine.
	 *
	 * @return {Machine}
	 *         The machine itself.
	 */
	Machine.prototype.removeFromParent = function () {
		if (this.parent) {
			this.parent.removeMachine(this);
		}

		return this;
	};

	/**
	 * Recursively removes all the states from the machine.
	 *
	 * @return {Machine}
	 *         The machine itself.
	 */
	Machine.prototype.recursiveRemove = function () {
		this.forEachState(function (state) {
			state.recursiveRemove();
		});
		this._states = {};

		return this;
	};

	/**
	 * Removes the state with the specified id from the machine.
	 *
	 * @param {string} id
	 *        The identifier of the state which is to be removed.
	 *
	 * @return {Machine}
	 *         The machine itself.
	 */
	Machine.prototype.removeState = function (id) {
		if (!this.hasState(id)) { return; }
		if (this.initialState === id) {
			throw new Error('Cannot remove initial state');
		}

		if (this.currentState === this._states[id]) {
			this.reset();
		}
		delete this._states[id];

		return this;
	};

	/**
	 * Sets the initial state of the machine.
	 *
	 * @param {string} initialState
	 *        The identifier of the state which is to be set as the initial one.
	 *
	 * @returns {Machine}
	 *          The state machine itself.
	 */
	Machine.prototype.setInitialState = function (initialStateId) {
		this.initialState = initialStateId;
		return this;
	};

	/**
	 * Gets the state that has the specified identifier, if it is in the machine.
	 *
	 * @param {string} id
	 *        The identifier of the state which is to be returned.
	 *
	 * @return {State}
	 */
	Machine.prototype.getState = function (id) {
		return this._states[id];
	};

	/**
	 * Gets a an object with all the states where the key is the state id and
	 * the value is the state itself.
	 *
	 * @return {object}
	 */
	Machine.prototype.getStates = function () {
		return this._states;
	};

	/**
	 * Gets all the states in the machine as an array.
	 *
	 * @return {State[]}
	 */
	Machine.prototype.getStateArray = function () {
		var states = [];
		this.forEachState(function(state) {
			states.push(state);
		});
		return states;
	};

	/**
	 * Gets an array with the ids of all the states that are in the machine.
	 *
	 * @return {string[]}
	 */
	Machine.prototype.getStateIds = function () {
		return Object.keys(this._states);
	};

	/**
	 * Gets whether the machine has a state with the specified identifier.
	 *
	 * @param {string} id
	 *        The identifier of the state which is to be checked.
	 *
	 * @return {Boolean}
	 *         True if the machine has the specified state and false otherwise.
	 */
	Machine.prototype.hasState = function (id) {
		return Boolean(this.getState(id));
	};

	Machine.prototype.contains = function (id) {
		return this.hasState(id);
	};

	/**
	 * Gets whether the machine has any states.
	 *
	 * @return {Boolean}
	 */
	Machine.prototype.hasStates = function () {
		return this.getStateIds().length > 0;
	};

	/**
	 * Applies the specified function for each state in the machine.
	 *
	 * @param {Function} fn
	 *        Function which is to be called for each state. It receives the
	 *        state in the first parameter and the state id in the second one.
	 */
	Machine.prototype.forEachState = function (fn) {
		var ids = this.getStateIds();
		for (var i = 0; i < ids.length; ++i) {
			var id = ids[i];
			fn(this.getState(id), id);
		}
	};

	/**
	 * Sets the state machine component to which this machine belongs.
	 *
	 * @param {fsm} fsm
	 *        The state machine component to which the machine belongs.
	 *
	 * @returns {Machine}
	 *          The machine itself.
	 */
	Machine.prototype.setParentFSM = function (fsm) {
		this._fsm;
		return this;
	};

	/**
	 * Gets the state machine component to which the machine belongs.
	 *
	 * @return {StateMachineComponent}
	 *         The state machine component to which the machine belongs.
	 */
	Machine.prototype.getParentFSM = function () {
		return this._fsm;
	};

	return Machine;
});
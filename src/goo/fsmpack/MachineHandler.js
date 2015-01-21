define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/fsmpack/statemachine/State',
	'goo/fsmpack/statemachine/Machine',
	'goo/fsmpack/statemachine/actions/Actions',
	'goo/util/rsvp'
], function(
	ConfigHandler,
	PromiseUtil,
	_,
	State,
	Machine,
	Actions,
	RSVP
) {
	'use strict';

	/**
	 * Handler for loading materials into engine
	 * @hidden
	 * @extends ConfigHandler
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 */
	function MachineHandler() {
		ConfigHandler.apply(this, arguments);
	}

	MachineHandler.prototype = Object.create(ConfigHandler.prototype);
	MachineHandler.prototype.constructor = MachineHandler;

	ConfigHandler._registerClass('machine', MachineHandler);
	MachineHandler.prototype._remove = function(ref) {
		var machine = this._objects[ref];
		if (machine) {
			/**
			 * Removes a machine
			 * @param {ref}
			 * @private
			 */
			machine.removeFromParent();
		}
		delete this._objects[ref];
	};

	/**
	 * Creates an empty machine
	 * @returns {Machine}
	 * @private
	 */
	 MachineHandler.prototype._create = function() {
		return new Machine();
	};

	/**
	 * Adds/updates/removes a machine
	 * @param {string} ref
	 * @param {object|null} config
	 * @param {object} options
	 * @private
	 * @returns {RSVP.Promise} Resolves with the updated machine or null if removed
	 */
	 MachineHandler.prototype._update = function(ref, config, options) {
		var that = this;
		return ConfigHandler.prototype._update.call(this, ref, config, options).then(function(machine) {
			if (!machine) { return; }
			machine.name = config.name;

			// Remove old states
			for (var key in machine._states) {
				if (!config.states[key]) {
					machine.removeState(key);
				}
			}
			// Update existing states and create new ones
			var promises = [];
			for (var key in config.states) {
				promises.push(that._updateState(machine, config.states[key], options));
			}
			return RSVP.all(promises).then(function() {
				machine.setInitialState(config.initialState);
				return machine;
			});
		});
	};

	/**
	 * Update actions on a state
	 * @param {State} state
	 * @param {object} config
	 * @private
	 */
	MachineHandler.prototype._updateActions = function(state, stateConfig) {
		// Remove old actions
		for (var i = 0; i < state._actions.length; i++) {
			var action = state._actions[i];
			if (!stateConfig.actions || !stateConfig.actions[action.id]) {
				state.removeAction(action);
				i--;
			}
		}

		// Update new and existing ones
		// For actions, order is (or will be) important
		var actions = [];
		_.forEach(stateConfig.actions, function(actionConfig) {
			var action = state.getAction(actionConfig.id);
			if (!action) {
				var Action = Actions.actionForType(actionConfig.type);
				action = new Action(actionConfig.id, actionConfig.options);
				if (action.onCreate) {
					action.onCreate(state.proxy);
				}
				//state.addAction(action);
			} else {
				action.configure(actionConfig.options);
			}
			actions.push(action);
		}, null, 'sortValue');
		state._actions = actions;
	};

	/**
	 * Update transitions on the machine
	 * @param {State} state
	 * @param {object} config
	 * @private
	 */
	MachineHandler.prototype._updateTransitions = function(state, stateConfig) {
		state._transitions = {};
		for (var key in stateConfig.transitions) {
			var transition = stateConfig.transitions[key];
			state.setTransition(transition.id, transition.targetState);
		}
	};

	/**
	 * Update states on the machine. This includes loading childMachines
	 * @param {State} state
	 * @param {object} config
	 * @private
	 */
	MachineHandler.prototype._updateState = function(machine, stateConfig, options) {
		var state;
		if (machine._states && machine._states[stateConfig.id]) {
			state = machine._states[stateConfig.id];
		} else {
			state = new State(stateConfig.id);
			machine.addState(state);
		}
		state.name = stateConfig.name;

		// Actions
		this._updateActions(state, stateConfig);
		// Transitions
		this._updateTransitions(state, stateConfig);
		// Child machines
		// Removing
		for (var i = 0; i < state._machines; i++) {
			var childMachine = state._machines[i];
			if(!stateConfig.childMachines[childMachine.id]) {
				state.removeMachine(childMachine);
				i--;
			}
		}
		// Updating
		var promises = [];
		for (var key in stateConfig.childMachines) {
			promises.push(this._load(stateConfig.childMachines[key].machineRef, options));
		}

		/*
		// TODO: Test and use this. Will make the promises sorted correctly.
		_.forEach(stateConfig.childMachines, function(childMachineConfig) {
			promises.push(that._load(childMachineConfig.machineRef, options));
		}, null, 'sortValue');
		*/

		return RSVP.all(promises).then(function(machines) {
			for (var i = 0; i < machines; i++) {
				state.addMachine(machines[i]);
			}
			return state;
		});
	};


	return MachineHandler;
});
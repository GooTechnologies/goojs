define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/loaders/JsonUtils',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/fsmpack/statemachine/State',
	'goo/fsmpack/statemachine/Machine',
	'goo/fsmpack/statemachine/actions/Actions',
	'goo/util/rsvp',
	'goo/loaders/DynamicLoader'
], function(
	ConfigHandler,
	JsonUtils,
	PromiseUtil,
	_,
	State,
	Machine,
	Actions,
	RSVP,
	DynamicLoader
) {
	'use strict';

	function MachineHandler() {
		ConfigHandler.apply(this, arguments);
	}

	MachineHandler.prototype = Object.create(ConfigHandler.prototype);
	MachineHandler.prototype.constructor = MachineHandler;
	ConfigHandler._registerClass('machine', MachineHandler);
	DynamicLoader.registerJSON('machine');

	MachineHandler.prototype._remove = function(ref) {
		var machine = this._objects[ref];
		if (machine) {
			machine.removeFromParent();
		}
		delete this._objects[ref];
	};

	MachineHandler.prototype._create = function() {
		return new Machine();
	};

	MachineHandler.prototype.update = function(ref, config, options) {
		var that = this;
		return ConfigHandler.prototype.update.call(this, ref, config, options).then(function(machine) {
			machine.name = config.name;
			machine.setInitialState(config.initialState);

			// Remove old states
			for (var key in machine._states) {
				if (!config.states[key]) {
					machine.removeState(key);
				}
			}
			// Update existing states and create new ones
			var promises = [];
			for (var key in config.states) {
				promises.push(that._updateState(machine, config.states[key]));
			}
			return RSVP.all(promises).then(function() {
				return machine;
			});
		});
	};

	MachineHandler.prototype._updateActions = function(state, stateConfig) {
		// Remove old actions
		for (var i = 0; i < state._actions.length; i++) {
			var action = state._actions[i];
			if (!stateConfig.actions[action.id]) {
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
		}, 'sortValue');
		state._actions = actions;
	};

	MachineHandler.prototype._updateTransitions = function(state, stateConfig) {
		state._transitions = {};
		for (var key in stateConfig.transitions) {
			var transition = stateConfig.transitions[key];
			state.setTransition(transition.id, transition.targetState);
		}
	};

	MachineHandler.prototype._updateState = function(machine, stateConfig) {
		var state = machine._states[stateConfig.id];
		if (!state) {
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
			promises.push(this._load(stateConfig.childMachines[key]));
		}
		return RSVP.all(promises).then(function(machines) {
			for (var i = 0; i < machines; i++) {
				state.addMachine(machines[i]);
			}
			return state;
		});
	};


	return MachineHandler;
});
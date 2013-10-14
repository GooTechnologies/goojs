define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/renderer/MeshData',
	'goo/animation/SkeletonPose',
	'goo/loaders/JsonUtils',
	'goo/util/PromiseUtil',
	'goo/statemachine/State',
	'goo/statemachine/Machine',
	'goo/statemachine/actions/Actions',
	'goo/util/rsvp'
], function(
	ConfigHandler,
	MeshData,
	SkeletonPose,
	JsonUtils,
	PromiseUtil,
	State,
	Machine,
	Actions,
	RSVP
) {
	'use strict';

	function MachineHandler() {
		ConfigHandler.apply(this, arguments);
		this._objects = {};
	}

	MachineHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('machine', MachineHandler);

	MachineHandler.prototype._updateActions = function(state, stateConfig) {
		for (var j = 0; j < stateConfig.actions.length; j++) {
			var actionConfig = stateConfig.actions[j];
			var action = state.getAction(actionConfig.id);

			if (action === undefined) {
				// New action
				var ActionClass = Actions.actionForType(actionConfig.type);
				if (ActionClass instanceof Function) {
					action = new ActionClass(actionConfig.id, actionConfig.options);
					state.addAction(action);
				}
			}
			else {
				// Update properties on existing action
				action.configure(actionConfig.options);
			}
		}
	};

	MachineHandler.prototype._updateTransitions = function(realState, stateConfig) {
		var transitions = stateConfig.transitions;
		for (var i = 0; i < transitions.length; i++) {
			var transition = transitions[i];
			realState.setTransition(transition.id, transition.targetState);
		}
	};

	MachineHandler.prototype._updateState = function(realMachine, stateConfig) {
		var realState = realMachine._states ? realMachine._states[stateConfig.id] : undefined;
		if (realState === undefined) {
			realState = new State(stateConfig.id);
			realMachine.addState(realState);
		}
		realState.name = stateConfig.name;
		this._updateActions(realState, stateConfig);
		this._updateTransitions(realState, stateConfig);

		var that = this;
		function update(ref) {
			return that.getConfig(ref).then(function(config) {
				return that.updateObject(ref, config);
			});
		}

		// machine refs
		var promises = [];
		for (var j = 0; j < stateConfig.machineRefs.length; j++) {
			var machineRef = stateConfig.machineRefs[j];
			promises.push(update(machineRef));
		}

		if (promises.length>0) {
			return RSVP.all(promises).then(function(realMachines) {
				realMachines.forEach(function(realMachine) {
					realState.addMachine(realMachine);
				});
			});
		}
		else {
			return PromiseUtil.createDummyPromise(realState);
		}
	};

	MachineHandler.prototype.update = function(ref, config) {

		var realMachine = this._objects[ref];
		if (!realMachine) {
			realMachine = this._objects[ref] = new Machine(config.name);
		}

		realMachine.setInitialState(config.initialState);

		// states
		var promises = [];
		for (var i = 0; i < config.states.length; i++) {
			promises.push(this._updateState(realMachine, config.states[i]));
		}

		// vars
		// ...

		return RSVP.all(promises).then(function() {
			return realMachine;
		});
	};

	return MachineHandler;
});
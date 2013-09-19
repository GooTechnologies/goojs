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
	function MachineHandler() {
		ConfigHandler.apply(this, arguments);
		this._objects = {};
	}


	MachineHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('machine', MachineHandler);

	MachineHandler.prototype._updateActions = function(realState, stateConfig) {
		for (var j = 0; j < stateConfig.actions.length; j++) {
			var action = stateConfig.actions[j];
			var actionClass = Actions.actionForType(action.type);
			if (actionClass instanceof Function) {
				var realAction = new actionClass(action.options);
				realState.addAction(realAction);
			}
		}
	};

	MachineHandler.prototype._updateTransitions = function(realState, stateConfig) {
		var transitionKeys = Object.keys(stateConfig.transitions);
		for (var i = 0; i < transitionKeys.length; i++) {
			var transitionKey = transitionKeys[i];
			realState.setTransition(transitionKey, stateConfig.transitions[transitionKey]);
		}
	};

	MachineHandler.prototype._updateState = function(realMachine, stateConfig) {
		var realState = new State(stateConfig.id);

		realMachine.addState(realState);
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

		return RSVP.all(promises).then(function(realMachines) {
			realMachines.forEach(function(realMachine) {
				realState.addMachine(realMachine);
			});
		});
	};

	MachineHandler.prototype.update = function(ref, config) {
		var realMachine = new Machine(config.name);

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
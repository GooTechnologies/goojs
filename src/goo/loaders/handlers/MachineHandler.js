define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/renderer/MeshData',
	'goo/animation/SkeletonPose',
	'goo/loaders/JsonUtils',
	'goo/util/PromiseUtil',
	'goo/statemachine/State',
	'goo/statemachine/Machine',
	'goo/statemachine/actions/AddPositionAction',
	'goo/statemachine/actions/MouseClickAction',
	'goo/statemachine/actions/KeyUpAction',
	'goo/statemachine/actions/KeyDownAction'
], function(
	ConfigHandler,
	MeshData,
	SkeletonPose,
	JsonUtils,
	PromiseUtil,
	State,
	Machine,
	AddPositionAction,
	MouseClickAction,
	KeyUpAction,
	KeyDownAction
) {
	function MachineHandler() {
		ConfigHandler.apply(this, arguments);
		this._objects = {};
	}

	MachineHandler.actions = {
		AddPositionAction: AddPositionAction,
		MouseClickAction: MouseClickAction,
		KeyUpAction: KeyUpAction,
		KeyDownAction: KeyDownAction
		// populate this list
	};

	MachineHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('machine', MachineHandler);

	MachineHandler.prototype.update = function(ref, config) {
		var realMachine = new Machine(config.name);

		// states
		for (var i = 0; i < config.states.length; i++) {
			var state = config.states[i];
			var realState = new State(state.uuid);
			realMachine.addState(realState);

			// actions
			for (var j = 0; j < state.actions.length; j++) {
				var action = state.actions[j];
				if (MachineHandler.actions[action.type] instanceof Function) {
					var realAction = new MachineHandler.actions[action.type](action.options);
					state.addAction(realAction);
				}
			}

			// machine refs
			for (var j = 0; j < state.machineRefs.length; j++) {
				var machine = state.machines[j];

				realState._machines.push(machine.name);
				// store them initially as uuids and after every state is loaded do a replace on all
			}
		}

		// vars

		return PromiseUtil.createDummyPromise(realMachine);
	};

	return MachineHandler;
});
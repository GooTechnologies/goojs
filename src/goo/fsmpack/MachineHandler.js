var ConfigHandler = require('../loaders/handlers/ConfigHandler');
var ObjectUtils = require('../util/ObjectUtils');
var State = require('../fsmpack/statemachine/State');
var Machine = require('../fsmpack/statemachine/Machine');
var Actions = require('../fsmpack/statemachine/actions/Actions');
var RSVP = require('../util/rsvp');

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

/**
 * Creates an empty machine
 * @returns {Machine}
 * @private
 */
MachineHandler.prototype._create = function () {
	return new Machine();
};

/**
 * Preparing sound config by populating it with defaults.
 * @param {Object} config
 * @private
 */
MachineHandler.prototype._prepare = function (config) {
	ObjectUtils.defaults(config, {
		maxLoopDepth: 100,
		asyncMode: true
	});
};

/**
 * Adds/updates/removes a machine
 * @param {string} ref
 * @param {Object} config
 * @param {Object} options
 * @private
 * @returns {RSVP.Promise} Resolves with the updated machine or null if removed
 */
MachineHandler.prototype._update = function (ref, config, options) {
	var that = this;
	return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (machine) {
		if (!machine) { return; }
		machine.id = ref;
		machine.name = config.name;
		machine.maxLoopDepth = config.maxLoopDepth;
		machine.asyncMode = config.asyncMode;

		// Remove old states
		machine.states.forEach(function (state) {
			if (!config.states[state.id]) {
				machine.removeState(state);
			}
		});

		// Update existing states and create new ones
		var promises = [];
		for (var id in config.states) {
			promises.push(that._updateState(machine, config.states[id], options));
		}

		return RSVP.all(promises).then(function () {
			machine.setInitialState(machine.getStateById(config.initialState));
			return machine;
		});
	});
};

/**
 * Update actions on a state
 * @param {State} state
 * @param {Object} config
 * @private
 */
MachineHandler.prototype._updateActions = function (state, stateConfig) {
	// Remove old actions
	for (var i = 0; i < state.actions.length; i++) {
		var action = state.actions[i];
		if (!stateConfig.actions || !stateConfig.actions[action.id]) {
			state.removeAction(action);
			i--;
		}
	}

	// Update new and existing ones.
	// For actions, order is important.
	var actions = [];
	ObjectUtils.forEach(stateConfig.actions, function (actionConfig) {
		var action = state.getActionById(actionConfig.id);
		if (!action) {
			var ActionConstructor = Actions.actionForType(actionConfig.type);
			action = new ActionConstructor({
				id: actionConfig.id,
				settings: actionConfig.options
			});
		} else {
			action.configure(actionConfig.options);
		}
		actions.push(action);
	}, null, 'sortValue');

	state.removeAllActions();
	for (var i=0; i<actions.length; i++){
		state.addAction(actions[i]);
	}
};

/**
 * Update transitions on the machine
 * @param {State} state
 * @param {Object} config
 * @private
 */
MachineHandler.prototype._updateTransitions = function (state, stateConfig, machine) {
	state.transitions.clear();
	for (var id in stateConfig.transitions) {
		var transition = stateConfig.transitions[id];
		var targetState = machine.getStateById(transition.targetState);
		state.setTransition(transition.id, targetState);
	}
};

/**
 * Update states on the machine. This includes loading childMachines
 * @param {State} state
 * @param {Object} config
 * @private
 */
MachineHandler.prototype._updateState = function (machine, stateConfig/*, options*/) {
	var state = machine.getStateById(stateConfig.id);
	if (!state) {
		state = new State({
			id: stateConfig.id
		});
		machine.addState(state);
	}
	state.name = stateConfig.name;

	// Actions
	this._updateActions(state, stateConfig);

	// Transitions
	this._updateTransitions(state, stateConfig, machine);

	return Promise.resolve(state);
};

module.exports = MachineHandler;

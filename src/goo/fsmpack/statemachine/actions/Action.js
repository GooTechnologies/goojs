var State = require('../State');
var StateMachineComponent = require('../StateMachineComponent');

/**
 * @param {object} [options]
 * @param {string} [options.id]
 * @param {Object} [options.transitions]
 * @param {Object} [options.settings]
 * @param {State} [options.parent]
 * @private
 */
function Action(options) {
	options = options || {};

	/**
	 * @type {string}
	 */
	this.id = options.id;

	/**
	 * The host state.
	 * @type {State|StateMachineComponent}
	 */
	this.parent = options.parent;

	/**
	 * @type {object}
	 */
	this.transitions = {};
	if (options.transitions) {
		this.setTransitions(options.transitions);
	}

	if (options.settings) {
		this.configure(options.settings);
	}
}

/**
 * Returns the (root) entity that the action is on.
 * @returns {Entity}
 */
Action.prototype.getEntity = function () {
	var parent = this.parent;
	if (parent instanceof State) {
		return parent.machine.getEntity();
	} else if (parent instanceof StateMachineComponent) {
		return parent.entity;
	}
};

/**
 * @param {string} name
 * @returns {boolean}
 */
Action.prototype.getInputState = function (key) {
	var parent = this.parent;
	if (parent instanceof State) {
		return parent.machine.getInputState(key);
	} else if (parent instanceof StateMachineComponent) {
		return parent.system.getInputState(key);
	}
	return false;
};

/**
 * @param {string} name
 * @returns {number}
 */
Action.prototype.getVariable = function (name) {
	if (this.vars[name] !== undefined) {
		return this.vars[name];
	} else if (parent instanceof StateMachineComponent) {
		return this.parent.getVariable(name);
	}
};

/**
 * Apply an operation on a variable.
 * @param {string} name
 * @param {Function} fun
 */
Action.prototype.applyOnVariable = function (name, fun) {
	if (this.vars[name] !== undefined) {
		this.vars[name] = fun(this.vars[name]);
	} else {
		this.parent.applyOnVariable(name, fun);
	}
};

/**
 * @param {string} name
 * @param {Function} initialValue
 */
Action.prototype.defineVariable = function (name, initialValue) {
	this.vars[name] = initialValue;
};

/**
 * @param {string} name
 */
Action.prototype.removeVariable = function (name) {
	delete this.vars[name];
};

/**
 * Send an event, to trigger a transition. The event name must be listed among the transitions.
 * @param {object} settings
 */
Action.prototype.sendEvent = function (eventName) {
	if (this.parent instanceof State) {
		var transitionId = this.transitions[eventName];
		this.parent.handleTransition(transitionId);
	}
};

/**
 * Called by the constructor and by the handlers when new options are loaded
 * @param {object} settings
 */
Action.prototype.configure = function (settings) {

	// Set parameters
	var externalParameters = this.constructor.external.parameters;
	for (var i = 0; i < externalParameters.length; i++) {
		var externalParameter = externalParameters[i];
		var key = externalParameter.key;

		if (typeof settings[key] !== 'undefined') {
			this[key] = settings[key]; // TODO: should probably not mutate the action itself.. also clone? :/
		} else {
			this[key] = externalParameter['default']; // TODO: clone?
		}
	}

	// Set transitions
	this.setTransitions(settings.transitions);
};

Action.prototype.setTransitions = function (transitions) {
	for (var key in this.transitions) {
		delete this.transitions[key];
	}
	for (var key in transitions) {
		this.transitions[key] = transitions[key];
	}
};

/**
 * Called on enter - called once, when the host state becomes active
 */
Action.prototype.enter = function () {};

/**
 * Called on update
 */
Action.prototype.update = function () {};

/**
 * Called by external functions; also the place to cleanup whatever _setup did
 */
Action.prototype.exit = function () {};

/**
 * Called when the machine just started
 */
Action.prototype.ready = function () {};

/**
 * Called when the machine stops and makes sure that any changes not undone by exit methods get undone
 */
Action.prototype.cleanup = function () {};

module.exports = Action;

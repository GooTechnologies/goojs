var Component = require('../../entities/components/Component');
var ArrayUtils = require('../../util/ArrayUtils');
var SystemBus = require('../../entities/SystemBus');

/**
 * StateMachineComponent.
 * @extends {Component}
 */
function StateMachineComponent() {
	Component.apply(this, arguments);

	this.type = 'StateMachineComponent';

	/**
	 * @type {Array<Machine>}
	 */
	this.machines = [];

	/**
	 * @type {Map}
	 */
	this.machinesById = new Map();

	/**
	 * @type {object}
	 */
	this.vars = {};

	/**
	 * Read only, set by the StateMachineSystem.
	 * @type {StateMachineSystem}
	 */
	this.system = null;

	/**
	 * @type {number}
	 */
	this.time = 0;

	/**
	 * @type {boolean}
	 */
	this.entered = false;

	/**
	 * @type {boolean}
	 */
	this.active = true;
}

StateMachineComponent.prototype = Object.create(Component.prototype);

StateMachineComponent.vars = {};

/**
 * Add a machine.
 * @param {Machine} machine
 */
StateMachineComponent.prototype.addMachine = function (machine) {
	machine.parent = this;
	this.machines.push(machine);
	this.machinesById.set(machine.id, machine);
};

/**
 * Remove a machine.
 * @param {Machine} machine
 */
StateMachineComponent.prototype.removeMachine = function (machine) {
	machine.parent = null;
	ArrayUtils.remove(this.machines, machine);
	this.machinesById.delete(machine.id);
};

StateMachineComponent.getVariable = function (name) {
	return StateMachineComponent.vars[name];
};

StateMachineComponent.prototype.getVariable = function (name) {
	if (this.vars[name] !== undefined) {
		return this.vars[name];
	} else {
		return StateMachineComponent.getVariable(name);
	}
};

StateMachineComponent.applyOnVariable = function (name, fun) {
	StateMachineComponent.vars[name] = fun(StateMachineComponent.vars[name]);
};

StateMachineComponent.prototype.applyOnVariable = function (name, fun) {
	if (this.vars[name] !== undefined) {
		this.vars[name] = fun(this.vars[name]);
	} else {
		StateMachineComponent.applyOnVariable(name, fun);
	}
};

StateMachineComponent.prototype.defineVariable = function (name, initialValue) {
	this.vars[name] = initialValue;
};

StateMachineComponent.prototype.removeVariable = function (name) {
	delete this.vars[name];
};

StateMachineComponent.applyOnVariable = function (name, fun) {
	if (this.vars[name]) {
		this.vars[name] = fun(this.vars[name]);
	} else if (StateMachineComponent.vars[name]) {
		StateMachineComponent.applyOnVariable(name, fun);
	}
};

/**
 * Gets the state machine with the specified identifier.
 *
 * @param {string} id
 *        The identifier of the machine which is to be returned.
 *
 * @return {Machine}
 *         The state machine which was found or null if the specified state
 *         machine is not in the component.
 */
StateMachineComponent.prototype.getMachineById = function (id) {
	return this.machinesById.get(id);
};

/**
 * Resets all state machines to their initial state
 */
StateMachineComponent.prototype.init = function () {
	for (var i = 0; i < this.machines.length; i++) {
		var machine = this.machines[i];
		machine.reset();
		machine.ready();
	}
};

StateMachineComponent.prototype.enter = function () {
	for (var i = 0; i < this.machines.length; i++) {
		var machine = this.machines[i];
		machine.enter();
	}
	this.entered = true;
};

/**
 * Trigger exit in all machines.
 */
StateMachineComponent.prototype.exit = function () {
	for (var i = 0; i < this.machines.length; i++) {
		var machine = this.machines[i];
		machine.exit();
	}
	this.entered = false;
};

/**
 * Performs a cleanup; undoes any changes not undone by exit methods
 */
StateMachineComponent.prototype.cleanup = function () {
	for (var i = 0; i < this.machines.length; i++) {
		var machine = this.machines[i];
		machine.cleanup();
	}
};

/**
 * Updates the state machines
 */
StateMachineComponent.prototype.update = function () {
	if (!this.active) {
		return;
	}
	for (var i = 0; i < this.machines.length; i++) {
		var machine = this.machines[i];
		machine.update();
	}
};

/**
 * Stops updating the state machines
 */
StateMachineComponent.prototype.pause = function () {
	this.active = false;
	SystemBus.emit('goo.entity.' + this.entity.name + '.fsm.pause');
};

/**
 * Resumes updating the state machines
 */
StateMachineComponent.prototype.play = function () {
	this.active = true;
	SystemBus.emit('goo.entity.' + this.entity.name + '.fsm.play');
};

module.exports = StateMachineComponent;

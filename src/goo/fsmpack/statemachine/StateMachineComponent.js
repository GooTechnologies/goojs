define([
	'goo/entities/components/Component',
	'goo/util/ArrayUtil',
	'goo/entities/SystemBus'
],
/** @lends */
function (
	Component,
	ArrayUtil,
	SystemBus
) {
	'use strict';

	/**
	 * @class StateMachineComponent
	 * @private
	 */
	function StateMachineComponent() {
		this.type = 'StateMachineComponent';

		this._machines = [];
		this.entity = null;
		this.vars = {};
		this.system = null;
		this.time = 0;

		this.active = true;
	}

	StateMachineComponent.prototype = Object.create(Component.prototype);

	StateMachineComponent.vars = {};

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

	StateMachineComponent.prototype.addMachine = function (machine) {
		machine._fsm = this;
		machine.parent = this;
		this._machines.push(machine);
	};

	StateMachineComponent.prototype.removeMachine = function (machine) {
		machine.recursiveRemove();
		ArrayUtil.remove(this._machines, machine);
	};

	/**
	 * Resets all state machines to their initial state
	 */
	StateMachineComponent.prototype.init = function () {
		for (var i = 0; i < this._machines.length; i++) {
			var machine = this._machines[i];
			machine.setRefs(this);
			machine.reset();
			machine.ready();
		}
	};

	StateMachineComponent.prototype.doEnter = function () {
		for (var i = 0; i < this._machines.length; i++) {
			var machine = this._machines[i];
			machine.enter();
		}
	};

	/**
	 * Kills the state machines triggering exit functions in all current states
	 */
	StateMachineComponent.prototype.kill = function () {
		for (var i = 0; i < this._machines.length; i++) {
			var machine = this._machines[i];
			machine.kill();
		}
	};

	/**
	 * Performs a cleanup; undoes any changes not undone by exit methods
	 */
	StateMachineComponent.prototype.cleanup = function () {
		for (var i = 0; i < this._machines.length; i++) {
			var machine = this._machines[i];
			machine.cleanup();
		}
	};

	/**
	 * Updates the state machines
	 */
	StateMachineComponent.prototype.update = function () {
		if (this.active) {
			for (var i = 0; i < this._machines.length; i++) {
				var machine = this._machines[i];
				machine.update();
			}
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

	return StateMachineComponent;
});
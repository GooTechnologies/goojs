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
	 * @class FSMComponent
	 */
	function FSMComponent() {
		this.type = 'FSMComponent';

		this._machines = [];
		this.entity = null;
		this.vars = {};

		this.active = true;
	}

	FSMComponent.prototype = Object.create(Component.prototype);

	FSMComponent.vars = {};

	FSMComponent.getVariable = function (name) {
		return FSMComponent.vars[name];
	};

	FSMComponent.prototype.getVariable = function (name) {
		if (this.vars[name] !== undefined) {
			return this.vars[name];
		} else {
			return FSMComponent.getVariable(name);
		}
	};

	FSMComponent.applyOnVariable = function (name, fun) {
		FSMComponent.vars[name] = fun(FSMComponent.vars[name]);
	};

	FSMComponent.prototype.applyOnVariable = function (name, fun) {
		if (this.vars[name] !== undefined) {
			this.vars[name] = fun(this.vars[name]);
		} else {
			FSMComponent.applyOnVariable(name, fun);
		}
	};

	FSMComponent.prototype.defineVariable = function (name, initialValue) {
		this.vars[name] = initialValue;
	};

	FSMComponent.prototype.removeVariable = function (name) {
		delete this.vars[name];
	};

	FSMComponent.applyOnVariable = function (name, fun) {
		if (this.vars[name]) {
			this.vars[name] = fun(this.vars[name]);
		} else if (FSMComponent.vars[name]) {
			FSMComponent.applyOnVariable(name, fun);
		}
	};

	FSMComponent.prototype.addMachine = function (machine) {
		machine._fsm = this;
		machine.parent = this;
		this._machines.push(machine);
	};

	FSMComponent.prototype.removeMachine = function (machine) {
		machine.recursiveRemove();
		ArrayUtil.remove(this._machines, machine);
	};

	/**
	 * Resets all state machines to their initial state
	 */
	FSMComponent.prototype.init = function () {
		for (var i = 0; i < this._machines.length; i++) {
			var machine = this._machines[i];
			machine.setRefs(this);
			machine.reset();
			machine.enter();
		}
	};

	/**
	 * Updated the state machines
	 */
	FSMComponent.prototype.update = function () {
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
	FSMComponent.prototype.pause = function () {
		this.active = false;
		SystemBus.emit('goo.entity.' + this.entity.name + '.fsm.pause');
	};

	/**
	 * Resumes updating the state machines
	 */
	FSMComponent.prototype.play = function () {
		this.active = true;
		SystemBus.emit('goo.entity.' + this.entity.name + '.fsm.play');
	};

	return FSMComponent;
});
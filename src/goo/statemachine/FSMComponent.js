define([
	'goo/entities/components/Component',
	'goo/entities/Bus'
],
/** @lends */
function (
	Component,
	Bus
) {
	"use strict";

	/**
	 * @class FSMComponent
	 */
	function FSMComponent() {
		Component.call(this, 'FSMComponent', false);

		this._bus = new Bus();
		this._machines = [];
		this.entity = null;
		this.vars = {};

		this.active = true;
	}

	FSMComponent.prototype = Object.create(Component.prototype);

	FSMComponent.vars = {};

	FSMComponent.getVariable = function(name) {
		return FSMComponent.vars[name];
	};

	FSMComponent.prototype.getVariable = function(name) {
		if (this.vars[name] !== undefined) {
			return this.vars[name];
		} else {
			return FSMComponent.getVariable(name);
		}
	};

	FSMComponent.applyOnVariable = function(name, fun) {
		FSMComponent.vars[name] = fun(FSMComponent.vars[name]);
	};

	FSMComponent.prototype.applyOnVariable = function(name, fun) {
		if (this.vars[name] !== undefined) {
			this.vars[name] = fun(this.vars[name]);
		} else {
			FSMComponent.applyOnVariable(name, fun);
		}
	};

	FSMComponent.prototype.defineVariable = function(name, initialValue) {
		this.vars[name] = initialValue;
	};

	FSMComponent.prototype.removeVariable = function(name) {
		delete this.vars[name];
	};

	FSMComponent.applyToVariable = function(name, fun) {
		if (this.vars[name]) {
			this.vars[name] = fun(this.vars[name]);
		} else if (FSMComponent.vars[name]) {
			FSMComponent.vars[name] = fun(FSMComponent.vars[name]);
		}
	};

	FSMComponent.prototype.addMachine = function(machine) {
		machine._fsm = this;
		this._machines.push(machine);
	};

	FSMComponent.prototype.init = function() {
		for (var i = 0; i < this._machines.length; i++) {
			var machine = this._machines[i];
			machine.setRefs(this);
			machine.reset();
			machine.enter();
		}
	};

	FSMComponent.prototype.update = function() {
		if (this.active) {
			for (var i = 0; i < this._machines.length; i++) {
				var machine = this._machines[i];
				machine.update();
			}
		}
	};

	return FSMComponent;
});
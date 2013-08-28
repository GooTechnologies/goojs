define([
	'goo/entities/components/Component',
	'goo/statemachine/State',
	'goo/lib/machina/machina.min'
],
/** @lends */
function (
	Component,
	State,
	machina
) {
	"use strict";

	/**
	 * @class 
	 */
	function FSMComponent() {
		this.type = 'FSMComponent';

		var namespace = 'statefsm';

		machina.Fsm.call(this, {
			namespace: namespace
		});

		this.stateList = [];
		this.localVariables = {
			defaultLocal: 2
		};

		this.stateIdCounter = 0;
		this.enabled = true;
		this.initialState = null;
		this.engine = null;

		this.running = false;
	}

	FSMComponent.globalVariables = {
		defaultGlobal: 1
	};

	FSMComponent.prototype = Object.create(machina.Fsm.prototype);

	FSMComponent.prototype.addToQueue = function (target) {
		this.target = target;
	};

	FSMComponent.prototype.update = function (tpf) {
		if (!this.running) {
			this.start();
			this.running = true;
		}

		// console.log(this.state);
		for (var i = 0; i < this.stateList.length; i++) {
			var state = this.stateList[i];
			if (this.state === state.id) {
				state.update(tpf);
			}
		}

		if (this.target) {
			if (this.state !== this.target) {
				this.transition(this.target);
			} else {
				this.handle('_onExit');
				this.handle('_onEnter');
			}
			this.target = null;
		}
	};

	FSMComponent.prototype.getEngine = function () {
		return this.engine;
	};

	FSMComponent.prototype.createState = function (name, id) {
		var state = new State(this, name, id);
		this.stateList.push(state);
		this.states[state.id] = state.stateObj;
		return state;
	};

	FSMComponent.prototype.getState = function (id) {
		for (var i = 0; i < this.stateList.length; i++) {
			var state = this.stateList[i];
			if (id === state.id) {
				return state;
			}
		}
		return null;
	};

	FSMComponent.prototype.deleteState = function (id) {
		for (var i = 0; i < this.stateList.length; i++) {
			var state = this.stateList[i];
			if (id === state.id) {
				this.stateList.splice(i, 1);
				delete this.states[state.id];
				break;
			}
		}
	};

	FSMComponent.prototype.setLocalVariable = function (name, value) {
		this.localVariables[name] = value;
	};

	FSMComponent.prototype.getLocalVariable = function (name) {
		return this.localVariables[name];
	};

	FSMComponent.prototype.deleteLocalVariable = function (name) {
		delete this.localVariables[name];
	};

	FSMComponent.prototype.setGlobalVariable = function (name, value) {
		FSMComponent.globalVariables[name] = value;
	};

	FSMComponent.prototype.getGlobalVariable = function (name) {
		return FSMComponent.globalVariables[name];
	};

	FSMComponent.prototype.getGlobalVariables = function () {
		return FSMComponent.globalVariables;
	};

	FSMComponent.prototype.deleteGlobalVariable = function (name) {
		delete FSMComponent.globalVariables[name];
	};

	FSMComponent.prototype.setStartState = function (target) {
		if (target instanceof State) {
			target = target.id;
		}

		var oldInitialState = this.initialState;
		this.initialState = target;

		return oldInitialState;
	};

	FSMComponent.prototype.start = function () {
		if (this.state !== this.initialState) {
			this.transition(this.initialState);
		} else {
			this.handle('_onExit');
			this.handle('_onEnter');
		}
	};

	FSMComponent.prototype.rerun = function () {
		this.handle('_onExit');
		this.handle('_onEnter');
	};

	FSMComponent.prototype.toString = function () {
		return this;
	};

	FSMComponent.prototype.getCurrentState = function () {
		for (var i = 0; i < this.stateList.length; i++) {
			var state = this.stateList[i];
			if (this.state === state.id) {
				return state;
			}
		}
		return null;
	};

	return FSMComponent;
});
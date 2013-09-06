define([
	'goo/entities/Bus',
	'goo/entities/components/Component',
	'goo/statemachine/State'
],
/** @lends */
function (
	Bus,
	Component,
	State
) {
	"use strict";

	function StateMachineComponent() {
		this.bus = new Bus();
		this.machines = [];
	}

	StateMachineComponent.prototype.update = function() {
	  	for (var i = 0; i < this.machines.length; i++) {
			var machine = this.machines[i];
			machine.update();
		}
	};
	//=========================================================================
	function Machine() {
		this.states = [];
		this.initialState = 0; // convention: always 0
		this.currentState = null;
	}

	Machine.prototype.update = function() {
		var jumpUp;
		jumpUp = this.currentState.update();

		if (this.contains(jumpUp)) {
			this.curentState.kill();
			this.setState(jumpUp);
		} else {

		}

		return jumpUp;
	}

	Machine.prototype.contains = function(state) {
		return this.states.indexOf(state) !== -1;
	}

	Machine.prototype.setState = function(state) {
		// change state
		this.activeState = state;

		// reset initial state of child machines
		this.activeState.reset();

		// do on enter of new state
		this.activeState.enter();
	}

	Machine.prototype.reset = function() {
		// reset self
		this.activeState = this.states[this.initialState];

		// propagate reset
		this.activeState.reset();
	}

	Machine.prototype.kill = function() {
		this.currentState.kill();
	}

	Machine.prototype.enter = function() {
		this.activeState.enter();
	}
	//=========================================================================
	function State(uuid) {
		this.uuid = uuid;
		this.onUpdate = [];
		this.onExit = [];
		this.onEnter = [];
		this.machines = [];
		this.vars = {};
	}

	State.prototype.update = function() {
		var jumpUp;

		// do on update of self
		for (var i = 0; i < this.onUpdate.length; i++) {
			jumpUp = this.onUpdate[i].run(this);
			if(jumpUp) { return jumpUp; }
		}

	    // propagate on update
		for (var i = 0; i < this.machines.length; i++) {
			var machine = this.machines[i];
			jumpUp = machine.update();
			if(jumpUp) { return jumpUp; }
		}
	}

	State.prototype.reset = function() {
		for (var i = 0; i < this.machines.length; i++) {
			this.machines.reset();
		}
	}

	State.prototype.kill = function() {
		for (var i = 0; i < this.machines.length; i++) {
			this.machines.kill();
		}
		for (var i = 0; i < this.onExit.length; i++) {
			this.onExit[i]();
		}
	}

	State.prototype.enter = function() {
		// on enter of self
		for (var i = 0; i < this.onEnter.length; i++) {
			this.onEnter[i]();
		}

		// propagate on enter
		for (var i = 0; i < this.machines.length; i++) {
			this.machines.enter();
		}
	}


	var firstState = {
		uuid: 'uuid1',
		onUpdate: [
			{
				type: 'console',
				properties: {
					text: 'uuid1 onupdate action1'
				}
			},
			{
				type: 'keytrans',
				properties: {
					key: 'uuid1 onupdate action1',
					dest: 'uuid2'
				}
			}
		],
		onEnter: [
			{
				type: 'console',
				properties: {
					text: 'uuid1 onenter action1'
				}
			}
		],
		onExit: [
			{
				type: 'console',
				properties: {
					text: 'uuid1 onexit action1'
				}
			}
		],
		machines: []
	}

	var moveState = {
		uuid: 'uuid2',
		name: 'Move',
		actions: [
			{
				type: 'keyup',
				properties: {
					key: 'w',
					event: 'keyevent'
				}
			}
		],
		events: [
			{
				name: 'keyevent',
				transition: 'uuid1'
			}
		]
	}

	var movementLayer = {
		uuid: 'uuid3',
		name: 'MovementLayer',
		stateRefs: [
			'uuid1',
			'uuid2'
		],
		initialState: 'uuid1'
	}

	var aliveState = {
		uuid: 'uuid4',
		name: 'Alive',
		actions: [
			{
				type: 'eventlistener',
				properties: {
					event: 'hit'
				}
			}
		],
		layerRefs: [
			'uuid3'
		]
	}

	var deadState = {
		uuid: 'uuid5',
		name: 'Dead',
	}

	var playerLayer = {
		uuid: 'uuid6',
		name: 'PlayerLayer',
		stateRefs: [
			'uuid4',
			'uuid5'
		],
		initialState: 'uuid4'
	}

	var PlayerStateMachine = {
		layerRefs: [
			'uuid6'
		]
	};



	//layer == statemachine

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
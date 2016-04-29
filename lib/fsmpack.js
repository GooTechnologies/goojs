/* Goo Engine UNOFFICIAL
 * Copyright 2016 Goo Technologies AB
 */

webpackJsonp([5],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(145);


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */,
/* 131 */,
/* 132 */,
/* 133 */,
/* 134 */,
/* 135 */,
/* 136 */,
/* 137 */,
/* 138 */,
/* 139 */,
/* 140 */,
/* 141 */,
/* 142 */,
/* 143 */,
/* 144 */,
/* 145 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
		MachineHandler: __webpack_require__(146),
		ProximityComponent: __webpack_require__(206),
		ProximitySystem: __webpack_require__(204),
		Action: __webpack_require__(151),
		Actions: __webpack_require__(149),
		AddLightAction: __webpack_require__(192),
		AddPositionAction: __webpack_require__(262),
		AddVariableAction: __webpack_require__(263),
		ApplyImpulseAction: __webpack_require__(239),
		ArrowsAction: __webpack_require__(150),
		CollidesAction: __webpack_require__(203),
		CompareCounterAction: __webpack_require__(246),
		CompareCountersAction: __webpack_require__(247),
		CompareDistanceAction: __webpack_require__(202),
		CopyJointTransformAction: __webpack_require__(236),
		DollyZoomAction: __webpack_require__(200),
		EmitAction: __webpack_require__(186),
		EvalAction: __webpack_require__(188),
		FireAction: __webpack_require__(216),
		GetPositionAction: __webpack_require__(264),
		HideAction: __webpack_require__(189),
		HtmlAction: __webpack_require__(235),
		InBoxAction: __webpack_require__(201),
		IncrementCounterAction: __webpack_require__(249),
		InFrustumAction: __webpack_require__(199),
		KeyDownAction: __webpack_require__(159),
		KeyPressedAction: __webpack_require__(160),
		KeyUpAction: __webpack_require__(158),
		LogMessageAction: __webpack_require__(233),
		LookAtAction: __webpack_require__(171),
		MouseDownAction: __webpack_require__(155),
		MouseMoveAction: __webpack_require__(156),
		MouseUpAction: __webpack_require__(154),
		MoveAction: __webpack_require__(168),
		MultiplyVariableAction: __webpack_require__(265),
		NumberCompareAction: __webpack_require__(266),
		PauseAnimationAction: __webpack_require__(178),
		PickAction: __webpack_require__(161),
		PickAndExitAction: __webpack_require__(162),
		RandomTransitionAction: __webpack_require__(185),
		RemoveAction: __webpack_require__(191),
		RemoveLightAction: __webpack_require__(194),
		RemoveParticlesAction: __webpack_require__(217),
		ResumeAnimationAction: __webpack_require__(179),
		RotateAction: __webpack_require__(169),
		ScaleAction: __webpack_require__(170),
		SetAnimationAction: __webpack_require__(180),
		SetClearColorAction: __webpack_require__(197),
		SetCounterAction: __webpack_require__(248),
		SetLightRangeAction: __webpack_require__(267),
		SetPositionAction: __webpack_require__(268),
		SetRenderTargetAction: __webpack_require__(227),
		SetRotationAction: __webpack_require__(269),
		SetVariableAction: __webpack_require__(270),
		ShakeAction: __webpack_require__(177),
		ShowAction: __webpack_require__(190),
		SmokeAction: __webpack_require__(207),
		SoundFadeInAction: __webpack_require__(225),
		SoundFadeOutAction: __webpack_require__(226),
		SwitchCameraAction: __webpack_require__(198),
		TagAction: __webpack_require__(205),
		TransitionAction: __webpack_require__(183),
		TransitionOnMessageAction: __webpack_require__(187),
		TriggerEnterAction: __webpack_require__(237),
		TriggerLeaveAction: __webpack_require__(238),
		TweenLightColorAction: __webpack_require__(196),
		TweenLookAtAction: __webpack_require__(176),
		TweenMoveAction: __webpack_require__(172),
		TweenOpacityAction: __webpack_require__(234),
		TweenRotationAction: __webpack_require__(174),
		TweenScaleAction: __webpack_require__(175),
		TweenTextureOffsetAction: __webpack_require__(230),
		WaitAction: __webpack_require__(182),
		WasdAction: __webpack_require__(167),
		FSMUtil: __webpack_require__(271),
		FsmUtils: __webpack_require__(152),
		Machine: __webpack_require__(148),
		State: __webpack_require__(147),
		StateMachineComponent: __webpack_require__(272),
		StateMachineSystem: __webpack_require__(273),
		StateMachineComponentHandler: __webpack_require__(274),
		StateMachineHandlers: __webpack_require__(275)
	};
	if (typeof(window) !== 'undefined') {
		for (var key in module.exports) {
			window.goo[key] = module.exports[key];
		}
	}

/***/ },
/* 146 */
/***/ function(module, exports, __webpack_require__) {

	var ConfigHandler = __webpack_require__(85);
	var ObjectUtils = __webpack_require__(6);
	var State = __webpack_require__(147);
	var Machine = __webpack_require__(148);
	var Actions = __webpack_require__(149);
	var RSVP = __webpack_require__(55);

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
			for (var key in machine._states) {
				if (!config.states[key]) {
					machine.removeState(key);
				}
			}
			// Update existing states and create new ones
			var promises = [];
			for (var key in config.states) {
				promises.push(that._updateState(machine, config.states[key], options));
			}
			return RSVP.all(promises).then(function () {
				machine.setInitialState(config.initialState);
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
		for (var i = 0; i < state._actions.length; i++) {
			var action = state._actions[i];
			if (!stateConfig.actions || !stateConfig.actions[action.id]) {
				state.removeAction(action);
				i--;
			}
		}

		// Update new and existing ones
		// For actions, order is (or will be) important
		var actions = [];
		ObjectUtils.forEach(stateConfig.actions, function (actionConfig) {
			var action = state.getAction(actionConfig.id);
			if (!action) {
				var Action = Actions.actionForType(actionConfig.type);
				action = new Action(actionConfig.id, actionConfig.options);
				if (action.onCreate) {
					action.onCreate(state.proxy);
				}
				//state.addAction(action);
			} else {
				action.configure(actionConfig.options);
			}
			actions.push(action);
		}, null, 'sortValue');
		state._actions = actions;
	};

	/**
	 * Update transitions on the machine
	 * @param {State} state
	 * @param {Object} config
	 * @private
	 */
	MachineHandler.prototype._updateTransitions = function (state, stateConfig) {
		state._transitions = {};
		for (var key in stateConfig.transitions) {
			var transition = stateConfig.transitions[key];
			state.setTransition(transition.id, transition.targetState);
		}
	};

	/**
	 * Update states on the machine. This includes loading childMachines
	 * @param {State} state
	 * @param {Object} config
	 * @private
	 */
	MachineHandler.prototype._updateState = function (machine, stateConfig, options) {
		var state;
		if (machine._states && machine._states[stateConfig.id]) {
			state = machine._states[stateConfig.id];
		} else {
			state = new State(stateConfig.id);
			machine.addState(state);
		}
		state.name = stateConfig.name;

		// Actions
		this._updateActions(state, stateConfig);
		// Transitions
		this._updateTransitions(state, stateConfig);
		// Child machines
		// Removing
		for (var i = 0; i < state._machines; i++) {
			var childMachine = state._machines[i];
			if (!stateConfig.childMachines[childMachine.id]) {
				state.removeMachine(childMachine);
				i--;
			}
		}
		// Updating
		var promises = [];
		for (var key in stateConfig.childMachines) {
			promises.push(this._load(stateConfig.childMachines[key].machineRef, options));
		}

		/*
		// TODO: Test and use this. Will make the promises sorted correctly.
		ObjectUtils.forEach(stateConfig.childMachines, function (childMachineConfig) {
			promises.push(that._load(childMachineConfig.machineRef, options));
		}, null, 'sortValue');
		*/

		return RSVP.all(promises).then(function (machines) {
			for (var i = 0; i < machines; i++) {
				state.addMachine(machines[i]);
			}
			return state;
		});
	};

	module.exports = MachineHandler;


/***/ },
/* 147 */
/***/ function(module, exports, __webpack_require__) {

	var ArrayUtils = __webpack_require__(86);
	var SystemBus = __webpack_require__(44);

	function State(uuid) {
		this.uuid = uuid;
		this._fsm = null;
		this.parent = null;
		this._actions = [];
		this._machines = [];
		this._transitions = {};
		this.vars = {};
		this.depth = 0;

		this.proxy = {
			getInputState: function (key) {
				return this._fsm.system.getInputState(key);
			}.bind(this),
			getTpf: function () {
				return this._fsm.entity._world.tpf;
			}.bind(this),
			getWorld: function () {
				return this._fsm.entity._world;
			}.bind(this),
			getTime: function () {
				return this._fsm.system.time;
			}.bind(this),
			getState: function () {
				return this;
			}.bind(this),
			getFsm: function () {
				return this._fsm;
			}.bind(this),
			getOwnerEntity: function () {
				return this._fsm && this._fsm.entity;
			}.bind(this),
			getEntityById: function (id) {
				return this._fsm.entity._world.by.id(id).first();
			}.bind(this),
			send: function (channels/*, data*/) {
				if (channels) {
					if (typeof channels === 'string' && this._transitions[channels]) {
						this.requestTransition(this._transitions[channels]);
					}
				}
			}.bind(this),
			addListener: function (channelName, callback) {
				this._fsm._bus.addListener(channelName, callback);
			}.bind(this),
			removeListener: function (channelName, callback) {
				this._fsm._bus.removeListener(channelName, callback);
			}.bind(this),
			defineVariable: function (name, initialValue) {
				this.vars[name] = initialValue;
			}.bind(this),
			removeVariable: function (name) {
				delete this.vars[name];
			}.bind(this),
			getVariable: function (name) {
				if (this.vars[name] !== undefined) {
					return this.vars[name];
				} else {
					return this._fsm.getVariable(name);
				}
			}.bind(this),
			applyOnVariable: function (name, fun) {
				if (this.vars[name] !== undefined) {
					this.vars[name] = fun(this.vars[name]);
				} else {
					this._fsm.applyOnVariable(name, fun);
				}
			}.bind(this),
			getEvalProxy: function () {
				return this._fsm.system.evalProxy;
			}.bind(this)
		};
	}

	State.prototype.setRefs = function (parentFSM) {
		this._fsm = parentFSM;
		for (var i = 0; i < this._machines.length; i++) {
			var machine = this._machines[i];
			machine.setRefs(parentFSM);
		}
	};

	State.prototype.resetDepth = function () {
		this.depth = 0;
	};

	State.prototype.isCurrentState = function () {
		return this === this.parent.getCurrentState();
	};

	State.prototype.requestTransition = function (target) {
		if (this.isCurrentState()) {
			if (!this.parent.asyncMode) {
				this.depth++;
				var fsm = this._fsm;
				if (this.depth > this.parent.maxLoopDepth) {
					var data = {
						entityId: fsm && fsm.entity ? fsm.entity.id : '',
						entityName: fsm && fsm.entity ? fsm.entity.name : '',
						machineName: this.parent ? this.parent.name : '',
						stateId: this.uuid,
						stateName: this.name
					};
					data.error = 'Exceeded max loop depth (' + this.parent.maxLoopDepth + ') in "' + [data.entityName, data.machineName, data.stateName].join('" / "') + '"';
					console.warn(data.error);
					SystemBus.emit('goo.fsm.error', data);
					return;
				}

				if (target && this.parent.contains(target)) {
					this.parent.currentState.kill();
					this.parent.setState(this.parent._states[target]);
				}
			} else {
				this.transitionTarget = target;
			}
		}
	};

	State.prototype.setTransition = function (eventName, target) {
		this._transitions[eventName] = target;
	};

	State.prototype.clearTransition = function (eventName) {
		delete this._transitions[eventName];
	};

	State.prototype.enter = function () {
		SystemBus.emit('goo.fsm.enter', {
			entityId: this._fsm && this._fsm.entity ? this._fsm.entity.id : '',
			machineName: this.parent ? this.parent.name : '',
			stateId: this.uuid,
			stateName: this.name
		});

		// on enter of self
		var depth = this.depth;
		for (var i = 0; i < this._actions.length; i++) {
			this._actions[i].enter(this.proxy);
			if (this.depth > depth) {
				return;
			}
		}

		// propagate on enter
		for (var i = 0; i < this._machines.length; i++) {
			this._machines[i].enter();
		}
	};

	State.prototype.update = function () {
		// SystemBus.emit('goo.fsm.update', {
		// 	entityId: this._fsm && this._fsm.entity ? this._fsm.entity.id : '',
		// 	machineName: this.parent ? this.parent.name : '',
		// 	stateId: this.uuid,
		// 	stateName: this.name
		// });

		// do on update of self
		var depth = this.depth;

		if (!this.parent.asyncMode) {
			for (var i = 0; i < this._actions.length; i++) {
				this._actions[i].update(this.proxy);
				if (this.depth > depth) {
					return;
				}
			}

			// propagate on update
			for (var i = 0; i < this._machines.length; i++) {
				this._machines[i].update();
			}
		} else {
			// old async mode
			for (var i = 0; i < this._actions.length; i++) {
				this._actions[i].update(this.proxy);
				if (this.transitionTarget) {
					var tmp = this.transitionTarget;
					this.transitionTarget = null;
					return tmp;
				}
			}

			var jump;
			// propagate on update
			for (var i = 0; i < this._machines.length; i++) {
				var machine = this._machines[i];
				jump = machine.update();
				if (jump) {
					return jump;
				}
			}
		}
	};

	State.prototype.kill = function () {
		SystemBus.emit('goo.fsm.exit', {
			entityId: this._fsm && this._fsm.entity ? this._fsm.entity.id : '',
			machineName: this.parent ? this.parent.name : '',
			stateId: this.uuid,
			stateName: this.name
		});

		for (var i = 0; i < this._machines.length; i++) {
			this._machines[i].kill();
		}
		for (var i = 0; i < this._actions.length; i++) {
			this._actions[i].exit(this.proxy);
		}
	};

	State.prototype.reset = function () {
		for (var i = 0; i < this._machines.length; i++) {
			this._machines[i].reset();
		}
	};

	State.prototype.ready = function () {
		for (var i = 0; i < this._machines.length; i++) {
			this._machines[i].ready();
		}
		for (var i = 0; i < this._actions.length; i++) {
			this._actions[i].ready(this.proxy);
		}
	};

	State.prototype.cleanup = function () {
		for (var i = 0; i < this._machines.length; i++) {
			this._machines[i].cleanup();
		}
		for (var i = 0; i < this._actions.length; i++) {
			this._actions[i].cleanup(this.proxy);
		}
	};

	State.prototype.getAction = function (id) {
		if (!this._actions) {
			return undefined;
		}
		for (var i = 0; i < this._actions.length; i++) {
			var action = this._actions[i];
			if (id !== undefined && action.id === id) {
				return action;
			}
		}
		return undefined;
	};

	State.prototype.addAction = function (action) {
		// check if action is already added
		if (this._actions[action.id]) {
			return;
		}

		if (action.onCreate) {
			action.onCreate(this.proxy);
		}
		this._actions.push(action);
	};

	State.prototype.recursiveRemove = function () {
		this.removeAllActions();
		for (var i = 0; i < this._machines.length; i++) {
			this._machines[i].recursiveRemove();
		}
		this._machines = [];
	};

	State.prototype.removeAllActions = function () {
		for (var i = 0; i < this._actions.length; i++) {
			var action = this._actions[i];
			if (action.onDestroy) {
				action.onDestroy(this.proxy);
			}
		}
		this._actions = [];
	};

	State.prototype.removeAction = function (action) {
		if (action.onDestroy) {
			action.onDestroy(this.proxy);
		}

		ArrayUtils.remove(this._actions, action);
	};

	State.prototype.addMachine = function (machine) {
		var index = this._machines.indexOf(machine);
		if (index === -1) {
			machine._fsm = this._fsm;
			machine.parent = this;
			this._machines.push(machine);
		}
	};

	State.prototype.removeMachine = function (machine) {
		machine.recursiveRemove();
		ArrayUtils.remove(this._machines, machine);
	};

	module.exports = State;

/***/ },
/* 148 */
/***/ function(module, exports) {

	function Machine(id, name) {
		this.id = id;
		this.name = name;
		this._states = {};
		this._fsm = null;
		this.initialState = 'entry';
		this.currentState = null;
		this.parent = null;

		this.maxLoopDepth = 100;
		this.asyncMode = false;
	}

	Machine.prototype.setRefs = function (parentFSM) {
		this._fsm = parentFSM;
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.setRefs(parentFSM);
		}
	};

	Machine.prototype.contains = function (uuid) {
		return !!this._states[uuid];
	};

	Machine.prototype.setState = function (state) {
		// change state
		this.currentState = state;

		// reset initial state of child machines
		this.currentState.reset();

		// do on enter of new state
		this.currentState.enter();
	};

	Machine.prototype.reset = function () {
		// reset self
		this.currentState = this._states[this.initialState];

		// propagate reset
		if (this.currentState) {
			this.currentState.reset();
		}
	};

	Machine.prototype.ready = function () {
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.ready();
		}
	};

	Machine.prototype.cleanup = function () {
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.cleanup();
		}
	};

	Machine.prototype.enter = function () {
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.resetDepth();
		}
		if (this.currentState) {
			this.currentState.enter();
		}
	};

	Machine.prototype.update = function () {
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.resetDepth();
		}
		if (this.currentState) {
			if (!this.asyncMode) {
				this.currentState.update();
			} else {
				// old async mode
				var jump = this.currentState.update();

				if (jump && this.contains(jump)) {
					this.currentState.kill();
					this.setState(this._states[jump]);
				}

				return jump;
			}
		}
	};

	Machine.prototype.kill = function () {
		if (this.currentState) {
			this.currentState.kill();
		}
	};

	Machine.prototype.getCurrentState = function () {
		return this.currentState;
	};

	Machine.prototype.addState = function (state) {
		if (Object.keys(this._states).length === 0) {
			this.initialState = state.uuid;
		}
		state.parent = this;
		state._fsm = this._fsm;
		this._states[state.uuid] = state;
	};

	Machine.prototype.removeFromParent = function () {
		if (this.parent) {
			this.parent.removeMachine(this);
		}
	};

	Machine.prototype.recursiveRemove = function () {
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.recursiveRemove();
		}
		this._states = {};
	};

	Machine.prototype.removeState = function (id) {
		if (!this._states[id]) { return; }
		if (this.initialState === id) { throw new Error('Cannot remove initial state'); }
		if (this.currentState === this._states[id]) {
			this.reset();
		}
		delete this._states[id];
	};

	Machine.prototype.setInitialState = function (initialState) {
		this.initialState = initialState;
	};

	module.exports = Machine;


/***/ },
/* 149 */
/***/ function(module, exports, __webpack_require__) {

	var _actions = {};

	var Actions = function () {};

	var IGNORED_ACTIONS = [
		'Eval',
		'HTMLPick',
		'Remove',
		'Collides',
		'Tag'
	];

	Actions.register = function (name, actionClass) {
		_actions[name] = actionClass;
	};

	Actions.actionForType = function (name) {
		return _actions[name];
	};

	Actions.allActions = function () {
		var actions = {};
		var keys = Object.keys(_actions);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (IGNORED_ACTIONS.indexOf(key) === -1) {
				actions[key] = _actions[key];
			}
		}
		return actions;
	};

	Actions.allActionsArray = function () {
		var array = [];
		var actions = Actions.allActions();
		var keys = Object.keys(actions);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			array.push(actions[key]);
		}
		return array;
	};


	var allActions = {
		ArrowsAction: __webpack_require__(150),
		DomEventAction: __webpack_require__(153),
		MouseUpAction: __webpack_require__(154),
		MouseDownAction: __webpack_require__(155),
		MouseMoveAction: __webpack_require__(156),
		MousePressedAction: __webpack_require__(157),
		KeyUpAction: __webpack_require__(158),
		KeyDownAction: __webpack_require__(159),
		KeyPressedAction: __webpack_require__(160),
		PickAction: __webpack_require__(161),
		PickAndExitAction: __webpack_require__(162),
		ClickAction: __webpack_require__(163),
		HoverEnterAction: __webpack_require__(164),
		HoverExitAction: __webpack_require__(166),
		WasdAction: __webpack_require__(167),
		MoveAction: __webpack_require__(168),
		RotateAction: __webpack_require__(169),
		ScaleAction: __webpack_require__(170),
		LookAtAction: __webpack_require__(171),
		TweenMoveAction: __webpack_require__(172),
		TweenRotationAction: __webpack_require__(174),
		TweenScaleAction: __webpack_require__(175),
		TweenLookAtAction: __webpack_require__(176),
		ShakeAction: __webpack_require__(177),
		PauseAnimationAction: __webpack_require__(178),
		ResumeAnimationAction: __webpack_require__(179),
		SetAnimationAction: __webpack_require__(180),
		SetTimeScaleAction: __webpack_require__(181),
		WaitAction: __webpack_require__(182),
		TransitionAction: __webpack_require__(183),
		NextFrameAction: __webpack_require__(184),
		RandomTransitionAction: __webpack_require__(185),
		EmitAction: __webpack_require__(186),
		TransitionOnMessageAction: __webpack_require__(187),
		EvalAction: __webpack_require__(188),
		HideAction: __webpack_require__(189),
		ShowAction: __webpack_require__(190),
		RemoveAction: __webpack_require__(191),
		AddLightAction: __webpack_require__(192),
		RemoveLightAction: __webpack_require__(194),
		SetLightPropertiesAction: __webpack_require__(195),
		TweenLightColorAction: __webpack_require__(196),
		SetClearColorAction: __webpack_require__(197),
		SwitchCameraAction: __webpack_require__(198),
		InFrustumAction: __webpack_require__(199),
		DollyZoomAction: __webpack_require__(200),
		InBoxAction: __webpack_require__(201),
		CompareDistanceAction: __webpack_require__(202),
		CollidesAction: __webpack_require__(203),
		TagAction: __webpack_require__(205),
		SmokeAction: __webpack_require__(207),
		FireAction: __webpack_require__(216),
		RemoveParticlesAction: __webpack_require__(217),
		TogglePostFxAction: __webpack_require__(218),
		ToggleFullscreenAction: __webpack_require__(219),
		PlaySoundAction: __webpack_require__(221),
		PauseSoundAction: __webpack_require__(223),
		StopSoundAction: __webpack_require__(224),
		SoundFadeInAction: __webpack_require__(225),
		SoundFadeOutAction: __webpack_require__(226),
		SetRenderTargetAction: __webpack_require__(227),
		TweenTextureOffsetAction: __webpack_require__(230),
		SetMaterialColorAction: __webpack_require__(231),
		TweenMaterialColorAction: __webpack_require__(232),
		LogMessageAction: __webpack_require__(233),
		TweenOpacityAction: __webpack_require__(234),
		HtmlAction: __webpack_require__(235),
		CopyJointTransformAction: __webpack_require__(236),
		TriggerEnterAction: __webpack_require__(237),
		TriggerLeaveAction: __webpack_require__(238),
		ApplyImpulseAction: __webpack_require__(239),
		ApplyForceAction: __webpack_require__(240),
		ApplyTorqueAction: __webpack_require__(241),
		SetRigidBodyPositionAction: __webpack_require__(242),
		SetRigidBodyRotationAction: __webpack_require__(243),
		SetRigidBodyVelocityAction: __webpack_require__(244),
		SetRigidBodyAngularVelocityAction: __webpack_require__(245),
		CompareCounterAction: __webpack_require__(246),
		CompareCountersAction: __webpack_require__(247),
		SetCounterAction: __webpack_require__(248),
		IncrementCounterAction: __webpack_require__(249),
		MuteAction: __webpack_require__(250),
		UnmuteAction: __webpack_require__(251),
		ToggleMuteAction: __webpack_require__(252),
		StartTimelineAction: __webpack_require__(253),
		PauseTimelineAction: __webpack_require__(254),
		StopTimelineAction: __webpack_require__(255),
		SetTimelineTimeAction: __webpack_require__(256),
		SetHtmlTextAction: __webpack_require__(257),
		SpriteAnimationAction: __webpack_require__(258),
		PauseParticleSystemAction: __webpack_require__(259),
		StopParticleSystemAction: __webpack_require__(260),
		StartParticleSystemAction: __webpack_require__(261)
	};

	for (var actionName in allActions) {
		var action = allActions[actionName];
		Actions.register(action.external.key, action);
	}

	module.exports = Actions;

/***/ },
/* 150 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	var keys = {
		38: 'up',
		37: 'left',
		40: 'down',
		39: 'right'
	};

	function ArrowsAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ArrowsAction.prototype = Object.create(Action.prototype);
	ArrowsAction.prototype.constructor = ArrowsAction;

	ArrowsAction.prototype.configure = function (settings) {
		this.targets = settings.transitions;
	};

	ArrowsAction.external = {
		key: 'Arrow Keys Listener',
		name: 'Arrow Keys',
		type: 'controls',
		description: 'Transitions to other states when arrow keys are pressed (keydown).',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'up',
			description: "On key up pressed."
		}, {
			key: 'left',
			description: "On key left pressed."
		}, {
			key: 'down',
			description: "On key down pressed."
		}, {
			key: 'right',
			description: "On key right pressed."
		}]
	};

	var labels = {
		up: 'On key UP',
		left: 'On key LEFT',
		down: 'On key DOWN',
		right: 'On key RIGHT'
	};

	ArrowsAction.getTransitionLabel = function (transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	ArrowsAction.prototype.enter = function (fsm) {
		this.eventListener = function (event) {
			var keyname = keys[event.which];
			var target = this.targets[keyname];
			if (target) {
				fsm.send(target);
			}
		}.bind(this);
		document.addEventListener('keydown', this.eventListener);
	};

	ArrowsAction.prototype.exit = function () {
		document.removeEventListener('keydown', this.eventListener);
	};

	module.exports = ArrowsAction;

/***/ },
/* 151 */
/***/ function(module, exports, __webpack_require__) {

	var FsmUtils = __webpack_require__(152);

	/**
	 * @param {string} id
	 * @param {Object} settings
	 * @private
	 */
	function Action(id, settings) {
		this.id = id;
		this.configure(settings || {});
	}

	/* this should be called by the constructor and by the handlers when new options are loaded */
	Action.prototype.configure = function (settings) {
		FsmUtils.setParameters.call(this, settings, this.constructor.external.parameters);
		FsmUtils.setTransitions.call(this, settings, this.constructor.external.transitions);
	};

	/* this gets executed on enter - called once, when the host state becomes active */
	Action.prototype.enter = function (/*fsm*/) {
	};

	/* this gets executed on update - called on every frame */
	Action.prototype.update = function (/*fsm*/) {
	};

	/* this is called by external functions; also the place to cleanup whatever _setup did */
	Action.prototype.exit = function (/*fsm*/) {
	};

	/* this is called when the machine just started */
	Action.prototype.ready = function (/*fsm*/) {
	};

	/* this is called when the machine stops and makes sure that any changes not undone by exit methods get undone */
	Action.prototype.cleanup = function (/*fsm*/) {
	};

	module.exports = Action;


/***/ },
/* 152 */
/***/ function(module, exports) {

	function FsmUtils() {}

	FsmUtils.setParameters = function (settings, externalParameters) {
		for (var i = 0; i < externalParameters.length; i++) {
			var externalParameter = externalParameters[i];
			var key = externalParameter.key;

			if (typeof settings[key] !== 'undefined') {
				this[key] = settings[key];
			} else {
				this[key] = externalParameter['default'];
			}
		}
	};

	FsmUtils.setTransitions = function (settings, externalTransitions) {
		for (var i = 0; i < externalTransitions.length; i++) {
			var externalTransition = externalTransitions[i];
			var key = externalTransition.key;

			this.transitions = this.transitions || {};
			this.transitions[key] = settings.transitions[key];
		}
	};

	FsmUtils.getKey = function (str) {
		if (FsmUtils.keys[str]) {
			return FsmUtils.keys[str];
		} else {
			return str.charCodeAt(0);
		}
	};

	FsmUtils.keys = {
		'Backspace': 8,
		'Tab': 9,
		'Enter': 13,
		'Shift': 16,
		'Ctrl': 17,
		'Alt': 18,
		'Pause': 19,
		'Capslock': 20,
		'Esc': 27,
		'Space':32,
		'Pageup': 33,
		'Pagedown': 34,
		'End': 35,
		'Home': 36,
		'Leftarrow': 37,
		'Uparrow': 38,
		'Rightarrow': 39,
		'Downarrow': 40,
		'Insert': 45,
		'Delete': 46,
		'0': 48,
		'1': 49,
		'2': 50,
		'3': 51,
		'4': 52,
		'5': 53,
		'6': 54,
		'7': 55,
		'8': 56,
		'9': 57,
		'a': 65,
		'b': 66,
		'c': 67,
		'd': 68,
		'e': 69,
		'f': 70,
		'g': 71,
		'h': 72,
		'i': 73,
		'j': 74,
		'k': 75,
		'l': 76,
		'm': 77,
		'n': 78,
		'o': 79,
		'p': 80,
		'q': 81,
		'r': 82,
		's': 83,
		't': 84,
		'u': 85,
		'v': 86,
		'w': 87,
		'x': 88,
		'y': 89,
		'z': 90,
		'A': 65,
		'B': 66,
		'C': 67,
		'D': 68,
		'E': 69,
		'F': 70,
		'G': 71,
		'H': 72,
		'I': 73,
		'J': 74,
		'K': 75,
		'L': 76,
		'M': 77,
		'N': 78,
		'O': 79,
		'P': 80,
		'Q': 81,
		'R': 82,
		'S': 83,
		'T': 84,
		'U': 85,
		'V': 86,
		'W': 87,
		'X': 88,
		'Y': 89,
		'Z': 90,
		'0numpad': 96,
		'1numpad': 97,
		'2numpad': 98,
		'3numpad': 99,
		'4numpad': 100,
		'5numpad': 101,
		'6numpad': 102,
		'7numpad': 103,
		'8numpad': 104,
		'9numpad': 105,
		'Multiply': 106,
		'Plus': 107,
		'Minus': 109,
		'Dot': 110,
		'Slash1': 111,
		'F1': 112,
		'F2': 113,
		'F3': 114,
		'F4': 115,
		'F5': 116,
		'F6': 117,
		'F7': 118,
		'F8': 119,
		'F9': 120,
		'F10': 121,
		'F11': 122,
		'F12': 123,
		'Equals': 187,
		'Comma': 188,
		'Slash': 191,
		'Backslash': 220
	};

	FsmUtils.keyInverse = [];

	function buildKeyInverse(assoc) {
		var inverseAssoc = [];

		var keys = Object.keys(assoc);
		for (var i = 0; i < keys.length; i++) {
			inverseAssoc[assoc[keys[i]]] = keys[i];
		}

		return inverseAssoc;
	}

	FsmUtils.keyInverse = buildKeyInverse(FsmUtils.keys);

	FsmUtils.keyForCode = function (code) {
		if (FsmUtils.keyInverse[code]) {
			return FsmUtils.keyInverse[code];
		}
		return 'FsmUtils.keyForCode: key not found for code ' + code;
	};

	var s4 = function () {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	};

	// Random unique id
	FsmUtils.guid = function () {
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
	};

	FsmUtils.getValue = function (par, fsm) {
		if (typeof par === 'number') {
			return par;
		} else {
			return fsm.getVariable(par);
		}
	};

	module.exports = FsmUtils;

/***/ },
/* 153 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function DomEventAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.domElements = null;
	}

	DomEventAction.prototype = Object.create(Action.prototype);
	DomEventAction.prototype.constructor = DomEventAction;

	DomEventAction.external = {
		key: 'domEvent',
		name: 'DOM Event Listen',
		type: 'misc',
		description: 'Adds a DOM event listener on one or many elements (specified by a query selector), and performs a transition on a given event.',
		canTransition: true,
		parameters: [{
			name: 'Event name',
			key: 'eventName',
			type: 'string',
			description: 'DOM event to listen to, for example "click", "mousedown", "keydown", etc.',
			'default': 'click'
		},{
			name: 'Query Selector',
			key: 'querySelector',
			type: 'string',
			description: 'Query selector that matches your DOM element(s). For example, set "canvas" if you want to match all <canvas> elements, or ".myClass" to match all elements with your class.',
			'default': 'body'
		}],
		transitions: [{
			key: 'event',
			description: 'State to transition to when the DOM event triggers.'
		}]
	};

	DomEventAction.getTransitionLabel = function (transitionKey, actionConfig) {
		return 'On ' + actionConfig.options.eventName;
	};

	DomEventAction.prototype.enter = function (fsm) {
		this.eventListener = function () {
			fsm.send(this.transitions.event);
		}.bind(this);

		var elements = this.domElements = document.querySelectorAll(this.querySelector);
		for (var i = 0; i < elements.length; i++) {
			elements[i].addEventListener(this.eventName, this.eventListener);
		}
	};

	DomEventAction.prototype.exit = function () {
		var elements = this.domElements;
		if (!elements) {
			return;
		}
		for (var i = 0; i < elements.length; i++) {
			elements[i].removeEventListener(this.eventName, this.eventListener);
		}
		this.domElements = null;
	};

	module.exports = DomEventAction;

/***/ },
/* 154 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function MouseUpAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MouseUpAction.prototype = Object.create(Action.prototype);
	MouseUpAction.prototype.constructor = MouseUpAction;

	MouseUpAction.external = {
		key: 'Mouse Up / Touch end',
		name: 'Mouse Up / Touch end',
		type: 'controls',
		description: 'Listens for a mouseup event (or touchend) on the canvas and performs a transition.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mouseLeftUp',
			description: 'State to transition to when the left mouse button is released.'
		}, {
			key: 'middleMouseUp',
			description: 'State to transition to when the middle mouse button is released.'
		}, {
			key: 'rightMouseUp',
			description: 'State to transition to when the right mouse button is released.'
		}, {
			key: 'touchUp',
			description: 'State to transition to when the touch event ends.'
		}]
	};

	var labels = {
		mouseLeftUp: 'On left mouse up',
		middleMouseUp: 'On middle mouse up',
		rightMouseUp: 'On right mouse up',
		touchUp: 'On touch end'
	};

	MouseUpAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return labels[transitionKey];
	};

	MouseUpAction.prototype.enter = function (fsm) {
		var update = function (button) {
			if (button === 'touch') {
				fsm.send(this.transitions.touchUp);
			} else {
				fsm.send([
					this.transitions.mouseLeftUp,
					this.transitions.middleMouseUp,
					this.transitions.rightMouseUp
				][button]);
			}
		}.bind(this);

		this.mouseEventListener = function (event) {
			update(event.button);
		}.bind(this);

		this.touchEventListener = function () {
			update('touch');
		}.bind(this);

		document.addEventListener('mouseup', this.mouseEventListener);
		document.addEventListener('touchend', this.touchEventListener);
	};

	MouseUpAction.prototype.exit = function () {
		document.removeEventListener('mouseup', this.mouseEventListener);
		document.removeEventListener('touchend', this.touchEventListener);
	};

	module.exports = MouseUpAction;

/***/ },
/* 155 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function MouseDownAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MouseDownAction.prototype = Object.create(Action.prototype);
	MouseDownAction.prototype.constructor = MouseDownAction;

	MouseDownAction.external = {
		key: 'Mouse Down / Touch Start',
		name: 'Mouse Down / Touch Start',
		type: 'controls',
		description: 'Listens for a mousedown event (or touchstart) on the canvas and performs a transition.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mouseLeftDown',
			description: 'State to transition to when the left mouse button is pressed.'
		}, {
			key: 'middleMouseDown',
			description: 'State to transition to when the middle mouse button is pressed.'
		}, {
			key: 'rightMouseDown',
			description: 'State to transition to when the right mouse button is pressed.'
		}, {
			key: 'touchDown',
			description: 'State to transition to when the touch event begins.'
		}]
	};

	var labels = {
		mouseLeftDown: 'On left mouse down',
		middleMouseDown: 'On middle mouse down',
		rightMouseDown: 'On right mouse down',
		touchDown: 'On touch start'
	};

	MouseDownAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return labels[transitionKey];
	};

	MouseDownAction.prototype.enter = function (fsm) {
		var update = function (button) {
			if (button === 'touch') {
				fsm.send(this.transitions.touchDown);
			} else {
				fsm.send([
					this.transitions.mouseLeftDown,
					this.transitions.middleMouseDown,
					this.transitions.rightMouseDown
				][button]);
			}
		}.bind(this);

		this.mouseEventListener = function (event) {
			update(event.button);
		}.bind(this);

		this.touchEventListener = function () {
			update('touch');
		}.bind(this);

		document.addEventListener('mousedown', this.mouseEventListener);
		document.addEventListener('touchstart', this.touchEventListener);
	};

	MouseDownAction.prototype.exit = function () {
		document.removeEventListener('mousedown', this.mouseEventListener);
		document.removeEventListener('touchstart', this.touchEventListener);
	};

	module.exports = MouseDownAction;

/***/ },
/* 156 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function MouseMoveAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MouseMoveAction.prototype = Object.create(Action.prototype);
	MouseMoveAction.prototype.constructor = MouseMoveAction;

	MouseMoveAction.external = {
		key: 'Mouse / Touch Move',
		name: 'Mouse / Touch Move',
		type: 'controls',
		description: 'Listens for mouse movement (mousemove) or touch movement (touchmove) on the canvas and performs a transition.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mousemove',
			description: 'State to transition to on mouse movement.'
		}, {
			key: 'touchmove',
			description: 'State to transition to on touch movement.'
		}]
	};

	var labels = {
		mousemove: 'On mouse move',
		touchmove: 'On touch move'
	};

	MouseMoveAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return labels[transitionKey];
	};

	MouseMoveAction.prototype.enter = function (fsm) {
		var update = function (type) {
			if (type === 'mouse') {
				fsm.send(this.transitions.mousemove);
			} else {
				fsm.send(this.transitions.touchmove);
			}
		}.bind(this);

		this.mouseEventListener = function (/*event*/) {
			update('mouse');
		}.bind(this);

		this.touchEventListener = function (/*event*/) {
			update('touch');
		}.bind(this);

		document.addEventListener('mousemove', this.mouseEventListener);
		document.addEventListener('touchmove', this.touchEventListener);
	};

	MouseMoveAction.prototype.exit = function () {
		document.removeEventListener('mousemove', this.mouseEventListener);
		document.removeEventListener('touchmove', this.touchEventListener);
	};

	module.exports = MouseMoveAction;

/***/ },
/* 157 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function MousePressedAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MousePressedAction.prototype = Object.create(Action.prototype);
	MousePressedAction.prototype.constructor = MousePressedAction;

	MousePressedAction.external = {
		key: 'Mouse Button Pressed',
		name: 'Mouse Button Pressed',
		type: 'controls',
		description: 'Listens for a mouse button press event and performs a transition. Works over transition boundaries..',
		canTransition: true,
		parameters: [{
			name: 'Button',
			key: 'button',
			type: 'string',
			control: 'dropdown',
			description: 'Mouse Button to listen for.',
			'default': 'Left',
			options: ['Left', 'Middle', 'Right']
		}],
		transitions: [{
			key: 'mousedown',
			description: 'State to transition to when the mouse button is pressed.'
		}]
	};

	var labels = {
		mousedown: 'Mouse Button Pressed'
	};

	MousePressedAction.getTransitionLabel = function (transitionKey, actionConfig){
		if (labels[transitionKey]) {
			return 'On ' + actionConfig.options.button + ' ' + labels[transitionKey];
		}
	};

	MousePressedAction.prototype.enter = function (fsm) {
		if (fsm.getInputState(this.button)) {
			fsm.send(this.transitions.mousedown);
		}
	};

	MousePressedAction.prototype.update = function (fsm) {
		if (fsm.getInputState(this.button)) {
			fsm.send(this.transitions.mousedown);
		}
	};

	module.exports = MousePressedAction;

/***/ },
/* 158 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var FsmUtils = __webpack_require__(152);

	function KeyUpAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	KeyUpAction.prototype = Object.create(Action.prototype);
	KeyUpAction.prototype.constructor = KeyUpAction;

	KeyUpAction.external = {
		key: 'Key Up',
		name: 'Key Up',
		type: 'controls',
		description: 'Listens for a key release and performs a transition.',
		canTransition: true,
		parameters: [{
			name: 'Key',
			key: 'key',
			type: 'string',
			control: 'key',
			description: 'Key to listen for.',
			'default': 'A'
		}],
		transitions: [{
			key: 'keyup',
			description: 'State to transition to when the key is released.'
		}]
	};

	KeyUpAction.getTransitionLabel = function (transitionKey, actionConfig){
		return 'On Key ' + (actionConfig.options.key || '') + ' up';
	};

	KeyUpAction.prototype.configure = function (settings) {
		this.key = settings.key ? FsmUtils.getKey(settings.key) : null;
		this.transitions = { keyup: settings.transitions.keyup };
	};

	KeyUpAction.prototype.enter = function (fsm) {
		this.eventListener = function (event) {
			if (!this.key || event.which === +this.key) {
				fsm.send(this.transitions.keyup);
			}
		}.bind(this);
		document.addEventListener('keyup', this.eventListener);
	};

	KeyUpAction.prototype.exit = function () {
		document.removeEventListener('keyup', this.eventListener);
	};

	module.exports = KeyUpAction;

/***/ },
/* 159 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var FsmUtils = __webpack_require__(152);

	function KeyDownAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	KeyDownAction.prototype = Object.create(Action.prototype);
	KeyDownAction.prototype.constructor = KeyDownAction;

	KeyDownAction.external = {
		key: 'Key Down',
		name: 'Key Down',
		type: 'controls',
		description: 'Listens for a key press and performs a transition.',
		canTransition: true,
		parameters: [{
			name: 'Key',
			key: 'key',
			type: 'string',
			control: 'key',
			description: 'Key to listen for.',
			'default': 'A'
		}],
		transitions: [{
			key: 'keydown',
			description: 'State to transition to when the key is pressed.'
		}]
	};

	KeyDownAction.getTransitionLabel = function (transitionKey, actionConfig) {
		return 'On Key ' + (actionConfig.options.key || '') + ' down';
	};

	KeyDownAction.prototype.configure = function (settings) {
		this.key = settings.key ? FsmUtils.getKey(settings.key) : null;
		this.transitions = { keydown: settings.transitions.keydown };
	};

	KeyDownAction.prototype.enter = function (fsm) {
		this.eventListener = function (event) {
			if (this.key && event.which === +this.key) {
				fsm.send(this.transitions.keydown);
			}
		}.bind(this);
		document.addEventListener('keydown', this.eventListener);
	};

	KeyDownAction.prototype.exit = function () {
		document.removeEventListener('keydown', this.eventListener);
	};

	module.exports = KeyDownAction;

/***/ },
/* 160 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var FsmUtils = __webpack_require__(152);

	function KeyPressedAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	KeyPressedAction.prototype = Object.create(Action.prototype);
	KeyPressedAction.prototype.constructor = KeyPressedAction;

	KeyPressedAction.external = {
		key: 'Key Pressed',
		name: 'Key Pressed',
		type: 'controls',
		description: 'Listens for a key press event and performs a transition. Works over transition boundaries.',
		canTransition: true,
		parameters: [{
			name: 'Key',
			key: 'key',
			type: 'string',
			control: 'key',
			description: 'Key to listen for.',
			'default': 'A'
		}],
		transitions: [{
			key: 'keydown',
			description: 'State to transition to when the key is pressed.'
		}]
	};

	KeyPressedAction.getTransitionLabel = function (transitionKey, actionConfig){
		return 'On Key ' + (actionConfig.options.key || '') + ' pressed';
	};

	KeyPressedAction.prototype.configure = function (settings) {
		this.key = settings.key ? FsmUtils.getKey(settings.key) : null;
		this.transitions = { keydown: settings.transitions.keydown };
	};

	KeyPressedAction.prototype.enter = function (fsm) {
		if (fsm.getInputState(this.key)) {
			fsm.send(this.transitions.keydown);
		}
	};

	KeyPressedAction.prototype.update = function (fsm) {
		if (fsm.getInputState(this.key)) {
			fsm.send(this.transitions.keydown);
		}
	};

	module.exports = KeyPressedAction;

/***/ },
/* 161 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var SystemBus = __webpack_require__(44);

	function PickAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	PickAction.prototype = Object.create(Action.prototype);
	PickAction.prototype.constructor = PickAction;

	PickAction.external = {
		key: 'Pick',
		name: 'Pick',
		type: 'controls',
		description: 'Listens for a picking event on the entity and performs a transition.',
		canTransition: true,
		parameters: [], // but not farther than some value
		transitions: [{
			key: 'pick',
			name: 'Pick',
			description: 'State to transition to when entity is picked.'
		}]
	};

	var labels = {
		pick: 'On pick entity'
	};

	PickAction.getTransitionLabel = function (transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	PickAction.prototype.enter = function (fsm) {
		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;

		var that = this;
		this.eventListener = function (event) {
			var pickedEntity = event.entity;
			if (!pickedEntity) {
				var x, y;
				var domTarget = that.goo.renderer.domElement;
				if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
					x = event.changedTouches[0].pageX - domTarget.getBoundingClientRect().left;
					y = event.changedTouches[0].pageY - domTarget.getBoundingClientRect().top;
				} else {
					var rect = domTarget.getBoundingClientRect();
					x = event.clientX - rect.left;
					y = event.clientY - rect.top;
				}
				var pickingStore = that.goo.pickSync(x, y);
				pickedEntity = that.goo.world.entityManager.getEntityByIndex(pickingStore.id);

				if (!pickedEntity) {
					return;
				}
			}

			pickedEntity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					fsm.send(that.transitions.pick);
					return false;
				}
			});
		};

		document.addEventListener('click', this.eventListener);
		document.addEventListener('touchstart', this.eventListener);
		SystemBus.addListener('goo.trigger.click', this.eventListener);
		SystemBus.addListener('goo.trigger.touchstart', this.eventListener);
	};

	PickAction.prototype.exit = function () {
		document.removeEventListener('click', this.eventListener);
		document.removeEventListener('touchstart', this.eventListener);
		SystemBus.removeListener('goo.trigger.click', this.eventListener);
		SystemBus.removeListener('goo.trigger.touchstart', this.eventListener);
	};

	module.exports = PickAction;

/***/ },
/* 162 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function PickAndExitAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.eventListener = function (event) {
			// To prevent touch + click event firing multiple times on touch devices
			event.stopPropagation();
			event.preventDefault();

			var htmlCmp = this.ownerEntity.getComponent('HtmlComponent');
			var clickedHtmlCmp = (htmlCmp && htmlCmp.domElement.contains(event.target));
			if (clickedHtmlCmp) {
				this.handleExit();
				return;
			}

			if (event.target !== this.canvasElement) {
				return;
			}

			var x, y;
			if (event.touches && event.touches.length) {
				x = event.touches[0].clientX;
				y = event.touches[0].clientY;
			} else if (event.changedTouches && event.changedTouches.length) {
				x = event.changedTouches[0].pageX;
				y = event.changedTouches[0].pageY;
			} else {
				x = event.offsetX;
				y = event.offsetY;
			}

			var pickResult = this.goo.pickSync(x, y);
			if (pickResult.id === -1) {
				return;
			}

			var entity = this.goo.world.entityManager.getEntityByIndex(pickResult.id);
			var descendants = [];
			this.ownerEntity.traverse(descendants.push.bind(descendants));
			if (descendants.indexOf(entity) === -1) {
				return;
			}

			this.handleExit();
		}.bind(this);
	}

	PickAndExitAction.prototype = Object.create(Action.prototype);
	PickAndExitAction.prototype.constructor = PickAndExitAction;

	PickAndExitAction.external = {
		key: 'Pick and Exit',
		name: 'Pick and Exit',
		type: 'controls',
		description: 'Listens for a picking event on the entity and opens a new browser window.',
		canTransition: true,
		parameters: [{
			name: 'URL',
			key: 'url',
			type: 'string',
			description: 'URL to open.',
			'default': 'http://www.goocreate.com/'
		}, {
			name: 'Exit name',
			key: 'exitName',
			type: 'string',
			description: 'Name of the exit, used to track this exit in Ads.',
			'default': 'clickEntityExit'
		}],
		transitions: []
	};

	PickAndExitAction.prototype.enter = function (fsm) {
		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;
		this.canvasElement = this.goo.renderer.domElement;
		//
		// ASSUMPTION: HtmlComponents will be attached in the DOM as siblings
		// to the canvas.
		//
		this.domElement = this.canvasElement.parentNode;
		this.domElement.addEventListener('click', this.eventListener, false);
		this.domElement.addEventListener('touchend', this.eventListener, false); // window.open does not work in touchstart for iOS9
	};

	PickAndExitAction.prototype.handleExit = function () {
		var handler = window.gooHandleExit || function (url) {
			window.open(url, '_blank');
		};

		handler(this.url, this.exitName);
	};

	PickAndExitAction.prototype.exit = function () {
		if (this.domElement) {
			this.domElement.removeEventListener('click', this.eventListener);
			this.domElement.removeEventListener('touchend', this.eventListener);
		}
	};

	module.exports = PickAndExitAction;


/***/ },
/* 163 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function ClickAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.selected = false;
		this.x = 0;
		this.y = 0;
	}

	ClickAction.prototype = Object.create(Action.prototype);
	ClickAction.prototype.constructor = ClickAction;

	ClickAction.external = {
		key: 'Click/Tap',
		name: 'Click/Tap on entity',
		type: 'controls',
		description: 'Listens for a click/tap event on the entity and performs a transition.',
		canTransition: true,
		parameters: [], // but not farther than some value
		transitions: [{
			key: 'click',
			description: 'State to transition to when entity is clicked.'
		}]
	};

	ClickAction.getTransitionLabel = function (/*transitionKey, actionConfig*/){
		return 'On Click/Tap Entity';
	};

	ClickAction.prototype.enter = function (fsm) {
		var that = this;
		this.downListener = function (event) {
			var x, y;
			var gooRunner = that.gooRunner;
			var domTarget = gooRunner.renderer.domElement;
			if (event.type === 'touchstart' || event.type === 'touchend') {
				x = event.changedTouches[0].pageX - domTarget.getBoundingClientRect().left;
				y = event.changedTouches[0].pageY - domTarget.getBoundingClientRect().top;
			} else {
				var rect = domTarget.getBoundingClientRect();
				x = event.clientX - rect.left;
				y = event.clientY - rect.top;
			}
			var pickingStore = gooRunner.pickSync(x, y);
			var pickedEntity = gooRunner.world.entityManager.getEntityByIndex(pickingStore.id);

			if (!pickedEntity) {
				return;
			}

			pickedEntity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					that.x = x;
					that.y = y;
					that.selected = true;
					return false;
				}
			});
		};
		this.upListener = function (event) {
			if (!that.selected) {
				return;
			}

			that.selected = false;

			var x, y;
			var gooRunner = that.gooRunner;
			var domTarget = gooRunner.renderer.domElement;
			var rect = domTarget.getBoundingClientRect();
			if (event.type === 'touchstart' || event.type === 'touchend') {
				x = event.changedTouches[0].pageX - rect.left;
				y = event.changedTouches[0].pageY - rect.top;
			} else {
				x = event.clientX - rect.left;
				y = event.clientY - rect.top;
			}

			var diffx = that.x - x;
			var diffy = that.y - y;
			if (Math.abs(diffx) > 10 || Math.abs(diffy) > 10) {
				return;
			}

			var pickingStore = gooRunner.pickSync(x, y);
			var pickedEntity = gooRunner.world.entityManager.getEntityByIndex(pickingStore.id);

			if (!pickedEntity) {
				return;
			}

			pickedEntity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					fsm.send(that.transitions.click);
					return false;
				}
			});
		};

		this.ownerEntity = fsm.getOwnerEntity();
		this.gooRunner = this.ownerEntity._world.gooRunner;

		document.addEventListener('mousedown', this.downListener);
		document.addEventListener('touchstart', this.downListener);
		document.addEventListener('mouseup', this.upListener);
		document.addEventListener('touchend', this.upListener);

		this.selected = false;
	};

	ClickAction.prototype.exit = function () {
		document.removeEventListener('mousedown', this.downListener);
		document.removeEventListener('touchstart', this.downListener);
		document.removeEventListener('mouseup', this.upListener);
		document.removeEventListener('touchend', this.upListener);
	};

	module.exports = ClickAction;


/***/ },
/* 164 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var BoundingPicker = __webpack_require__(165);

	function HoverEnterAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.first = true;
		this.hit = false;
	}

	HoverEnterAction.prototype = Object.create(Action.prototype);
	HoverEnterAction.prototype.constructor = HoverEnterAction;

	HoverEnterAction.types = {
		fast: 'Bounding (Fast)',
		slow: 'Per pixel (Slow)'
	};

	HoverEnterAction.external = {
		key: 'Hover Enter',
		name: 'Entity Hover Enter',
		type: 'controls',
		description: 'Listens for a hover enter event on the entity and performs a transition.',
		canTransition: true,
		parameters: [{
			name: 'Accuracy',
			key: 'type',
			type: 'string',
			control: 'dropdown',
			description: 'Hover accuracy/performance selection.',
			'default': HoverEnterAction.types.fast,
			options: [HoverEnterAction.types.fast, HoverEnterAction.types.slow]
		}],
		transitions: [{
			key: 'enter',
			description: 'State to transition to when entity is entered.'
		}]
	};

	HoverEnterAction.getTransitionLabel = function (/*transitionKey, actionConfig*/){
		return 'On Entity Hover Enter';
	};

	HoverEnterAction.prototype.enter = function (fsm) {
		var that = this;
		var isHit = function (entity) {
			if (!entity) {
				return false;
			}
			var hit = false;
			entity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					hit = true;
					return false;
				}
			});
			return hit;
		};

		var checkEnter = function (entity) {
			var hit = isHit(entity);

			if ((that.first || !that.hit) && hit) {
				fsm.send(that.transitions.enter);
			}
			that.first = false;
			that.hit = hit;
		};

		this.moveListener = function (event) {
			var x, y;
			var domTarget = that.goo.renderer.domElement;
			if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
				var rect = domTarget.getBoundingClientRect();
				x = event.changedTouches[0].pageX - rect.left;
				y = event.changedTouches[0].pageY - rect.top;
			} else {
				var rect = domTarget.getBoundingClientRect();
				x = event.clientX - rect.left;
				y = event.clientY - rect.top;
			}

			var camera = that.goo.renderSystem.camera;
			var pickedEntity = null;

			if (that.type === HoverEnterAction.types.slow) {
				var pickingStore = that.goo.pickSync(x, y);
				pickedEntity = that.goo.world.entityManager.getEntityByIndex(pickingStore.id);
			} else {
				var pickList = BoundingPicker.pick(that.goo.world, camera, x, y);
				if (pickList.length > 0) {
					pickedEntity = pickList[0].entity;
				}
			}

			checkEnter(pickedEntity);
		};

		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;

		document.addEventListener('mousemove', this.moveListener);
		document.addEventListener('touchmove', this.moveListener);

		this.first = true;
		this.hit = false;
	};

	HoverEnterAction.prototype.exit = function () {
		document.removeEventListener('mousemove', this.moveListener);
		document.removeEventListener('touchmove', this.moveListener);
	};

	module.exports = HoverEnterAction;

/***/ },
/* 165 */,
/* 166 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var BoundingPicker = __webpack_require__(165);

	function HoverExitAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.first = true;
		this.hit = false;
	}

	HoverExitAction.prototype = Object.create(Action.prototype);
	HoverExitAction.prototype.constructor = HoverExitAction;

	HoverExitAction.types = {
		fast: 'Bounding (Fast)',
		slow: 'Per pixel (Slow)'
	};

	HoverExitAction.external = {
		key: 'Hover Exit',
		name: 'Entity Hover Exit',
		type: 'controls',
		description: 'Listens for a hover exit event on the entity and performs a transition.',
		canTransition: true,
		parameters: [{
			name: 'Accuracy',
			key: 'type',
			type: 'string',
			control: 'dropdown',
			description: 'Hover accuracy/performance selection.',
			'default': HoverExitAction.types.fast,
			options: [HoverExitAction.types.fast, HoverExitAction.types.slow]
		}],
		transitions: [{
			key: 'exit',
			description: 'State to transition to when entity is exited.'
		}]
	};

	HoverExitAction.getTransitionLabel = function (/*transitionKey, actionConfig*/){
		return 'On Entity Hover Exit';
	};

	HoverExitAction.prototype.enter = function (fsm) {
		var that = this;
		var isHit = function (entity) {
			if (!entity) {
				return false;
			}
			var hit = false;
			entity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					hit = true;
					return false;
				}
			});
			return hit;
		};

		var checkExit = function (entity) {
			var hit = isHit(entity);

			if ((that.first || that.hit) && !hit) {
				fsm.send(that.transitions.exit);
			}
			that.hit = hit;
			that.first = false;
		};

		this.moveListener = function (event) {
			var x, y;
			var domTarget = that.goo.renderer.domElement;
			if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
				x = event.changedTouches[0].pageX - domTarget.getBoundingClientRect().left;
				y = event.changedTouches[0].pageY - domTarget.getBoundingClientRect().top;
			} else {
				var rect = domTarget.getBoundingClientRect();
				x = event.clientX - rect.left;
				y = event.clientY - rect.top;
			}

			var camera = that.goo.renderSystem.camera;
			var pickedEntity = null;

			if (that.type === HoverExitAction.types.slow) {
				var pickingStore = that.goo.pickSync(x, y);
				pickedEntity = that.goo.world.entityManager.getEntityByIndex(pickingStore.id);
			} else {
				var pickList = BoundingPicker.pick(that.goo.world, camera, x, y);
				if (pickList.length > 0) {
					pickedEntity = pickList[0].entity;
				}
			}

			checkExit(pickedEntity);
		};

		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;

		document.addEventListener('mousemove', this.moveListener);
		document.addEventListener('touchmove', this.moveListener);

		this.first = true;
		this.hit = false;
	};

	HoverExitAction.prototype.exit = function () {
		document.removeEventListener('mousemove', this.moveListener);
		document.removeEventListener('touchmove', this.moveListener);
	};

	module.exports = HoverExitAction;

/***/ },
/* 167 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function WasdAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	WasdAction.prototype = Object.create(Action.prototype);
	WasdAction.prototype.constructor = WasdAction;

	WasdAction.prototype.configure = function (settings) {
		this.targets = settings.transitions;
	};

	var keys = {
		87: 'w',
		65: 'a',
		83: 's',
		68: 'd'
	};

	WasdAction.external = (function () {
		var transitions = [];
		for (var keycode in keys) {
			var keyname = keys[keycode];
			transitions.push({
				key: keyname,
				name: 'On key ' + keyname.toUpperCase(),
				description: "On key '" + keyname + "' pressed."
			});
		}

		return {
			key: 'WASD Keys Listener',
			name: 'WASD Keys',
			type: 'controls',
			description: 'Transitions to other states when the WASD keys are pressed.',
			canTransition: true,
			parameters: [],
			transitions: transitions
		};
	})();

	var labels = {
		w: 'On Key W Pressed',
		a: 'On Key A Pressed',
		s: 'On Key S Pressed',
		d: 'On Key D Pressed'
	};

	WasdAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return labels[transitionKey];
	};

	WasdAction.prototype.enter = function (fsm) {
		this.eventListener = function (event) {
			var keyname = keys[event.which];
			if (keyname) {
				var target = this.targets[keyname];
				if (typeof target === 'string') {
					fsm.send(target);
				}
			}
		}.bind(this);

		document.addEventListener('keydown', this.eventListener);
	};

	WasdAction.prototype.exit = function () {
		document.removeEventListener('keydown', this.eventListener);
	};

	module.exports = WasdAction;

/***/ },
/* 168 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector3 = __webpack_require__(8);

	function MoveAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MoveAction.prototype = Object.create(Action.prototype);
	MoveAction.prototype.constructor = MoveAction;

	MoveAction.external = {
		key: 'Move',
		name: 'Move',
		type: 'animation',
		description: 'Moves the entity.',
		parameters: [{
			name: 'Translation',
			key: 'translation',
			type: 'position',
			description: 'Move.',
			'default': [0, 0, 0]
		}, {
			name: 'Oriented',
			key: 'oriented',
			type: 'boolean',
			description: 'If true translate with rotation.',
			'default': true
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add to current translation.',
			'default': true
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	MoveAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.sync().transform;
		this.forward = Vector3.fromArray(this.translation);
		var orientation = transform.rotation;
		this.forward.applyPost(orientation);

		if (!this.everyFrame) {
			this.applyMove(fsm);
		}
	};

	MoveAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.applyMove(fsm);
		}
	};

	MoveAction.prototype.applyMove = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.sync().transform;
		var translation = transform.translation;

		if (this.oriented) {
			if (this.relative) {
				var forward = Vector3.fromArray(this.translation);
				var orientation = transform.rotation;
				forward.applyPost(orientation);

				if (this.everyFrame) {
					forward.scale(fsm.getTpf());
					translation.add(forward);
				} else {
					translation.add(forward);
				}
			} else {
				translation.set(this.forward);
			}
		} else {
			if (this.relative) {
				if (this.everyFrame) {
					var tpf = fsm.getTpf();
					translation.addDirect(this.translation[0] * tpf, this.translation[1] * tpf, this.translation[2] * tpf);
				} else {
					translation.addDirect(this.translation[0], this.translation[1], this.translation[2]);
				}
			} else {
				translation.setDirect(this.translation[0], this.translation[1], this.translation[2]);
			}
		}

		entity.transformComponent.setUpdated();
	};

	module.exports = MoveAction;

/***/ },
/* 169 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var MathUtils = __webpack_require__(9);

	function RotateAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RotateAction.prototype = Object.create(Action.prototype);
	RotateAction.prototype.constructor = RotateAction;

	RotateAction.external = {
		key: 'Rotate',
		name: 'Rotate',
		type: 'animation',
		description: 'Rotates the entity with the set angles (in degrees).',
		parameters: [{
			name: 'Rotation',
			key: 'rotation',
			type: 'rotation',
			description: 'Rotatation.',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add to current rotation.',
			'default': true
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	var DEG_TO_RAD = MathUtils.DEG_TO_RAD;

	RotateAction.prototype.applyRotation = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.sync().transform;

		var rotationX = this.rotation[0];
		var rotationY = this.rotation[1];
		var rotationZ = this.rotation[2];

		if (this.relative) {
			var rotationMatrix = transform.rotation;
			if (this.everyFrame) {
				var tpf = fsm.getTpf();
				rotationMatrix.rotateX(rotationX * DEG_TO_RAD * tpf);
				rotationMatrix.rotateY(rotationY * DEG_TO_RAD * tpf);
				rotationMatrix.rotateZ(rotationZ * DEG_TO_RAD * tpf);
			} else {
				rotationMatrix.rotateX(rotationX * DEG_TO_RAD);
				rotationMatrix.rotateY(rotationY * DEG_TO_RAD);
				rotationMatrix.rotateZ(rotationZ * DEG_TO_RAD);
			}
		} else {
			if (this.everyFrame) {
				var tpf = fsm.getTpf();
				transform.setRotationXYZ(
					rotationX * DEG_TO_RAD * tpf,
					rotationY * DEG_TO_RAD * tpf,
					rotationZ * DEG_TO_RAD * tpf
				);
			} else {
				transform.setRotationXYZ(
					rotationX * DEG_TO_RAD,
					rotationY * DEG_TO_RAD,
					rotationZ * DEG_TO_RAD
				);
			}
		}

		entity.transformComponent.setUpdated();
	};

	RotateAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.applyRotation(fsm);
		}
	};

	RotateAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.applyRotation(fsm);
		}
	};

	module.exports = RotateAction;

/***/ },
/* 170 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function ScaleAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ScaleAction.prototype = Object.create(Action.prototype);
	ScaleAction.prototype.constructor = ScaleAction;

	ScaleAction.external = {
		key: 'Scale',
		name: 'Scale',
		type: 'animation',
		description: 'Scales the entity.',
		parameters: [{
			name: 'Scale',
			key: 'scale',
			type: 'position',
			description: 'Scale.',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true, add/multiply the current scaling.',
			'default': true
		}, {
			name: 'Multiply',
			key: 'multiply',
			type: 'boolean',
			description: 'If true multiply, otherwise add.',
			'default': false
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': false
		}],
		transitions: []
	};

	ScaleAction.prototype.applyScale = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;
		if (this.relative) {
			if (this.multiply) {
				if (this.everyFrame) {
					var tpf = fsm.getTpf() * 10;
					transform.scale.x *= this.scale[0] * tpf;
					transform.scale.y *= this.scale[1] * tpf;
					transform.scale.z *= this.scale[2] * tpf;
				} else {
					transform.scale.mulDirect(this.scale[0], this.scale[1], this.scale[2]);
				}
			} else {
				if (this.everyFrame) {
					var tpf = fsm.getTpf() * 10;
					transform.scale.x += this.scale[0] * tpf;
					transform.scale.y += this.scale[1] * tpf;
					transform.scale.z += this.scale[2] * tpf;
				} else {
					transform.scale.addDirect(this.scale[0], this.scale[1], this.scale[2]);
				}
			}
		} else {
			transform.scale.setArray(this.scale);
		}

		entity.transformComponent.setUpdated();
	};

	ScaleAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.applyScale(fsm);
		}
	};

	ScaleAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.applyScale(fsm);
		}
	};

	module.exports = ScaleAction;

/***/ },
/* 171 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector3 = __webpack_require__(8);

	function LookAtAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	LookAtAction.prototype = Object.create(Action.prototype);
	LookAtAction.prototype.constructor = LookAtAction;

	LookAtAction.external = {
		key: 'Look At',
		name: 'Look At',
		type: 'animation',
		description: 'Reorients an entity so that it\'s facing a specific point.',
		parameters: [{
			name: 'Look at',
			key: 'lookAt',
			type: 'position',
			description: 'Position to look at.',
			'default': [0, 0, 0]
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	LookAtAction.prototype.doLookAt = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;

		transformComponent.transform.lookAt(new Vector3(this.lookAt), Vector3.UNIT_Y);
		transformComponent.setUpdated();
	};

	LookAtAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.doLookAt(fsm);
		}
	};

	LookAtAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.doLookAt(fsm);
		}
	};

	module.exports = LookAtAction;

/***/ },
/* 172 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector3 = __webpack_require__(8);
	var Easing = __webpack_require__(173);

	function TweenMoveAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.fromPos = new Vector3();
		this.toPos = new Vector3();
		this.deltaPos = new Vector3();
		this.oldPos = new Vector3();
		this.completed = false;
	}

	TweenMoveAction.prototype = Object.create(Action.prototype);
	TweenMoveAction.prototype.constructor = TweenMoveAction;

	TweenMoveAction.external = {
		key: 'Tween Move',
		name: 'Tween Move',
		type: 'animation',
		description: 'Transition to the set location.',
		canTransition: true,
		parameters: [{
			name: 'Translation',
			key: 'to',
			type: 'position',
			description: 'Move.',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add, otherwise set.',
			'default': true
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for this movement to complete.',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type.',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction.',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the movement completes.'
		}]
	};

	TweenMoveAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return transitionKey === 'complete' ? 'On Tween Move Complete' : undefined;
	};

	TweenMoveAction.prototype.enter = function (fsm) {
		var transformComponent = fsm.getOwnerEntity().transformComponent.sync();

		this.fromPos.set(transformComponent.transform.translation);
		this.toPos.setDirect(this.to[0], this.to[1], this.to[2]);
		if (this.relative) {
			this.oldPos.set(this.fromPos);
			this.toPos.add(this.fromPos);
		}

		this.startTime = fsm.getTime();
		this.completed = false;
	};

	TweenMoveAction.prototype.update = function (fsm) {
		if (this.completed) {
			return;
		}
		var transformComponent = fsm.getOwnerEntity().transformComponent.sync();

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = Easing[this.easing1][this.easing2](t);

		if (this.relative) {
			this.deltaPos.set(this.fromPos).lerp(this.toPos, fT).sub(this.oldPos);
			transformComponent.transform.translation.add(this.deltaPos);
			this.oldPos.add(this.deltaPos);
		} else {
			transformComponent.transform.translation.set(this.fromPos).lerp(this.toPos, fT);
		}

		transformComponent.setUpdated();

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};

	module.exports = TweenMoveAction;

/***/ },
/* 173 */,
/* 174 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Quaternion = __webpack_require__(23);
	var Matrix3 = __webpack_require__(24);
	var MathUtils = __webpack_require__(9);
	var Easing = __webpack_require__(173);

	function TweenRotationAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.quatFrom = new Quaternion();
		this.quatTo = new Quaternion();
		this.quatFinal = new Quaternion();
		this.completed = false;
	}

	TweenRotationAction.prototype = Object.create(Action.prototype);
	TweenRotationAction.prototype.constructor = TweenRotationAction;

	TweenRotationAction.external = {
		key: 'Tween Rotation',
		name: 'Tween Rotate',
		type: 'animation',
		description: 'Transition to the set rotation, in angles.',
		canTransition: true,
		parameters: [{
			name: 'Rotation',
			key: 'to',
			type: 'rotation',
			description: 'Rotation.',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add, otherwise set.',
			'default': true
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for this movement to complete.',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type.',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction.',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the rotation completes.'
		}]
	};

	TweenRotationAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return transitionKey === 'complete' ? 'On Tween Rotation Complete' : undefined;
	};

	TweenRotationAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent.sync();

		this.startTime = fsm.getTime();

		this.quatFrom.fromRotationMatrix(transformComponent.transform.rotation);
		this.quatTo.fromRotationMatrix(new Matrix3().fromAngles(this.to[0] * MathUtils.DEG_TO_RAD, this.to[1] * MathUtils.DEG_TO_RAD, this.to[2] * MathUtils.DEG_TO_RAD));
		if (this.relative) {
			this.quatTo.mul(this.quatFrom);
		}
		this.completed = false;
	};

	TweenRotationAction.prototype.update = function (fsm) {
		if (this.completed) {
			return;
		}
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.sync().transform;

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = Easing[this.easing1][this.easing2](t);
		Quaternion.slerp(this.quatFrom, this.quatTo, fT, this.quatFinal);

		this.quatFinal.toRotationMatrix(transform.rotation);
		entity.transformComponent.setUpdated();

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};

	module.exports = TweenRotationAction;

/***/ },
/* 175 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector3 = __webpack_require__(8);
	var Easing = __webpack_require__(173);

	function TweenScaleAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.fromScale = new Vector3();
		this.toScale = new Vector3();
		this.completed = false;
	}

	TweenScaleAction.prototype = Object.create(Action.prototype);
	TweenScaleAction.prototype.constructor = TweenScaleAction;

	TweenScaleAction.external = {
		key: 'Tween Scale',
		name: 'Tween Scale',
		type: 'animation',
		description: 'Transition to the set scale.',
		canTransition: true,
		parameters: [{
			name: 'Scale',
			key: 'to',
			type: 'position',
			description: 'Scale.',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add, otherwise set.',
			'default': true
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for this movement to complete.',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type.',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction.',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the scaling completes.'
		}]
	};

	TweenScaleAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return transitionKey === 'complete' ? 'On Tween Scale Complete' : undefined;
	};

	TweenScaleAction.prototype.enter = function (fsm) {
		var transformComponent = fsm.getOwnerEntity().transformComponent;

		this.fromScale.set(transformComponent.transform.scale);
		this.toScale.setDirect(this.to[0], this.to[1], this.to[2]);
		if (this.relative) {
			this.toScale.add(this.fromScale);
		}

		this.startTime = fsm.getTime();
		this.completed = false;
	};

	TweenScaleAction.prototype.update = function (fsm) {
		if (this.completed) {
			return;
		}
		var transformComponent = fsm.getOwnerEntity().transformComponent;

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = Easing[this.easing1][this.easing2](t);

		transformComponent.transform.scale.set(this.fromScale).lerp(this.toScale, fT);
		transformComponent.setUpdated();

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};

	module.exports = TweenScaleAction;

/***/ },
/* 176 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector3 = __webpack_require__(8);
	var Quaternion = __webpack_require__(23);
	var Easing = __webpack_require__(173);

	function TweenLookAtAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.quatFrom = new Quaternion();
		this.quatTo = new Quaternion();
		this.quatFinal = new Quaternion();
		this.completed = false;
	}

	TweenLookAtAction.prototype = Object.create(Action.prototype);
	TweenLookAtAction.prototype.constructor = TweenLookAtAction;

	TweenLookAtAction.external = {
		key: 'Tween Look At',
		name: 'Tween Look At',
		type: 'animation',
		description: 'Transition the entity\'s rotation to face the set position.',
		canTransition: true,
		parameters: [{
			name: 'Position',
			key: 'to',
			type: 'position',
			description: 'Look at point.',
			'default': [0, 0, 0]
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for this movement to complete.',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type.',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction.',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the transition completes.'
		}]
	};

	TweenLookAtAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return transitionKey === 'complete' ? 'On Tween LookAt Complete' : undefined;
	};

	TweenLookAtAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;

		this.startTime = fsm.getTime();

		this.quatFrom.fromRotationMatrix(transform.rotation);

		var dir = Vector3.fromArray(this.to).sub(transform.translation);
		this.rot = transform.rotation.clone();
		this.rot.lookAt(dir, Vector3.UNIT_Y);
		this.quatTo.fromRotationMatrix(this.rot);

		this.completed = false;
	};

	TweenLookAtAction.prototype.update = function (fsm) {
		if (this.completed) {
			return;
		}
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = Easing[this.easing1][this.easing2](t);
		Quaternion.slerp(this.quatFrom, this.quatTo, fT, this.quatFinal);

		this.quatFinal.toRotationMatrix(transform.rotation);
		entity.transformComponent.setUpdated();

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};

	module.exports = TweenLookAtAction;

/***/ },
/* 177 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector3 = __webpack_require__(8);
	var MathUtils = __webpack_require__(9);
	var Easing = __webpack_require__(173);

	function ShakeAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.oldVal = new Vector3();
		this.target = new Vector3();
		this.vel = new Vector3();
		this.completed = false;
	}

	ShakeAction.prototype = Object.create(Action.prototype);
	ShakeAction.prototype.constructor = ShakeAction;

	ShakeAction.external = {
		key: 'Shake',
		name: 'Shake',
		type: 'animation',
		description: 'Shakes the entity. Optionally performs a transition.',
		canTransition: true,
		parameters: [{
			name: 'Start level',
			key: 'startLevel',
			type: 'float',
			description: 'Shake amount at start.',
			'default': 0
		}, {
			name: 'End level',
			key: 'endLevel',
			type: 'float',
			description: 'Shake amount at the end.',
			'default': 10
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Shake time amount.',
			'default': 1000
		}, {
			name: 'Speed',
			key: 'speed',
			type: 'string',
			control: 'dropdown',
			description: 'Speed of shaking.',
			'default': 'Fast',
			options: ['Fast', 'Medium', 'Slow']
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the shake completes.'
		}]
	};

	var labels = {
		complete: 'On Shake Complete'
	};

	ShakeAction.getTransitionLabel = function (transitionKey /*, actionConfig*/) {
		return labels[transitionKey];
	};

	ShakeAction.prototype.configure = function (settings) {
		this.startLevel = settings.startLevel;
		this.endLevel = settings.endLevel;
		this.time = settings.time;
		this.speed = { Fast: 1, Medium: 2, Slow: 4 }[settings.speed];
		this.easing = Easing.Quadratic.InOut;
		this.eventToEmit = settings.transitions.complete;
	};

	ShakeAction.prototype.enter = function (fsm) {
		this.oldVal.set(Vector3.ZERO);
		this.target.set(Vector3.ZERO);
		this.vel.set(Vector3.ZERO);
		this.iter = 0;
		this.startTime = fsm.getTime();
		this.completed = false;
	};

	ShakeAction.prototype.update = function (fsm) {
		if (this.completed) {
			return;
		}
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = this.easing(t);

		var level = MathUtils.lerp(fT, this.startLevel, this.endLevel);

		this.iter++;
		if (this.iter > this.speed) {
			this.iter = 0;

			this.target.setDirect(
				-this.oldVal.x + (Math.random() - 0.5) * level * 2,
				-this.oldVal.y + (Math.random() - 0.5) * level * 2,
				-this.oldVal.z + (Math.random() - 0.5) * level * 2
			);
		}

		this.vel.setDirect(
			this.vel.x * 0.98 + (this.target.x) * 0.1,
			this.vel.y * 0.98 + (this.target.y) * 0.1,
			this.vel.z * 0.98 + (this.target.z) * 0.1
		);

		translation.add(this.vel).sub(this.oldVal);
		this.oldVal.copy(this.vel);
		transformComponent.setUpdated();

		if (t >= 1) {
			translation.sub(this.oldVal);
			transformComponent.setUpdated();
			this.completed = true;
			fsm.send(this.eventToEmit);
		}
	};

	module.exports = ShakeAction;

/***/ },
/* 178 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function PauseAnimationAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	PauseAnimationAction.prototype = Object.create(Action.prototype);
	PauseAnimationAction.prototype.constructor = PauseAnimationAction;

	PauseAnimationAction.external = {
		key: 'Pause Animation',
		name: 'Pause Animation',
		type: 'animation',
		description: 'Pauses skeleton animations.',
		parameters: [{
			name: 'On all entities',
			key: 'onAll',
			type: 'boolean',
			description: 'Pause animation on all entities or just one.',
			'default': false
		}],
		transitions: []
	};

	PauseAnimationAction.prototype.enter = function (fsm) {
		if (this.onAll) {
			var world = fsm.getWorld();
			var animationSystem = world.getSystem('AnimationSystem');
			animationSystem.pause();
		} else {
			var entity = fsm.getOwnerEntity();
			if (entity.animationComponent) {
				entity.animationComponent.pause();
			}
		}
	};

	module.exports = PauseAnimationAction;

/***/ },
/* 179 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function ResumeAnimationAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ResumeAnimationAction.prototype = Object.create(Action.prototype);
	ResumeAnimationAction.prototype.constructor = ResumeAnimationAction;

	ResumeAnimationAction.external = {
		key: 'Resume Animation',
		name: 'Resume Animation',
		type: 'animation',
		description: 'Continues playing a skeleton animation.',
		parameters: [{
			name: 'On all entities',
			key: 'onAll',
			type: 'boolean',
			description: 'Resume animation on all entities or just one.',
			'default': false
		}],
		transitions: []
	};

	ResumeAnimationAction.prototype.enter = function (fsm) {
		if (this.onAll) {
			var world = fsm.getWorld();
			var animationSystem = world.getSystem('AnimationSystem');
			animationSystem.resume();
		} else {
			var entity = fsm.getOwnerEntity();
			if (entity.animationComponent) {
				entity.animationComponent.resume();
			}
		}
	};

	module.exports = ResumeAnimationAction;

/***/ },
/* 180 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function SetAnimationAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this._transitioned = false;
		this._loopAtStart = null;
		this._previousLoop = 0;
	}

	SetAnimationAction.prototype = Object.create(Action.prototype);
	SetAnimationAction.prototype.constructor = SetAnimationAction;

	SetAnimationAction.external = {
		key: 'Set Animation',
		name: 'Set Animation',
		type: 'animation',
		description: 'Transitions to a selected animation.',
		parameters: [{
			name: 'Animation',
			key: 'animation',
			type: 'animation'
		},{
			name: 'Loops',
			key: 'loops',
			description: 'How many times to loop before transitioning.',
			type: 'int',
			min: 1,
			'default': 1
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the target animation completes. If the animation loops forever, the transition will be done when the next loop starts.'
		}]
	};

	var labels = {
		complete: 'On animation complete'
	};

	SetAnimationAction.getTransitionLabel = function (transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	SetAnimationAction.prototype.enter = function () {
		this._transitioned = false;
		this._loopAtStart = null;
		this._previousLoop = 0;
	};

	SetAnimationAction.prototype.update = function (fsm) {
		// If we already made the transition, bail
		if (this._transitioned) {
			return;
		}

		var entity = fsm.getOwnerEntity();
		var that = this;

		if (this.animation && entity.animationComponent) {
			var currentState;

			if (this._loopAtStart === null) { // First enter!
				// Set the animation
				entity.animationComponent.transitionTo(this.animation, true);

				// Get the current loop number and store it
				currentState = entity.animationComponent.getCurrentState();
				if (currentState) {
					this._loopAtStart = currentState.getCurrentLoop();
				}
			}
			currentState = entity.animationComponent.getCurrentState();

			var shouldTransition = false;

			// Transition if the loop number was reached.
			if (currentState) {
				// Current state found - animation is still running
				shouldTransition = shouldTransition || (currentState.getCurrentLoop() - this._loopAtStart === this.loops);
				this._previousLoop = currentState.getCurrentLoop();
			} else {
				// No current state found. The animation probably used all of its loops and changed to the "null" animation.
				// Therefore, we cannot know the current loop. Look at the previous one
				shouldTransition = shouldTransition || (this._previousLoop === this.loops - 1);
			}

			if (shouldTransition) {
				fsm.send(that.transitions.complete);
				this._transitioned = true;
			}

		}
	};

	SetAnimationAction.prototype.exit = function () {
		this._transitioned = false;
		this._loopAtStart = null;
		this._previousLoop = 0;
	};

	module.exports = SetAnimationAction;

/***/ },
/* 181 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function SetTimeScaleAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this.everyFrame = false;
	}

	SetTimeScaleAction.prototype = Object.create(Action.prototype);
	SetTimeScaleAction.prototype.constructor = SetTimeScaleAction;

	SetTimeScaleAction.external = {
		key: 'Set Animation Time Scale',
		name: 'Set Animation Time Scale',
		type: 'animation',
		description: 'Sets the time scale for the current animation.',
		parameters: [{
			name: 'Scale',
			key: 'scale',
			type: 'float',
			description: 'Scale factor for the animation timer.',
			'default': 1
		}],
		transitions: []
	};

	SetTimeScaleAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.animationComponent) {
			entity.animationComponent.setTimeScale(this.scale);
		}
	};

	module.exports = SetTimeScaleAction;

/***/ },
/* 182 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	/**
	 * @private
	 * @extends Action
	 */
	function WaitAction(/*id, settings*/) {
		Action.apply(this, arguments);

		/**
		 * Current time, in milliseconds.
		 * @type {number}
		 */
		this.currentTime = 0;

		/**
		 * Wait time, in milliseconds.
		 * @type {number}
		 */
		this.totalWait = 0;

		this.completed = false;
	}

	WaitAction.prototype = Object.create(Action.prototype);
	WaitAction.prototype.constructor = WaitAction;

	WaitAction.external = {
		key: 'Wait',
		name: 'Wait',
		type: 'animation',
		description: 'Performs a transition after a specified amount of time. A random time can be set, this will add between 0 and the set random time to the specified wait time.',
		canTransition: true,
		parameters: [{
			name: 'Time (ms)',
			key: 'waitTime',
			type: 'float',
			description: 'Base time in milliseconds before transition fires.',
			'default': 5000
		}, {
			name: 'Random (ms)',
			key: 'randomTime',
			type: 'float',
			description: 'A random number of milliseconds (between 0 and this value) will be added to the base wait time.',
			'default': 0
		}],
		transitions: [{
			key: 'timeUp',
			description: 'State to transition to when time up.'
		}]
	};

	WaitAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return transitionKey === 'timeUp' ? 'On Wait End' : undefined;
	};

	WaitAction.prototype.enter = function () {
		this.completed = false;
		this.currentTime = 0;
		this.totalWait = parseFloat(this.waitTime) + Math.random() * parseFloat(this.randomTime);
	};

	WaitAction.prototype.update = function (fsm) {
		this.currentTime += fsm.getTpf() * 1000;
		if (this.currentTime >= this.totalWait && !this.completed) {
			this.completed = true;
			fsm.send(this.transitions.timeUp);
		}
	};

	module.exports = WaitAction;

/***/ },
/* 183 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function TransitionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TransitionAction.prototype = Object.create(Action.prototype);
	TransitionAction.prototype.constructor = TransitionAction;

	TransitionAction.external = {
		key: 'Transition',
		name: 'Transition',
		type: 'transitions',
		description: 'Transition to a selected state.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'transition',
			description: 'State to transition to.'
		}]
	};

	var labels = {
		transition: 'On Enter'
	};

	TransitionAction.getTransitionLabel = function (transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	TransitionAction.prototype.enter = function (fsm) {
		fsm.send(this.transitions.transition);
	};

	module.exports = TransitionAction;

/***/ },
/* 184 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function NextFrameAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	NextFrameAction.prototype = Object.create(Action.prototype);
	NextFrameAction.prototype.constructor = NextFrameAction;

	NextFrameAction.external = {
		key: 'transitionOnNextFrame',
		name: 'Transition on next frame',
		type: 'transitions',
		description: 'Transition to a selected state on the next frame.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'transition',
			name: 'On Next Frame',
			description: 'State to transition to on next frame.'
		}]
	};

	var labels = {
		transition: 'On Next Frame'
	};

	NextFrameAction.getTransitionLabel = function (transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	NextFrameAction.prototype.update = function (fsm) {
		fsm.send(this.transitions.transition);
	};

	module.exports = NextFrameAction;

/***/ },
/* 185 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function RandomTransitionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RandomTransitionAction.prototype = Object.create(Action.prototype);
	RandomTransitionAction.prototype.constructor = RandomTransitionAction;

	RandomTransitionAction.external = {
		key: 'Random Transition',
		name: 'Random Transition',
		type: 'transitions',
		description: 'Performs a random transition. Will choose one of the two transitions randomly and transition immediately.',
		canTransition: true,
		parameters: [{
			name: 'Probability A',
			key: 'skewness',
			type: 'float',
			control: 'slider',
			min: 0,
			max: 1,
			description: 'The probability that the first destination is chosen over the second.',
			'default': 0.5
		}],
		transitions: [{
			key: 'transition1',
			description: 'First choice.'
		}, {
			key: 'transition2',
			description: 'Second choice.'
		}]
	};

	var labels = {
		transition1: 'On random outcome A',
		transition2: 'On random outcome B'
	};

	RandomTransitionAction.getTransitionLabel = function (transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	RandomTransitionAction.prototype.enter = function (fsm) {
		var transitions = this.transitions;
		var a = transitions.transition1;
		var b = transitions.transition2;
		var transition = Math.random() < this.skewness ? a : b;
		fsm.send(transition);
	};

	module.exports = RandomTransitionAction;

/***/ },
/* 186 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var SystemBus = __webpack_require__(44);

	function EmitAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	EmitAction.prototype = Object.create(Action.prototype);
	EmitAction.prototype.constructor = EmitAction;

	EmitAction.external = {
		key: 'Emit message',
		name: 'Emit Message',
		type: 'transitions',
		description: 'Emits a message (event) to a channel on the bus. Messages can be listened to by the Listen action, or by scripts using the SystemBus.addListener(channel, callback) function.',
		parameters: [{
			name: 'Channel',
			key: 'channel',
			type: 'string',
			description: 'Channel to transmit a message (event) on.',
			'default': ''
		}],
		transitions: []
	};

	EmitAction.prototype.enter = function (/*fsm*/) {
		SystemBus.emit(this.channel, this.data); // data is unused?
	};

	module.exports = EmitAction;

/***/ },
/* 187 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var SystemBus = __webpack_require__(44);

	function TransitionOnMessageAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TransitionOnMessageAction.prototype = Object.create(Action.prototype);
	TransitionOnMessageAction.prototype.constructor = TransitionOnMessageAction;

	TransitionOnMessageAction.external = {
		key: 'Transition on Message',
		name: 'Listen',
		type: 'transitions',
		description: 'Performs a transition on receiving a system bus message (event) on a specific channel.',
		canTransition: true,
		parameters: [{
			name: 'Message channel',
			key: 'channel',
			type: 'string',
			description: 'Channel to listen to.',
			'default': ''
		}],
		transitions: [{
			key: 'transition',
			description: 'State to transition to.'
		}]
	};

	TransitionOnMessageAction.getTransitionLabel = function (transitionKey, actionConfig){
		var label = actionConfig.options.channel ? '"' + actionConfig.options.channel + '"' : '';
		return transitionKey === 'transition' ? 'On ' + label + ' event' : 'On Message';
	};

	TransitionOnMessageAction.prototype.enter = function (fsm) {
		this.eventListener = function (/*data*/) {
			fsm.send(this.transitions.transition);
		}.bind(this);
		SystemBus.addListener(this.channel, this.eventListener, false);
	};

	TransitionOnMessageAction.prototype.exit = function (/*fsm*/) {
		SystemBus.removeListener(this.channel, this.eventListener);
	};

	module.exports = TransitionOnMessageAction;

/***/ },
/* 188 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function EvalAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.expressionFunction = null;
	}

	EvalAction.prototype = Object.create(Action.prototype);
	EvalAction.prototype.constructor = EvalAction;

	EvalAction.external = {
		key: 'Eval',
		name: 'Eval',
		description: 'Evaluates a JS expression.',
		parameters: [{
			name: 'expression',
			key: 'expression',
			type: 'string',
			description: 'JavaScript expression to evaluate.',
			'default': ''
		}],
		transitions: []
	};

	EvalAction.prototype.enter = function () {
		this.expressionFunction = new Function('goo', this.expression);
	};

	EvalAction.prototype.update = function (fsm) {
		if (this.expressionFunction) {
			try {
				this.expressionFunction(fsm.getEvalProxy());
			} catch (e) {
				console.warn('Eval code error: ' + e.message);
			}
		}
	};

	module.exports = EvalAction;

/***/ },
/* 189 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function HideAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	HideAction.prototype = Object.create(Action.prototype);
	HideAction.prototype.constructor = HideAction;

	HideAction.external = {
		key: 'Hide',
		name: 'Hide',
		type: 'display',
		description: 'Hides an entity and its children.',
		parameters: [],
		transitions: []
	};

	HideAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.hide();
	};

	module.exports = HideAction;

/***/ },
/* 190 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function ShowAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ShowAction.prototype = Object.create(Action.prototype);
	ShowAction.prototype.constructor = ShowAction;

	ShowAction.external = {
		key: 'Show',
		name: 'Show',
		type: 'display',
		description: 'Makes an entity visible.',
		parameters: [],
		transitions: []
	};

	ShowAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.show();
	};

	module.exports = ShowAction;

/***/ },
/* 191 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function RemoveAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RemoveAction.prototype = Object.create(Action.prototype);
	RemoveAction.prototype.constructor = RemoveAction;

	RemoveAction.external = {
		key: 'Remove',
		name: 'Remove',
		type: 'display',
		description: 'Removes the entity from the world.',
		parameters: [{
			name: 'Recursive',
			key: 'recursive',
			type: 'boolean',
			description: 'Remove children too.',
			'default': false
		}],
		transitions: []
	};

	RemoveAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.removeFromWorld(this.recursive);
	};

	module.exports = RemoveAction;

/***/ },
/* 192 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var LightComponent = __webpack_require__(193);
	var PointLight = __webpack_require__(49);
	var DirectionalLight = __webpack_require__(51);
	var SpotLight = __webpack_require__(52);

	function AddLightAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	AddLightAction.prototype = Object.create(Action.prototype);
	AddLightAction.prototype.constructor = AddLightAction;

	AddLightAction.external = {
		key: 'Add Light',
		name: 'Add Light',
		description: 'Adds a point light to the entity.',
		type: 'light',
		parameters: [{
			name: 'Color',
			key: 'color',
			type: 'vec3',
			control: 'color',
			description: 'Color of the light.',
			'default': [1, 1, 1]
		}, {
			name: 'Light type',
			key: 'type',
			type: 'string',
			control: 'dropdown',
			description: 'Light type.',
			'default': 'Point',
			options: ['Point', 'Directional', 'Spot']
		}, {
			name: 'Range',
			key: 'range',
			type: 'float',
			control: 'slider',
			min: 0,
			max: 1000,
			description: 'Range of the light.',
			'default': 200
		}, {
			name: 'Cone Angle',
			key: 'angle',
			type: 'float',
			control: 'slider',
			min: 1,
			max: 170,
			description: 'Cone angle (applies only to spot lights).',
			'default': 30
		}, {
			name: 'Penumbra',
			key: 'penumbra',
			type: 'float',
			control: 'slider',
			min: 0,
			max: 170,
			description: 'Penumbra (applies only to spot lights).',
			'default': 30
		}],
		transitions: []
	};

	AddLightAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.lightComponent) {
			this._untouched = true;
			return;
		}

		var light;
		if (this.type === 'Directional') {
			light = new DirectionalLight();
		} else if (this.type === 'Spot') {
			light = new SpotLight();
			light.range = +this.range;
			light.angle = +this.angle;
			light.penumbra = +this.penumbra;
		} else {
			light = new PointLight();
			light.range = +this.range;
		}

		light.color.setDirect(this.color[0], this.color[1], this.color[2]);

		entity.setComponent(new LightComponent(light));
	};

	AddLightAction.prototype.cleanup = function (fsm) {
		if (this._untouched) { return; }

		var entity = fsm.getOwnerEntity();
		if (entity) {
			entity.clearComponent('LightComponent');
		}
	};

	module.exports = AddLightAction;

/***/ },
/* 193 */,
/* 194 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function RemoveLightAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RemoveLightAction.prototype = Object.create(Action.prototype);
	RemoveLightAction.prototype.constructor = RemoveLightAction;

	RemoveLightAction.external = {
		key: 'Remove Light',
		name: 'Remove Light',
		type: 'light',
		description: 'Removes the light attached to the entity.',
		parameters: [],
		transitions: []
	};

	RemoveLightAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('LightComponent')) {
			entity.clearComponent('LightComponent');
		}
	};

	module.exports = RemoveLightAction;

/***/ },
/* 195 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function SetLightPropertiesAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetLightPropertiesAction.prototype = Object.create(Action.prototype);
	SetLightPropertiesAction.prototype.constructor = SetLightPropertiesAction;

	SetLightPropertiesAction.external = {
		key: 'Set Light Properties',
		name: 'Set Light Properties',
		description: 'Sets various properties of a light.',
		parameters: [{
			name: 'Entity (optional)',
			key: 'entity',
			type: 'entity',
			description: 'Entity that has a light.'
		}, {
			name: 'Color',
			key: 'color',
			type: 'vec3',
			control: 'color',
			description: 'Light color.',
			'default': [1, 1, 1]
		}, {
			name: 'Intensity',
			key: 'intensity',
			type: 'float',
			description: 'Light intensity.',
			'default': 1
		}, {
			name: 'Specular Intensity',
			key: 'specularIntensity',
			type: 'float',
			description: 'Specular light intensity.',
			'default': 1
		}, {
			name: 'Range',
			key: 'range',
			type: 'float',
			description: 'Light range (for point/spot lights).',
			'default': 100
		}],
		transitions: []
	};

	SetLightPropertiesAction.prototype.enter = function (fsm) {
		var entity = (this.entity && fsm.getEntityById(this.entity.entityRef)) || fsm.getOwnerEntity();
		if (entity &&
			entity.lightComponent &&
			entity.lightComponent.light) {
			entity.lightComponent.light.color.setDirect(this.color[0], this.color[1], this.color[2]);
			entity.lightComponent.light.intensity = this.intensity;
			entity.lightComponent.light.specularIntensity = this.specularIntensity;
			entity.lightComponent.light.range = this.range;
		}
	};

	module.exports = SetLightPropertiesAction;

/***/ },
/* 196 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector3 = __webpack_require__(8);
	var Easing = __webpack_require__(173);

	function TweenLightColorAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.fromCol = new Vector3();
		this.toCol = new Vector3();
		this.completed = false;
	}

	TweenLightColorAction.prototype = Object.create(Action.prototype);
	TweenLightColorAction.prototype.constructor = TweenLightColorAction;

	TweenLightColorAction.external = {
		key: 'Tween Light Color',
		name: 'Tween Light',
		type: 'light',
		description: 'Tweens the color of the light.',
		parameters: [{
			name: 'Color',
			key: 'to',
			type: 'vec3',
			control: 'color',
			description: 'Color of the light.',
			'default': [1, 1, 1]
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for the transition to complete.',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type.',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction.',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the light tween was completed.'
		}]
	};

	TweenLightColorAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return transitionKey === 'complete' ? 'On Tween Light Complete' : undefined;
	};

	TweenLightColorAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity.lightComponent) {
			return;
		}

		this.fromCol.set(entity.lightComponent.light.color);
		this.toCol.setDirect(this.to[0], this.to[1], this.to[2]);

		this.startTime = fsm.getTime();

		this.completed = false;
	};

	TweenLightColorAction.prototype.update = function (fsm) {
		if (this.completed) {
			return;
		}

		var entity = fsm.getOwnerEntity();
		if (!entity.lightComponent) {
			return;
		}

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = Easing[this.easing1][this.easing2](t);

		var color = entity.lightComponent.light.color;
		color.set(this.fromCol).lerp(this.toCol, fT);

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};

	module.exports = TweenLightColorAction;

/***/ },
/* 197 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function SetClearColorAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetClearColorAction.prototype = Object.create(Action.prototype);
	SetClearColorAction.prototype.constructor = SetClearColorAction;

	SetClearColorAction.external = {
		key: 'Set Clear Color',
		name: 'Background Color',
		description: 'Sets the clear color.',
		parameters: [{
			name: 'Color',
			key: 'color',
			type: 'vec4',
			control: 'color',
			description: 'Color.',
			'default': [1, 1, 1, 1]
		}],
		transitions: []
	};

	SetClearColorAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var color = this.color;
		entity._world.gooRunner.renderer.setClearColor(color[0], color[1], color[2], color[3]);
	};

	module.exports = SetClearColorAction;

/***/ },
/* 198 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var SystemBus = __webpack_require__(44);
	var Renderer = __webpack_require__(123);

	function SwitchCameraAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this._camera = null;
	}

	SwitchCameraAction.prototype = Object.create(Action.prototype);
	SwitchCameraAction.prototype.constructor = SwitchCameraAction;

	SwitchCameraAction.external = {
		key: 'Switch Camera',
		name: 'Switch Camera',
		type: 'camera',
		description: 'Switches to a selected camera.',
		parameters: [{
			name: 'Camera',
			key: 'cameraEntityRef',
			type: 'camera',
			description: 'Camera to switch to.',
			'default': null
		}],
		transitions: []
	};

	SwitchCameraAction.prototype.ready = function (/*fsm*/) {
		this._camera = Renderer.mainCamera; // make this into get activeCamera
	};

	SwitchCameraAction.prototype.enter = function (fsm) {
		var world = fsm.getOwnerEntity()._world;
		var cameraEntity = world.entityManager.getEntityById(this.cameraEntityRef);
		if (cameraEntity && cameraEntity.cameraComponent) {
			SystemBus.emit('goo.setCurrentCamera', {
				camera: cameraEntity.cameraComponent.camera,
				entity: cameraEntity
			});
		}
	};

	SwitchCameraAction.prototype.cleanup = function (/*fsm*/) {
	};

	module.exports = SwitchCameraAction;

/***/ },
/* 199 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Camera = __webpack_require__(120);
	var BoundingSphere = __webpack_require__(13);

	function InFrustumAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	InFrustumAction.prototype = Object.create(Action.prototype);
	InFrustumAction.prototype.constructor = InFrustumAction;

	InFrustumAction.external = {
		key: 'In Frustum',
		name: 'In View',
		type: 'camera',
		description: 'Performs a transition based on whether the entity is in a camera\'s frustum or not.',
		canTransition: true,
		parameters: [{
			name: 'Current camera',
			key: 'current',
			type: 'boolean',
			description: 'Check this to always use the current camera.',
			'default': true
		}, {
			name: 'Camera',
			key: 'cameraEntityRef',
			type: 'camera',
			description: 'Other camera; Will be ignored if the previous option is checked.',
			'default': null
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: [{
			key: 'inside',
			description: 'State to transition to if entity is in the frustum.'
		}, {
			key: 'outside',
			description: 'State to transition to if entity is outside the frustum.'
		}]
	};

	var labels = {
		inside: 'On Inside Frustum',
		outside: 'On Outside Frustum'
	};

	InFrustumAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return labels[transitionKey];
	};

	InFrustumAction.prototype.checkFrustum = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (this.current) {
			if (entity.isVisible) {
				fsm.send(this.transitions.inside);
			} else {
				fsm.send(this.transitions.outside);
			}
		} else {
			var boundingVolume = entity.meshRendererComponent ? entity.meshRendererComponent.worldBound : new BoundingSphere(entity.transformComponent.sync().worldTransform.translation, 0.001);
			if (this.camera.contains(boundingVolume) === Camera.Outside) {
				fsm.send(this.transitions.outside);
			} else {
				fsm.send(this.transitions.inside);
			}
		}
	};

	InFrustumAction.prototype.enter = function (fsm) {
		if (!this.current) {
			var world = fsm.getOwnerEntity()._world;
			var cameraEntity = world.entityManager.getEntityById(this.cameraEntityRef);
			this.camera = cameraEntity.cameraComponent.camera;
		}

		if (!this.everyFrame) {
			this.checkFrustum(fsm);
		}
	};

	InFrustumAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.checkFrustum(fsm);
		}
	};

	module.exports = InFrustumAction;


/***/ },
/* 200 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector3 = __webpack_require__(8);
	var MathUtils = __webpack_require__(9);
	var Easing = __webpack_require__(173);

	function DollyZoomAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.from = new Vector3();
		this.to = new Vector3();
		this.completed = false;
	}

	DollyZoomAction.prototype = Object.create(Action.prototype);
	DollyZoomAction.prototype.constructor = DollyZoomAction;

	DollyZoomAction.external = {
		key: 'Dolly Zoom',
		name: 'Dolly Zoom',
		type: 'camera',
		description: 'Performs dolly zoom.',
		parameters: [{
			name: 'Forward',
			key: 'forward',
			type: 'float',
			description: 'Number of units to move towards the focus point. Enter negative values to move away.',
			'default': 100
		}, {
			name: 'Focus point',
			key: 'lookAt',
			type: 'position',
			description: 'Point to focus on while transitioning.',
			'default': [0, 0, 0]
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time.',
			'default': 10000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing.',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction.',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the transition completes.'
		}]
	};

	DollyZoomAction.getTransitionLabel = function (/*transitionKey, actionConfig*/){
		return 'On Dolly Zoom Complete';
	};

	DollyZoomAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		this.completed = false;

		if (entity.cameraComponent && entity.cameraComponent.camera) {
			var transformComponent = entity.transformComponent;
			var translation = transformComponent.transform.translation;
			var camera = entity.cameraComponent.camera;

			this.fromDistance = new Vector3(this.lookAt).distance(camera.translation);
			this.toDistance = this.fromDistance - this.forward;

			this.eyeTargetScale = Math.tan(camera.fov * (Math.PI / 180) / 2) * this.fromDistance;

			var initialTranslation = new Vector3().copy(translation);
			var toVec = Vector3.fromArray(this.lookAt)
				.sub(initialTranslation)
				.normalize()
				.scale(this.forward)
				.add(initialTranslation);

			this.from.set(initialTranslation.x, initialTranslation.y, initialTranslation.z);
			this.to.setDirect(toVec.x, toVec.y, toVec.z);

			this.startTime = fsm.getTime();
		} else {
			this.eyeTargetScale = null;
		}
	};

	DollyZoomAction.prototype.update = function (fsm) {
		if (this.completed) {
			return;
		}

		if (this.eyeTargetScale) {
			var entity = fsm.getOwnerEntity();
			var transformComponent = entity.transformComponent;
			var camera = entity.cameraComponent.camera;

			var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
			var fT = Easing[this.easing1][this.easing2](t);

			transformComponent.transform.translation.set(this.from).lerp(this.to, fT);
			transformComponent.setUpdated();

			var d = MathUtils.lerp(fT, this.fromDistance, this.toDistance);
			var fov = (180 / Math.PI) * 2 * Math.atan(this.eyeTargetScale / d);
			camera.setFrustumPerspective(fov);

			if (t >= 1) {
				fsm.send(this.transitions.complete);
				this.completed = true;
			}
		}
	};

	module.exports = DollyZoomAction;

/***/ },
/* 201 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function InBoxAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	InBoxAction.prototype = Object.create(Action.prototype);
	InBoxAction.prototype.constructor = InBoxAction;

	InBoxAction.external = {
		key: 'In Box',
		name: 'In Box',
		type: 'collision',
		description: 'Performs a transition based on whether an entity is inside a user defined box volume or not. The volume is defined by setting two points which, when connected, form a diagonal through the box volume.',
		canTransition: true,
		parameters: [{
			name: 'Point1',
			key: 'point1',
			type: 'position',
			description: 'First box point.',
			'default': [-1, -1, -1]
		}, {
			name: 'Point2',
			key: 'point2',
			type: 'position',
			description: 'Second box point.',
			'default': [1, 1, 1]
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: [{
			key: 'inside',
			description: 'State to transition to if the entity is inside the box.'
		}, {
			key: 'outside',
			description: 'State to transition to if the entity is outside the box.'
		}]
	};

	var labels = {
		inside: 'On Inside Box',
		outside: 'On Outside Box'
	};

	InBoxAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return labels[transitionKey];
	};

	// TODO: Find this in some Util class
	function checkInside(pos, pt1, pt2) {
		var inside = false;

		var inOnAxis = function (pos, pt1, pt2) {
			if (pt1 > pt2) {
				if (pos < pt1 && pos > pt2) {
					return true;
				}
			} else if (pt2 > pt1) {
				if (pos < pt2 && pos > pt1) {
					return true;
				}
			} else {
				if (pos === pt2) {
					return true;
				}
			}
			return false;
		};

		var isInsideX = inOnAxis(pos[0], pt1[0], pt2[0]);
		var isInsideY = inOnAxis(pos[1], pt1[1], pt2[1]);
		var isInsideZ = inOnAxis(pos[2], pt1[2], pt2[2]);

		if (isInsideX && isInsideY && isInsideZ) {
			inside = true;
		}

		return inside;
	}

	InBoxAction.prototype.checkInside = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var translation = entity.transformComponent.sync().worldTransform.translation;

		var inside = checkInside([translation.x, translation.y, translation.z], this.point1, this.point2);

		if (inside) {
			fsm.send(this.transitions.inside);
		} else {
			fsm.send(this.transitions.outside);
		}
	};

	InBoxAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.checkInside(fsm);
		}
	};

	InBoxAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.checkInside(fsm);
		}
	};

	module.exports = InBoxAction;

/***/ },
/* 202 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Renderer = __webpack_require__(123);

	function CompareDistanceAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	CompareDistanceAction.prototype = Object.create(Action.prototype);
	CompareDistanceAction.prototype.constructor = CompareDistanceAction;

	CompareDistanceAction.external = {
		key: 'Compare Distance',
		name: 'Camera Distance',
		type: 'collision',
		description: 'Performs a transition based on the distance to the main camera or to a location.',
		canTransition: true,
		parameters: [{
			name: 'Current camera',
			key: 'camera',
			type: 'boolean',
			description: 'Measure the distance to the current camera or to an arbitrary point.',
			'default': true
		}, {
			name: 'Position',
			key: 'position',
			type: 'position',
			description: 'Position to measure the distance to; Will be ignored if previous option is selected.',
			'default': [0, 0, 0]
		}, {
			name: 'Value',
			key: 'value',
			type: 'float',
			description: 'Value to compare to.',
			'default': 0
		}, {
			name: 'Tolerance',
			key: 'tolerance',
			type: 'float',
			'default': 0
		}, {
			name: 'Type',
			key: 'distanceType',
			type: 'string',
			control: 'dropdown',
			description: 'The type of distance.',
			'default': 'Euclidean',
			options: ['Euclidean', 'Manhattan']
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: [{
			key: 'less',
			description: 'State to transition to if the measured distance is smaller than the specified value.'
		}, {
			key: 'equal',
			description: 'State to transition to if the measured distance is about the same as the specified value.'
		}, {
			key: 'greater',
			description: 'State to transition to if the measured distance is greater than the specified value.'
		}]
	};

	var labels = {
		less: 'On camera distance < X',
		equal: 'On camera distance == X',
		greater: 'On camera distance > X'
	};

	CompareDistanceAction.getTransitionLabel = function (transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	CompareDistanceAction.prototype.compare = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var translation = entity.transformComponent.sync().worldTransform.translation;
		var delta;

		if (this.camera) {
			delta = translation.clone().sub(Renderer.mainCamera.translation);
		} else {
			delta = translation.clone().subDirect(this.position[0], this.position[1], this.position[2]);
		}

		var distance;
		if (this.type === 'Euclidean') {
			distance = delta.length();
		} else {
			distance = Math.abs(delta.x) + Math.abs(delta.y) + Math.abs(delta.z);
		}
		var diff = this.value - distance;

		if (Math.abs(diff) <= this.tolerance) {
			fsm.send(this.transitions.equal);
		} else if (diff > 0) {
			fsm.send(this.transitions.less);
		} else {
			fsm.send(this.transitions.greater);
		}
	};

	CompareDistanceAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.compare(fsm);
		}
	};

	CompareDistanceAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.compare(fsm);
		}
	};

	module.exports = CompareDistanceAction;

/***/ },
/* 203 */
/***/ function(module, exports, __webpack_require__) {

	var EntitySelection = __webpack_require__(21);
	var Action = __webpack_require__(151);
	var ProximitySystem = __webpack_require__(204);

	function CollidesAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	CollidesAction.prototype = Object.create(Action.prototype);
	CollidesAction.prototype.constructor = CollidesAction;

	CollidesAction.external = {
		key: 'Collides',
		name: 'Collision (Bounding volume intersection)',
		type: 'collision',
		description: 'Checks for collisions or non-collisions with other entities. Collisions are based on the entities\' bounding volumes. Before using collisions you first need to tag your entities.',
		canTransition: true,
		parameters: [{
			name: 'Tag',
			key: 'tag',
			type: 'string',
			description: 'Checks for collisions with other objects having this tag.',
			'default': 'red'
		}],
		transitions: [{
			key: 'collides',
			description: 'State to transition to when a collision occurs.'
		}, {
			key: 'notCollides',
			description: 'State to transition to when a collision is not occurring.'
		}]
	};

	var labels = {
		collides: 'On bounds Overlap',
		notCollides: 'On bounds Separate'
	};

	CollidesAction.getTransitionLabel = function (transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	CollidesAction.prototype.ready = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var world = entity._world;
		if (!world.getSystem('ProximitySystem')) {
			world.setSystem(new ProximitySystem());
		}
	};

	CollidesAction.prototype.update = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var world = entity._world;
		var proximitySystem = world.getSystem('ProximitySystem');

		var entities = new EntitySelection(proximitySystem.getFor(this.tag))
			.and(world.by.tag(this.tag))
			.toArray();

		var collides = false;

		entity.traverse(function (entity) {
			// Stop traversing when the entity can't collide with anything.
			if (!entity.meshRendererComponent || entity.particleComponent) {
				return false;
			}

			var worldBound = entity.meshRendererComponent.worldBound;

			for (var i = 0; i < entities.length; i++) {
				entities[i].traverse(function (entity) {
					if (!entity.meshRendererComponent || entity.particleComponent) {
						return true; // Move on to other entities.
					}

					var otherBound = entity.meshRendererComponent.worldBound;
					if (otherBound && worldBound.intersects(otherBound)) {
						collides = true;
						return false; // Stop traversing.
					}
				});

				if (collides) {
					return false; // Stop traversing.
				}
			}
		});

		fsm.send(collides ? this.transitions.collides : this.transitions.notCollides);
	};

	module.exports = CollidesAction;

/***/ },
/* 204 */
/***/ function(module, exports, __webpack_require__) {

	var System = __webpack_require__(42);
	var SystemBus = __webpack_require__(44);
	var StringUtils = __webpack_require__(36);

	/**
	 * Processes all entities with a proximity component
	 * @param {Renderer} renderer
	 * @param {RenderSystem} renderSystem
	 * @private
	 * @extends System
	 */
	function ProximitySystem() {
		System.call(this, 'ProximitySystem', ['ProximityComponent']);

		this.collections = {
			Red: { name: 'Red', collection: [] },
			Blue: { name: 'Blue', collection: [] },
			Green: { name: 'Green', collection: [] },
			Yellow: { name: 'Yellow', collection: [] }
		};
	}

	ProximitySystem.prototype = Object.create(System.prototype);

	ProximitySystem.prototype._collides = function (first, second) {
		// really non-optimal
		for (var i = 0; i < first.collection.length; i++) {
			var firstElement = first.collection[i];
			for (var j = 0; j < second.collection.length; j++) {
				var secondElement = second.collection[j];

				if (firstElement.meshRendererComponent.worldBound.intersects(secondElement.meshRendererComponent.worldBound)) {
					SystemBus.send('collides.' + first.name + '.' + second.name);
				}
			}
		}
	};

	function formatTag(tag) {
		return StringUtils.capitalize(tag);
	}

	ProximitySystem.prototype.getFor = function (tag) {
		tag = formatTag(tag);
		if (this.collections[tag]) {
			return this.collections[tag].collection;
		} else {
			return [];
		}
	};

	ProximitySystem.prototype.add = function (entity, tag) {
		tag = formatTag(tag);
		if (!this.collections[tag]) {
			this.collections[tag] = { name: tag, collection: [] };
		}
		this.collections[tag].collection.push(entity);
	};

	ProximitySystem.prototype.remove = function (entity, tag) {
		tag = formatTag(tag);
		var collection = this.collections[tag].collection;
		var index = collection.indexOf(entity);
		collection.splice(index, 1);
	};

	ProximitySystem.prototype.process = function (/*entities*/) {
		/*
		this._collides(this.collections.red, this.collections.blue);
		this._collides(this.collections.red, this.collections.green);
		this._collides(this.collections.red, this.collections.yellow);

		this._collides(this.collections.blue, this.collections.green);
		this._collides(this.collections.blue, this.collections.yellow);

		this._collides(this.collections.green, this.collections.yellow);
		*/
	};

	module.exports = ProximitySystem;

/***/ },
/* 205 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var ProximityComponent = __webpack_require__(206);

	function TagAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TagAction.prototype = Object.create(Action.prototype);
	TagAction.prototype.constructor = TagAction;

	TagAction.external = {
		key: 'Tag',
		name: 'Tag',
		type: 'collision',
		description: 'Sets a tag on the entity. Use tags to be able to capture collision events with the \'Collides\' action.',
		parameters: [{
			name: 'Tag',
			key: 'tag',
			type: 'string',
			control: 'dropdown',
			description: 'Checks for collisions with other objects having this tag.',
			'default': 'red',
			options: ['red', 'blue', 'green', 'yellow']
		}],
		transitions: []
	};

	TagAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.proximityComponent) {
			if (entity.proximityComponent.tag !== this.tag) {
				entity.clearComponent('ProximityComponent');
				entity.setComponent(new ProximityComponent(this.tag));
			}
		} else {
			entity.setComponent(new ProximityComponent(this.tag));
		}
	};

	TagAction.prototype.cleanup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity) {
			entity.clearComponent('ProximityComponent');
		}
	};

	module.exports = TagAction;

/***/ },
/* 206 */
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(20);

	/**
	 * @private
	 */
	function ProximityComponent(tag) {
		Component.apply(this, arguments);

		this.type = 'ProximityComponent';

		Object.defineProperty(this, 'tag', {
			value: tag || 'red',
			writable: false
		});
	}

	ProximityComponent.prototype = Object.create(Component.prototype);
	ProximityComponent.prototype.constructor = ProximityComponent;

	ProximityComponent.prototype.attached = function (entity) {
		var world = entity._world;
		if (!world) { return; }

		var proximitySystem = world.getSystem('ProximitySystem');
		if (!proximitySystem) { return; }

		proximitySystem.add(entity, this.tag);
	};

	ProximityComponent.prototype.detached = function (entity) {
		var world = entity._world;
		if (!world) { return; }

		var proximitySystem = world.getSystem('ProximitySystem');
		if (!proximitySystem) { return; }

		proximitySystem.remove(entity, this.tag);
	};

	module.exports = ProximityComponent;

/***/ },
/* 207 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Material = __webpack_require__(30);
	var ShaderLib = __webpack_require__(46);
	var ParticleLib = __webpack_require__(208);
	var ParticleSystemUtils = __webpack_require__(209);

	function SmokeAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this.smokeEntity = null;
	}

	SmokeAction.material = null;

	SmokeAction.prototype = Object.create(Action.prototype);
	SmokeAction.prototype.constructor = SmokeAction;

	SmokeAction.external = {
		key: 'Smoke',
		name: 'Smoke FX',
		type: 'fx',
		description: 'Makes the entity emit smoke. To cancel the smoke emitter use the "Remove Particles" action.',
		parameters: [{
			name: 'Color',
			key: 'color',
			type: 'vec3',
			control: 'color',
			description: 'Smoke color.',
			'default': [0, 0, 0]
		}],
		transitions: []
	};

	SmokeAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (this.smokeEntity && entity.transformComponent.children.indexOf(this.smokeEntity.transformComponent) !== -1) {
			return;
		}

		var gooRunner = entity._world.gooRunner;

		if (!SmokeAction.material) {
			SmokeAction.material = new Material(ShaderLib.particles);
			var texture = ParticleSystemUtils.createFlareTexture();
			texture.generateMipmaps = true;
			SmokeAction.material.setTexture('DIFFUSE_MAP', texture);
			SmokeAction.material.blendState.blending = 'TransparencyBlending';
			SmokeAction.material.cullState.enabled = false;
			SmokeAction.material.depthState.write = false;
			SmokeAction.material.renderQueue = 2001;
		}

		var entityScale = entity.transformComponent.sync().worldTransform.scale;
		var scale = (entityScale.x + entityScale.y + entityScale.z) / 3;
		this.smokeEntity = ParticleSystemUtils.createParticleSystemEntity(
			gooRunner.world,
			ParticleLib.getSmoke({
				scale: scale,
				color: this.color
			}),
			SmokeAction.material
		);
		this.smokeEntity.meshRendererComponent.isPickable = false;
		this.smokeEntity.meshRendererComponent.castShadows = false;
		this.smokeEntity.meshRendererComponent.receiveShadows = false;
		this.smokeEntity.name = '_ParticleSystemSmoke';
		entity.transformComponent.attachChild(this.smokeEntity.transformComponent);

		this.smokeEntity.addToWorld();
	};

	SmokeAction.prototype.cleanup = function (/*fsm*/) {
		if (this.smokeEntity) {
			this.smokeEntity.removeFromWorld();
			this.smokeEntity = null;
		}
	};

	module.exports = SmokeAction;

/***/ },
/* 208 */,
/* 209 */,
/* 210 */,
/* 211 */,
/* 212 */,
/* 213 */,
/* 214 */,
/* 215 */,
/* 216 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Material = __webpack_require__(30);
	var ShaderLib = __webpack_require__(46);
	var ParticleLib = __webpack_require__(208);
	var ParticleSystemUtils = __webpack_require__(209);

	function FireAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this.fireEntity = null;
	}

	FireAction.material = null;

	FireAction.prototype = Object.create(Action.prototype);
	FireAction.prototype.constructor = FireAction;

	FireAction.external = {
		key: 'Fire',
		name: 'Fire FX',
		type: 'fx',
		description: 'Makes the entity emit fire. To "extinguish" the fire use the "Remove Particles" action.',
		parameters: [{
			name: 'Start Color',
			key: 'startColor',
			type: 'vec3',
			control: 'color',
			description: 'Flame color at source.',
			'default': [1, 1, 0]
		}, {
			name: 'End color',
			key: 'endColor',
			type: 'vec3',
			control: 'color',
			description: 'Color near the end of a flame\'s life.',
			'default': [1, 0, 0]
		}],
		transitions: []
	};

	FireAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (this.fireEntity && entity.transformComponent.children.indexOf(this.fireEntity.transformComponent) !== -1) {
			return;
		}

		var gooRunner = entity._world.gooRunner;

		if (!FireAction.material) {
			FireAction.material = new Material(ShaderLib.particles);
			var texture = ParticleSystemUtils.createFlareTexture();
			texture.generateMipmaps = true;
			FireAction.material.setTexture('DIFFUSE_MAP', texture);
			FireAction.material.blendState.blending = 'AdditiveBlending';
			FireAction.material.cullState.enabled = false;
			FireAction.material.depthState.write = false;
			FireAction.material.renderQueue = 2002;
		}

		var entityScale = entity.transformComponent.sync().worldTransform.scale;
		var scale = (entityScale.x + entityScale.y + entityScale.z) / 3;
		this.fireEntity = ParticleSystemUtils.createParticleSystemEntity(
			gooRunner.world,
			ParticleLib.getFire({
				scale: scale,
				startColor: this.startColor,
				endColor: this.endColor
			}),
			FireAction.material
		);
		this.fireEntity.meshRendererComponent.isPickable = false;
		this.fireEntity.meshRendererComponent.castShadows = false;
		this.fireEntity.meshRendererComponent.receiveShadows = false;
		this.fireEntity.name = '_ParticleSystemFire';
		entity.transformComponent.attachChild(this.fireEntity.transformComponent);

		this.fireEntity.addToWorld();
	};

	FireAction.prototype.cleanup = function (/*fsm*/) {
		if (this.fireEntity) {
			this.fireEntity.removeFromWorld();
			this.fireEntity = null;
		}
	};

	module.exports = FireAction;

/***/ },
/* 217 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function RemoveParticlesAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RemoveParticlesAction.prototype = Object.create(Action.prototype);
	RemoveParticlesAction.prototype.constructor = RemoveParticlesAction;

	RemoveParticlesAction.external = {
		key: 'Remove Particles',
		name: 'Remove Particles',
		type: 'fx',
		description: 'Removes any particle emitter attached to the entity.',
		parameters: [],
		transitions: []
	};

	RemoveParticlesAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.children().each(function (child) {
			if (child.name.indexOf('_ParticleSystem') !== -1 && child.hasComponent('ParticleComponent')) {
				child.removeFromWorld();
			}
		});
	};

	module.exports = RemoveParticlesAction;

/***/ },
/* 218 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function TogglePostFxAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TogglePostFxAction.prototype = Object.create(Action.prototype);
	TogglePostFxAction.prototype.constructor = TogglePostFxAction;

	TogglePostFxAction.external = {
		key: 'Toggle Post FX',
		name: 'Toggle Post FX',
		type: 'fx',
		description: 'Enabled/disables post fx globally.',
		parameters: [{
			name: 'Set Post FX state',
			key: 'enabled',
			type: 'boolean',
			description: 'Set Post FX on/off.',
			'default': true
		}],
		transitions: []
	};

	TogglePostFxAction.prototype.enter = function (fsm) {
		var renderSystem = fsm.getWorld().gooRunner.renderSystem;
		if (renderSystem) {
			renderSystem.enableComposers(this.enabled);
		}
	};

	module.exports = TogglePostFxAction;

/***/ },
/* 219 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var GameUtils = __webpack_require__(220);

	function ToggleFullscreenAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ToggleFullscreenAction.prototype = Object.create(Action.prototype);
	ToggleFullscreenAction.prototype.constructor = ToggleFullscreenAction;

	ToggleFullscreenAction.external = {
		key: 'Toggle Fullscreen',
		name: 'Toggle Fullscreen',
		type: 'display',
		description: 'Toggles fullscreen on/off. Note that in most browsers this must be initiated by a user gesture. For example, click or touch.',
		parameters: [],
		transitions: []
	};

	ToggleFullscreenAction.prototype.enter = function (/*fsm*/) {
		GameUtils.toggleFullScreen();
	};

	module.exports = ToggleFullscreenAction;

/***/ },
/* 220 */,
/* 221 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var PromiseUtil = __webpack_require__(222);

	function PlaySoundAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	PlaySoundAction.prototype = Object.create(Action.prototype);
	PlaySoundAction.prototype.constructor = PlaySoundAction;

	PlaySoundAction.external = {
		key: 'Play Sound',
		name: 'Play Sound',
		type: 'sound',
		description: 'Plays a sound. NOTE: On iOS devices, you need to play the first sound inside a touchend event (for example using the MouseUpAction).',
		canTransition: true,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound to play.'
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the sound finishes playing.'
		}]
	};

	var labels = {
		complete: 'On Sound End'
	};

	PlaySoundAction.getTransitionLabel = function (transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	PlaySoundAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('SoundComponent')) { return; }

		var sound = entity.soundComponent.getSoundById(this.sound);
		if (!sound) { return; }

		var endPromise;
		try {
			endPromise = sound.play();
		} catch (e) {
			console.warn('Could not play sound: ' + e);
			endPromise = PromiseUtil.resolve();
		}

		endPromise.then(function () {
			fsm.send(this.transitions.complete);
		}.bind(this));
	};

	module.exports = PlaySoundAction;

/***/ },
/* 222 */,
/* 223 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function PauseSoundAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	PauseSoundAction.prototype = Object.create(Action.prototype);
	PauseSoundAction.prototype.constructor = PauseSoundAction;

	PauseSoundAction.external = {
		key: 'Pause Sound',
		name: 'Pause Sound',
		type: 'sound',
		description: 'Pauses a sound.',
		canTransition: false,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound to pause.'
		}],
		transitions: []
	};

	PauseSoundAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('SoundComponent')) {
			var sound = entity.soundComponent.getSoundById(this.sound);
			if (sound) {
				sound.pause();
			}
		}
	};

	module.exports = PauseSoundAction;

/***/ },
/* 224 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function StopSoundAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	StopSoundAction.prototype = Object.create(Action.prototype);
	StopSoundAction.prototype.constructor = StopSoundAction;

	StopSoundAction.external = {
		key: 'Stop Sound',
		name: 'Stop Sound',
		type: 'sound',
		description: 'Stops a sound.',
		canTransition: false,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound to stop.'
		}],
		transitions: []
	};

	StopSoundAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('SoundComponent')) {
			var sound = entity.soundComponent.getSoundById(this.sound);
			if (sound) {
				sound.stop();
			}
		}
	};

	module.exports = StopSoundAction;

/***/ },
/* 225 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var PromiseUtil = __webpack_require__(222);

	function SoundFadeInAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SoundFadeInAction.prototype = Object.create(Action.prototype);
	SoundFadeInAction.prototype.constructor = SoundFadeInAction;

	SoundFadeInAction.external = {
		key: 'Sound Fade In',
		name: 'Sound Fade In',
		type: 'sound',
		description: 'Fades in a sound. NOTE: On iOS devices, you need to play the first sound inside a touchend event (for example using the MouseUpAction).',
		canTransition: true,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound to fade.'
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for the fading to complete.',
			'default': 1000
		}, {
			name: 'On Sound End',
			key: 'onSoundEnd',
			type: 'boolean',
			description: 'Whether to transition when the sound finishes playing, regardless of the specified transition time.',
			'default': false
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the time expires or when the sound finishes playing.'
		}]
	};

	var labels = {
		complete: 'On Sound Fade In Complete'
	};

	SoundFadeInAction.getTransitionLabel = function (transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	SoundFadeInAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('SoundComponent')) { return; }

		var sound = entity.soundComponent.getSoundById(this.sound);
		if (!sound) { return; }

		var endPromise;
		try {
			endPromise = sound.fadeIn(this.time / 1000);

			if (this.onSoundEnd) {
				endPromise = sound.play();
			}
		} catch (e) {
			console.warn('Could not play sound: ' + e);
			endPromise = PromiseUtil.resolve();
		}

		endPromise.then(function () {
			fsm.send(this.transitions.complete);
		}.bind(this));
	};

	module.exports = SoundFadeInAction;

/***/ },
/* 226 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function SoundFadeOutAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SoundFadeOutAction.prototype = Object.create(Action.prototype);
	SoundFadeOutAction.prototype.constructor = SoundFadeOutAction;

	SoundFadeOutAction.external = {
		key: 'Sound Fade Out',
		name: 'Sound Fade Out',
		type: 'sound',
		description: 'Fades out a sound and stops it.',
		canTransition: true,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound to fade out.'
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for the fading to complete.',
			'default': 1000
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the sound fade completes.'
		}]
	};

	var labels = {
		complete: 'On Sound Fade Out Complete'
	};

	SoundFadeOutAction.getTransitionLabel = function (transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	SoundFadeOutAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('SoundComponent')) {
			var sound = entity.soundComponent.getSoundById(this.sound);
			if (sound) {
				sound.fadeOut(this.time / 1000).then(function () {
					fsm.send(this.transitions.complete);
				}.bind(this));
			}
		}
	};

	module.exports = SoundFadeOutAction;

/***/ },
/* 227 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var PortalComponent = __webpack_require__(228);
	var PortalSystem = __webpack_require__(229);
	var Material = __webpack_require__(30);
	var ShaderLib = __webpack_require__(46);

	function SetRenderTargetAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetRenderTargetAction.prototype = Object.create(Action.prototype);
	SetRenderTargetAction.prototype.constructor = SetRenderTargetAction;

	SetRenderTargetAction.external = {
		key: 'Set Render Target',
		name: 'Set Render Target',
		type: 'texture',
		description: 'Renders what a camera sees on the current entity\'s texture.',
		parameters: [{
			name: 'Camera',
			key: 'cameraEntityRef',
			type: 'camera',
			description: 'Camera to use as source.',
			'default': null
		}],
		transitions: []
	};

	SetRenderTargetAction.prototype.ready = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var world = entity._world;
		if (!world.getSystem('PortalSystem')) {
			var renderSystem = world.getSystem('RenderSystem');
			var renderer = world.gooRunner.renderer;
			world.setSystem(new PortalSystem(renderer, renderSystem));
		}
	};

	SetRenderTargetAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var world = entity._world;

		var cameraEntity = world.entityManager.getEntityById(this.cameraEntityRef);

		if (!cameraEntity || !cameraEntity.cameraComponent || !cameraEntity.cameraComponent.camera) { return; }
		var camera = cameraEntity.cameraComponent.camera;

		var portalMaterial = new Material(ShaderLib.textured);

		if (!entity.meshRendererComponent) { return; }
		this.oldMaterials = entity.meshRendererComponent.materials;
		entity.meshRendererComponent.materials = [portalMaterial];

		var portalComponent = new PortalComponent(camera, 500, { preciseRecursion: true });
		entity.setComponent(portalComponent);
	};

	SetRenderTargetAction.prototype.cleanup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity) {
			if (this.oldMaterials && entity.meshRendererComponent) {
				entity.meshRendererComponent.materials = this.oldMaterials;
			}
			entity.clearComponent('portalComponent');
		}

		this.oldMaterials = null;

		// would remove the entire system, but the engine does not support that
	};

	module.exports = SetRenderTargetAction;

/***/ },
/* 228 */,
/* 229 */,
/* 230 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector2 = __webpack_require__(19);
	var Easing = __webpack_require__(173);

	function TweenTextureOffsetAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.fromOffset = new Vector2();
		this.toOffset = new Vector2();
		this.completed = false;
	}

	TweenTextureOffsetAction.prototype = Object.create(Action.prototype);
	TweenTextureOffsetAction.prototype.constructor = TweenTextureOffsetAction;

	TweenTextureOffsetAction.external = {
		key: 'Tween Texture Offset',
		name: 'Tween Texture Offset',
		type: 'texture',
		description: 'Smoothly changes the texture offset of the entity.',
		canTransition: true,
		parameters: [{
			name: 'X Offset',
			key: 'toX',
			type: 'float',
			description: 'X Offset.',
			'default': 1
		}, {
			name: 'Y Offset',
			key: 'toY',
			type: 'float',
			description: 'Y Offset.',
			'default': 1
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for this transition to complete.',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type.',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction.',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the transition completes.'
		}]
	};

	TweenTextureOffsetAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return transitionKey === 'complete' ? 'On UV Tween Complete' : undefined;
	};

	TweenTextureOffsetAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var meshRendererComponent = entity.meshRendererComponent;
		this.texture = null;
		if (!meshRendererComponent || meshRendererComponent.materials.length === 0) {
			return;
		}
		var material = meshRendererComponent.materials[0];
		this.texture = material.getTexture('DIFFUSE_MAP');
		if (!this.texture) {
			return;
		}

		this.fromOffset.set(this.texture.offset);
		this.toOffset.setDirect(this.toX, this.toY);
		if (this.relative) {
			this.toOffset.add(this.fromOffset);
		}

		this.startTime = fsm.getTime();
		this.completed = false;
	};

	TweenTextureOffsetAction.prototype.update = function (fsm) {
		if (this.completed) {
			return;
		}
		if (!this.texture) {
			return;
		}

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = Easing[this.easing1][this.easing2](t);

		this.texture.offset.set(this.fromOffset).lerp(this.toOffset, fT);

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};

	module.exports = TweenTextureOffsetAction;

/***/ },
/* 231 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function SetMaterialColorAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetMaterialColorAction.prototype = Object.create(Action.prototype);
	SetMaterialColorAction.prototype.constructor = SetMaterialColorAction;

	SetMaterialColorAction.external = {
		key: 'Set Material Color',
		name: 'Set Material Color',
		type: 'texture',
		description: 'Sets the color of a material.',
		parameters: [{
			name: 'Entity (optional)',
			key: 'entity',
			type: 'entity',
			description: 'Entity that has a material.'
		}, {
			name: 'Color type',
			key: 'type',
			type: 'string',
			control: 'dropdown',
			description: 'Color type.',
			'default': 'Diffuse',
			options: ['Diffuse', 'Emissive', 'Specular', 'Ambient']
		}, {
			name: 'Color',
			key: 'color',
			type: 'vec3',
			control: 'color',
			description: 'Color.',
			'default': [1, 1, 1]
		}],
		transitions: []
	};

	var MAPPING = {
		Diffuse: 'materialDiffuse',
		Emissive: 'materialEmissive',
		Specular: 'materialSpecular',
		Ambient: 'materialAmbient'
	};

	SetMaterialColorAction.prototype.enter = function (fsm) {
		var entity = (this.entity && fsm.getEntityById(this.entity.entityRef)) || fsm.getOwnerEntity();
		if (entity && entity.meshRendererComponent) {
			var material = entity.meshRendererComponent.materials[0];
			var typeName = MAPPING[this.type];
			material.uniforms[typeName] = material.uniforms[typeName] || [1, 1, 1, 1];
			var col = material.uniforms[typeName];
			col[0] = this.color[0];
			col[1] = this.color[1];
			col[2] = this.color[2];
		}
	};

	module.exports = SetMaterialColorAction;

/***/ },
/* 232 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector3 = __webpack_require__(8);
	var Easing = __webpack_require__(173);

	function TweenMaterialColorAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.fromColor = new Vector3();
		this.toColor = new Vector3();
		this.calc = new Vector3();
		this.completed = false;
	}

	TweenMaterialColorAction.prototype = Object.create(Action.prototype);
	TweenMaterialColorAction.prototype.constructor = TweenMaterialColorAction;

	TweenMaterialColorAction.external = {
		key: 'Tween Material Color',
		name: 'Tween Material Color',
		type: 'texture',
		description: 'Tweens the color of a material.',
		parameters: [{
			name: 'Entity (optional)',
			key: 'entity',
			type: 'entity',
			description: 'Entity that has a material.'
		}, {
			name: 'Color type',
			key: 'type',
			type: 'string',
			control: 'dropdown',
			description: 'Color type.',
			'default': 'Diffuse',
			options: ['Diffuse', 'Emissive', 'Specular', 'Ambient']
		}, {
			name: 'Color',
			key: 'color',
			type: 'vec3',
			control: 'color',
			description: 'Color.',
			'default': [1, 1, 1]
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			control: 'spinner',
			description: 'Time it takes for the transition to complete.',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type.',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction.',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the transition completes.'
		}]
	};

	var MAPPING = {
		Diffuse: 'materialDiffuse',
		Emissive: 'materialEmissive',
		Specular: 'materialSpecular',
		Ambient: 'materialAmbient'
	};

	TweenMaterialColorAction.getTransitionLabel = function (transitionKey, actionConfig){
		return transitionKey === 'complete' ? 'On Tween ' + (actionConfig.options.type || 'Color') + ' Complete' : undefined;
	};

	TweenMaterialColorAction.prototype.enter = function (fsm) {
		var entity = (this.entity && fsm.getEntityById(this.entity.entityRef)) || fsm.getOwnerEntity();
		var meshRendererComponent = entity.meshRendererComponent;
		if (!meshRendererComponent) {
			return;
		}

		this.startTime = fsm.getTime();

		this.material = meshRendererComponent.materials[0];
		this.typeName = MAPPING[this.type];
		this.materialColor = this.material.uniforms[this.typeName] = this.material.uniforms[this.typeName] || [1, 1, 1, 1];
		this.fromColor.setDirect(this.materialColor[0], this.materialColor[1], this.materialColor[2]);
		this.toColor.setDirect(this.color[0], this.color[1], this.color[2]);

		this.completed = false;
	};

	TweenMaterialColorAction.prototype.update = function (fsm) {
		if (this.completed) {
			return;
		}
		var entity = (this.entity && fsm.getEntityById(this.entity.entityRef)) || fsm.getOwnerEntity();
		var meshRendererComponent = entity.meshRendererComponent;
		if (!meshRendererComponent) {
			return;
		}

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = Easing[this.easing1][this.easing2](t);

		this.calc.set(this.fromColor).lerp(this.toColor, fT);
		this.materialColor[0] = this.calc.x;
		this.materialColor[1] = this.calc.y;
		this.materialColor[2] = this.calc.z;

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};

	module.exports = TweenMaterialColorAction;

/***/ },
/* 233 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function LogMessageAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	LogMessageAction.prototype = Object.create(Action.prototype);
	LogMessageAction.prototype.constructor = LogMessageAction;

	LogMessageAction.external = {
		key: 'Log Message',
		name: 'Log Message',
		description: 'Prints a message in the debug console of your browser.',
		parameters: [{
			name: 'Message',
			key: 'message',
			type: 'string',
			description: 'Message to print.',
			'default': 'hello'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': false
		}],
		transitions: []
	};

	LogMessageAction.prototype.enter = function (/*fsm*/) {
		if (!this.everyFrame) {
			console.log(this.message);
		}
	};

	LogMessageAction.prototype.update = function (/*fsm*/) {
		if (this.everyFrame) {
			console.log(this.message);
		}
	};

	module.exports = LogMessageAction;

/***/ },
/* 234 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Easing = __webpack_require__(173);
	var MathUtils = __webpack_require__(9);

	function TweenOpacityAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this.completed = false;
	}

	TweenOpacityAction.prototype = Object.create(Action.prototype);
	TweenOpacityAction.prototype.constructor = TweenOpacityAction;

	TweenOpacityAction.external = {
		key: 'Tween Opacity',
		name: 'Tween Material Opacity',
		type: 'texture',
		description: 'Tweens the opacity of a material.',
		parameters: [{
			name: 'Opacity',
			key: 'to',
			type: 'float',
			control: 'spinner',
			description: 'Opacity.',
			'default': 1
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			control: 'spinner',
			description: 'Time it takes for the transition to complete.',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type.',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction.',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the transition completes.'
		}]
	};

	TweenOpacityAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return transitionKey === 'complete' ? 'On Tween Opacity Complete' : undefined;
	};

	TweenOpacityAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var meshRendererComponent = entity.meshRendererComponent;
		if (!meshRendererComponent) {
			return;
		}

		this.startTime = fsm.getTime();

		this.material = meshRendererComponent.materials[0];
		if (this.material.blendState.blending === 'NoBlending') {
			this.material.blendState.blending = 'TransparencyBlending';
		}
		if (this.material.renderQueue < 2000) {
			this.material.renderQueue = 2000;
		}
		if (this.material.uniforms.opacity === undefined) {
			this.material.uniforms.opacity = 1;
		}

		this.uniforms = this.material.uniforms;
		this.from = this.uniforms.opacity;
		this.completed = false;
	};

	TweenOpacityAction.prototype.update = function (fsm) {
		if (this.completed) {
			return;
		}
		var entity = fsm.getOwnerEntity();
		var meshRendererComponent = entity.meshRendererComponent;
		if (!meshRendererComponent) {
			return;
		}

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = Easing[this.easing1][this.easing2](t);

		this.uniforms.opacity = MathUtils.lerp(fT, this.from, this.to);

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};

	module.exports = TweenOpacityAction;

/***/ },
/* 235 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function HtmlAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	HtmlAction.prototype = Object.create(Action.prototype);
	HtmlAction.prototype.constructor = HtmlAction;

	HtmlAction.external = {
		key: 'HTMLPick',
		name: 'HTMLPick',
		type: 'controls',
		description: 'Listens for a picking event and performs a transition. Can only be used on HTML entities.',
		canTransition: true,
		parameters: [], // but not farther than some value
		transitions: [{
			key: 'pick',
			description: 'State to transition to when the HTML entity is picked.'
		}]
	};

	HtmlAction.getTransitionLabel = function (/*transitionKey, actionConfig*/){
		return 'On HTML Pick';
	};

	HtmlAction.prototype.enter = function (fsm) {
		var ownerEntity = fsm.getOwnerEntity();
		if (ownerEntity.htmlComponent) {
			this.eventListener = function () {
				fsm.send(this.transitions.pick);
			}.bind(this);
			this.domElement = ownerEntity.htmlComponent.domElement;
			this.domElement.addEventListener('click', this.eventListener);
		}
	};

	HtmlAction.prototype.exit = function (fsm) {
		var ownerEntity = fsm.getOwnerEntity();
		if (ownerEntity.htmlComponent && this.domElement) {
			this.domElement.removeEventListener('click', this.eventListener);
		}
	};

	module.exports = HtmlAction;

/***/ },
/* 236 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function CopyJointTransformAction() {
		Action.apply(this, arguments);
		this.everyFrame = true;
	}

	CopyJointTransformAction.prototype = Object.create(Action.prototype);
	CopyJointTransformAction.prototype.constructor = CopyJointTransformAction;

	CopyJointTransformAction.external = {
		key: 'Copy Joint Transform',
		name: 'Copy Joint Transform',
		type: 'animation',
		description: 'Copies a joint\'s transform from another entity, and applies it to this entity. This entity must be a child of an entity with an animation component.',
		parameters: [{
			name: 'Joint',
			key: 'jointIndex',
			type: 'int',
			control: 'jointSelector',
			'default': null,
			description: 'Joint transform to copy.'
		}],
		transitions: []
	};

	CopyJointTransformAction.prototype.update = function (fsm) {
		if (this.jointIndex === null) { return; }

		var entity = fsm.getOwnerEntity();
		var parent = entity.transformComponent.parent;
		if (!parent) { return; }

		parent = parent.entity;
		if (!parent.animationComponent || !parent.animationComponent._skeletonPose) { return; }
		var pose = parent.animationComponent._skeletonPose;
		var jointTransform = pose._globalTransforms[this.jointIndex];
		if (!jointTransform) { return; }

		entity.transformComponent.transform.matrix.copy(jointTransform.matrix);
		jointTransform.matrix.getTranslation(entity.transformComponent.transform.translation);
		jointTransform.matrix.getScale(entity.transformComponent.transform.scale);
		jointTransform.matrix.getRotation(entity.transformComponent.transform.rotation);
		updateWorldTransform(entity.transformComponent);
		entity.transformComponent.setUpdated();
	};

	function updateWorldTransform(transformComponent) {
		transformComponent.sync();
		var entity = transformComponent.entity;
		if (entity && entity.meshDataComponent && entity.meshRendererComponent) {
			entity.meshRendererComponent.updateBounds(
				entity.meshDataComponent.modelBound,
				transformComponent.sync().worldTransform
			);
		}

		for (var i = 0; i < transformComponent.children.length; i++) {
			updateWorldTransform(transformComponent.children[i]);
		}
	}

	module.exports = CopyJointTransformAction;

/***/ },
/* 237 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var SystemBus = __webpack_require__(44);

	function TriggerEnterAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this.entity = null;
	}

	TriggerEnterAction.prototype = Object.create(Action.prototype);
	TriggerEnterAction.prototype.constructor = TriggerEnterAction;

	TriggerEnterAction.external = {
		key: 'TriggerEnter',
		name: 'TriggerEnter',
		type: 'collision',
		description: 'Transitions when the trigger collider is entered. This action only works if the entity has a Collider Component.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'enter',
			description: 'State to transition to when enter occurs.'
		}]
	};

	TriggerEnterAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return transitionKey === 'enter' ? 'On Trigger Enter' : undefined;
	};

	TriggerEnterAction.prototype.enter = function (fsm) {
		this.entity = fsm.getOwnerEntity();
		var that = this;
		this.listener = function (triggerEnterEvent) {
			if (that.entity && triggerEnterEvent.entityA === that.entity || triggerEnterEvent.entityB === that.entity) {
				that.entity = null;
				// TODO: should this happen on postStep instead? Maybe the user will remove the entity here...
				fsm.send(that.transitions.enter);
			}
		};
		SystemBus.addListener('goo.physics.triggerEnter', this.listener);
	};

	TriggerEnterAction.prototype.exit = function (/*fsm*/) {
		SystemBus.removeListener('goo.physics.triggerEnter', this.listener);
		this.entity = null;
	};

	module.exports = TriggerEnterAction;

/***/ },
/* 238 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var SystemBus = __webpack_require__(44);

	function TriggerLeaveAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this.entity = null;
	}

	TriggerLeaveAction.prototype = Object.create(Action.prototype);
	TriggerLeaveAction.prototype.constructor = TriggerLeaveAction;

	TriggerLeaveAction.external = {
		key: 'TriggerLeave',
		name: 'TriggerLeave',
		type: 'collision',
		description: 'Transitions when a collider is leaving the entity trigger collider. This action only works if the entity has a Collider Component.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'leave',
			description: 'State to transition to when leave occurs.'
		}]
	};

	TriggerLeaveAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
		return transitionKey === 'leave' ? 'On Trigger Leave' : undefined;
	};

	TriggerLeaveAction.prototype.enter = function (fsm) {
		this.entity = fsm.getOwnerEntity();
		var that = this;
		this.listener = function (endContactEvent) {
			if (that.entity && endContactEvent.entityA === that.entity || endContactEvent.entityB === that.entity) {
				that.entity = null;
				// TODO: should this happen on postStep instead? Maybe the user will remove the entity here...
				fsm.send(that.transitions.leave);
			}
		};
		SystemBus.addListener('goo.physics.triggerExit', this.listener);
	};

	TriggerLeaveAction.prototype.exit = function (/*fsm*/) {
		SystemBus.removeListener('goo.physics.triggerExit', this.listener);
		this.entity = null;
	};

	module.exports = TriggerLeaveAction;

/***/ },
/* 239 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector3 = __webpack_require__(8);

	function ApplyImpulseAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ApplyImpulseAction.prototype = Object.create(Action.prototype);
	ApplyImpulseAction.prototype.constructor = ApplyImpulseAction;

	ApplyImpulseAction.external = {
		key: 'ApplyImpulse',
		name: 'Apply impulse on rigid body',
		type: 'physics',
		description: 'Apply an impulse to the attached rigid body.',
		canTransition: false,
		parameters: [{
			name: 'Impulse',
			key: 'impulse',
			type: 'position',
			description: 'Impulse to apply to the body.',
			'default': [0, 0, 0]
		}, {
			name: 'Apply point',
			key: 'point',
			type: 'position',
			description: 'Where on the body to apply the impulse, relative to the center of mass.',
			'default': [0, 0, 0]
		}, {
			name: 'Space',
			key: 'space',
			type: 'string',
			control: 'dropdown',
			description: 'The space where the impulse and apply point are defined.',
			'default': 'World',
			options: ['World', 'Local']
		}],
		transitions: []
	};

	var impulseVector = new Vector3();
	var applyPoint = new Vector3();
	ApplyImpulseAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity.rigidBodyComponent) { return; }

		impulseVector.setArray(this.impulse);
		applyPoint.setArray(this.point);
		if (this.space === 'World') {
			entity.rigidBodyComponent.applyImpulse(impulseVector, applyPoint);
		} else {
			entity.rigidBodyComponent.applyImpulseLocal(impulseVector, applyPoint);
		}
	};

	module.exports = ApplyImpulseAction;

/***/ },
/* 240 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector3 = __webpack_require__(8);
	var SystemBus = __webpack_require__(44);

	function ApplyForceAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ApplyForceAction.prototype = Object.create(Action.prototype);
	ApplyForceAction.prototype.constructor = ApplyForceAction;

	ApplyForceAction.external = {
		key: 'ApplyForce',
		name: 'Apply force on rigid body',
		type: 'physics',
		description: 'Apply a force to the attached rigid body.',
		canTransition: false,
		parameters: [{
			name: 'Force',
			key: 'force',
			type: 'position',
			description: 'Force to apply to the body.',
			'default': [0, 0, 0]
		}, {
			name: 'Apply point',
			key: 'point',
			type: 'position',
			description: 'Where on the body to apply the force, relative to the center of mass.',
			'default': [0, 0, 0]
		}, {
			name: 'Space',
			key: 'space',
			type: 'string',
			control: 'dropdown',
			description: 'The space where the force and apply point are defined.',
			'default': 'World',
			options: ['World', 'Local']
		}],
		transitions: []
	};

	var forceVector = new Vector3();
	var applyPoint = new Vector3();
	ApplyForceAction.prototype.enter = function (fsm) {
		SystemBus.addListener('goo.physics.substep', this.substepListener = function () {
			var entity = fsm.getOwnerEntity();
			if (!entity || !entity.rigidBodyComponent) { return; }

			forceVector.setArray(this.force);
			applyPoint.setArray(this.point);
			if (this.space === 'World') {
				entity.rigidBodyComponent.applyForce(forceVector, applyPoint);
			} else {
				entity.rigidBodyComponent.applyForceLocal(forceVector, applyPoint);
			}
		}.bind(this));
	};

	ApplyForceAction.prototype.exit = function () {
		SystemBus.removeListener('goo.physics.substep', this.substepListener);
	};

	module.exports = ApplyForceAction;

/***/ },
/* 241 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector3 = __webpack_require__(8);
	var SystemBus = __webpack_require__(44);

	function ApplyTorqueAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ApplyTorqueAction.prototype = Object.create(Action.prototype);
	ApplyTorqueAction.prototype.constructor = ApplyTorqueAction;

	ApplyTorqueAction.external = {
		key: 'ApplyTorque',
		name: 'Apply torque on rigid body',
		type: 'physics',
		description: 'Apply a torque to the attached rigid body.',
		canTransition: false,
		parameters: [{
			name: 'Torque',
			key: 'torque',
			type: 'position',
			description: 'Torque to apply to the body.',
			'default': [0, 0, 0]
		}, {
			name: 'Space',
			key: 'space',
			type: 'string',
			control: 'dropdown',
			description: 'Whether to apply the torque in local or world space.',
			'default': 'World',
			options: ['World', 'Local']
		}],
		transitions: []
	};

	var torqueVector = new Vector3();
	ApplyTorqueAction.prototype.enter = function (fsm) {
		SystemBus.addListener('goo.physics.substep', this.substepListener = function () {
			var entity = fsm.getOwnerEntity();
			if (!entity || !entity.rigidBodyComponent) { return; }

			torqueVector.setArray(this.torque);
			if (this.space === 'World') {
				entity.rigidBodyComponent.applyTorque(torqueVector);
			} else {
				entity.rigidBodyComponent.applyTorqueLocal(torqueVector);
			}
		}.bind(this));
	};

	ApplyTorqueAction.prototype.exit = function () {
		SystemBus.removeListener('goo.physics.substep', this.substepListener);
	};

	module.exports = ApplyTorqueAction;

/***/ },
/* 242 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector3 = __webpack_require__(8);

	function SetRigidBodyPositionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	SetRigidBodyPositionAction.prototype = Object.create(Action.prototype);
	SetRigidBodyPositionAction.prototype.constructor = SetRigidBodyPositionAction;

	SetRigidBodyPositionAction.external = {
		key: 'Set Rigid Body Position',
		name: 'Set Rigid Body Position',
		type: 'physics',
		description: 'Set the position of the rigid body.',
		canTransition: false,
		parameters: [{
			name: 'Position',
			key: 'position',
			type: 'position',
			description: 'Absolute world position to set.',
			'default': [0, 0, 0]
		}],
		transitions: []
	};

	var tmpVector = new Vector3();
	SetRigidBodyPositionAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.rigidBodyComponent) { return; }
		tmpVector.setArray(this.position);
		entity.rigidBodyComponent.setPosition(tmpVector);
	};

	module.exports = SetRigidBodyPositionAction;

/***/ },
/* 243 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Matrix3 = __webpack_require__(24);
	var Quaternion = __webpack_require__(23);
	var MathUtils = __webpack_require__(9);

	function SetRigidBodyRotationAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetRigidBodyRotationAction.prototype = Object.create(Action.prototype);
	SetRigidBodyRotationAction.prototype.constructor = SetRigidBodyRotationAction;

	SetRigidBodyRotationAction.external = {
		key: 'setRigidBodyRotation',
		name: 'Set Rigid Body Rotation',
		type: 'physics',
		canTransition: false,
		parameters: [{
			name: 'Rotation',
			key: 'rotation',
			type: 'vec3',
			description: 'Absolute rotation to set.',
			'default': [0, 0, 0]
		},{
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'Relative to the current rotation or absolute.',
			'default': false
		}],
		transitions: []
	};

	SetRigidBodyRotationAction.prototype.setRotation = (function () {
		var matrix = new Matrix3();
		var matrix2 = new Matrix3();
		var quaternion = new Quaternion();
		var quaternion2 = new Quaternion();
		var DEG_TO_RAD = MathUtils.DEG_TO_RAD;
		return function (fsm) {
			var entity = fsm.getOwnerEntity();
			if (entity && entity.rigidBodyComponent) {
				var rotation = this.rotation;
				matrix.fromAngles(
					rotation[0] * DEG_TO_RAD,
					rotation[1] * DEG_TO_RAD,
					rotation[2] * DEG_TO_RAD
				);

				if (this.relative) {
					entity.rigidBodyComponent.getQuaternion(quaternion2);
					matrix2.copyQuaternion(quaternion2);
					matrix.mul2(matrix2, matrix);
				}

				quaternion.fromRotationMatrix(matrix);
				entity.rigidBodyComponent.setQuaternion(quaternion);
			}
		};
	})();

	SetRigidBodyRotationAction.prototype.enter = function (fsm) {
		this.setRotation(fsm);
	};

	module.exports = SetRigidBodyRotationAction;

/***/ },
/* 244 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector3 = __webpack_require__(8);

	function SetRigidBodyVelocityAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	SetRigidBodyVelocityAction.prototype = Object.create(Action.prototype);
	SetRigidBodyVelocityAction.prototype.constructor = SetRigidBodyVelocityAction;

	SetRigidBodyVelocityAction.external = {
		key: 'Set Rigid Body Velocity',
		name: 'Set Rigid Body Velocity',
		type: 'physics',
		description: 'Set the linear velocity of the rigid body component.',
		canTransition: false,
		parameters: [{
			name: 'Velocity',
			key: 'velocity',
			type: 'position',
			description: 'Velocity to set.',
			'default': [0, 0, 0]
		}],
		transitions: []
	};

	var tmpVector = new Vector3();
	SetRigidBodyVelocityAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.rigidBodyComponent) { return; }
		tmpVector.setArray(this.velocity);
		entity.rigidBodyComponent.setVelocity(tmpVector);
	};

	module.exports = SetRigidBodyVelocityAction;

/***/ },
/* 245 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var Vector3 = __webpack_require__(8);

	function SetRigidBodyAngularVelocityAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	SetRigidBodyAngularVelocityAction.prototype = Object.create(Action.prototype);
	SetRigidBodyAngularVelocityAction.prototype.constructor = SetRigidBodyAngularVelocityAction;

	SetRigidBodyAngularVelocityAction.external = {
		key: 'Set Rigid Body Angular Velocity',
		name: 'Set Rigid Body Angular Velocity',
		type: 'physics',
		description: 'Set the angular velocity of the rigid body component.',
		canTransition: false,
		parameters: [{
			name: 'Angular velocity',
			key: 'velocity',
			type: 'position',
			description: 'Angular velocity to set.',
			'default': [0, 0, 0]
		}],
		transitions: []
	};

	var tmpVector = new Vector3();
	SetRigidBodyAngularVelocityAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.rigidBodyComponent) { return; }
		tmpVector.setArray(this.velocity);
		entity.rigidBodyComponent.setAngularVelocity(tmpVector);
	};

	module.exports = SetRigidBodyAngularVelocityAction;

/***/ },
/* 246 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function CompareCounterAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	CompareCounterAction.prototype = Object.create(Action.prototype);
	CompareCounterAction.prototype.constructor = CompareCounterAction;

	CompareCounterAction.external = {
		key: 'Compare Counter',
		name: 'Compare Counter',
		type: 'transitions',
		description: 'Compares a counter with a value.',
		canTransition: true,
		parameters: [{
			name: 'Name',
			key: 'name',
			type: 'string',
			description: 'Counter name.'
		}, {
			name: 'Value',
			key: 'value',
			type: 'float',
			description: 'Value to compare the counter with.',
			'default': 0
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: [{
			key: 'less',
			description: 'State to transition to if the counter is smaller than the specified value.'
		}, {
			key: 'equal',
			description: 'State to transition to if the counter is the same as the specified value.'
		}, {
			key: 'greater',
			description: 'State to transition to if the counter is greater than the specified value.'
		}]
	};

	var labels = {
		less: ' < X',
		equal: ' == X',
		greater: ' > X'
	};

	CompareCounterAction.getTransitionLabel = function (transitionKey, actionConfig){
		if (labels[transitionKey]) {
			return 'On ' + (actionConfig.options.name || 'Counter') + labels[transitionKey];
		}
	};

	CompareCounterAction.prototype.compare = function (fsm) {
		var value1 = fsm.getFsm().getVariable(this.name);
		// if (value1 === undefined) {
		// 	return;
		// }
		var value2 = +this.value;

		if (value1 > value2) {
			fsm.send(this.transitions.greater);
		} else if (value1 === value2) {
			fsm.send(this.transitions.equal);
		} else {
			fsm.send(this.transitions.less);
		}
	};

	CompareCounterAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.compare(fsm);
		}
	};

	CompareCounterAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.compare(fsm);
		}
	};

	module.exports = CompareCounterAction;

/***/ },
/* 247 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function CompareCountersAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	CompareCountersAction.prototype = Object.create(Action.prototype);
	CompareCountersAction.prototype.constructor = CompareCountersAction;

	CompareCountersAction.external = {
		key: 'Compare 2 Counters',
		name: 'Compare 2 Counters',
		type: 'transitions',
		description: 'Compares the value of 2 counters.',
		canTransition: true,
		parameters: [{
			name: 'First counter',
			key: 'name1',
			type: 'string',
			description: 'First counter name.'
		}, {
			name: 'Second counter',
			key: 'name2',
			type: 'string',
			description: 'Second counter name.'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: [{
			key: 'less',
			description: 'State to transition to if the first counter is smaller than the second counter.'
		}, {
			key: 'equal',
			description: 'State to transition to if the first counter is the same as the second counter.'
		}, {
			key: 'greater',
			description: 'State to transition to if the first counter is greater than the second counter.'
		}]
	};

	var operators = {
		less: '<',
		equal: '==',
		greater: '>'
	};

	CompareCountersAction.getTransitionLabel = function (transitionKey, actionConfig){
		if (operators[transitionKey]) {
			return 'On ' + (actionConfig.options.name1 || 'Counter1') + ' ' + operators[transitionKey] + ' ' + (actionConfig.options.name2 || 'counter2');
		}
	};

	CompareCountersAction.prototype.compare = function (fsm) {
		var value1 = +fsm.getFsm().getVariable(this.name1);
		var value2 = +fsm.getFsm().getVariable(this.name2);

		if (value1 === undefined || value2 === undefined) {
			return;
		}

		if (value1 > value2) {
			fsm.send(this.transitions.greater);
		} else if (value1 === value2) {
			fsm.send(this.transitions.equal);
		} else {
			fsm.send(this.transitions.less);
		}
	};

	CompareCountersAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.compare(fsm);
		}
	};

	CompareCountersAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.compare(fsm);
		}
	};

	module.exports = CompareCountersAction;

/***/ },
/* 248 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function SetCounterAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetCounterAction.prototype = Object.create(Action.prototype);
	SetCounterAction.prototype.constructor = SetCounterAction;

	SetCounterAction.external = {
		key: 'Set Counter',
		name: 'Set Counter',
		type: 'transitions',
		description: 'Sets a counter to a value.',
		parameters: [{
			name: 'Name',
			key: 'name',
			type: 'string',
			description: 'Counter name.'
		}, {
			name: 'Value',
			key: 'value',
			type: 'float',
			description: 'Value to set the counter to.',
			'default': 0
		}],
		transitions: []
	};

	SetCounterAction.prototype.enter = function (fsm) {
		fsm.getFsm().defineVariable(this.name, +this.value);
	};

	SetCounterAction.prototype.cleanup = function (fsm) {
		fsm.getFsm().removeVariable(this.name);
	};

	module.exports = SetCounterAction;

/***/ },
/* 249 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function IncrementCounterAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	IncrementCounterAction.prototype = Object.create(Action.prototype);
	IncrementCounterAction.prototype.constructor = IncrementCounterAction;

	IncrementCounterAction.external = {
		key: 'Increment Counter',
		name: 'Increment Counter',
		type: 'transitions',
		description: 'Increments a counter with a value.',
		parameters: [{
			name: 'Name',
			key: 'name',
			type: 'string',
			description: 'Counter name.'
		}, {
			name: 'Increment',
			key: 'increment',
			type: 'float',
			description: 'Value to increment the counter with.',
			'default': 1
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	IncrementCounterAction.prototype.incrementCounter = function (fsm) {
		var increment = +this.increment;

		if (fsm.getFsm().vars[this.name] === undefined) {
			fsm.getFsm().defineVariable(this.name, increment);
			return;
		}

		fsm.getFsm().applyOnVariable(this.name, function (oldValue) {
			return oldValue + increment;
		});
	};

	IncrementCounterAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.incrementCounter(fsm);
		}
	};

	IncrementCounterAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.incrementCounter(fsm);
		}
	};

	IncrementCounterAction.prototype.cleanup = function (fsm) {
		fsm.getFsm().removeVariable(this.name);
	};

	module.exports = IncrementCounterAction;

/***/ },
/* 250 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function MuteAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	MuteAction.prototype = Object.create(Action.prototype);
	MuteAction.prototype.constructor = MuteAction;

	MuteAction.external = {
		key: 'Mute sounds',
		name: 'Mute sounds',
		type: 'sound',
		description: 'Mute all sounds globally.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	MuteAction.prototype.enter = function (fsm) {
		var world = fsm.getWorld();
		if (!world) { return; }

		var soundSystem = world.getSystem('SoundSystem');
		if (soundSystem) {
			soundSystem.mute();
		}
	};

	module.exports = MuteAction;

/***/ },
/* 251 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function UnmuteAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	UnmuteAction.prototype = Object.create(Action.prototype);
	UnmuteAction.prototype.constructor = UnmuteAction;

	UnmuteAction.external = {
		key: 'Unmute sounds',
		name: 'Unmute sounds',
		type: 'sound',
		description: 'Unmute all sounds globally.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	UnmuteAction.prototype.enter = function (fsm) {
		var world = fsm.getWorld();
		if (!world) { return; }

		var soundSystem = world.getSystem('SoundSystem');
		if (soundSystem) {
			soundSystem.unmute();
		}
	};

	module.exports = UnmuteAction;

/***/ },
/* 252 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function ToggleMuteAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	ToggleMuteAction.prototype = Object.create(Action.prototype);
	ToggleMuteAction.prototype.constructor = ToggleMuteAction;

	ToggleMuteAction.external = {
		key: 'Toggle mute sounds',
		name: 'Toggle mute sounds',
		type: 'sound',
		description: 'Toggles mute of all sounds globally.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	ToggleMuteAction.prototype.enter = function (fsm) {
		var world = fsm.getWorld();
		if (!world) { return; }

		var soundSystem = world.getSystem('SoundSystem');
		if (soundSystem) {
			if (soundSystem.muted) {
				soundSystem.unmute();
			} else {
				soundSystem.mute();
			}
		}
	};

	module.exports = ToggleMuteAction;

/***/ },
/* 253 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function StartTimelineAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	StartTimelineAction.prototype = Object.create(Action.prototype);
	StartTimelineAction.prototype.constructor = StartTimelineAction;

	StartTimelineAction.external = {
		key: 'Start Timeline',
		name: 'Start Timeline',
		type: 'timeline',
		description: 'Starts or resumes the timeline.',
		canTransition: true,
		parameters: [],
		transitions: []
	};

	StartTimelineAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('TimelineComponent')) { return; }

		entity.timelineComponent.start();
	};

	module.exports = StartTimelineAction;

/***/ },
/* 254 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function PauseTimelineAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	PauseTimelineAction.prototype = Object.create(Action.prototype);
	PauseTimelineAction.prototype.constructor = PauseTimelineAction;

	PauseTimelineAction.external = {
		key: 'Pause Timeline',
		name: 'Pause Timeline',
		type: 'timeline',
		description: 'Pauses the timeline.',
		canTransition: true,
		parameters: [],
		transitions: []
	};

	PauseTimelineAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('TimelineComponent')) { return; }

		entity.timelineComponent.pause();
	};

	module.exports = PauseTimelineAction;

/***/ },
/* 255 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function StopTimelineAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	StopTimelineAction.prototype = Object.create(Action.prototype);
	StopTimelineAction.prototype.constructor = StopTimelineAction;

	StopTimelineAction.external = {
		key: 'Stop Timeline',
		name: 'Stop Timeline',
		type: 'timeline',
		description: 'Stops the timeline.',
		canTransition: true,
		parameters: [],
		transitions: []
	};

	StopTimelineAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('TimelineComponent')) { return; }

		entity.timelineComponent.stop();
	};

	module.exports = StopTimelineAction;

/***/ },
/* 256 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function SetTimelineTimeAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetTimelineTimeAction.prototype = Object.create(Action.prototype);
	SetTimelineTimeAction.prototype.constructor = SetTimelineTimeAction;

	SetTimelineTimeAction.external = {
		key: 'Set Timeline Time',
		name: 'Set Timeline Time',
		type: 'timeline',
		description: 'Sets the current time of the timeline.',
		canTransition: true,
		parameters: [{
			name: 'Time',
			key: 'time',
			type: 'float',
			description: 'Timeline time to set.',
			'default': 0
		}],
		transitions: []
	};

	SetTimelineTimeAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('TimelineComponent')) { return; }

		entity.timelineComponent.setTime(this.time);
	};

	module.exports = SetTimelineTimeAction;

/***/ },
/* 257 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function SetHtmlTextAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetHtmlTextAction.prototype = Object.create(Action.prototype);
	SetHtmlTextAction.prototype.constructor = SetHtmlTextAction;

	SetHtmlTextAction.external = {
		key: 'Set Html Text',
		name: 'Set Html Text',
		type: 'fx',
		description: 'Sets the contents of an HTML element.',
		parameters: [{
			name: 'Entity (optional)',
			key: 'entity',
			type: 'entity',
			description: 'Entity that has an HTML component.'
		}, {
			name: 'Html element selector',
			key: 'selector',
			type: 'string',
			description: 'Element selector to set text on.',
			'default': 'p'
		}, {
			name: 'Content',
			key: 'content',
			type: 'string',
			description: 'Content to set.',
			'default': 'Hello'
		}, {
			name: 'Allow HTML',
			key: 'html',
			type: 'boolean',
			description: 'Set to true if the content contains HTML. This will make the action use .innerHTML instead of .innerText.',
			'default': false
		}],
		transitions: []
	};

	SetHtmlTextAction.prototype.enter = function (fsm) {
		var entity = (this.entity && fsm.getEntityById(this.entity.entityRef)) || fsm.getOwnerEntity();
		if (entity && entity.htmlComponent && this.selector.length > 0) {
			var elements = entity.htmlComponent.domElement.querySelectorAll(this.selector);
			for (var i=0; i<elements.length; i++) {
				var element = elements[i];
				if (this.html) {
					element.innerHTML = this.content;
				} else {
					element.innerText = this.content;
				}
			}
		}
	};

	module.exports = SetHtmlTextAction;

/***/ },
/* 258 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function SpriteAnimationAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this.completed = false;
	}
	SpriteAnimationAction.prototype = Object.create(Action.prototype);
	SpriteAnimationAction.prototype.constructor = SpriteAnimationAction;

	SpriteAnimationAction.external = {
		key: 'spriteAnimation',
		name: 'Sprite Animation action',
		type: 'texture',
		description: 'Animates a texture spritesheet over time.',
		canTransition: false,
		parameters: [{
			name: 'Tiling',
			key: 'tiling',
			type: 'vec2',
			description: 'The number of sprites in X and Y directions.',
			'default': [8, 8]
		}, {
			name: 'Start tile',
			key: 'startTile',
			type: 'int',
			description: 'Initial tile for the animation. 0 is the first one and numTiles-1 is the last one.',
			'default': 0
		}, {
			name: 'End tile',
			key: 'endTile',
			type: 'int',
			description: 'End tile for the animation. Set to -1 to indicate the last tile.',
			'default': -1
		}, {
			name: 'Animation time',
			key: 'animationTime',
			type: 'float',
			min: 1e-6,
			description: 'The time it should take for the animation to cycle through all the tiles once.',
			'default': 1
		}, {
			name: 'Loops',
			key: 'loops',
			type: 'int',
			description: 'The number times to loop through the tiles before the animation is complete. Set to -1 to animate indefinitely.',
			min: -1,
			'default': -1
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the animation completes.'
		}]
	};

	SpriteAnimationAction.getTransitionLabel = function (/*transitionKey, actionConfig*/) {
		return 'Sprite Animation complete';
	};

	SpriteAnimationAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var meshRendererComponent = entity.meshRendererComponent;
		this.texture = null;
		if (!meshRendererComponent || meshRendererComponent.materials.length === 0) {
			return;
		}
		var material = meshRendererComponent.materials[0];
		this.texture = material.getTexture('DIFFUSE_MAP');
		if (!this.texture) {
			return;
		}
		this.startTime = fsm.getTime();
		this.completed = false;

		this.texture.repeat.setDirect(1 / this.tiling[0], 1 / this.tiling[1]);
	};

	SpriteAnimationAction.prototype.update = function (fsm) {
		if (!this.texture || this.completed) {
			return;
		}

		var time = fsm.getTime() - this.startTime;
		var numTiles = this.tiling[0] * this.tiling[1];
		var endTile = this.endTile;

		// endTile === -1 means the last tile
		if (endTile === -1) {
			endTile = numTiles;
		} else {
			endTile++;
		}

		var t = time / this.animationTime;
		var loop = Math.floor(t);
		t %= 1;

		if (loop >= this.loops && this.loops !== -1) {
			this.completed = true;
			fsm.send(this.transitions.complete);
			return;
		}

		var numViewTiles = endTile - this.startTile;
		var timeOffset = this.startTile / numTiles;
		t *= numViewTiles / numTiles;
		t += timeOffset;

		var tileX = Math.floor(this.tiling[0] * this.tiling[1] * t % this.tiling[1]);
		var tileY = Math.floor((this.tiling[1] * t) % this.tiling[1]);

		this.texture.offset.setDirect(tileX, tileY).mul(this.texture.repeat);
		this.texture.offset.y = -1 / this.tiling[1] - this.texture.offset.y + 1;
	};

	SpriteAnimationAction.prototype.exit = function (/*fsm*/) {};

	module.exports = SpriteAnimationAction;


/***/ },
/* 259 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function PauseParticleSystemAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	PauseParticleSystemAction.prototype = Object.create(Action.prototype);
	PauseParticleSystemAction.prototype.constructor = PauseParticleSystemAction;

	PauseParticleSystemAction.external = {
		key: 'pauseParticleSystem',
		name: 'Pause Particle System',
		type: 'misc',
		description: 'Pauses the particle system on the entity.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	PauseParticleSystemAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.particleSystemComponent) { return; }
		entity.particleSystemComponent.pause();
	};

	module.exports = PauseParticleSystemAction;

/***/ },
/* 260 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function StopParticleSystemAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	StopParticleSystemAction.prototype = Object.create(Action.prototype);
	StopParticleSystemAction.prototype.constructor = StopParticleSystemAction;

	StopParticleSystemAction.external = {
		key: 'stopParticleSystem',
		name: 'Stop Particle System',
		type: 'misc',
		description: 'Stops the particle system on the entity.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	StopParticleSystemAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.particleSystemComponent) { return; }
		entity.particleSystemComponent.stop();
	};

	module.exports = StopParticleSystemAction;

/***/ },
/* 261 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function StartParticleSystemAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	StartParticleSystemAction.prototype = Object.create(Action.prototype);
	StartParticleSystemAction.prototype.constructor = StartParticleSystemAction;

	StartParticleSystemAction.external = {
		key: 'startParticleSystem',
		name: 'Start Particle System',
		type: 'misc',
		description: 'Starts / plays the particle system on the entity.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	StartParticleSystemAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.particleSystemComponent) { return; }
		entity.particleSystemComponent.play();
	};

	module.exports = StartParticleSystemAction;

/***/ },
/* 262 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var FsmUtils = __webpack_require__(152);

	function AddPositionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	AddPositionAction.prototype = Object.create(Action.prototype);
	AddPositionAction.prototype.constructor = AddPositionAction;

	AddPositionAction.external = {
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Entity to move.'
		}, {
			name: 'Amount X',
			key: 'amountX',
			type: 'float',
			description: 'Amount to move on the X axis.',
			'default': 0
		}, {
			name: 'Amount Y',
			key: 'amountY',
			type: 'float',
			description: 'Amount to move on the Y axis.',
			'default': 0
		}, {
			name: 'Amount Z',
			key: 'amountZ',
			type: 'float',
			description: 'Amount to move on the Z axis.',
			'default': 0
		}, {
			name: 'Speed',
			key: 'speed',
			type: 'float',
			description: 'Speed to multiply.',
			'default': 1
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	AddPositionAction.prototype.addPosition = function (fsm) {
		if (this.entity) {
			var tpf = fsm.getTpf();

			var dx = FsmUtils.getValue(this.amountX, fsm);
			var dy = FsmUtils.getValue(this.amountY, fsm);
			var dz = FsmUtils.getValue(this.amountZ, fsm);

			this.entity.transformComponent.transform.translation.addDirect(
				dx * this.speed * tpf,
				dy * this.speed * tpf,
				dz * this.speed * tpf
			);

			this.entity.transformComponent.setUpdated();
		}
	};

	AddPositionAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.addPosition(fsm);
		}
	};

	AddPositionAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.addPosition(fsm);
		}
	};

	module.exports = AddPositionAction;


/***/ },
/* 263 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var FsmUtils = __webpack_require__(152);

	function AddVariableAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	AddVariableAction.prototype = Object.create(Action.prototype);
	AddVariableAction.prototype.constructor = AddVariableAction;

	AddVariableAction.external = {
		key: 'Add Variable',
		name: 'Add Variable',
		type: 'variables',
		description: '',
		parameters: [{
			name: 'Variable',
			key: 'variable',
			type: 'identifier'
		}, {
			name: 'Amount',
			key: 'amount',
			type: 'float'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': false
		}],
		transitions: []
	};

	AddVariableAction.prototype.add = function (fsm) {
		fsm.applyOnVariable(this.variable, function (v) {
			return v + FsmUtils.getValue(this.amount, fsm);
		}.bind(this));
	};

	AddVariableAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.add(fsm);
		}
	};

	AddVariableAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.add(fsm);
		}
	};

	module.exports = AddVariableAction;


/***/ },
/* 264 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function GetPositionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	GetPositionAction.prototype = Object.create(Action.prototype);
	GetPositionAction.prototype.constructor = GetPositionAction;

	GetPositionAction.prototype.configure = function (settings) {
		this.everyFrame = settings.everyFrame !== false;
		this.entity = settings.entity || null;
		this.variableX = settings.variableX || null;
		this.variableY = settings.variableY || null;
		this.variableZ = settings.variableZ || null;
	};

	GetPositionAction.external = {
		parameters: [{
			name: 'VariableX',
			key: 'variableX',
			type: 'identifier'
		}, {
			name: 'VariableY',
			key: 'variableY',
			type: 'identifier'
		}, {
			name: 'VariableZ',
			key: 'variableZ',
			type: 'identifier'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	GetPositionAction.prototype.update = function (fsm) {
		var translation = this.entity.transformComponent.transform.translation;
		if (this.entity !== null) {
			if (this.variableX) {  // !== undefined
				fsm.applyOnVariable(this.variableX, function () {
					return translation.x;
				});
			}
			if (this.variableY) {
				fsm.applyOnVariable(this.variableY, function () {
					return translation.y;
				});
			}
			if (this.variableZ) {
				fsm.applyOnVariable(this.variableZ, function () {
					return translation.z;
				});
			}
		}
	};

	module.exports = GetPositionAction;

/***/ },
/* 265 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var FsmUtils = __webpack_require__(152);

	function MultiplyVariableAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MultiplyVariableAction.prototype = Object.create(Action.prototype);
	MultiplyVariableAction.prototype.constructor = MultiplyVariableAction;

	MultiplyVariableAction.external = {
		key: 'Multiply Variable',
		name: 'Multiply Variable',
		type: 'variables',
		description: '',
		parameters: [{
			name: 'Variable',
			key: 'variable',
			type: 'identifier'
		}, {
			name: 'Amount',
			key: 'amount',
			type: 'float'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': false
		}],
		transitions: []
	};

	MultiplyVariableAction.prototype.update = function (fsm) {
		fsm.applyOnVariable(this.variable, function (v) {
			return v * FsmUtils.getValue(this.amount, fsm);
		}.bind(this));
	};

	module.exports = MultiplyVariableAction;

/***/ },
/* 266 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var FsmUtils = __webpack_require__(152);

	function NumberCompareAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	NumberCompareAction.prototype = Object.create(Action.prototype);
	NumberCompareAction.prototype.constructor = NumberCompareAction;

	NumberCompareAction.prototype.configure = function (settings) {
		this.everyFrame = settings.everyFrame !== false;
		this.leftHand = settings.leftHand || 0;
		this.rightHand = settings.rightHand || 0;
		this.tolerance = settings.tolerance || 0.0001;
		this.lessThanEvent = { channel: settings.transitions.less };
		this.equalEvent = { channel: settings.transitions.equal };
		this.greaterThanEvent = { channel: settings.transitions.greater };
	};

	NumberCompareAction.external = {
		parameters: [{
			name: 'Left hand value',
			key: 'leftHand',
			type: 'float'
		}, {
			name: 'Right hand value',
			key: 'rightHand',
			type: 'float'
		}, {
			name: 'Tolerance',
			key: 'tolerance',
			type: 'float',
			'default': 0.001
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: [{
			key: 'less',
			description: 'Event fired if left hand argument is smaller than right hand argument.'
		}, {
			key: 'equal',
			description: 'Event fired if both sides are approximately equal.'
		}, {
			key: 'greater',
			description: 'Event fired if left hand argument is greater than right hand argument.'
		}]
	};

	var labels = {
		less: 'On X < Y',
		equal: 'On X == Y',
		greater: 'On X > Y'
	};

	NumberCompareAction.getTransitionLabel = function (transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	NumberCompareAction.prototype.compare = function (fsm) {
		var leftHand = FsmUtils.getValue(this.leftHand, fsm);
		var rightHand = FsmUtils.getValue(this.rightHand, fsm);
		var diff = rightHand - leftHand;

		if (Math.abs(diff) <= this.tolerance) {
			if (this.equalEvent.channel) { fsm.send(this.equalEvent.channel); }
		} else if (diff > 0) {
			if (this.lessThanEvent.channel) { fsm.send(this.lessThanEvent.channel); }
		} else {
			if (this.greaterThanEvent.channel) { fsm.send(this.greaterThanEvent.channel); }
		}
	};

	NumberCompareAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.compare(fsm);
		}
	};

	NumberCompareAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.compare(fsm);
		}
	};

	module.exports = NumberCompareAction;

/***/ },
/* 267 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);

	function SetLightRangeAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetLightRangeAction.prototype = Object.create(Action.prototype);
	SetLightRangeAction.prototype.constructor = SetLightRangeAction;

	SetLightRangeAction.prototype.configure = function (settings) {
		this.everyFrame = !!settings.everyFrame;
		this.entity = settings.entity || null;
		this.range = settings.range || 100;
	};

	SetLightRangeAction.external = {
		key: 'Set Light Range',
		name: 'Set Light Range',
		description: 'Sets the range of a light.',
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Light entity.'
		}, {
			name: 'Range',
			key: 'range',
			type: 'real',
			description: 'Light range.',
			'default': 100,
			min: 0
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	SetLightRangeAction.prototype.enter = function (/*fsm*/) {
		var entity = this.entity;
		if (entity &&
			entity.lightComponent &&
			entity.lightComponent.light) {
			entity.lightComponent.light.range = this.range;
		}
	};

	module.exports = SetLightRangeAction;

/***/ },
/* 268 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var FsmUtils = __webpack_require__(152);

	function SetPositionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetPositionAction.prototype = Object.create(Action.prototype);
	SetPositionAction.prototype.constructor = SetPositionAction;

	SetPositionAction.prototype.configure = function (settings) {
		this.everyFrame = !!settings.everyFrame;
		this.entity = settings.entity || null;
		this.amountX = settings.amountX || 0;
		this.amountY = settings.amountY || 0;
		this.amountZ = settings.amountZ || 0;
	};

	SetPositionAction.external = {
		key: 'Set Position',
		name: 'Set Position',
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Entity to move.'
		}, {
			name: 'Amount X',
			key: 'amountX',
			type: 'float',
			description: 'Position on the X axis.',
			'default': 0
		}, {
			name: 'Amount Y',
			key: 'amountY',
			type: 'float',
			description: 'Position on the Y axis.',
			'default': 0
		}, {
			name: 'Amount Z',
			key: 'amountZ',
			type: 'float',
			description: 'Position on the Z axis.',
			'default': 0
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	SetPositionAction.prototype.update = function (fsm) {
		if (this.entity !== null) {
			this.entity.transformComponent.transform.translation.setDirect(
				FsmUtils.getValue(this.amountX, fsm),
				FsmUtils.getValue(this.amountY, fsm),
				FsmUtils.getValue(this.amountZ, fsm)
			);
			this.entity.transformComponent.setUpdated();
		}
	};

	module.exports = SetPositionAction;

/***/ },
/* 269 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var FsmUtils = __webpack_require__(152);

	function SetRotationAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetRotationAction.prototype = Object.create(Action.prototype);
	SetRotationAction.prototype.constructor = SetRotationAction;

	SetRotationAction.prototype.configure = function (settings) {
		this.everyFrame = !!settings.everyFrame;
		this.entity = settings.entity || null;
		this.amountX = settings.amountX || 0;
		this.amountY = settings.amountY || 0;
		this.amountZ = settings.amountZ || 0;
	};

	SetRotationAction.external = {
		name: 'Set Rotation',
		key: 'Set Rotation',
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Entity to move.'
		}, {
			name: 'Amount X',
			key: 'amountX',
			type: 'float',
			description: 'Amount to rotate on the X axis.',
			'default': 0
		}, {
			name: 'Amount Y',
			key: 'amountY',
			type: 'float',
			description: 'Amount to rotate on the Y axis.',
			'default': 0
		}, {
			name: 'Amount Z',
			key: 'amountZ',
			type: 'float',
			description: 'Amount to rotate on the Z axis.',
			'default': 0
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	SetRotationAction.prototype.setRotation = function (fsm) {
		if (this.entity !== null) {
			this.entity.transformComponent.transform.setRotationXYZ(
				FsmUtils.getValue(this.amountX, fsm),
				FsmUtils.getValue(this.amountY, fsm),
				FsmUtils.getValue(this.amountZ, fsm)
			);
			this.entity.transformComponent.setUpdated();
		}
	};

	SetRotationAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.setRotation(fsm);
		}
	};

	SetRotationAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.setRotation(fsm);
		}
	};

	module.exports = SetRotationAction;

/***/ },
/* 270 */
/***/ function(module, exports, __webpack_require__) {

	var Action = __webpack_require__(151);
	var FsmUtils = __webpack_require__(152);

	function SetVariableAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetVariableAction.prototype = Object.create(Action.prototype);
	SetVariableAction.prototype.constructor = SetVariableAction;

	SetVariableAction.external = {
		key: 'Set Variable',
		name: 'Set Variable',
		type: 'variables',
		description: '',
		parameters: [{
			name: 'Variable name',
			key: 'variable',
			type: 'identifier'
		}, {
			name: 'Value',
			key: 'amount',
			type: 'float'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': false
		}],
		transitions: []
	};

	SetVariableAction.prototype.enter = function (fsm) {
		if (this.variable) {
			fsm.applyOnVariable(this.variable, function () {
				return FsmUtils.getValue(this.amount, fsm);
			}.bind(this));
		}
	};

	module.exports = SetVariableAction;

/***/ },
/* 271 */
/***/ function(module, exports, __webpack_require__) {

	var FsmUtils = __webpack_require__(152);

	module.exports = FsmUtils;

/***/ },
/* 272 */
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(20);
	var ArrayUtils = __webpack_require__(86);
	var SystemBus = __webpack_require__(44);

	/**
	 * StateMachineComponent
	 * @private
	 */
	function StateMachineComponent() {
		Component.apply(this, arguments);

		this.type = 'StateMachineComponent';

		this._machines = [];
		this._machinesById = {};
		this.entity = null;
		this.vars = {};
		this.system = null;
		this.time = 0;
		this.entered = false;

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
		machine.parent = this;
		machine.setRefs(this);
		this._machines.push(machine);
		this._machinesById[machine.id] = machine;
	};

	StateMachineComponent.prototype.removeMachine = function (machine) {
		machine.recursiveRemove();
		ArrayUtils.remove(this._machines, machine);
		delete this._machinesById[machine.id];
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
		return this._machinesById[id] || null;
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

	module.exports = StateMachineComponent;


/***/ },
/* 273 */
/***/ function(module, exports, __webpack_require__) {

	var System = __webpack_require__(42);

	/**
	 * Processes all entities with a FSM component
	 * @private
	 */
	function StateMachineSystem(engine) {
		System.call(this, 'StateMachineSystem', ['StateMachineComponent']);

		this.engine = engine;
		this.passive = false;
		this.paused = false;

		/**
		 * Current time, in seconds.
		 * @type {number}
		 */
		this.time = 0;

		this.evalProxy = {
			// Add things that are useful from user scripts
			test: function () {
				console.log('test');
			}
		};

		// actions triggered by this system typically need to run after all other systems do their job
		this.priority = 1000;

		// Input handling
		var buttonNames = ['Left', 'Middle', 'Right'];
		this._inputStates = new Set();
		this._listeners = {
			keydown: function (event) {
				this._inputStates.add(event.which);
			}.bind(this),
			keyup: function (event) {
				this._inputStates.delete(event.which);
			}.bind(this),
			mousedown: function (event) {
				this._inputStates.add(buttonNames[event.button]);
			}.bind(this),
			mouseup: function (event) {
				this._inputStates.delete(buttonNames[event.button]);
			}.bind(this)
		};
	}

	StateMachineSystem.prototype = Object.create(System.prototype);

	StateMachineSystem.prototype.getInputState = function (key) {
		return this._inputStates.has(key);
	};

	StateMachineSystem.prototype.process = function (entities, tpf) {
		this.time += tpf;

		// Enter unentered components
		for (var i = 0; i < entities.length; i++) {
			var component = entities[i].stateMachineComponent;
			if (!component.entered) {
				// component.init(); // why was this done?
				component.doEnter();
				component.entered = true;
			}
		}

		for (var i = 0; i < entities.length; i++) {
			var component = entities[i].stateMachineComponent;
			component.update(tpf);
		}
	};

	StateMachineSystem.prototype.inserted = function (entity) {
		var component = entity.stateMachineComponent;

		component.entity = entity;
		component.system = this;
		component.init();
	};

	/**
	 * Resumes updating the entities
	 */
	StateMachineSystem.prototype.play = function () {
		this.passive = false;
		if (!this.paused) {
			// Un-enter entered components
			var entities = this._activeEntities;
			for (var i = 0; i < entities.length; i++) {
				var component = entities[i].stateMachineComponent;
				component.entered = false;
			}

			for (var key in this._listeners) {
				document.addEventListener(key, this._listeners[key]);
			}
			this._inputStates.clear();
		}
		this.paused = false;
	};

	/**
	 * Stops updating the entities
	 */
	StateMachineSystem.prototype.pause = function () {
		this.passive = true;
		this.paused = true;
	};

	/**
	 * Resumes updating the entities; an alias for `.play`
	 */
	StateMachineSystem.prototype.resume = StateMachineSystem.prototype.play;

	/**
	 * Stop updating entities and resets the state machines to their initial state
	 */
	StateMachineSystem.prototype.stop = function () {
		this.passive = true;
		this.paused = false;

		for (var i = 0; i < this._activeEntities.length; i++) {
			var component = this._activeEntities[i].stateMachineComponent;
			component.kill();
			component.cleanup();
		}
		this.time = 0;

		for (var key in this._listeners) {
			document.removeEventListener(key, this._listeners[key]);
		}
	};

	module.exports = StateMachineSystem;

/***/ },
/* 274 */
/***/ function(module, exports, __webpack_require__) {

	var ComponentHandler = __webpack_require__(88);
	var StateMachineComponent = __webpack_require__(272);
	var RSVP = __webpack_require__(55);
	var ObjectUtils = __webpack_require__(6);

	/**
	 * For handling loading of state machine components
	 * @param {World} world The goo world
	 * @param {Function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {Function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @extends ComponentHandler
	 * @hidden
	 */
	function StateMachineComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'StateMachineComponent';
	}

	StateMachineComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	StateMachineComponentHandler.prototype.constructor = StateMachineComponentHandler;
	ComponentHandler._registerClass('stateMachine', StateMachineComponentHandler);

	/**
	 * Create statemachine component
	 * @returns {StateMachineComponent} the created component object
	 * @hidden
	 */
	StateMachineComponentHandler.prototype._create = function () {
		return new StateMachineComponent();
	};

	StateMachineComponentHandler.prototype._remove = function (entity) {
		var component = entity.stateMachineComponent;
		if (component) {
			for (var i = component._machines.length - 1; i >= 0; i--) {
				var machine = component._machines[i];
				machine.cleanup();
				component.removeMachine(machine);
			}

			component.cleanup();
		}

		entity.clearComponent(this._type);
	};

	/**
	 * Update engine statemachine component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	StateMachineComponentHandler.prototype.update = function (entity, config, options) {
		var that = this;
		options = options || {};
		options.reload = true;
		options.instantiate = true;

		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			var promises = [];
			ObjectUtils.forEach(config.machines, function (machineConfig) {
				promises.push(that._load(machineConfig.machineRef, options));
			}, null, 'sortValue');

			return RSVP.all(promises).then(function (machines) {
				// Adding new machines
				for (var i = 0; i < machines.length; i++) {
					if (component._machines.indexOf(machines[i]) === -1) {
						component.addMachine(machines[i]);
					}
				}
				// Removing old machines
				for (var i = component._machines.length - 1; i >= 0; i--) {
					if (machines.indexOf(component._machines[i]) === -1) {
						component.removeMachine(component._machines[i]);
					}
				}
				return component;
			});
		});
	};

	module.exports = StateMachineComponentHandler;

/***/ },
/* 275 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(274);
	__webpack_require__(146);

/***/ }
]);

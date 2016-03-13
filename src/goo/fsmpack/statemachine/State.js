var ArrayUtils = require('../../util/ArrayUtils');
var SystemBus = require('../../entities/SystemBus');



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
		SystemBus.emit('goo.fsm.update', {
			entityId: this._fsm && this._fsm.entity ? this._fsm.entity.id : '',
			machineName: this.parent ? this.parent.name : '',
			stateId: this.uuid,
			stateName: this.name
		});

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
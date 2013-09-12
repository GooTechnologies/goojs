define(['goo/util/ArrayUtil'
],
/** @lends */
function (
	ArrayUtil
) {
	"use strict";

	function State(uuid) {
		this.uuid = uuid;
		this._fsm = null;
		this._actions = [];
		this._machines = [];
		this.vars = {};

		this.transitionTarget = null;

		this.proxy = {
			getTpf: function () {
				return this._fsm.entity.world.tpf;
			}.bind(this),
			getState: function () {
				return this;
			}.bind(this),
			getFsm: function () {
				return this._fsm;
			}.bind(this),
			getOwnerEntity: function () {
				return this._fsm.entity;
			}.bind(this),
			send: function (channels, data) {
				/* might change */
				if (typeof channels === 'string' && channels === 'transition') {
					this.requestTransition(data);
				} else {
					this._fsm._bus.emit(channels, data);
				}
			}.bind(this),
			addListener: function (channelName, callback) {
				this._fsm._bus.addListener(channelName, callback);
			}.bind(this),
			removeListener: function (channelName, callback) {
				this._fsm._bus.removeListener(channelName, callback);
			}.bind(this)
		};
	}

	State.prototype.setRefs = function(parentFSM) {
		this._fsm = parentFSM;
		for (var i = 0; i < this._machines.length; i++) {
			var machine = this._machines[i];
			machine.setRefs(parentFSM);
		}
	};

	State.prototype.requestTransition = function(target) {
		this.transitionTarget = target;
	};

	State.prototype.update = function() {
		// do on update of self
		for (var i = 0; i < this._actions.length; i++) {
			if (this._actions[i].onUpdate) {
				this._actions[i].onUpdate(this.proxy);
				if(this.transitionTarget) {
					var tmp = this.transitionTarget;
					this.transitionTarget = null;
					return tmp;
				}
			}
		}

		var jump;
		// propagate on update
		for (var i = 0; i < this._machines.length; i++) {
			var machine = this._machines[i];
			jump = machine.update();
			if(jump) { return jump; }
		}
	};

	State.prototype.reset = function() {
		for (var i = 0; i < this._machines.length; i++) {
			this._machines[i].reset();
		}
	};

	State.prototype.kill = function() {
		for (var i = 0; i < this._machines.length; i++) {
			this._machines[i].kill();
		}
		for (var i = 0; i < this._actions.length; i++) {
			if (this._actions[i].onExit) {
				this._actions[i].onExit(this.proxy);
			}
		}
	};

	State.prototype.enter = function() {
		// on enter of self
		for (var i = 0; i < this._actions.length; i++) {
			if (this._actions[i].onEnter) {
				this._actions[i].onEnter(this.proxy);
			}
		}

		// propagate on enter
		for (var i = 0; i < this._machines.length; i++) {
			this._machines[i].enter();
		}
	};

	State.prototype.addAction = function (action) {
		if (action.onCreate) {
			action.onCreate(this.proxy);
		}
		this._actions.push(action);
	};

	State.prototype.removeAction = function (action) {
		if (action.onDestroy) {
			action.onDestroy(this.proxy);
		}

		ArrayUtil.remove(this._actions, action);
	};

	State.prototype.addMachine = function(machine) {
		machine._fsm = this._fsm;
		this._machines.push(machine);
	};

	return State;
});
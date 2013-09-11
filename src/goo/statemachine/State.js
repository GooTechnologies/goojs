define(['goo/util/ArrayUtil'
],
/** @lends */
function (
	ArrayUtil
) {
	"use strict";

	function State(uuid) {
		this.uuid = uuid;
		this.actions = [];
		this.machines = [];
		this.vars = {};
	}

	State.prototype.update = function() {
		var jumpUp;

		// do on update of self
		for (var i = 0; i < this.actions.length; i++) {
			jumpUp = this.actions[i].onUpdate(this);
			if(jumpUp) { return jumpUp; }
		}

		// propagate on update
		for (var i = 0; i < this.machines.length; i++) {
			var machine = this.machines[i];
			jumpUp = machine.update();
			if(jumpUp) { return jumpUp; }
		}
	};

	State.prototype.reset = function() {
		for (var i = 0; i < this.machines.length; i++) {
			this.machines[i].reset();
		}
	};

	State.prototype.kill = function() {
		for (var i = 0; i < this.machines.length; i++) {
			this.machines[i].kill();
		}
		for (var i = 0; i < this.actions.length; i++) {
			if (this.actions[i].onExit) {
				this.actions[i].onExit(this);
			}
		}
	};

	State.prototype.enter = function() {
		// on enter of self
		for (var i = 0; i < this.actions.length; i++) {
			if (this.actions[i].onEnter) {
				this.actions[i].onEnter(this);
			}
		}

		// propagate on enter
		for (var i = 0; i < this.machines.length; i++) {
			this.machines[i].enter();
		}
	};

	State.prototype.addAction = function (action) {
		if (action.onCreate) {
			action.onCreate(this);
		}
		this.actions.push(action);
	};

	State.prototype.removeAction = function (action) {
		if (action.onDestroy) {
			action.onDestroy(this);
		}

		ArrayUtil.remove(this.actions, action);
	};

	return State;
});
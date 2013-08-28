define([
	'goo/statemachine/Util'
],
/** @lends */
function (
	Util
) {
	"use strict";

	/**
	 * @class 
	 */
	function State(fsm, name, id) {
		this.fsm = fsm;
		this.id = id === undefined ? Util.guid() : id;
		this.name = name || this.id;

		this.actions = [];
		this.transitions = {};
		this.subscriptions = {};
		this.everyFrame = false;
		this.events = {};

		var that = this;
		this.stateObj = {
			_onEnter: function () {
				// setTimeout(function () {
					console.log('State _onEnter: ', that.name, '('+that.id+')');
					this.emit('_onEnter', that);

					// execute actions
					var currentState = that.fsm.state;
					for (var i = 0; i < that.actions.length; i++) {
						if (that.actions[i].create) {
							that.actions[i].create(this, that);
							if (that.fsm.state !== currentState) {
								// exit if state changed
								break;
							}
						}
					}

					// send done event
					that.fsm.handle('done', {
						state: that,
						isLocal: true
					});

				// }.bind(this), 0);
			},
			_onExit: function () {
				console.log('State _onExit: ', that.name, '('+that.id+')');
				this.emit('_onExit', that);

				// execute actions
				for (var i = 0; i < that.actions.length; i++) {
					if (that.actions[i].destroy) {
						that.actions[i].destroy(this, that);
					}
				}
			}
		};
	}

	State.prototype.update = function (tpf) {
		for (var i = 0; i < this.actions.length; i++) {
			var action = this.actions[i];
			if (action.update) {
				action.update(this.fsm, this, tpf);
			} else if (action.everyFrame && action.create) {
				action.create(this.fsm, this, tpf);
			}
		}

		// Every frame?
		this.fsm.handle('done', {
			state: this,
			isLocal: true
		});
	};

	State.prototype.addAction = function (action) {
		if (action.init) {
			action.init(this.fsm, this);
		}
		this.actions.push(action);
	};

	State.prototype.addTransition = function (source, target) {
		if (target instanceof State) {
			target = target.id;
		}

		this.subscriptions[source] = postal.subscribe({
			channel: 'statefsm.events',
			topic: source,
			callback: function(data, envelope) {
				var state = data.state;
				var isLocal = data.isLocal;

				if (isLocal === false || state.id === this.id) {
					this.fsm.addToQueue(target);
					
					// if (this.fsm.state !== target) {
					// 	this.fsm.transition(target);
					// } else {
					// 	this.fsm.handle('_onExit');
					// 	this.fsm.handle('_onEnter');
					// }
				}
			}.bind(this)
		});

		this.transitions[source] = target;
	};

	State.prototype.removeTransition = function (source) {
		if (this.subscriptions[source]) {
			this.subscriptions[source].unsubscribe();
			this.subscriptions[source] = undefined;
		}

		// this.fsm.off(source);

		// this.transitions[source] = undefined;
		delete this.transitions[source];
	};

	State.prototype.addEvent = function (name, isLocal) {
		isLocal = isLocal === undefined ? true : isLocal;
		var id = name=='done'?'done':Util.guid();

/*
		if (this.stateObj[name]) {
			return false;
		}
*/

		var that = this;
		this.stateObj[id] = function () {
			this.emit(id, {
				state: that,
				isLocal: isLocal
			});
		};

		this.events[id] = {
			id: id,
			name: name
		}
		
		return id;
	};

	State.prototype.removeEvent = function (id) {
		// this.stateObj[name] = undefined;
		delete this.stateObj[id];
		this.removeTransition(id);
		delete this.events[id];
	};

	State.prototype.getEvents = function () {
		var events = [];
		for (var eventId in this.events) {
			events.push(eventId);
		}
		return events;
	};

	return State;
});
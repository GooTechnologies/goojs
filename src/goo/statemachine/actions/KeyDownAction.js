define([
	'goo/statemachine/actions/Action',
	'goo/statemachine/FSMUtil'
],
/** @lends */
function(
	Action,
	FSMUtil
) {
	"use strict";

	function KeyDownAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.updated = false;
		this.eventListener = function(event) {
			if (event.which === this.key) {
				this.updated = true;
			}
		}.bind(this);
	}

	KeyDownAction.prototype = Object.create(Action.prototype);

	KeyDownAction.prototype.configure = function(settings) {
		this.everyFrame = true;
		this.eventToEmit = { channel: settings.transitions.keydown };
		var key = settings.key || 'a';
		this.key = (typeof key === 'number') ? key : FSMUtil.getKey(key);
		this.keyVariable = settings.keyVariable;
	};

	KeyDownAction.external = {
		parameters: [{
			name: 'Key',
			key: 'key',
			type: 'key',
			description: 'Key to listen for'
		}, {
			name: 'Key variable',
			key: 'keyVariable',
			type: 'identifier',
			description: 'Variable to store the key in'
		}],

		transitions: [{
			name: 'keydown',
			description: 'Fired on key down'
		}]
	};

	KeyDownAction.prototype._setup = function() {
		document.addEventListener('keydown', this.eventListener);
	};

	KeyDownAction.prototype._run = function(fsm) {
		if (this.updated) {
			this.updated = false;
			if (this.eventToEmit) {
				fsm.send(this.eventToEmit.channel, this.eventToEmit.data);
			}
		}
	};

	KeyDownAction.prototype.exit = function() {
		document.removeEventListener('keydown', this.eventListener);
	};

	return KeyDownAction;
});
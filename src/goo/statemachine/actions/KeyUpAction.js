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

	function KeyUpAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.updated = false;
		this.eventListener = function(event) {
			if (!this.key || event.which === this.key) {
				this.updated = true;
				if (this.keyVariable) {
					//fsm.applyToVariable(this.keyVariable, function() { return event.which; });
				}
			}
		}.bind(this);
	}

	KeyUpAction.prototype = Object.create(Action.prototype);

	KeyUpAction.prototype.configure = function(settings) {
		this.everyFrame = true;
		this.eventToEmit = { channel: settings.transitions.keyup };
		var key = settings.key || 'a';
		this.key = (typeof key === 'number') ? key : FSMUtil.keys[key];
		this.keyVariable = settings.keyVariable;
	};

	KeyUpAction.external = {
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
			name: 'keyup',
			description: 'Fired on key up'
		}]
	};

	KeyUpAction.prototype._setup = function() {
		document.addEventListener('keyup', this.eventListener);
	};

	KeyUpAction.prototype._run = function(fsm) {
		if (this.updated) {
			this.updated = false;
			if (this.eventToEmit) {
				fsm.send(this.eventToEmit.channel, this.eventToEmit.data);
			}
		}
	};

	KeyUpAction.prototype.exit = function() {
		document.removeEventListener('keyup', this.eventListener);
	};

	return KeyUpAction;
});
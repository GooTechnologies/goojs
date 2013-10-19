define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function KeyUpAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.eventListener = function(event) {
			if (!this.key || event.which === +this.key) {
				this.updated = true;
			}
		}.bind(this);
	}

	KeyUpAction.prototype = Object.create(Action.prototype);
	KeyUpAction.prototype.constructor = KeyUpAction;

	KeyUpAction.external = {
		parameters: [{
			name: 'Key',
			key: 'key',
			type: 'key',
			description: 'Key to listen for'
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
			fsm.send(this.transitions.keyup);
		}
	};

	KeyUpAction.prototype.exit = function() {
		document.removeEventListener('keyup', this.eventListener);
	};

	return KeyUpAction;
});
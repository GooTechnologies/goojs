define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function KeyDownAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.eventListener = function(event) {
			if (event.which === +this.key) {
				this.updated = true;
			}
		}.bind(this);
	}

	KeyDownAction.prototype = Object.create(Action.prototype);
	KeyDownAction.prototype.constructor = KeyDownAction;

	KeyDownAction.external = {
		description: 'Listens for a key press and performs a transition',
		canTransition: true,
		parameters: [{
			name: 'Key',
			key: 'key',
			type: 'key',
			description: 'Key to listen for'
		}],
		transitions: [{
			key: 'keydown',
			name: 'Key down',
			description: 'Fired on key down'
		}]
	};

	KeyDownAction.prototype._setup = function() {
		document.addEventListener('keydown', this.eventListener);
	};

	KeyDownAction.prototype._run = function(fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.keydown);
		}
	};

	KeyDownAction.prototype.exit = function() {
		document.removeEventListener('keydown', this.eventListener);
	};

	return KeyDownAction;
});
define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function KeyPressedAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.keyIsDown = false;
		this.eventListenerDown = function(event) {
			if (event.which === +this.key) {
				this.keyIsDown = true;
			}
		}.bind(this);
		this.eventListenerUp = function(event) {
			if (event.which === +this.key) {
				document.removeEventListener('keydown', this.eventListenerUp);
				this.keyIsDown = false;
			}
		}.bind(this);
	}

	KeyPressedAction.prototype = Object.create(Action.prototype);
	KeyPressedAction.prototype.constructor = KeyPressedAction;

	KeyPressedAction.external = {
		name: 'Key Pressed',
		description: 'Listens for a key press and performs a transition. Works over transition boundaries.',
		canTransition: true,
		parameters: [{
			name: 'Key',
			key: 'key',
			type: 'key',
			description: 'Key to listen for'
		}],
		transitions: [{
			key: 'keydown',
			name: 'Key pressed',
			description: 'State to transition to when the key is pressed'
		}]
	};

	KeyPressedAction.prototype._setup = function() {
		document.addEventListener('keydown', this.eventListenerDown);
		document.addEventListener('keyup', this.eventListenerUp);
	};

	KeyPressedAction.prototype._run = function(fsm) {
		if (this.keyIsDown) {
			fsm.send(this.transitions.keydown);
		}
	};

	KeyPressedAction.prototype.exit = function() {
		document.removeEventListener('keydown', this.eventListenerDown);
	};

	return KeyPressedAction;
});
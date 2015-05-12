define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/fsmpack/statemachine/FSMUtils'
], function (
	Action,
	FSMUtils
) {
	'use strict';

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
		name: 'Key Up',
		type: 'controls',
		description: 'Listens for a key release and performs a transition',
		canTransition: true,
		parameters: [{
			name: 'Key',
			key: 'key',
			type: 'string',
			control: 'key',
			description: 'Key to listen for',
			'default': 'A'
		}],
		transitions: [{
			key: 'keyup',
			name: 'Key up',
			description: 'State to transition to when the key is released'
		}]
	};

	KeyUpAction.prototype.configure = function (settings) {
		this.key = settings.key ? FSMUtils.getKey(settings.key) : null;
		this.transitions = { keyup: settings.transitions.keyup };
	};

	KeyUpAction.prototype._setup = function () {
		document.addEventListener('keyup', this.eventListener);
	};

	KeyUpAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.keyup);
		}
	};

	KeyUpAction.prototype.exit = function () {
		document.removeEventListener('keyup', this.eventListener);
	};

	return KeyUpAction;
});
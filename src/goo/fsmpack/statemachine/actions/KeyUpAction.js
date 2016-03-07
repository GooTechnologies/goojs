define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/fsmpack/statemachine/FsmUtils'
], function (
	Action,
	FsmUtils
) {
	'use strict';

	function KeyUpAction(/*id, settings*/) {
		Action.apply(this, arguments);
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

	KeyUpAction.getTransitionLabel = function(transitionKey, actionConfig){
		return 'Key ' + (actionConfig.options.key || '') + ' up';
	};

	KeyUpAction.prototype.configure = function (settings) {
		this.key = settings.key ? FsmUtils.getKey(settings.key) : null;
		this.transitions = { keyup: settings.transitions.keyup };
	};

	KeyUpAction.prototype.enter = function (fsm) {
		this.eventListener = function (event) {
			if (!this.key || event.which === +this.key) {
				fsm.send(this.transitions.keyup);
			}
		}.bind(this);
		document.addEventListener('keyup', this.eventListener);
	};

	KeyUpAction.prototype.exit = function () {
		document.removeEventListener('keyup', this.eventListener);
	};

	return KeyUpAction;
});
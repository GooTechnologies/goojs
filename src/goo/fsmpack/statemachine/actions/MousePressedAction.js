define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/fsmpack/statemachine/FsmUtils'
], function (
	Action,
	FsmUtils
) {
	'use strict';

	function MousePressedAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MousePressedAction.prototype = Object.create(Action.prototype);
	MousePressedAction.prototype.constructor = MousePressedAction;

	MousePressedAction.external = {
		name: 'Mouse Button Pressed',
		type: 'controls',
		description: 'Listens for a key press event and performs a transition. Works over transition boundaries.',
		canTransition: true,
		parameters: [{
			name: 'Key',
			key: 'key',
			type: 'string',
			control: 'key',
			description: 'Key to listen for'
		}],
		transitions: [{
			key: 'keydown',
			name: 'Key pressed',
			description: 'State to transition to when the key is pressed'
		}]
	};

	MousePressedAction.prototype.configure = function (settings) {
		this.key = settings.key ? FsmUtils.getKey(settings.key) : null;
		this.transitions = { keydown: settings.transitions.keydown };
	};

	MousePressedAction.prototype.enter = function (fsm) {
		if (fsm.getInputState(this.key)) {
			fsm.send(this.transitions.keydown);
		}
	};

	MousePressedAction.prototype.update = function (fsm) {
		if (fsm.getInputState(this.key)) {
			fsm.send(this.transitions.keydown);
		}
	};

	return MousePressedAction;
});
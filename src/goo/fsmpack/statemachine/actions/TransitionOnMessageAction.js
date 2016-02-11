define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/entities/SystemBus'
], function (
	Action,
	SystemBus
) {
	'use strict';

	function TransitionOnMessageAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.eventListener = function (/*data*/) {
			this.updated = true;
		}.bind(this);
	}

	TransitionOnMessageAction.prototype = Object.create(Action.prototype);
	TransitionOnMessageAction.prototype.constructor = TransitionOnMessageAction;

	TransitionOnMessageAction.external = {
		key: 'Transition on Message',
		name: 'Listen',
		type: 'transitions',
		description: 'Performs a transition on receiving a system bus message (a ping) on a specific channel',
		canTransition: true,
		parameters: [{
			name: 'Message channel',
			key: 'channel',
			type: 'string',
			description: 'Channel to listen to',
			'default': ''
		}],
		transitions: [{
			key: 'transition',
			name: 'On Message',
			description: 'State to transition to'
		}]
	};

	TransitionOnMessageAction.prototype.enter = function (/*fsm*/) {
		SystemBus.addListener(this.channel, this.eventListener, false);
	};

	TransitionOnMessageAction.prototype.update = function (fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.transition);
		}
	};

	TransitionOnMessageAction.prototype.exit = function (/*fsm*/) {
		SystemBus.removeListener(this.channel, this.eventListener);
	};

	return TransitionOnMessageAction;
});
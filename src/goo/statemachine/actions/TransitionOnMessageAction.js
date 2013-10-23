define([
	'goo/statemachine/actions/Action',
	'goo/entities/SystemBus'
],
/** @lends */
function(
	Action,
	SystemBus
) {
	"use strict";

	function TransitionOnMessageAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.eventListener = function(/*event*/) {
			this.updated = true;
		}.bind(this);
	}

	TransitionOnMessageAction.prototype = Object.create(Action.prototype);
	TransitionOnMessageAction.prototype.constructor = TransitionOnMessageAction;

	TransitionOnMessageAction.external = {
		name: 'Transition on Message',
		description: 'Performs a transition on receiving a message',
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
			name: 'To',
			description: 'State to transition to'
		}]
	};

	TransitionOnMessageAction.prototype._setup = function(/*fsm*/) {
		SystemBus.addListener(this.channel, this.handler);
	};

	TransitionOnMessageAction.prototype._run = function(fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.transition);
		}
	};

	TransitionOnMessageAction.prototype.exit = function(/*fsm*/) {
		SystemBus.removeListener(this.handler, this.eventListener);
	};

	return TransitionOnMessageAction;
});
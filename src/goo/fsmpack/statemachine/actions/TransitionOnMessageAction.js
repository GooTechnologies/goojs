var Action = require('../../../fsmpack/statemachine/actions/Action');
var SystemBus = require('../../../entities/SystemBus');

	'use strict';

	function TransitionOnMessageAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TransitionOnMessageAction.prototype = Object.create(Action.prototype);
	TransitionOnMessageAction.prototype.constructor = TransitionOnMessageAction;

	TransitionOnMessageAction.external = {
		key: 'Transition on Message',
		name: 'Listen',
		type: 'transitions',
		description: 'Performs a transition on receiving a system bus message (event) on a specific channel.',
		canTransition: true,
		parameters: [{
			name: 'Message channel',
			key: 'channel',
			type: 'string',
			description: 'Channel to listen to.',
			'default': ''
		}],
		transitions: [{
			key: 'transition',
			description: 'State to transition to.'
		}]
	};

	TransitionOnMessageAction.getTransitionLabel = function(transitionKey, actionConfig){
		var label = actionConfig.options.channel ? '"' + actionConfig.options.channel + '"' : '';
		return transitionKey === 'transition' ? 'On ' + label + ' event' : 'On Message';
	};

	TransitionOnMessageAction.prototype.enter = function (fsm) {
		this.eventListener = function (/*data*/) {
			fsm.send(this.transitions.transition);
		}.bind(this);
		SystemBus.addListener(this.channel, this.eventListener, false);
	};

	TransitionOnMessageAction.prototype.exit = function (/*fsm*/) {
		SystemBus.removeListener(this.channel, this.eventListener);
	};

	module.exports = TransitionOnMessageAction;
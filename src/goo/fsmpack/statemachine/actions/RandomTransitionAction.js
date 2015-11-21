var Action = require('../../../fsmpack/statemachine/actions/Action');

	'use strict';

	function RandomTransitionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RandomTransitionAction.prototype = Object.create(Action.prototype);
	RandomTransitionAction.prototype.constructor = RandomTransitionAction;

	RandomTransitionAction.external = {
		name: 'Random Transition',
		type: 'transitions',
		description: 'Performs a random transition',
		canTransition: true,
		parameters: [{
			name: 'Skewness',
			key: 'skewness',
			type: 'float',
			control: 'slider',
			min: 0,
			max: 1,
			description: 'Determines the chance that the first destination is picked over the second',
			'default': 1
		}],
		transitions: [{
			key: 'transition1',
			name: 'Destination 1',
			description: 'First choice'
		}, {
			key: 'transition2',
			name: 'Destination 2',
			description: 'Second choice'
		}]
	};

	RandomTransitionAction.prototype._run = function (fsm) {
		if (Math.random() < +this.skewness) {
			fsm.send(this.transitions.transition1);
		} else {
			fsm.send(this.transitions.transition2);
		}
	};

	module.exports = RandomTransitionAction;
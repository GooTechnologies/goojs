define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
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
			name: 'Probability A',
			key: 'skewness',
			type: 'float',
			control: 'slider',
			min: 0,
			max: 1,
			description: 'The probability that the first destination is chosen over the second.',
			'default': 0.5
		}],
		transitions: [{
			key: 'transition1',
			name: 'Destination A',
			description: 'First choice'
		}, {
			key: 'transition2',
			name: 'Destination B',
			description: 'Second choice'
		}]
	};

	RandomTransitionAction.prototype.update = function (fsm) {
		if (Math.random() < +this.skewness) {
			fsm.send(this.transitions.transition1);
		} else {
			fsm.send(this.transitions.transition2);
		}
	};

	return RandomTransitionAction;
});
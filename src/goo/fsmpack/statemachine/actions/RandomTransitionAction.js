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
		description: 'Performs a random transition. Will choose one of the two transitions randomly and transition immediately.',
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
			description: 'First choice.'
		}, {
			key: 'transition2',
			description: 'Second choice.'
		}]
	};

	var labels = {
		transition1: 'Random outcome A',
		transition2: 'Random outcome B'
	};

	RandomTransitionAction.getTransitionLabel = function(transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	RandomTransitionAction.prototype.enter = function (fsm) {
		var transitions = this.transitions;
		var a = transitions.transition1;
		var b = transitions.transition2;
		var transition = Math.random() < this.skewness ? a : b;
		fsm.send(transition);
	};

	return RandomTransitionAction;
});
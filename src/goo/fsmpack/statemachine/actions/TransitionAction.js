define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function TransitionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TransitionAction.prototype = Object.create(Action.prototype);
	TransitionAction.prototype.constructor = TransitionAction;

	TransitionAction.external = {
		name: 'Transition',
		type: 'transitions',
		description: 'Transition to a selected state',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'transition',
			description: 'State to transition to'
		}]
	};

	var labels = {
		transition: 'On Enter'
	};

	TransitionAction.getTransitionLabel = function(transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	TransitionAction.prototype.enter = function (fsm) {
		fsm.send(this.transitions.transition);
	};

	return TransitionAction;
});
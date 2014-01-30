define([
	'goo/fsmpack/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function TransitionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TransitionAction.prototype = Object.create(Action.prototype);
	TransitionAction.prototype.constructor = TransitionAction;

	TransitionAction.external = {
		name: 'Transition',
		description: 'Performs a transition',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'transition',
			name: 'To',
			description: 'State to transition to'
		}]
	};

	TransitionAction.prototype._run = function(fsm) {
		fsm.send(this.transitions.transition);
	};

	return TransitionAction;
});
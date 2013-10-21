define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function RandomTransitionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RandomTransitionAction.prototype = Object.create(Action.prototype);
	RandomTransitionAction.prototype.constructor = RandomTransitionAction;

	RandomTransitionAction.external = {
		canTransition: true,
		parameters: [],
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

	RandomTransitionAction.prototype._run = function(fsm) {
		if(Math.random() < 0.5) {
			fsm.send(this.transitions.transition1);
		} else {
			fsm.send(this.transitions.transition2);
		}
	};

	return RandomTransitionAction;
});
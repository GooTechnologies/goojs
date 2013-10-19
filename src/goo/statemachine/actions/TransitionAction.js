define([
	'goo/statemachine/actions/Action'
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
		parameters: [],
		transitions: [{
			name: 'transition',
			description: 'State to transition to'
		}]
	};

	TransitionAction.prototype._run = function(fsm) {
		fsm.send(this.transitions.transition);
	};

	return TransitionAction;
});
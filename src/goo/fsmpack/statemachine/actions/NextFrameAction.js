define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function NextFrameAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	NextFrameAction.prototype = Object.create(Action.prototype);
	NextFrameAction.prototype.constructor = NextFrameAction;

	NextFrameAction.external = {
		key: 'transitionOnNextFrame',
		name: 'Transition on next frame',
		type: 'transitions',
		description: 'Transition to a selected state on the next frame',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'transition',
			name: 'On Next Frame',
			description: 'State to transition to on next frame'
		}]
	};

	var labels = {
		transition: 'On Next Frame'
	};

	NextFrameAction.getTransitionLabel = function(transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	NextFrameAction.prototype.update = function (fsm) {
		fsm.send(this.transitions.transition);
	};

	return NextFrameAction;
});
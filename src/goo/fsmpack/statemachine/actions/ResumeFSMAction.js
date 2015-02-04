define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function ResumeFSMAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ResumeFSMAction.prototype = Object.create(Action.prototype);
	ResumeFSMAction.prototype.constructor = ResumeFSMAction;

	ResumeFSMAction.external = {
		name: 'Resume FSM',
		description: 'Continue running a suspended state machine',
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Entity to resume its FSM',
			'default': null
		}],
		transitions: []
	};

	ResumeFSMAction.prototype._run = function(/*fsm*/) {
		if (this.entity && this.entity.stateMachineComponent) {
			this.entity.stateMachineComponent.resume();
		}
	};

	return ResumeFSMAction;
});
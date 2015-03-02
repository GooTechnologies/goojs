define([
	'goo/fsmpack/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	'use strict';

	function SuspendFSMAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SuspendFSMAction.prototype = Object.create(Action.prototype);
	SuspendFSMAction.prototype.constructor = SuspendFSMAction;

	SuspendFSMAction.external = {
		name: 'Suspend FSM',
		description: 'Suspends the state machine of another entity',
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Entity to suspend its FSM',
			'default': null
		}],
		transitions: []
	};

	SuspendFSMAction.prototype._run = function(/*fsm*/) {
		if (this.entity && this.entity.stateMachineComponent) {
			this.entity.stateMachineComponent.pause();
		}
	};

	return SuspendFSMAction;
});
define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function SuspendFSMAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SuspendFSMAction.prototype = Object.create(Action.prototype);
	SuspendFSMAction.prototype.constructor = SuspendFSMAction;

	SuspendFSMAction.external = {
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
		if (this.entity && this.entity.fSMComponent) {
			this.entity.fSMComponent.pause();
		}
	};

	return SuspendFSMAction;
});
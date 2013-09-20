define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function LogVariableAction(id, settings) {
		Action.apply(this, arguments);

		this.currentTime = 0;
	}

	LogVariableAction.prototype = Object.create(Action.prototype);

	LogVariableAction.prototype.configure = function(settings) {
		this.everyFrame = settings.everyFrame || false;
		this.message = settings.message || '';
	};

	LogVariableAction.external = {
		parameters: [{
			name: 'Message',
			key: 'message',
			type: 'string',
			description: 'message to print',
			'default': 'hello'
		}],
		transitions: []
	};

	LogVariableAction.prototype._run = function(/*fsm*/) {
		console.log(this.message);
	};

	return LogVariableAction;
});
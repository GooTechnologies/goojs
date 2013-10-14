define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function LogMessageAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	LogMessageAction.prototype = Object.create(Action.prototype);
	LogMessageAction.prototype.constructor = LogMessageAction;

	LogMessageAction.external = {
		parameters: [{
			name: 'Message',
			key: 'message',
			type: 'string',
			description: 'message to print',
			'default': 'hello'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Do this action every frame',
			'default': false
		}],
		transitions: []
	};

	LogMessageAction.prototype._run = function(/*fsm*/) {
		console.log(this.message);
	};

	return LogMessageAction;
});
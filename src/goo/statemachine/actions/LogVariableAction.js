define([
	'goo/statemachine/actions/Action',
	'goo/statemachine/FSMComponent'
],
/** @lends */
function(
	Action,
	FSMComponent
) {
	"use strict";

	function LogVariableAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || false;

		this.message = settings.message || '';
		this.posVariable = settings.posVariable || null;

		this.currentTime = 0;
	}

	LogVariableAction.prototype = Object.create(Action.prototype);

	LogVariableAction.external = {};
	LogVariableAction.external.parameters = [
		{
			name: 'Message',
			key: 'message',
			type: 'string',
			description: 'message to print',
			'default': 'hello'
		}
	];

	LogVariableAction.external.transitions = [
	];

	LogVariableAction.prototype._run = function(/*fsm*/) {
		console.log(this.message);
		/*
		if (this.posVariable) {
			if (fsm.localVariables[this.posVariable] !== undefined) {
				console.log(this.posVariable, fsm.localVariables[this.posVariable]);
			} else if (FSMComponent.globalVariables[this.posVariable] !== undefined) {
				console.log(this.posVariable, FSMComponent.globalVariables[this.posVariable]);
			}
		}
		*/
	};

	return LogVariableAction;
});
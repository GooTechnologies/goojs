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
		this.everyFrame = settings.everyFrame || true;

		this.posVariable = settings.posVariable || null;

		this.currentTime = 0;
	}

	LogVariableAction.prototype = Object.create(Action.prototype);

	LogVariableAction.external = [
		{
			name: 'Variable to log',
			key: 'posVariable',
			type: 'string'
		}];

	LogVariableAction.prototype.onCreate = function(fsm) {
		if (this.posVariable) {
			if (fsm.localVariables[this.posVariable] !== undefined) {
				console.log(this.posVariable, fsm.localVariables[this.posVariable]);
			} else if (FSMComponent.globalVariables[this.posVariable] !== undefined) {
				console.log(this.posVariable, FSMComponent.globalVariables[this.posVariable]);
			}
		}
	};

	return LogVariableAction;
});
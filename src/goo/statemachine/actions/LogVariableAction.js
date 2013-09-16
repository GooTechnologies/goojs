define([
	'goo/statemachine/FSMComponent',
	'goo/statemachine/actions/Actions'
],
/** @lends */
function(
	FSMComponent,
	Actions
) {
	"use strict";

	/**
	 * @class
	 */
	function LogVariableAction(settings) {
		settings = settings || {};

		this.posVariable = settings.posVariable || null;

		this.external = [
		{
			name: 'Variable to log',
			key: 'posVariable',
			type: 'string'
		}];

		this.currentTime = 0;
	}

	LogVariableAction.prototype = {
		onCreate: function(fsm) {
			if (this.posVariable) {
				if (fsm.localVariables[this.posVariable] !== undefined) {
					console.log(this.posVariable, fsm.localVariables[this.posVariable]);
				} else if (FSMComponent.globalVariables[this.posVariable] !== undefined) {
					console.log(this.posVariable, FSMComponent.globalVariables[this.posVariable]);
				}
			}
		}
	};

	Actions.register('LogVariableAction', LogVariableAction);
	return LogVariableAction;
});
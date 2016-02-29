define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function SetVariableAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	SetVariableAction.prototype = Object.create(Action.prototype);
	SetVariableAction.prototype.constructor = SetVariableAction;

	SetVariableAction.external = {
		name: 'Set Variable',
		type: 'variables',
		description: '',
		parameters: [{
			name: 'Variable',
			key: 'variable',
			type: 'identifier' // todo: add to ParameterUtils
		}, {
			name: 'Value',
			key: 'amount',
			type: 'float'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': false
		}],
		transitions: []
	};

	SetVariableAction.prototype.enter = function (fsm) {
		if (this.variable) {
			fsm.setVariable(this.variable, this.amount);
		}
	};

	return SetVariableAction;
});
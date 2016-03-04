define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function AddVariableAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	AddVariableAction.prototype = Object.create(Action.prototype);
	AddVariableAction.prototype.constructor = AddVariableAction;

	AddVariableAction.external = {
		name: 'Add Variable',
		type: 'variables',
		description: '',
		parameters: [{
			name: 'Variable',
			key: 'variable',
			type: 'string' // Todo: should be "variable" reference
		}, {
			name: 'Amount',
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

	AddVariableAction.prototype.add = function (fsm) {
		var variableId = this.variable;
		var variable = fsm.getVariable(variableId);
		var type = fsm.getVariableType(variableId);
		var amount = this.amount;
		switch(type){
			case 'float':
				variable += amount;
				break;
			case 'vec2':
				variable[0] += amount;
				variable[1] += amount;
				break;
			case 'vec3':
				variable[0] += amount;
				variable[1] += amount;
				variable[2] += amount;
				break;
			case 'vec4':
				variable[0] += amount;
				variable[1] += amount;
				variable[2] += amount;
				variable[3] += amount;
				break;
		}
		fsm.setVariable(variableId, variable);
	};

	AddVariableAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.add(fsm);
		}
	};

	AddVariableAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.add(fsm);
		}
	};

	return AddVariableAction;
});
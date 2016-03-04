define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/util/ParameterUtils'
], function (
	Action,
	ParameterUtils
) {
	'use strict';

	function CreateVariableAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	CreateVariableAction.prototype = Object.create(Action.prototype);
	CreateVariableAction.prototype.constructor = CreateVariableAction;

	CreateVariableAction.external = {
		name: 'Create Variable',
		type: 'variables',
		description: '',
		parameters: [{
			name: 'Variable name',
			key: 'variable',
			type: 'string' // Todo: should be "variable" reference
		}, {
			name: 'Type',
			key: 'type',
			type: 'string',
			control: 'select',
			options: Object.keys(ParameterUtils.DEFAULTS_BY_TYPE)
		}, {
			name: 'Initial Value (JSON)',
			key: 'value',
			type: 'string',
			'default': 0
		}],
		transitions: []
	};

	CreateVariableAction.prototype.enter = function (fsm) {
		var machine = fsm.getMachine();
		var variableId = this.variable;
		var oldDefs = machine._variableDefinitions;
		var def = {
			key: variableId,
			type: this.type,
			'default': ParameterUtils.DEFAULTS_BY_TYPE[this.type]
		};
		oldDefs.push(def);
		machine.setVariableDefinitions(oldDefs);
		try {
			machine.setVariable(variableId, JSON.parse(this.value));
		} catch(err){
			console.error(err);
		}
	};

	return CreateVariableAction;
});
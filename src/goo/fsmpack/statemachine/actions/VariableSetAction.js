define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function VariableSetAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	VariableSetAction.prototype = Object.create(Action.prototype);
	VariableSetAction.prototype.constructor = VariableSetAction;

	VariableSetAction.external = {
		name: 'Set Variable',
		type: 'variables',
		description: '',
		parameters: [{
			name: 'Variable',
			key: 'variable',
			type: 'string' // Todo: should be "variable" reference
		}, {
			name: 'Float Value',
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

	VariableSetAction.prototype.set = function (fsm) {
		switch (fsm.getVariableType(this.variable)) {
		case 'float':
			fsm.setVariable(this.variable, this.amount);
			break;
		}
	};

	VariableSetAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.set(fsm);
		}
	};

	VariableSetAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.set(fsm);
		}
	};

	return VariableSetAction;
});
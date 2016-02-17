define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/fsmpack/statemachine/FsmUtils'
], function (
	Action,
	FsmUtils
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
			type: 'identifier'
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

	AddVariableAction.prototype.update = function (fsm) {
		fsm.applyOnVariable(this.variable, function (v) {
			return v + FsmUtils.getValue(this.amount, fsm);
		}.bind(this));
	};

	return AddVariableAction;
});
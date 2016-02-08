define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/fsmpack/statemachine/FsmUtils'
], function (
	Action,
	FsmUtils
) {
	'use strict';

	function MultiplyVariableAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MultiplyVariableAction.prototype = Object.create(Action.prototype);
	MultiplyVariableAction.prototype.constructor = MultiplyVariableAction;

	MultiplyVariableAction.external = {
		name: 'Multiply Variable',
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

	MultiplyVariableAction.prototype._run = function (fsm) {
		fsm.applyOnVariable(this.variable, function (v) {
			return v * FsmUtils.getValue(this.amount, fsm);
		}.bind(this));
	};

	return MultiplyVariableAction;
});
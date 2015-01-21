define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/fsmpack/statemachine/FSMUtil'
], function (
	Action,
	FSMUtil
) {
	'use strict';

	function AddVariableAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	AddVariableAction.prototype = Object.create(Action.prototype);

	AddVariableAction.prototype.configure = function(settings) {
		this.everyFrame = !!settings.everyFrame;
		this.variable = settings.variable || null;
		this.amount = settings.amount || 1;
	};

	AddVariableAction.external = {
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

	AddVariableAction.prototype._run = function(fsm) {
		fsm.applyOnVariable(this.variable, function(v) {
			return v + FSMUtil.getValue(this.amount, fsm);
		}.bind(this));
	};

	return AddVariableAction;
});
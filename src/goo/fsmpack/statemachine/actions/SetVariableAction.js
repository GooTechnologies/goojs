define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/fsmpack/statemachine/FSMUtil'
	], function (
	Action,
	FSMUtil
	) {
	'use strict';

	function SetVariableAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetVariableAction.prototype = Object.create(Action.prototype);

	SetVariableAction.prototype.configure = function (settings) {
		this.everyFrame = settings.everyFrame !== false;
		this.variable = settings.variable || null;
		this.amount = settings.amount || 0;
	};

	SetVariableAction.external = {
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

	SetVariableAction.prototype._run = function (fsm) {
		if (this.variable) {
			fsm.applyOnVariable(this.variable, function () {
				return FSMUtil.getValue(this.amount, fsm);
			}.bind(this));
		}
	};

	return SetVariableAction;
});
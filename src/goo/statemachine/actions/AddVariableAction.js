define([
	'goo/statemachine/actions/Action',
	'goo/statemachine/FSMUtil'
],
/** @lends */
function(
	Action,
	FSMUtil
) {
	"use strict";

	function AddVariableAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || false;

		this.variable = settings.variable || null;
		this.amount = settings.amount || 1;
	}

	AddVariableAction.prototype = Object.create(Action.prototype);

	AddVariableAction.external = [
		{
			name: 'Entity',
			key: 'entity',
			type: 'entity'
		},
		{
			name: 'Position',
			key: 'position',
			type: 'vec3'
		},
		{
			name: 'Speed',
			key: 'speed',
			type: 'float',
			control: 'slider',
			min: 0,
			max: 10
		}];

	AddVariableAction.prototype._run = function(fsm) {
		fsm.applyToVariable(this.variable, function(v) {
			return v + FSMUtil.getValue(this.amount, fsm);
		}.bind(this));
	};

	return AddVariableAction;
});
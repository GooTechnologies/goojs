define([
	'goo/statemachine/actions/Action',
	'goo/statemachine/StateUtils'
],
/** @lends */
function(
	Action,
	StateUtils
) {
	"use strict";

	function MultiplyVariableAction(settings) {
		settings = settings || {};
		this.everyFrame = false; ///

		this.variable = settings.variable || null;
		this.amount = settings.amount || 1;
	}

	MultiplyVariableAction.prototype = Object.create(Action.prototype);

	MultiplyVariableAction.external = [
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

	MultiplyVariableAction.prototype._run = function(fsm) {
		fsm.applyOnVariable(this.variable, function(v) {
			return v * StateUtils.getValue(this.amount, fsm);
		}.bind(this));
	};

	return MultiplyVariableAction;
});
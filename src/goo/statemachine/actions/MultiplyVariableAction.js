define([
	'goo/statemachine/actions/Actions',
	'goo/statemachine/StateUtils'
],
/** @lends */
function(
	Actions,
	StateUtils
) {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function MultiplyVariableAction(settings) {
		settings = settings || {};

		this.variable = settings.variable || null;
		this.amount = settings.amount || 1;

		this.external = [
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
	}

	MultiplyVariableAction.prototype = {
		onEnter: function(fsm) {
			fsm.applyOnVariable(this.variable, function(v) {
				return v * StateUtils.getValue(this.amount, fsm);
			}.bind(this));
		},
		onUpdate: function(/*fsm*/) {

		},
		onExit: function(/*fsm*/) {

		}
	};

	Actions.register('MultiplyVariableAction', MultiplyVariableAction);

	return MultiplyVariableAction;
});
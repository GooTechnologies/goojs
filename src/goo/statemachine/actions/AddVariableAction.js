define([
	'goo/statemachine/StateUtils'
],
/** @lends */
function(
	StateUtils
) {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function AddVariableAction(settings) {
		settings = settings || {};

		this.variable = settings.variable || null;
		this.amount = settings.amount || 1;
		this.everyFrame = settings.everyFrame || false;
	}

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

	AddVariableAction.prototype = {
		onEnter: function(fsm) {
			fsm.applyToVariable(this.variable, function(v) {
				return v + StateUtils.getValue(this.amount, fsm);
			}.bind(this));
		},
		onUpdate: function(/*fsm*/) {

		},
		onExit: function(/*fsm*/) {

		}
	};

	return AddVariableAction;
});
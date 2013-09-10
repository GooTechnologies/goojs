define([
	'goo/statemachine/actions/Actions'
],
/** @lends */
function(
Actions
) {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function SetNumberAction(settings) {
		settings = settings || {};

		this.variable = settings.variable || 'None';
		this.value = settings.value || '0';

		this.external = {
			variable: ['string', 'Variable'],
			value: ['float', 'Value']
		};
	}

	SetNumberAction.prototype = {
		onCreate: function(fsm) {
			fsm.setLocalVariable(this.variable, this.value);
		}
	};

	Actions.register('SetNumberAction', SetNumberAction);
	return SetNumberAction;
});
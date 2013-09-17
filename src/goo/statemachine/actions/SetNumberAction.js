define([],
/** @lends */
function() {
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
			fsm.applyOnVariable(this.variable, function() { return this.value; }.bind(this));
		}
	};

	return SetNumberAction;
});
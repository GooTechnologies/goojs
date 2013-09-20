define(['goo/statemachine/actions/Action'],
/** @lends */
function(Action) {
	"use strict";

	function SetNumberAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || false;

		this.variable = settings.variable || 'None';
		this.value = settings.value || '0';
	}

	SetNumberAction.prototype = Object.create(Action.prototype);

	SetNumberAction.external = [{
			variable: ['string', 'Variable'],
			value: ['float', 'Value']
		}];

	SetNumberAction.prototype._run = function(fsm) {
		fsm.applyOnVariable(this.variable, function() {
			return this.value;
		}.bind(this));
	};

	return SetNumberAction;
});
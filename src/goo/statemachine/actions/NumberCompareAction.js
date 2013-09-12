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
	function NumberCompareAction(settings) {
		settings = settings || {};

		this.float1 = settings.float1 || 0.0;
		this.float1Variable = settings.float1Variable || '';
		this.float2 = settings.float2 || 0.0;
		this.float2Variable = settings.float2Variable || '';
		this.tolerance = settings.tolerance || 0.0;

		this.equalsEvent = settings.equalsEvent || 'equals';
		this.lessThanEvent = settings.lessThanEvent || 'lessThan';
		this.greaterThanEvent = settings.greaterThanEvent || 'greaterThan';

		this.external = {
			float1: ['float', 'Number 1'],
			float1Variable: ['string', 'Number 1 Variable'],
			float2: ['float', 'Number 2'],
			float2Variable: ['string', 'Number 2 Variable'],
			tolerance: ['float', 'Tolerance'],

			equalsEvent: ['string', 'Equals Event'],
			lessThanEvent: ['string', 'Less Than Event'],
			greaterThanEvent: ['string', 'Greater Than Event']
		};
	}

	NumberCompareAction.prototype = {
		onCreate: function(fsm) {
			var float1 = !!this.float1Variable || this.float1Variable !== '' ? fsm.getVariable(this.float1Variable) : this.float1;
			var float2 = !!this.float2Variable || this.float2Variable !== '' ? fsm.getVariable(this.float2Variable) : this.float2;
			var diff = float1 - float2;
			if (Math.abs(diff) <= this.tolerance) {
				fsm.send(this.equalsEvent);
			} else if (diff < 0) {
				fsm.send(this.lessThanEvent);
			} else {
				fsm.send(this.greaterThanEvent);
			}
		}
	};

	Actions.register('NumberCompareAction', NumberCompareAction);
	return NumberCompareAction;
});
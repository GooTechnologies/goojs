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
		this.type = 'NumberCompareAction';

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
			greaterThanEvent: ['string', 'Greater Than Event'],
		};
	}

	NumberCompareAction.prototype = {
		create: function(fsm) {
			var float1 = !!this.float1Variable || this.float1Variable !== '' ? fsm.getLocalVariable(this.float1Variable) : this.float1;
			var float2 = !!this.float2Variable || this.float2Variable !== '' ? fsm.getLocalVariable(this.float2Variable) : this.float2;
			var diff = float1 - float2;
			if (Math.abs(diff) <= this.tolerance) {
				fsm.handle(this.equalsEvent);
			} else if (diff < 0) {
				fsm.handle(this.lessThanEvent);				
			} else {
				fsm.handle(this.greaterThanEvent);				
			}
		},
		destroy: function() {
		},
		run: function(fsm, state, tpf) {

		}
	};

	Actions.register('NumberCompareAction', NumberCompareAction);
	return NumberCompareAction;
});
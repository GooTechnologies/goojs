define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function NumberCompareAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || true;

		this.float1 = settings.float1 || 0.0;
		this.float1Variable = settings.float1Variable || '';
		this.float2 = settings.float2 || 0.0;
		this.float2Variable = settings.float2Variable || '';
		this.tolerance = settings.tolerance || 0.0;

		this.equalsEvent = settings.equalsEvent;
		this.lessThanEvent = settings.lessThanEvent;
		this.greaterThanEvent = settings.greaterThanEvent;

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

	NumberCompareAction.prototype = Object.create(Action.prototype);

	NumberCompareAction.external = {};
	NumberCompareAction.external.parameters = [
		{
			name: 'First value',
			key: '',
			type: 'key',
			description: 'Key to listen for',
			'default': 'w'
		}
	];

	NumberCompareAction.external.transitions = [
		{
			name: 'On key up',
			description: 'Event fired on key up'
		}
	];

	NumberCompareAction.prototype._run = function(fsm) {
		var float1 = !!this.float1Variable || this.float1Variable !== '' ? fsm.getVariable(this.float1Variable) : this.float1;
		var float2 = !!this.float2Variable || this.float2Variable !== '' ? fsm.getVariable(this.float2Variable) : this.float2;
		var diff = float1 - float2;

		if (Math.abs(diff) <= this.tolerance) {
			if (this.equalsEvent) { fsm.send(this.equalsEvent); }
		} else if (diff < 0) {
			if (this.lessThanEvent) { fsm.send(this.lessThanEvent); }
		} else {
			if (this.greaterThanEvent) { fsm.send(this.greaterThanEvent); }
		}
	};

	return NumberCompareAction;
});
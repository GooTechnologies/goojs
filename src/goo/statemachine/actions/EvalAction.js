define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function EvalAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	EvalAction.prototype = Object.create(Action.prototype);
	EvalAction.prototype.constructor = EvalAction;

	EvalAction.external = {
		description: 'This is all you need, really',
		parameters: [{
			name: 'expression',
			key: 'expression',
			type: 'string',
			description: 'JavaScript expression to evaluate',
			'default': ''
		}],
		transitions: []
	};

	EvalAction.prototype._run = function(/*fsm*/) {
		/* jshint evil: true */
		eval(this.expression);
	};

	return EvalAction;
});
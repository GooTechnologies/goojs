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
		parameters: [{
			name: 'JS expression',
			key: 'expression',
			type: 'string',
			description: 'JavaScript expression to evaluate',
			'default': ''
		}],
		transitions: []
	};

	EvalAction.prototype._run = function(fsm) {
		eval(this.expression);
	};

	return EvalAction;
});
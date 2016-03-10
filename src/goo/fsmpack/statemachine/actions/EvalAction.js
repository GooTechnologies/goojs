define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function EvalAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.expressionFunction = null;
	}

	EvalAction.prototype = Object.create(Action.prototype);
	EvalAction.prototype.constructor = EvalAction;

	EvalAction.external = {
		name: 'Eval',
		description: 'Evaluates a JS expression.',
		parameters: [{
			name: 'expression',
			key: 'expression',
			type: 'string',
			description: 'JavaScript expression to evaluate.',
			'default': ''
		}],
		transitions: []
	};

	EvalAction.prototype.enter = function () {
		/* jshint evil: true */
		this.expressionFunction = new Function('goo', this.expression);
	};

	EvalAction.prototype.update = function (fsm) {
		/* jshint evil: true */
		if (this.expressionFunction) {
			try {
				this.expressionFunction(fsm.getEvalProxy());
			} catch (e) {
				console.warn('Eval code error: ' + e.message);
			}
		}
	};

	return EvalAction;
});
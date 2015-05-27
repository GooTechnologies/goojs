define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function IncrementCounterAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	IncrementCounterAction.prototype = Object.create(Action.prototype);
	IncrementCounterAction.prototype.constructor = IncrementCounterAction;

	IncrementCounterAction.external = {
		key: 'Increment Counter',
		name: 'Increment Counter',
		type: 'transitions',
		description: 'Increments a counter with a value',
		parameters: [{
			name: 'Name',
			key: 'name',
			type: 'string',
			description: 'Counter name',
			'default': 0
		}, {
			name: 'Increment',
			key: 'increment',
			type: 'number',
			description: 'Value to increment the counter with',
			'default': 0
		}],
		transitions: []
	};

	IncrementCounterAction.prototype._run = function (fsm) {
		fsm.getFsm().applyOnVariable(this.name, function (oldValue) {
			if (!oldValue) { return this.increment; }
			return oldValue + this.increment;
		});
	};

	return IncrementCounterAction;
});
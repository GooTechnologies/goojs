var Action = require('../../../fsmpack/statemachine/actions/Action');

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
			description: 'Counter name'
		}, {
			name: 'Increment',
			key: 'increment',
			type: 'number',
			description: 'Value to increment the counter with',
			'default': 1
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	IncrementCounterAction.prototype._run = function (fsm) {
		var increment = +this.increment;

		if (fsm.getFsm().vars[this.name] === undefined) {
			fsm.getFsm().defineVariable(this.name, increment);
			return;
		}

		fsm.getFsm().applyOnVariable(this.name, function (oldValue) {
			return oldValue + increment;
		});
	};

	IncrementCounterAction.prototype.cleanup = function (fsm) {
		fsm.getFsm().removeVariable(this.name);
	};

	module.exports = IncrementCounterAction;
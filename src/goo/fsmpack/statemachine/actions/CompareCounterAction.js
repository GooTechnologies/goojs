var Action = require('../../../fsmpack/statemachine/actions/Action');

	'use strict';

	function CompareCounterAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	CompareCounterAction.prototype = Object.create(Action.prototype);
	CompareCounterAction.prototype.constructor = CompareCounterAction;

	CompareCounterAction.external = {
		key: 'Compare Counter',
		name: 'Compare Counter',
		type: 'transitions',
		description: 'Compares a counter with a value',
		canTransition: true,
		parameters: [{
			name: 'Name',
			key: 'name',
			type: 'string',
			description: 'Counter name'
		}, {
			name: 'Value',
			key: 'value',
			type: 'number',
			description: 'Value to compare the counter with',
			'default': 0
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: [{
			key: 'less',
			name: 'Less',
			description: 'State to transition to if the counter is smaller than the specified value'
		}, {
			key: 'equal',
			name: 'Equal',
			description: 'State to transition to if the counter is the same as the specified value'
		}, {
			key: 'greater',
			name: 'Greater',
			description: 'State to transition to if the counter is greater than the specified value'
		}]
	};

	CompareCounterAction.prototype._run = function (fsm) {
		var value1 = +fsm.getFsm().getVariable(this.name);
		var value2 = +this.value;

		if (value1 > value2) {
			fsm.send(this.transitions.greater);
		} else if (value1 === value2) {
			fsm.send(this.transitions.equal);
		} else {
			fsm.send(this.transitions.less);
		}
	};

	module.exports = CompareCounterAction;
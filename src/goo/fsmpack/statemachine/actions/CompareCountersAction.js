define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function CompareCountersAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	CompareCountersAction.prototype = Object.create(Action.prototype);
	CompareCountersAction.prototype.constructor = CompareCountersAction;

	CompareCountersAction.external = {
		key: 'Compare 2 Counters',
		name: 'Compare 2 Counters',
		type: 'transitions',
		description: 'Compares the value of 2 counters.',
		canTransition: true,
		parameters: [{
			name: 'First counter',
			key: 'name1',
			type: 'string',
			description: 'First counter name.'
		}, {
			name: 'Second counter',
			key: 'name2',
			type: 'string',
			description: 'Second counter name.'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: [{
			key: 'less',
			description: 'State to transition to if the first counter is smaller than the second counter.'
		}, {
			key: 'equal',
			description: 'State to transition to if the first counter is the same as the second counter.'
		}, {
			key: 'greater',
			description: 'State to transition to if the first counter is greater than the second counter.'
		}]
	};

	var operators = {
		less: '<',
		equal: '==',
		greater: '>'
	};

	CompareCountersAction.getTransitionLabel = function(transitionKey, actionConfig){
		if (operators[transitionKey]) {
			return 'On ' + (actionConfig.options.name1 || 'Counter1') + ' ' + operators[transitionKey] + ' ' + (actionConfig.options.name2 || 'counter2');
		}
	};

	CompareCountersAction.prototype.compare = function (fsm) {
		var value1 = +fsm.getFsm().getVariable(this.name1);
		var value2 = +fsm.getFsm().getVariable(this.name2);

		if (value1 === undefined || value2 === undefined) {
			return;
		}

		if (value1 > value2) {
			fsm.send(this.transitions.greater);
		} else if (value1 === value2) {
			fsm.send(this.transitions.equal);
		} else {
			fsm.send(this.transitions.less);
		}
	};

	CompareCountersAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.compare(fsm);
		}
	};

	CompareCountersAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.compare(fsm);
		}
	};

	return CompareCountersAction;
});
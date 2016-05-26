import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

var operators = {
	less: '<',
	equal: '==',
	greater: '>'
};

class CompareCountersAction extends Action {
	name1: string;
	name2: string;
	everyFrame: boolean;
	constructor(id: string, options: any){
		super(id, options)
	}

	static external: External = {
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

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		if (operators[transitionKey]) {
			return 'On ' + (actionConfig.options.name1 || 'Counter1') + ' ' + operators[transitionKey] + ' ' + (actionConfig.options.name2 || 'counter2');
		}
	};

	compare (fsm) {
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

	enter (fsm) {
		if (!this.everyFrame) {
			this.compare(fsm);
		}
	};

	update (fsm) {
		if (this.everyFrame) {
			this.compare(fsm);
		}
	};
}

export = CompareCountersAction;
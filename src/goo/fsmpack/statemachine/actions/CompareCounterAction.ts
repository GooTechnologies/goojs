import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

var labels = {
	less: ' < X',
	equal: ' == X',
	greater: ' > X'
};

class CompareCounterAction extends Action {
	transitions: any;
	everyFrame: boolean;
	value: number;
	name: string;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Compare Counter',
		name: 'Compare Counter',
		type: 'transitions',
		description: 'Compares a counter with a value.',
		canTransition: true,
		parameters: [{
			name: 'Name',
			key: 'name',
			type: 'string',
			description: 'Counter name.'
		}, {
			name: 'Value',
			key: 'value',
			type: 'float',
			description: 'Value to compare the counter with.',
			'default': 0
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: [{
			key: 'less',
			description: 'State to transition to if the counter is smaller than the specified value.'
		}, {
			key: 'equal',
			description: 'State to transition to if the counter is the same as the specified value.'
		}, {
			key: 'greater',
			description: 'State to transition to if the counter is greater than the specified value.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		if (labels[transitionKey]) {
			return 'On ' + (actionConfig.options.name || 'Counter') + labels[transitionKey];
		}
	};

	compare (fsm) {
		var value1 = fsm.getFsm().getVariable(this.name);
		// if (value1 === undefined) {
		// 	return;
		// }
		var value2 = +this.value;

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

export = CompareCounterAction;
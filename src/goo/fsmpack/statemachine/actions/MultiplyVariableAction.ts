import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var FsmUtils = require('../../../fsmpack/statemachine/FsmUtils');

class MultiplyVariableAction extends Action {
	variable: string;
	amount: number;
	everyFrame: boolean;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Multiply Variable',
		name: 'Multiply Variable',
		type: 'variables',
		description: '',
		parameters: [{
			name: 'Variable',
			key: 'variable',
			description: 'Variable',
			type: 'identifier'
		}, {
			name: 'Amount',
			key: 'amount',
			description: 'Amount',
			type: 'float'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': false
		}],
		transitions: []
	};

	update (fsm) {
		fsm.applyOnVariable(this.variable, function (v) {
			return v * FsmUtils.getValue(this.amount, fsm);
		}.bind(this));
	};
}

export = MultiplyVariableAction;
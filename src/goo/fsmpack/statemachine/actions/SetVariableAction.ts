import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var FsmUtils = require('../../../fsmpack/statemachine/FsmUtils');

class SetVariableAction extends Action {
	variable: string;
	amount: number;
	everyFrame: boolean;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Set Variable',
		name: 'Set Variable',
		type: 'variables',
		description: '',
		parameters: [{
			name: 'Variable name',
			description: 'Variable name',
			key: 'variable',
			type: 'identifier'
		}, {
			name: 'Value',
			description: 'Value',
			key: 'amount',
			type: 'float'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': false
		}],
		transitions: []
	};

	enter (fsm) {
		if (this.variable) {
			fsm.applyOnVariable(this.variable, function () {
				return FsmUtils.getValue(this.amount, fsm);
			}.bind(this));
		}
	};
}

export = SetVariableAction;
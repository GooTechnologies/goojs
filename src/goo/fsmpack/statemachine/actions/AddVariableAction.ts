import Action = require('./Action');
import {External} from './IAction';
var FsmUtils = require('../../../fsmpack/statemachine/FsmUtils');

class AddVariableAction extends Action {
	variable: string;
	everyFrame: boolean;

	constructor(id, options){
		super(id, options)
	}

	static external = {
		key: 'Add Variable',
		name: 'Add Variable',
		type: 'variables',
		description: '',
		parameters: [{
			name: 'Variable',
			key: 'variable',
			type: 'identifier'
		}, {
			name: 'Amount',
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

	add(fsm) {
		fsm.applyOnVariable(this.variable, function (v) {
			return v + FsmUtils.getValue(this.amount, fsm);
		}.bind(this));
	};

	enter(fsm) {
		if (!this.everyFrame) {
			this.add(fsm);
		}
	};

	update(fsm) {
		if (this.everyFrame) {
			this.add(fsm);
		}
	};
}

export = AddVariableAction;

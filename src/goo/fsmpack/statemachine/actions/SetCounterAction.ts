import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class SetCounterAction extends Action {
	name: string;
	value: number;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Set Counter',
		name: 'Set Counter',
		type: 'transitions',
		description: 'Sets a counter to a value.',
		parameters: [{
			name: 'Name',
			key: 'name',
			type: 'string',
			description: 'Counter name.'
		}, {
			name: 'Value',
			key: 'value',
			type: 'float',
			description: 'Value to set the counter to.',
			'default': 0
		}],
		transitions: []
	};

	enter (fsm) {
		fsm.getFsm().defineVariable(this.name, +this.value);
	};

	cleanup (fsm) {
		fsm.getFsm().removeVariable(this.name);
	};
}

export = SetCounterAction;
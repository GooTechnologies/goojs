import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class IncrementCounterAction extends Action {
	name: string;
	increment: number;
	everyFrame: boolean;

	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Increment Counter',
		name: 'Increment Counter',
		type: 'transitions',
		description: 'Increments a counter with a value.',
		parameters: [{
			name: 'Name',
			key: 'name',
			type: 'string',
			description: 'Counter name.'
		}, {
			name: 'Increment',
			key: 'increment',
			type: 'float',
			description: 'Value to increment the counter with.',
			'default': 1
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	incrementCounter (fsm) {
		var increment = +this.increment;

		if (fsm.getFsm().vars[this.name] === undefined) {
			fsm.getFsm().defineVariable(this.name, increment);
			return;
		}

		fsm.getFsm().applyOnVariable(this.name, function (oldValue) {
			return oldValue + increment;
		});
	};

	enter (fsm) {
		if (!this.everyFrame) {
			this.incrementCounter(fsm);
		}
	};

	update (fsm) {
		if (this.everyFrame) {
			this.incrementCounter(fsm);
		}
	};

	cleanup (fsm) {
		fsm.getFsm().removeVariable(this.name);
	};
}

export = IncrementCounterAction;
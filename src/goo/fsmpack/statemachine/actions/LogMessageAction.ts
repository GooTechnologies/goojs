import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class LogMessageAction extends Action {
	message: string;
	everyFrame: boolean;

	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Log Message',
		name: 'Log Message',
		type: 'misc',
		description: 'Prints a message in the debug console of your browser.',
		parameters: [{
			name: 'Message',
			key: 'message',
			type: 'string',
			description: 'Message to print.',
			'default': 'hello'
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
		if (!this.everyFrame) {
			console.log(this.message);
		}
	};

	update (fsm) {
		if (this.everyFrame) {
			console.log(this.message);
		}
	};
}

export = LogMessageAction;
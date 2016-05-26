import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var SystemBus = require('../../../entities/SystemBus');

class EmitAction extends Action {
	channel: string;
	data: any;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Emit message',
		name: 'Emit Message',
		type: 'transitions',
		description: 'Emits a message (event) to a channel on the bus. Messages can be listened to by the Listen action, or by scripts using the SystemBus.addListener(channel, callback) function.',
		parameters: [{
			name: 'Channel',
			key: 'channel',
			type: 'string',
			description: 'Channel to transmit a message (event) on.',
			'default': ''
		}],
		transitions: []
	};

	enter (fsm) {
		SystemBus.emit(this.channel, this.data); // data is unused?
	};
}

export = EmitAction;
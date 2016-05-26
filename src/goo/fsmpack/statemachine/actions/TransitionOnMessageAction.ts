import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var SystemBus = require('../../../entities/SystemBus');

class TransitionOnMessageAction extends Action {
	channel: string;
	eventListener: () => void;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Transition on Message',
		name: 'Listen',
		type: 'transitions',
		description: 'Performs a transition on receiving a system bus message (event) on a specific channel.',
		canTransition: true,
		parameters: [{
			name: 'Message channel',
			key: 'channel',
			type: 'string',
			description: 'Channel to listen to.',
			'default': ''
		}],
		transitions: [{
			key: 'transition',
			description: 'State to transition to.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		var label = actionConfig.options.channel ? '"' + actionConfig.options.channel + '"' : '';
		return transitionKey === 'transition' ? 'On ' + label + ' event' : 'On Message';
	};

	enter (fsm) {
		this.eventListener = function (/*data*/) {
			fsm.send(this.transitions.transition);
		}.bind(this);
		SystemBus.addListener(this.channel, this.eventListener, false);
	};

	exit (/*fsm*/) {
		SystemBus.removeListener(this.channel, this.eventListener);
	};
}

export = TransitionOnMessageAction;
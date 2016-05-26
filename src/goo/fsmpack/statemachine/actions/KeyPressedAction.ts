import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var FsmUtils = require('../../../fsmpack/statemachine/FsmUtils');

class KeyPressedAction extends Action {
	key: string;
	eventListener: () => void;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Key Pressed',
		name: 'Key Pressed',
		type: 'controls',
		description: 'Listens for a key press event and performs a transition. Works over transition boundaries.',
		canTransition: true,
		parameters: [{
			name: 'Key',
			key: 'key',
			type: 'string',
			control: 'key',
			description: 'Key to listen for.',
			'default': 'A'
		}],
		transitions: [{
			key: 'keydown',
			description: 'State to transition to when the key is pressed.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return 'On Key ' + (actionConfig.options.key || '') + ' pressed';
	};

	configure (settings) {
		this.key = settings.key ? FsmUtils.getKey(settings.key) : null;
		this.transitions = { keydown: settings.transitions.keydown };
	};

	enter (fsm) {
		if (fsm.getInputState(this.key)) {
			fsm.send(this.transitions.keydown);
		}
	};

	update (fsm) {
		if (fsm.getInputState(this.key)) {
			fsm.send(this.transitions.keydown);
		}
	};
}

export = KeyPressedAction;
import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var FsmUtils = require('../../../fsmpack/statemachine/FsmUtils');

class KeyDownAction extends Action {
	key: string;
	eventListener: () => void;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Key Down',
		name: 'Key Down',
		type: 'controls',
		description: 'Listens for a key press and performs a transition.',
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

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig) {
		return 'On Key ' + (actionConfig.options.key || '') + ' down';
	};

	configure (settings) {
		this.key = settings.key ? FsmUtils.getKey(settings.key) : null;
		this.transitions = { keydown: settings.transitions.keydown };
	};

	enter (fsm) {
		this.eventListener = function (event) {
			if (this.key && event.which === +this.key) {
				fsm.send(this.transitions.keydown);
			}
		}.bind(this);
		document.addEventListener('keydown', this.eventListener);
	};

	exit () {
		document.removeEventListener('keydown', this.eventListener);
	};
}

export = KeyDownAction;
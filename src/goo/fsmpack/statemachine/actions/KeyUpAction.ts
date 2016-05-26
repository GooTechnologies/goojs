import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var FsmUtils = require('../../../fsmpack/statemachine/FsmUtils');

class KeyUpAction extends Action {
	key: string;
	eventListener: () => void;

	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Key Up',
		name: 'Key Up',
		type: 'controls',
		description: 'Listens for a key release and performs a transition.',
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
			key: 'keyup',
			description: 'State to transition to when the key is released.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return 'On Key ' + (actionConfig.options.key || '') + ' up';
	};

	configure (settings) {
		this.key = settings.key ? FsmUtils.getKey(settings.key) : null;
		this.transitions = { keyup: settings.transitions.keyup };
	};

	enter (fsm) {
		this.eventListener = function (event) {
			if (!this.key || event.which === +this.key) {
				fsm.send(this.transitions.keyup);
			}
		}.bind(this);
		document.addEventListener('keyup', this.eventListener);
	};

	exit () {
		document.removeEventListener('keyup', this.eventListener);
	};
}

export = KeyUpAction;
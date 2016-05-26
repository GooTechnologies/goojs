import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

var keys = {
	38: 'up',
	37: 'left',
	40: 'down',
	39: 'right'
};

var labels = {
	up: 'On key UP',
	left: 'On key LEFT',
	down: 'On key DOWN',
	right: 'On key RIGHT'
};

class ArrowsAction extends Action {
	targets: Array<any>;
	eventListener: () => void;
	constructor(id: string, options: any){
		super(id, options);
	}

	configure (settings) {
		this.targets = settings.transitions;
	};

	static external: External = {
		key: 'Arrow Keys Listener',
		name: 'Arrow Keys',
		type: 'controls',
		description: 'Transitions to other states when arrow keys are pressed (keydown).',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'up',
			description: "On key up pressed."
		}, {
			key: 'left',
			description: "On key left pressed."
		}, {
			key: 'down',
			description: "On key down pressed."
		}, {
			key: 'right',
			description: "On key right pressed."
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey , actionConfig){
		return labels[transitionKey];
	};

	enter (fsm) {
		this.eventListener = function (event) {
			var keyname = keys[event.which];
			var target = this.targets[keyname];
			if (target) {
				fsm.send(target);
			}
		}.bind(this);
		document.addEventListener('keydown', this.eventListener);
	};

	exit () {
		document.removeEventListener('keydown', this.eventListener);
	};
}

export = ArrowsAction;
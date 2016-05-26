import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

var labels = {
	transition: 'On Next Frame'
};

class NextFrameAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'transitionOnNextFrame',
		name: 'Transition on next frame',
		type: 'transitions',
		description: 'Transition to a selected state on the next frame.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'transition',
			name: 'On Next Frame',
			description: 'State to transition to on next frame.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey , actionConfig){
		return labels[transitionKey];
	};

	update (fsm) {
		fsm.send(this.transitions.transition);
	};
}

export = NextFrameAction;
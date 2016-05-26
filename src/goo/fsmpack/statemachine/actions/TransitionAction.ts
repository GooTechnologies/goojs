import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

var labels = {
	transition: 'On Enter'
};

class TransitionAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Transition',
		name: 'Transition',
		type: 'transitions',
		description: 'Transition to a selected state.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'transition',
			description: 'State to transition to.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey , actionConfig){
		return labels[transitionKey];
	};

	enter (fsm) {
		fsm.send(this.transitions.transition);
	};
}

export = TransitionAction;
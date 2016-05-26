import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

var labels = {
	transition1: 'On random outcome A',
	transition2: 'On random outcome B'
};

class RandomTransitionAction extends Action {
	skewness: number;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Random Transition',
		name: 'Random Transition',
		type: 'transitions',
		description: 'Performs a random transition. Will choose one of the two transitions randomly and transition immediately.',
		canTransition: true,
		parameters: [{
			name: 'Probability A',
			key: 'skewness',
			type: 'float',
			control: 'slider',
			min: 0,
			max: 1,
			description: 'The probability that the first destination is chosen over the second.',
			'default': 0.5
		}],
		transitions: [{
			key: 'transition1',
			description: 'First choice.'
		}, {
			key: 'transition2',
			description: 'Second choice.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey , actionConfig){
		return labels[transitionKey];
	};

	enter (fsm) {
		var transitions = this.transitions;
		var a = transitions.transition1;
		var b = transitions.transition2;
		var transition = Math.random() < this.skewness ? a : b;
		fsm.send(transition);
	};
}

export = RandomTransitionAction;
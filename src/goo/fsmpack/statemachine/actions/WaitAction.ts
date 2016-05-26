import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

/**
 * @private
 * @extends Action
 */
class WaitAction extends Action {
	currentTime: number;
	totalWait: number;
	completed: boolean;
	waitTime: number;
	randomTime: number;
	constructor(id: string, options: any){
		super(id, options);
		this.currentTime = 0;
		this.totalWait = 0;
		this.completed = false;
	}

	static external: External = {
		key: 'Wait',
		name: 'Wait',
		type: 'animation',
		description: 'Performs a transition after a specified amount of time. A random time can be set, this will add between 0 and the set random time to the specified wait time.',
		canTransition: true,
		parameters: [{
			name: 'Time (ms)',
			key: 'waitTime',
			type: 'float',
			description: 'Base time in milliseconds before transition fires.',
			'default': 5000
		}, {
			name: 'Random (ms)',
			key: 'randomTime',
			type: 'float',
			description: 'A random number of milliseconds (between 0 and this value) will be added to the base wait time.',
			'default': 0
		}],
		transitions: [{
			key: 'timeUp',
			description: 'State to transition to when time up.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return transitionKey === 'timeUp' ? 'On Wait End' : undefined;
	};

	enter () {
		this.completed = false;
		this.currentTime = 0;
		this.totalWait = this.waitTime + Math.random() * this.randomTime;
	};

	update (fsm) {
		this.currentTime += fsm.getTpf() * 1000;
		if (this.currentTime >= this.totalWait && !this.completed) {
			this.completed = true;
			fsm.send(this.transitions.timeUp);
		}
	};
}

export = WaitAction;
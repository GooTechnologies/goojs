import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var Vector3 = require('../../../math/Vector3');
var Easing = require('../../../util/Easing');

class TweenScaleAction extends Action {
	fromScale: any;
	toScale: any;
	completed: boolean;
	to: Array<number>;
	relative: boolean;
	time: number;
	startTime: number;
	easing1: string;
	easing2: string;
	constructor(id: string, options: any){
		super(id, options);
		this.fromScale = new Vector3();
		this.toScale = new Vector3();
		this.completed = false;
	}

	static external: External = {
		key: 'Tween Scale',
		name: 'Tween Scale',
		type: 'animation',
		description: 'Transition to the set scale.',
		canTransition: true,
		parameters: [{
			name: 'Scale',
			key: 'to',
			type: 'position',
			description: 'Scale.',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add, otherwise set.',
			'default': true
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for this movement to complete.',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type.',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction.',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the scaling completes.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return transitionKey === 'complete' ? 'On Tween Scale Complete' : undefined;
	};

	enter (fsm) {
		var transformComponent = fsm.getOwnerEntity().transformComponent;

		this.fromScale.set(transformComponent.transform.scale);
		this.toScale.setDirect(this.to[0], this.to[1], this.to[2]);
		if (this.relative) {
			this.toScale.add(this.fromScale);
		}

		this.startTime = fsm.getTime();
		this.completed = false;
	};

	update (fsm) {
		if (this.completed) {
			return;
		}
		var transformComponent = fsm.getOwnerEntity().transformComponent;

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = Easing[this.easing1][this.easing2](t);

		transformComponent.transform.scale.set(this.fromScale).lerp(this.toScale, fT);
		transformComponent.setUpdated();

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};
}

export = TweenScaleAction;
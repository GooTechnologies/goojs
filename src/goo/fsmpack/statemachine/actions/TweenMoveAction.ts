import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
import Vector3 = require('../../../math/Vector3');
import Easing = require('../../../util/Easing');

class TweenMoveAction extends Action {
	fromPos: any;
	toPos: any;
	deltaPos: any;
	oldPos: any;
	completed: boolean;
	to: Array<number>;
	time: number;
	startTime: number;
	easing1: string;
	easing2: string;
	relative: boolean;
	constructor(id: string, options: any){
		super(id, options);
		this.fromPos = new Vector3();
		this.toPos = new Vector3();
		this.deltaPos = new Vector3();
		this.oldPos = new Vector3();
		this.completed = false;
	}

	static external: External = {
		key: 'Tween Move',
		name: 'Tween Move',
		type: 'animation',
		description: 'Transition to the set location.',
		canTransition: true,
		parameters: [{
			name: 'Translation',
			key: 'to',
			type: 'position',
			description: 'Move.',
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
			description: 'State to transition to when the movement completes.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return transitionKey === 'complete' ? 'On Tween Move Complete' : undefined;
	};

	enter (fsm) {
		var transformComponent = fsm.getOwnerEntity().transformComponent.sync();

		this.fromPos.set(transformComponent.transform.translation);
		this.toPos.setDirect(this.to[0], this.to[1], this.to[2]);
		if (this.relative) {
			this.oldPos.set(this.fromPos);
			this.toPos.add(this.fromPos);
		}

		this.startTime = fsm.getTime();
		this.completed = false;
	};

	update (fsm) {
		if (this.completed) {
			return;
		}
		var transformComponent = fsm.getOwnerEntity().transformComponent.sync();

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = Easing[this.easing1][this.easing2](t);

		if (this.relative) {
			this.deltaPos.set(this.fromPos).lerp(this.toPos, fT).sub(this.oldPos);
			transformComponent.transform.translation.add(this.deltaPos);
			this.oldPos.add(this.deltaPos);
		} else {
			transformComponent.transform.translation.set(this.fromPos).lerp(this.toPos, fT);
		}

		transformComponent.setUpdated();

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};
}

export = TweenMoveAction;
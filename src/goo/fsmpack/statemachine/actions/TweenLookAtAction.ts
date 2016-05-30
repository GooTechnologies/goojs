import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
import Vector3 = require('../../../math/Vector3');
import Quaternion = require('../../../math/Quaternion');
import Easing = require('../../../util/Easing');

class TweenLookAtAction extends Action {
	quatFrom: any;
	quatTo: any;
	quatFinal: any;
	completed: boolean;
	rot: any;
	startTime: number;
	time: number;
	easing1: string;
	easing2: string;
	to: Array<number>;
	constructor(id: string, options: any){
		super(id, options);
		this.quatFrom = new Quaternion();
		this.quatTo = new Quaternion();
		this.quatFinal = new Quaternion();
		this.completed = false;
	}

	static external: External = {
		key: 'Tween Look At',
		name: 'Tween Look At',
		type: 'animation',
		description: 'Transition the entity\'s rotation to face the set position.',
		canTransition: true,
		parameters: [{
			name: 'Position',
			key: 'to',
			type: 'position',
			description: 'Look at point.',
			'default': [0, 0, 0]
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
			description: 'State to transition to when the transition completes.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return transitionKey === 'complete' ? 'On Tween LookAt Complete' : undefined;
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;

		this.startTime = fsm.getTime();

		this.quatFrom.fromRotationMatrix(transform.rotation);

		var dir = Vector3.fromArray(this.to).sub(transform.translation);
		this.rot = transform.rotation.clone();
		this.rot.lookAt(dir, Vector3.UNIT_Y);
		this.quatTo.fromRotationMatrix(this.rot);

		this.completed = false;
	};

	update (fsm) {
		if (this.completed) {
			return;
		}
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = Easing[this.easing1][this.easing2](t);
		Quaternion.slerp(this.quatFrom, this.quatTo, fT, this.quatFinal);

		this.quatFinal.toRotationMatrix(transform.rotation);
		entity.transformComponent.setUpdated();

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};
}

export = TweenLookAtAction;
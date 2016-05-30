import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
import Quaternion = require('../../../math/Quaternion');
import Matrix3 = require('../../../math/Matrix3');
import MathUtils = require('../../../math/MathUtils');
import Easing = require('../../../util/Easing');

class TweenRotationAction extends Action {
	quatFrom: any;
	quatTo: any;
	quatFinal: any;
	completed: boolean;
	time: number;
	startTime: number;
	easing1: string;
	easing2: string;
	to: Array<number>;
	relative: boolean;

	constructor(id: string, options: any){
		super(id, options);
		this.quatFrom = new Quaternion();
		this.quatTo = new Quaternion();
		this.quatFinal = new Quaternion();
		this.completed = false;
	}

	static external: External = {
		key: 'Tween Rotation',
		name: 'Tween Rotate',
		type: 'animation',
		description: 'Transition to the set rotation, in angles.',
		canTransition: true,
		parameters: [{
			name: 'Rotation',
			key: 'to',
			type: 'rotation',
			description: 'Rotation.',
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
			description: 'State to transition to when the rotation completes.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return transitionKey === 'complete' ? 'On Tween Rotation Complete' : undefined;
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent.sync();

		this.startTime = fsm.getTime();

		this.quatFrom.fromRotationMatrix(transformComponent.transform.rotation);
		this.quatTo.fromRotationMatrix(new Matrix3().fromAngles(this.to[0] * MathUtils.DEG_TO_RAD, this.to[1] * MathUtils.DEG_TO_RAD, this.to[2] * MathUtils.DEG_TO_RAD));
		if (this.relative) {
			this.quatTo.mul(this.quatFrom);
		}
		this.completed = false;
	};

	update (fsm) {
		if (this.completed) {
			return;
		}
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.sync().transform;

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

export = TweenRotationAction;
import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var Vector3 = require('../../../math/Vector3');
var MathUtils = require('../../../math/MathUtils');
var Easing = require('../../../util/Easing');

var labels = {
	complete: 'On Shake Complete'
};

class ShakeAction extends Action {
	startLevel: number;
	endLevel: number;
	time: number;
	oldVal: any;
	target: any;
	vel: any;
	completed: boolean;
	easing: (number) => number;
	eventToEmit: any;
	iter: number;
	startTime: number;
	speed: number;

	constructor(id: string, options: any){
		super(id, options);
		this.oldVal = new Vector3();
		this.target = new Vector3();
		this.vel = new Vector3();
		this.completed = false;
	}

	static external: External = {
		key: 'Shake',
		name: 'Shake',
		type: 'animation',
		description: 'Shakes the entity. Optionally performs a transition.',
		canTransition: true,
		parameters: [{
			name: 'Start level',
			key: 'startLevel',
			type: 'float',
			description: 'Shake amount at start.',
			'default': 0
		}, {
			name: 'End level',
			key: 'endLevel',
			type: 'float',
			description: 'Shake amount at the end.',
			'default': 10
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Shake time amount.',
			'default': 1000
		}, {
			name: 'Speed',
			key: 'speed',
			type: 'string',
			control: 'dropdown',
			description: 'Speed of shaking.',
			'default': 'Fast',
			options: ['Fast', 'Medium', 'Slow']
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the shake completes.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey , actionConfig) {
		return labels[transitionKey];
	};

	configure (settings) {
		this.startLevel = settings.startLevel;
		this.endLevel = settings.endLevel;
		this.time = settings.time;
		this.speed = { Fast: 1, Medium: 2, Slow: 4 }[settings.speed];
		this.easing = Easing.Quadratic.InOut;
		this.eventToEmit = settings.transitions.complete;
	};

	enter (fsm) {
		this.oldVal.set(Vector3.ZERO);
		this.target.set(Vector3.ZERO);
		this.vel.set(Vector3.ZERO);
		this.iter = 0;
		this.startTime = fsm.getTime();
		this.completed = false;
	};

	update (fsm) {
		if (this.completed) {
			return;
		}
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = this.easing(t);

		var level = MathUtils.lerp(fT, this.startLevel, this.endLevel);

		this.iter++;
		if (this.iter > this.speed) {
			this.iter = 0;

			this.target.setDirect(
				-this.oldVal.x + (Math.random() - 0.5) * level * 2,
				-this.oldVal.y + (Math.random() - 0.5) * level * 2,
				-this.oldVal.z + (Math.random() - 0.5) * level * 2
			);
		}

		this.vel.setDirect(
			this.vel.x * 0.98 + (this.target.x) * 0.1,
			this.vel.y * 0.98 + (this.target.y) * 0.1,
			this.vel.z * 0.98 + (this.target.z) * 0.1
		);

		translation.add(this.vel).sub(this.oldVal);
		this.oldVal.copy(this.vel);
		transformComponent.setUpdated();

		if (t >= 1) {
			translation.sub(this.oldVal);
			transformComponent.setUpdated();
			this.completed = true;
			fsm.send(this.eventToEmit);
		}
	};
}

export = ShakeAction;
define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/math/MathUtils',
	'goo/math/Vector3',
	'goo/util/TWEEN'
], function (
	Action,
	MathUtils,
	Vector3,
	TWEEN
) {
	'use strict';

	function ShakeAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.oldVal = new Vector3();
		this.target = new Vector3();
		this.vel = new Vector3();
		this.completed = false;
	}

	ShakeAction.prototype = Object.create(Action.prototype);
	ShakeAction.prototype.constructor = ShakeAction;

	ShakeAction.external = {
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

	var labels = {
		complete: 'On Shake Complete'
	};

	ShakeAction.getTransitionLabel = function(transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	ShakeAction.prototype.configure = function (settings) {
		this.startLevel = settings.startLevel;
		this.endLevel = settings.endLevel;
		this.time = settings.time;
		this.speed = { Fast: 1, Medium: 2, Slow: 4 }[settings.speed];
		this.easing = TWEEN.Easing.Quadratic.InOut;
		this.eventToEmit = settings.transitions.complete;
	};

	ShakeAction.prototype.enter = function (fsm) {
		this.oldVal.set(Vector3.ZERO);
		this.target.set(Vector3.ZERO);
		this.vel.set(Vector3.ZERO);
		this.iter = 0;
		this.startTime = fsm.getTime();
		this.completed = false;
	};

	ShakeAction.prototype.update = function (fsm) {
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
			fsm.send(this.eventToEmit);
			this.completed = true;
		}
	};

	return ShakeAction;
});
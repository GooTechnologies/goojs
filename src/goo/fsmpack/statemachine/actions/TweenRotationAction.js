define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/math/Quaternion',
	'goo/math/Matrix3',
	'goo/math/MathUtils',
	'goo/util/TWEEN'
], function (
	Action,
	Quaternion,
	Matrix3,
	MathUtils,
	TWEEN
) {
	'use strict';

	function TweenRotationAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.quatFrom = new Quaternion();
		this.quatTo = new Quaternion();
		this.quatFinal = new Quaternion();
	}

	TweenRotationAction.prototype = Object.create(Action.prototype);
	TweenRotationAction.prototype.constructor = TweenRotationAction;

	TweenRotationAction.external = {
		key: 'Tween Rotation',
		name: 'Tween Rotate',
		type: 'animation',
		description: 'Transition to the set rotation, in angles.',
		canTransition: true,
		parameters: [{
			name: 'Rotation',
			key: 'to',
			type: 'rotation',
			description: 'Rotation',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add, otherwise set',
			'default': true
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for this movement to complete',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the rotation completes'
		}]
	};

	TweenRotationAction.prototype.ready = function () {
		if (this.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[this.easing1][this.easing2];
		}
	};

	TweenRotationAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;

		this.startTime = fsm.getTime();

		this.quatFrom.fromRotationMatrix(transformComponent.transform.rotation);
		this.quatTo.fromRotationMatrix(new Matrix3().fromAngles(this.to[0] * MathUtils.DEG_TO_RAD, this.to[1] * MathUtils.DEG_TO_RAD, this.to[2] * MathUtils.DEG_TO_RAD));
		if (this.relative) {
			this.quatTo.mul(this.quatFrom);
		}
	};

	TweenRotationAction.prototype.update = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = this.easing(t);
		Quaternion.slerp(this.quatFrom, this.quatTo, fT, this.quatFinal);

		this.quatFinal.toRotationMatrix(transform.rotation);
		entity.transformComponent.setUpdated();

		if (t >= 1) {
			fsm.send(this.transitions.complete);
		}
	};

	return TweenRotationAction;
});
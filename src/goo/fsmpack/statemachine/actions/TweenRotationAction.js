define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/math/Quaternion',
	'goo/math/Matrix3x3',
	'goo/math/MathUtils',
	'goo/util/Tween'
], function (
	Action,
	Quaternion,
	Matrix3x3,
	MathUtils,
	TWEEN
) {
	'use strict';

	function TweenRotationAction(/*id, settings*/) {
		Action.apply(this, arguments);
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
			type: 'number',
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

	TweenRotationAction.prototype.configure = function(settings) {
		this.to = settings.to;
		this.relative = settings.relative;
		this.time = settings.time;
		if (settings.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	TweenRotationAction.prototype._setup = function() {
		this.tween = new TWEEN.Tween();
	};

	TweenRotationAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	TweenRotationAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var rotation = transformComponent.transform.rotation;

		var initialRotation = new Quaternion().fromRotationMatrix(rotation);
		var finalRotation = new Quaternion().fromRotationMatrix(new Matrix3x3().fromAngles(this.to[0] * MathUtils.DEG_TO_RAD, this.to[1] * MathUtils.DEG_TO_RAD, this.to[2] * MathUtils.DEG_TO_RAD));
		var workQuaternion = new Quaternion();
		var time = entity._world.time * 1000;

		if (this.relative) {
			Quaternion.mul(initialRotation, finalRotation, finalRotation);
		}

		this.tween.from({ t: 0 }).to({ t: 1 }, +this.time).easing(this.easing).onUpdate(function() {
			Quaternion.slerp(initialRotation, finalRotation, this.t, workQuaternion);
			rotation.copyQuaternion(workQuaternion);
			transformComponent.setUpdated();
		}).onComplete(function() {
			fsm.send(this.eventToEmit.channel);
		}.bind(this)).start(time);
	};

	return TweenRotationAction;
});
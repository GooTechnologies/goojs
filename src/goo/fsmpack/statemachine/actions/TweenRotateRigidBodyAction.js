define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/math/Quaternion',
	'goo/math/Matrix3x3',
	'goo/math/Vector3',
	'goo/math/MathUtils',
	'goo/math/TweenUtil'
], function (
	Action,
	Quaternion,
	Matrix3x3,
	Vector3,
	MathUtils,
	TweenUtil
) {
	'use strict';

	function TweenRotateRigidBodyAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TweenRotateRigidBodyAction.prototype = Object.create(Action.prototype);
	TweenRotateRigidBodyAction.prototype.constructor = TweenRotateRigidBodyAction;

	TweenRotateRigidBodyAction.external = {
		key: 'Tween Rotate RigidBody',
		name: 'Tween Rotate RigidBody',
		type: 'physics',
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

	TweenRotateRigidBodyAction.prototype.configure = function (settings) {
		this.to = settings.to;
		this.relative = settings.relative;
		this.time = settings.time;
		if (settings.easing1 === 'Linear') {
			this.easing = window.TWEEN.Easing.Linear.None;
		} else {
			this.easing = window.TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	TweenRotateRigidBodyAction.prototype._setup = function () {
		this.tween = new window.TWEEN.Tween();
	};

	TweenRotateRigidBodyAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	var newQuaternion = new Quaternion();
	var newVelocity = new Vector3();

	TweenRotateRigidBodyAction.prototype.fixedUpdate = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var rigidBodyComponent = entity.rigidBodyComponent;

		if (rigidBodyComponent && this.startTime >= 0) {
			var world = entity._world;
			var timeSeconds = this.time / 1000;
			var progress = (world.fixedTime - this.startTime) / timeSeconds;

			if (progress < 1) {
				Quaternion.slerp(this.fromQuaternion, this.toQuaternion, this.easing(progress), newQuaternion);
				rigidBodyComponent.setQuaternion(newQuaternion);

				// Set velocity
				var speed = TweenUtil.getApproxDerivative(this.easing, progress, 0.01) * this.rotationAngle;
				newVelocity.copy(this.rotationAxis).scale(speed / timeSeconds);
				rigidBodyComponent.setAngularVelocity(newVelocity);

			} else {

				// At end of the path
				rigidBodyComponent.setQuaternion(this.toQuaternion);
				//entity.transformComponent.transform.rotation.copy(this.toQuaternion);
				newVelocity.setDirect(0, 0, 0);
				rigidBodyComponent.setAngularVelocity(newVelocity);
				this.startTime = -1;
				fsm.send(this.eventToEmit.channel);
			}
		}
	};

	TweenRotateRigidBodyAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var rotation = transformComponent.transform.rotation;

		if (entity.rigidBodyComponent) {
			this.startTime = entity._world.fixedTime;
			this.fromQuaternion = new Quaternion().fromRotationMatrix(rotation);
			this.toQuaternion = new Quaternion().fromRotationMatrix(new Matrix3x3().fromAngles(this.to[0] * MathUtils.DEG_TO_RAD, this.to[1] * MathUtils.DEG_TO_RAD, this.to[2] * MathUtils.DEG_TO_RAD));

			if (this.relative) {
				Quaternion.mul(this.fromQuaternion, this.toQuaternion, this.toQuaternion);
			}

			// Get rotation axis - for the angular velocity
			this.rotationAxis = new Vector3();
			this.rotationAngle = this.fromQuaternion.clone().conjugate().mul(this.toQuaternion).toAngleAxis(this.rotationAxis);

			this.fixedUpdate(fsm);
			this.startTime = entity._world.fixedTime + entity._world.fixedDeltaTime;
		}
	};

	return TweenRotateRigidBodyAction;
});
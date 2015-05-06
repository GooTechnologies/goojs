define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/math/Vector3'
], function (
	Action,
	Vector3
) {
	'use strict';

	function TweenMoveAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this.startTime = -1;
	}

	TweenMoveAction.prototype = Object.create(Action.prototype);
	TweenMoveAction.prototype.constructor = TweenMoveAction;

	TweenMoveAction.external = {
		name: 'Tween Move',
		type: 'animation',
		description: 'Transition to the set location.',
		canTransition: true,
		parameters: [{
			name: 'Translation',
			key: 'to',
			type: 'position',
			description: 'Move',
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
			description: 'State to transition to when the movement completes'
		}]
	};

	TweenMoveAction.prototype.configure = function (settings) {
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

	TweenMoveAction.prototype._setup = function (/*fsm*/) {
		this.tween = new window.TWEEN.Tween();
	};

	TweenMoveAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	function getApproxTweenDerivative(f, t, eps) {
		if (t - eps > 0 && t + eps < 1) {
			// Midpoint
			return (f(t + eps) - f(t - eps)) / (2 * eps);
		} else if (t > 0.5) {
			// Upper
			t = Math.min(1, t);
			return (f(t) - f(t - eps)) / eps;
		} else {
			// Lower
			t = Math.max(0, t);
			return (f(t + eps) - f(t)) / eps;
		}
	}

	var newPos = new Vector3();
	var newVelocity = new Vector3();

	TweenMoveAction.prototype.fixedUpdate = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var rigidBodyComponent = entity.rigidBodyComponent;
		var world = entity._world;
		var timeSeconds = this.time / 1000;

		if (this.startTime >= 0) {
			// var oldX = rigidBodyComponent.cannonBody.position.y;
			// var oldV = rigidBodyComponent.cannonBody.velocity.y;
			// var contTime = this.startTime;

			var progress = (world.fixedTime - this.startTime) / timeSeconds;
			newPos.copy(this.fromVector);
			if (progress < 1) {

				newPos.lerp(this.toVector, this.easing(progress));
				rigidBodyComponent.setPosition(newPos);
				var speed = getApproxTweenDerivative(this.easing, progress, 0.01);
				newVelocity.copy(this.directionVector).scale(speed / timeSeconds);
				rigidBodyComponent.setVelocity(newVelocity);

			} else {

				// At end of the path
				rigidBodyComponent.setPosition(this.toVector);
				entity.transformComponent.transform.translation.copy(this.toVector);
				rigidBodyComponent.setVelocity(newVelocity);
				this.startTime = -1;
				fsm.send(this.eventToEmit.channel);
			}
		}
	};

	TweenMoveAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;
		var initialTranslation = new Vector3().copy(translation);

		if (entity.rigidBodyComponent) {

			this.startTime = entity._world.fixedTime;
			this.fromVector = initialTranslation.clone();
			this.toVector = this.relative ? new Vector3(this.to).addVector(initialTranslation) : new Vector3(this.to);
			this.directionVector = new Vector3().setVector(this.toVector).subVector(this.fromVector);
			this.fixedUpdate(fsm);
			this.startTime = entity._world.fixedTime + entity._world.fixedDeltaTime;

		} else {

			var time = entity._world.time * 1000;

			var fakeFrom = { x: initialTranslation.x, y: initialTranslation.y, z: initialTranslation.z };
			var fakeTo;

			var old = { x: fakeFrom.x, y: fakeFrom.y, z: fakeFrom.z };

			if (this.relative) {
				var to = Vector3.add(initialTranslation, this.to);
				fakeTo = { x: to.x, y: to.y, z: to.z };

				// it's a string until property controls are fixed
				if (this.time === '0') {
					// have to do this manually since tween.js chokes for time = 0
					translation.data[0] += fakeTo.x - old.x;
					translation.data[1] += fakeTo.y - old.y;
					translation.data[2] += fakeTo.z - old.z;
					transformComponent.setUpdated();
					fsm.send(this.eventToEmit.channel);
				} else {
					this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
						translation.data[0] += this.x - old.x;
						translation.data[1] += this.y - old.y;
						translation.data[2] += this.z - old.z;

						old.x = this.x;
						old.y = this.y;
						old.z = this.z;

						transformComponent.setUpdated();
					}).onComplete(function () {
						fsm.send(this.eventToEmit.channel);
					}.bind(this)).start(time);
				}
			} else {
				fakeTo = { x: this.to[0], y: this.to[1], z: this.to[2] };

				if (this.time === '0') {
					// have to do this manually since tween.js chokes for time = 0
					translation.data[0] += fakeTo.x - old.x;
					translation.data[1] += fakeTo.y - old.y;
					translation.data[2] += fakeTo.z - old.z;
					transformComponent.setUpdated();
					fsm.send(this.eventToEmit.channel);
				} else {
					this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
						translation.data[0] += this.x - old.x;
						translation.data[1] += this.y - old.y;
						translation.data[2] += this.z - old.z;

						old.x = this.x;
						old.y = this.y;
						old.z = this.z;

						transformComponent.setUpdated();
					}).onComplete(function () {
						fsm.send(this.eventToEmit.channel);
					}.bind(this)).start(time);
				}
			}
		}
	};

	return TweenMoveAction;
});
define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/math/Vector3'
],
/** @lends */
function(
	Action,
	Vector3
) {
	'use strict';

	function TweenLookAtAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TweenLookAtAction.prototype = Object.create(Action.prototype);
	TweenLookAtAction.prototype.constructor = TweenLookAtAction;

	TweenLookAtAction.external = {
		name: 'Tween Look At',
		type: 'animation',
		description: 'Transition the entity\'s rotation to face the set position.',
		canTransition: true,
		parameters: [{
			name: 'Position',
			key: 'to',
			type: 'position',
			description: 'Look at point',
			'default': [0, 0, 0]
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
			name: 'On completion',
			description: 'State to transition to when the transition completes'
		}]
	};

	TweenLookAtAction.prototype.configure = function(settings) {
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

	TweenLookAtAction.prototype._setup = function() {
		this.tween = new window.TWEEN.Tween();
	};

	TweenLookAtAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	TweenLookAtAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var transform = transformComponent.transform;

		var distance = Vector3.distance(new Vector3(this.to), transform.translation);
		var time = entity._world.time * 1000;

		var initialLookAt = new Vector3(0, 0, 1);
		var orientation = transform.rotation;
		orientation.applyPost(initialLookAt);
		initialLookAt.scale(distance);

		var fakeFrom = { x: initialLookAt.x, y: initialLookAt.y, z: initialLookAt.z };
		var fakeTo = { x: this.to[0], y: this.to[1], z: this.to[2] };
		var tmpVec3 = new Vector3();

		this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function() {
			tmpVec3.data[0] = this.x;
			tmpVec3.data[1] = this.y;
			tmpVec3.data[2] = this.z;
			transform.lookAt(tmpVec3, Vector3.UNIT_Y);
			transformComponent.setUpdated();
		}).onComplete(function() {
			fsm.send(this.eventToEmit.channel);
		}.bind(this)).start(time);
	};

	return TweenLookAtAction;
});
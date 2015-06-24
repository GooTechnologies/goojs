define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/util/Tween'
], function (
	Action,
	TWEEN
) {
	'use strict';

	function TweenLightColorAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TweenLightColorAction.prototype = Object.create(Action.prototype);
	TweenLightColorAction.prototype.constructor = TweenLightColorAction;

	TweenLightColorAction.external = {
		key: 'Tween Light Color',
		name: 'Tween Light',
		type: 'light',
		description: 'Tweens the color of the light',
		parameters: [{
			name: 'Color',
			key: 'to',
			type: 'vec3',
			control: 'color',
			description: 'Color of the light',
			'default': [1, 1, 1]
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'number',
			description: 'Time it takes for the transition to complete',
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
			description: 'State to transition to when the transition completes'
		}]
	};

	TweenLightColorAction.prototype.configure = function (settings) {
		this.to = settings.to;
		this.time = settings.time;
		if (settings.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	TweenLightColorAction.prototype._setup = function (/*fsm*/) {
		this.tween = new TWEEN.Tween();
	};

	TweenLightColorAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	TweenLightColorAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.lightComponent) {
			var lightComponent = entity.lightComponent;
			var color = lightComponent.light.color;
			var time = entity._world.time * 1000;

			var fakeFrom = { x: color.x, y: color.y, z: color.z };
			var fakeTo = { x: this.to[0], y: this.to[1], z: this.to[2] };

			var old = { x: fakeFrom.x, y: fakeFrom.y, z: fakeFrom.z };

			this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
				color.x += this.x - old.x;
				color.y += this.y - old.y;
				color.z += this.z - old.z;

				old.x = this.x;
				old.y = this.y;
				old.z = this.z;
			}).onComplete(function () {
					fsm.send(this.eventToEmit.channel);
				}.bind(this)).start(time);
		}
	};

	return TweenLightColorAction;
});
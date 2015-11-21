var Action = require('../../../fsmpack/statemachine/actions/Action');
var Vector3 = require('../../../math/Vector3');
var TWEEN = require('../../../util/TWEEN');

	'use strict';

	function TweenScaleAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TweenScaleAction.prototype = Object.create(Action.prototype);
	TweenScaleAction.prototype.constructor = TweenScaleAction;

	TweenScaleAction.external = {
		name: 'Tween Scale',
		type: 'animation',
		description: 'Transition to the set scale.',
		canTransition: true,
		parameters: [{
			name: 'Scale',
			key: 'to',
			type: 'position',
			description: 'Scale',
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
			description: 'State to transition to when the scaling completes'
		}]
	};

	TweenScaleAction.prototype.configure = function (settings) {
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

	TweenScaleAction.prototype._setup = function () {
		this.tween = new TWEEN.Tween();
	};

	TweenScaleAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	TweenScaleAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var scale = transformComponent.transform.scale;
		var initialScale = scale.clone();

		var fakeFrom = { x: initialScale.x, y: initialScale.y, z: initialScale.z };
		var fakeTo;
		var time = entity._world.time * 1000;

		if (this.relative) {
			var to = Vector3.fromArray(this.to).add(initialScale);
			fakeTo = { x: to.x, y: to.y, z: to.z };

			this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
				scale.setDirect(this.x, this.y, this.z);
				transformComponent.setUpdated();
			}).onComplete(function () {
					fsm.send(this.eventToEmit.channel);
				}.bind(this)).start(time);
		} else {
			fakeTo = { x: this.to[0], y: this.to[1], z: this.to[2] };

			this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
				scale.setDirect(this.x, this.y, this.z);
				transformComponent.setUpdated();
			}).onComplete(function () {
					fsm.send(this.eventToEmit.channel);
				}.bind(this)).start(time);
		}
	};

	module.exports = TweenScaleAction;
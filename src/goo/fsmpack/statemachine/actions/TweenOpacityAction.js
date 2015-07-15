define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/util/TWEEN'
], function (
	Action,
	TWEEN
) {
	'use strict';

	function TweenOpacityAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TweenOpacityAction.prototype = Object.create(Action.prototype);
	TweenOpacityAction.prototype.constructor = TweenOpacityAction;

	TweenOpacityAction.external = {
		name: 'Tween Opacity',
		type: 'texture',
		description: 'Tweens the opacity of a material',
		parameters: [{
			name: 'Opacity',
			key: 'to',
			type: 'float',
			control: 'spinner',
			description: 'Opacity',
			'default': 1
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			control: 'spinner',
			description: 'Time it takes for the transition to complete',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Bounce']
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

	TweenOpacityAction.prototype.configure = function (settings) {
		this.to = settings.to;
		this.time = settings.time;
		if (settings.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	TweenOpacityAction.prototype._setup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var meshRendererComponent = entity.meshRendererComponent;

		if (meshRendererComponent) {
			this.tween = new TWEEN.Tween();

			this.material = meshRendererComponent.materials[0];
			this.oldBlending = this.material.blendState.blending;
			this.oldQueue = this.material.renderQueue;
			this.oldOpacity = this.material.uniforms.opacity;

			this.material.blendState.blending = 'CustomBlending';
			if (this.material.renderQueue < 2000) {
				this.material.renderQueue = 2000;
			}

			if (this.material.uniforms.opacity === undefined) {
				this.material.uniforms.opacity = 1;
			}
		}
	};

	TweenOpacityAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();

			this.material.blendState.blending = this.oldBlending;
			this.material.renderQueue = this.oldQueue;
			this.material.uniforms.opacity = this.oldOpacity;
		}
	};

	TweenOpacityAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.meshRendererComponent) {
			var uniforms = this.material.uniforms;

			var time = entity._world.time * 1000;

			var fakeFrom = { opacity: uniforms.opacity };
			var fakeTo = { opacity: this.to };

			var old = { opacity: fakeFrom.opacity };

			this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
				uniforms.opacity += this.opacity - old.opacity;

				old.opacity = this.opacity;
			}).onComplete(function () {
				fsm.send(this.eventToEmit.channel);
			}.bind(this)).start(time);
		}
	};

	return TweenOpacityAction;
});
define([
	'goo/fsmpack/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

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
			type: 'number',
			description: 'Opacity',
			'default': 1
		}, {
			name: 'Time',
			key: 'time',
			type: 'number',
			description: 'Time it takes for the transition to complete',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'dropdown',
			description: 'Easing type',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'dropdown',
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
			this.easing = window.TWEEN.Easing.Linear.None;
		} else {
			this.easing = window.TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	TweenOpacityAction.prototype._setup = function (/*fsm*/) {
		this.tween = new window.TWEEN.Tween();
	};

	TweenOpacityAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	TweenOpacityAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.meshRendererComponent) {
			var meshRendererComponent = entity.meshRendererComponent;
			var material = meshRendererComponent.materials[0];
			var uniforms = material.uniforms;

			var fakeFrom = { opacity: uniforms.opacity === undefined ? 1 : uniforms.opacity };
			var fakeTo = { opacity: this.to };

			var old = { opacity: fakeFrom.opacity };

			if (material.blendState.blending === 'NoBlending') {
				material.blendState.blending = 'CustomBlending';
			}
			this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
				uniforms.opacity += this.opacity - old.opacity;
				console.log(uniforms.opacity);
				old.opacity = this.opacity;
			}).onComplete(function() {
				fsm.send(this.eventToEmit.channel);
			}.bind(this)).start(fsm.getTime() * 1000);
		}
	};

	return TweenOpacityAction;
});
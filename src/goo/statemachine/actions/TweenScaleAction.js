define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function TweenScaleAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.easing = window.TWEEN.Easing.Elastic.InOut;
		this.tween = new window.TWEEN.Tween();
	}

	TweenScaleAction.prototype = Object.create(Action.prototype);
	TweenScaleAction.prototype.constructor = TweenScaleAction;

	TweenScaleAction.external = {
		parameters: [{
			name: 'Scale',
			key: 'to',
			type: 'position',
			description: 'Scale',
			'default': [1, 1, 1]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add, otherwise set',
			'default': true
		}, {
			name: 'Time',
			key: 'time',
			type: 'number',
			description: 'Time it takes for this movement to complete',
			'default': true
		}, {
			name: 'Easing',
			key: 'easing_',
			type: '[linear, exponential.in, exponential.out, exponential.inout, back.in, back.out, back.inout]', // there are 31 in total
			// proposed: linear, sinusoidal, exponential, circular, back, elastic, bounce.out
			description: 'Easting type',
			'default': 'linear'
		}],
		transitions: [{
			name: 'complete',
			description: 'Event fired when the movement completes'
		}]
	};

	TweenScaleAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var scale = transformComponent.transform.scale;
		var initialScale = new Vector3().copy(translation); // can tween.js tween over this type of object?

		if (this.relative) {
			var to = Vector3.add(initialScale, this.to);
			this.tween.from(initialScale).to(to, this.time).easing(this.easing).onUpdate(function() {
				scale.setd(this.x, this.y, this.z);
				transformComponent.setUpdated();
			}).onComplete(function() {
				fsm.send(this.event);
				console.log('complete:', this.event);
			}.bind(this)).start();
		} else {
			this.tween.from(initialScale).to(this.to, this.time).easing(this.easing).onUpdate(function() {
				scale.setd(this.x, this.y, this.z);
				transformComponent.setUpdated();
			}).onComplete(function() {
				fsm.send(this.event);
				console.log('complete:', this.event);
			}.bind(this)).start();
		}

		entity.transformComponent.setUpdated();
	};

	return TweenScaleAction;
});
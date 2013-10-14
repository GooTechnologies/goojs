define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function TweenMoveAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.easing = window.TWEEN.Easing.Elastic.InOut;
		this.tween = new window.TWEEN.Tween();
	}

	TweenMoveAction.prototype = Object.create(Action.prototype);
	TweenMoveAction.prototype.constructor = TweenMoveAction;

	TweenMoveAction.external = {
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

	TweenMoveAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;
		var initialTranslation = new Vector3().copy(translation); // can tween.js tween over this type of object?

		if (this.relative) {
			var to = Vector3.add(initialTranslation).add(this.to);
			this.tween.from(initialTranslation).to(to, this.time).easing(this.easing).onUpdate(function() {
				translation.setd(this.x, this.y, this.z);
				transformComponent.setUpdated();
			}).onComplete(function() {
				fsm.send(this.event);
				console.log('complete:', this.event);
			}.bind(this)).start();
		} else {
			this.tween.from(initialTranslation).to(this.to, this.time).easing(this.easing).onUpdate(function() {
				translation.setd(this.x, this.y, this.z);
				transformComponent.setUpdated();
			}).onComplete(function() {
				fsm.send(this.event);
				console.log('complete:', this.event);
			}.bind(this)).start();
		}

		entity.transformComponent.setUpdated();
	};

	return TweenMoveAction;
});
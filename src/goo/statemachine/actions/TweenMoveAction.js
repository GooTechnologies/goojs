define([
	'goo/statemachine/actions/Action',
	'goo/math/Vector3'
],
/** @lends */
function(
	Action,
	Vector3
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
			'default': 1000
		}, {
			name: 'Easing',
			key: 'easing_',
			type: '[linear, exponential.in, exponential.out, exponential.inout, back.in, back.out, back.inout]', // there are 31 in total
			// proposed: linear, sinusoidal, exponential, circular, back, elastic, bounce.out
			description: 'Easting type',
			'default': 'linear'
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'Event fired when the movement completes'
		}]
	};

	TweenMoveAction.prototype.configure = function(settings) {
		this.to = settings.to;
		this.relative = settings.relative;
		this.time = settings.time;
		//this.easing = 'linear';
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	TweenMoveAction.prototype._run = function(fsm) {
		this.tween = new window.TWEEN.Tween();

		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;
		var initialTranslation = new Vector3().copy(translation); // can tween.js tween over this type of object?

		var fakeFrom = { x: initialTranslation.x, y: initialTranslation.y, z: initialTranslation.z };
		var fakeTo;

		if (this.relative) {
			var to = Vector3.add(initialTranslation, this.to);
			fakeTo = { x: to.x, y: to.y, z: to.z };

			this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function() {
				translation.setd(this.x, this.y, this.z);
				transformComponent.setUpdated();
			}).onComplete(function() {
				fsm.send(this.eventToEmit.channel);
				console.log('complete:');
			}.bind(this)).start();
		} else {
			fakeTo = { x: this.to[0], y: this.to[1], z: this.to[2] };

			this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function() {
				translation.setd(this.x, this.y, this.z);
				transformComponent.setUpdated();
			}).onComplete(function() {
				fsm.send(this.eventToEmit.channel);
				console.log('complete:');
			}.bind(this)).start();
		}
	};

	return TweenMoveAction;
});
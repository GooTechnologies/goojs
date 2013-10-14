define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function TweenLookAtAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.easing = window.TWEEN.Easing.Elastic.InOut;
		this.tween = new window.TWEEN.Tween();
	}

	TweenLookAtAction.prototype = Object.create(Action.prototype);
	TweenLookAtAction.prototype.constructor = TweenLookAtAction;

	TweenLookAtAction.external = {
		parameters: [{
			name: 'Translation',
			key: 'to',
			type: 'position',
			description: 'Move',
			'default': [0, 0, 0]
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

	TweenLookAtAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var transform = transformComponent.transform;

		var distance = Vector3.distance(this.to, transform.translation);

		var initialLookAt = new Vector3(0, 0, -1);
		var orientation = transform.rotation;
		orientation.applyPost(initialLookAt);
		initialLookAt.scale(distance);

		this.tween.from(initialLookAt).to(this.to, this.time).easing(this.easing).onUpdate(function() {
			transform.lookAt(this.x, this.y, this.z);
			transformComponent.setUpdated();
		}).onComplete(function() {
			fsm.send(this.event);
			console.log('complete:', this.event);
		}.bind(this)).start();

		entity.transformComponent.setUpdated();
	};

	return TweenLookAtAction;
});
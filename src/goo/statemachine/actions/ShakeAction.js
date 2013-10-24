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

	function ShakeAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ShakeAction.prototype = Object.create(Action.prototype);
	ShakeAction.prototype.constructor = ShakeAction;

	ShakeAction.external = {
		name: 'Shake',
		description: 'Shakes the entity',
		parameters: [{
			name: 'Amount',
			key: 'amount',
			type: 'number',
			description: 'Shake amount',
			'default': 1
		}, {
			name: 'Time',
			key: 'time',
			type: 'number',
			description: 'Shake time amount',
			'default': 1000
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'Event fired when the shake completes'
		}]
	};

	ShakeAction.prototype.configure = function(settings) {
		this.to = settings.to;
		this.relative = settings.relative;
		this.time = settings.time;
		this.amount = settings.amount;

		this.easing = window.TWEEN.Easing.Linear.None;

		this.eventToEmit = { channel: settings.transitions.complete };
	};

	ShakeAction.prototype._setup = function() {
		this.tween = new window.TWEEN.Tween();
	};

	ShakeAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;

		var oldRan = new Vector3();
		var ran = new Vector3();

		var that = this;
		this.tween.from({ amplitude: 0 }).to({ amplitude: 1 }, +this.time).easing(this.easing).onUpdate(function() {
			ran.setd(
				(Math.random()-0.5) * that.amount,
				(Math.random()-0.5) * that.amount,
				(Math.random()-0.5) * that.amount
			);
			translation.add(ran).sub(oldRan);
			oldRan.copy(ran);
			transformComponent.setUpdated();
		}).onComplete(function() {
			translation.sub(oldRan);
			transformComponent.setUpdated();
			fsm.send(this.eventToEmit.channel);
		}.bind(this)).start();
	};

	return ShakeAction;
});
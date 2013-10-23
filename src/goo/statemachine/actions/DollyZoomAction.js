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

	function DollyZoomAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	DollyZoomAction.prototype = Object.create(Action.prototype);
	DollyZoomAction.prototype.constructor = DollyZoomAction;

	DollyZoomAction.external = {
		name: 'Dolly Zoom',
		description: 'Performs dolly zoom',
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
			description: 'Shake amount',
			'default': 1000
		}],
		transitions: []
	};

	DollyZoomAction.prototype.configure = function (settings) {
		this.to = settings.to;
		this.relative = settings.relative;
		this.time = settings.time;
		this.amount = settings.amount;

		this.easing = window.TWEEN.Easing.Linear.None;

//		if (settings.easing1 === 'Linear') {
//			this.easing = window.TWEEN.Easing.Linear.None;
//		} else {
//			this.easing = window.TWEEN.Easing[settings.easing1][settings.easing2];
//		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	DollyZoomAction.prototype._setup = function () {
		this.tween = new window.TWEEN.Tween();
	};

	DollyZoomAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;
		var initialTranslation = new Vector3().copy(translation);

		var that = this;
		this.tween.from({ amplitude: 0 }).to({ amplitude: 1 }, +this.time).easing(this.easing).onUpdate(function() {
			translation.setd(
				initialTranslation.data[0] + (Math.random()-0.5) * that.amount,
				initialTranslation.data[1] + (Math.random()-0.5) * that.amount,
				initialTranslation.data[2] + (Math.random()-0.5) * that.amount
			);
			transformComponent.setUpdated();
		}).onComplete(function() {
			translation.copy(initialTranslation);
			fsm.send(this.eventToEmit.channel);
		}.bind(this)).start();
	};

	return DollyZoomAction;
});
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
		canTransition: true,
		parameters: [{
			name: 'Start level',
			key: 'startLevel',
			type: 'number',
			description: 'Shake amount at start',
			'default': 0
		}, {
			name: 'End level',
			key: 'endLevel',
			type: 'number',
			description: 'Shake amount at the end',
			'default': 0
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
		this.startLevel = settings.startLevel;
		this.endLevel = settings.endLevel;
		this.time = settings.time;
		this.easing = window.TWEEN.Easing.Quadratic.InOut;
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

		this.tween.from({ level: +this.startLevel }).to({ level: +this.endLevel }, +this.time).easing(this.easing).onUpdate(function() {
			ran.setd(
				(Math.random()-0.5) * this.level * 2,
				(Math.random()-0.5) * this.level * 2,
				(Math.random()-0.5) * this.level * 2
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
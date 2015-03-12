define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/math/Vector3'
], function (
	Action,
	Vector3
) {
	'use strict';

	function ShakeAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ShakeAction.prototype = Object.create(Action.prototype);
	ShakeAction.prototype.constructor = ShakeAction;

	ShakeAction.external = {
		name: 'Shake',
		type: 'animation',
		description: 'Shakes the entity. Optionally performs a transition.',
		canTransition: true,
		parameters: [{
			name: 'Start level',
			key: 'startLevel',
			type: 'float',
			description: 'Shake amount at start',
			'default': 0
		}, {
			name: 'End level',
			key: 'endLevel',
			type: 'float',
			description: 'Shake amount at the end',
			'default': 10
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Shake time amount',
			'default': 1000
		}, {
			name: 'Speed',
			key: 'speed',
			type: 'string',
			control: 'dropdown',
			description: 'Speed of shaking',
			'default': 'Fast',
			options: ['Fast', 'Medium', 'Slow']
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the shake completes'
		}]
	};

	ShakeAction.prototype.configure = function(settings) {
		this.startLevel = settings.startLevel;
		this.endLevel = settings.endLevel;
		this.time = settings.time;
		this.speed = { 'Fast': 1, 'Medium': 2, 'Slow': 4 }[settings.speed];
		this.easing = window.TWEEN.Easing.Quadratic.InOut;
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	ShakeAction.prototype._setup = function() {
		this.tween = new window.TWEEN.Tween();
	};

	ShakeAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	ShakeAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;
		var time = entity._world.time * 1000;

		var oldVal = new Vector3();
		var target = new Vector3();
		var vel = new Vector3();

		var that = this;
		var iter = 0;
		this.tween.from({ level: +this.startLevel }).to({ level: +this.endLevel }, +this.time).easing(this.easing).onUpdate(function() {
			iter++;
			if (iter > that.speed) {
				iter = 0;

				target.setDirect(
					- oldVal.x + (Math.random()-0.5) * this.level * 2,
					- oldVal.y + (Math.random()-0.5) * this.level * 2,
					- oldVal.z + (Math.random()-0.5) * this.level * 2
				);
			}

			vel.setDirect(
				vel.x * 0.98 + (target.x) * 0.1,
				vel.y * 0.98 + (target.y) * 0.1,
				vel.z * 0.98 + (target.z) * 0.1
			);

			translation.addVector(vel).subVector(oldVal);
			oldVal.copy(vel);
			transformComponent.setUpdated();
		}).onComplete(function() {
			translation.subVector(oldVal);
			transformComponent.setUpdated();
			fsm.send(this.eventToEmit.channel);
		}.bind(this)).start(time);
	};

	return ShakeAction;
});
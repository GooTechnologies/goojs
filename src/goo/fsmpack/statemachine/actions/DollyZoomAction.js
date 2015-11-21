var Action = require('goo/fsmpack/statemachine/actions/Action');
var Vector3 = require('goo/math/Vector3');
var TWEEN = require('goo/util/TWEEN');

	'use strict';

	function DollyZoomAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	DollyZoomAction.prototype = Object.create(Action.prototype);
	DollyZoomAction.prototype.constructor = DollyZoomAction;

	DollyZoomAction.external = {
		name: 'Dolly Zoom',
		type: 'camera',
		description: 'Performs dolly zoom',
		parameters: [{
			name: 'Forward',
			key: 'forward',
			type: 'number',
			description: 'Number of units to move towards the focus point. Enter negative values to move away.',
			'default': 100
		}, {
			name: 'Focus point',
			key: 'lookAt',
			type: 'position',
			description: 'Point to focus on while transitioning',
			'default': [0, 0, 0]
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'number',
			description: 'Time',
			'default': 10000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
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

	DollyZoomAction.prototype.configure = function (settings) {
		this.forward = settings.forward;
		this.lookAt = settings.lookAt;
		this.time = settings.time;

		if (settings.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	DollyZoomAction.prototype._setup = function (fsm) {
		this.tween = new TWEEN.Tween();
		var entity = fsm.getOwnerEntity();

		if (entity.cameraComponent && entity.cameraComponent.camera) {
			var camera = entity.cameraComponent.camera;
			this.initialDistance = new Vector3(this.lookAt).distance(camera.translation);
			this.eyeTargetScale = Math.tan(camera.fov * (Math.PI / 180) / 2) * this.initialDistance;
		} else {
			this.eyeTargetScale = null;
		}
	};

	DollyZoomAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	DollyZoomAction.prototype._run = function (fsm) {
		if (this.eyeTargetScale) {
			var entity = fsm.getOwnerEntity();
			var transformComponent = entity.transformComponent;
			var translation = transformComponent.transform.translation;
			var initialTranslation = new Vector3().copy(translation);
			var camera = entity.cameraComponent.camera;
			var time = entity._world.time * 1000;

			var to = Vector3.fromArray(this.lookAt)
				.sub(initialTranslation)
				.normalize()
				.scale(this.forward)
				.add(initialTranslation);

			var fakeFrom = { x: initialTranslation.x, y: initialTranslation.y, z: initialTranslation.z, d: this.initialDistance };
			var fakeTo = { x: to.x, y: to.y, z: to.z, d: +this.initialDistance - +this.forward };

			var old = { x: fakeFrom.x, y: fakeFrom.y, z: fakeFrom.z };
			var that = this;

			this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
				translation.x += this.x - old.x;
				translation.y += this.y - old.y;
				translation.z += this.z - old.z;

				old.x = this.x;
				old.y = this.y;
				old.z = this.z;

				transformComponent.setUpdated();

				var fov = (180 / Math.PI) * 2 * Math.atan(that.eyeTargetScale / this.d);
				camera.setFrustumPerspective(fov);
			}).onComplete(function () {
				fsm.send(this.eventToEmit.channel);
			}.bind(this)).start(time);
		}
	};

	module.exports = DollyZoomAction;
var Action = require('../../../fsmpack/statemachine/actions/Action');
var Vector3 = require('../../../math/Vector3');
var TWEEN = require('../../../util/TWEEN');

	'use strict';

	function TweenLightColorAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.fromCol = new Vector3();
		this.toCol = new Vector3();
		this.completed = false;
	}

	TweenLightColorAction.prototype = Object.create(Action.prototype);
	TweenLightColorAction.prototype.constructor = TweenLightColorAction;

	TweenLightColorAction.external = {
		key: 'Tween Light Color',
		name: 'Tween Light',
		type: 'light',
		description: 'Tweens the color of the light.',
		parameters: [{
			name: 'Color',
			key: 'to',
			type: 'vec3',
			control: 'color',
			description: 'Color of the light.',
			'default': [1, 1, 1]
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for the transition to complete.',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type.',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction.',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			description: 'State to transition to when the light tween was completed.'
		}]
	};

	TweenLightColorAction.getTransitionLabel = function(transitionKey/*, actionConfig*/){
		return transitionKey === 'complete' ? 'On Tween Light Complete' : undefined;
	};

	TweenLightColorAction.prototype.ready = function () {
		if (this.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[this.easing1][this.easing2];
		}
	};

	TweenLightColorAction.prototype.enter = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity.lightComponent) {
			return;
		}

		this.fromCol.set(entity.lightComponent.light.color);
		this.toCol.setDirect(this.to[0], this.to[1], this.to[2]);

		this.startTime = fsm.getTime();

		this.completed = false;
	};

	TweenLightColorAction.prototype.update = function (fsm) {
		if (this.completed) {
			return;
		}

		var entity = fsm.getOwnerEntity();
		if (!entity.lightComponent) {
			return;
		}

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = this.easing(t);

		var color = entity.lightComponent.light.color;
		color.set(this.fromCol).lerp(this.toCol, fT);

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};

	module.exports = TweenLightColorAction;
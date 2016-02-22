define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/math/Vector3',
	'goo/util/TWEEN'
], function (
	Action,
	Vector3,
	TWEEN
) {
	'use strict';

	function TweenMoveAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.fromPos = new Vector3();
		this.toPos = new Vector3();
		this.completed = false;
	}

	TweenMoveAction.prototype = Object.create(Action.prototype);
	TweenMoveAction.prototype.constructor = TweenMoveAction;

	TweenMoveAction.external = {
		name: 'Tween Move',
		type: 'animation',
		description: 'Transition to the set location.',
		canTransition: true,
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
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Time it takes for this movement to complete',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type',
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
			description: 'State to transition to when the movement completes'
		}]
	};

	TweenMoveAction.prototype.ready = function () {
		if (this.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[this.easing1][this.easing2];
		}
	};

	TweenMoveAction.prototype.enter = function (fsm) {
		var transformComponent = fsm.getOwnerEntity().transformComponent;

		this.fromPos.set(transformComponent.transform.translation);
		this.toPos.setDirect(this.to[0], this.to[1], this.to[2]);
		if (this.relative) {
			this.toPos.add(this.fromPos);
		}

		this.startTime = fsm.getTime();
		this.completed = false;
	};

	TweenMoveAction.prototype.update = function (fsm) {
		if (this.completed) {
			return;
		}
		var transformComponent = fsm.getOwnerEntity().transformComponent;

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = this.easing(t);

		transformComponent.transform.translation.set(this.fromPos).lerp(this.toPos, fT);
		transformComponent.setUpdated();

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};

	return TweenMoveAction;
});
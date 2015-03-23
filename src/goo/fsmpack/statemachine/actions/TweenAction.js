define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/fsmpack/statemachine/FSMUtil'
	],


function(
	Action,
	FSMUtil
) {
	'use strict';

	function TweenAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TweenAction.prototype = Object.create(Action.prototype);
	TweenAction.prototype.constructor = TweenAction;

	TweenAction.external = {
		name: 'Tween',
		description: 'Tween anything',
		canTransition: true,
		parameters: [{
			name: 'To',
			key: 'to',
			type: 'number',
			description: 'Value to tween to',
			'default': 0
		}, {
			name: 'Object',
			key: 'objectName',
			type: 'string',
			description: 'Object',
			'default': ''
		}, {
			name: 'Property',
			key: 'propertyName',
			type: 'string',
			description: 'Property',
			'default': ''
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'number',
			description: 'Time it takes for this tween to complete',
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
			description: 'State to transition to when the tween completes'
		}]
	};

	TweenAction.prototype.configure = function (settings) {
		this.to = settings.to;
		this.objectName = settings.objectName;
		this.propertyName = settings.propertyName;
		this.time = settings.time;
		if (settings.easing1 === 'Linear') {
			this.easing = window.TWEEN.Easing.Linear.None;
		} else {
			this.easing = window.TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	TweenAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();

		var object = eval('entity.' + this.objectName);
		var from = object[this.propertyName];
		FSMUtil.createComposableTween(entity, this.propertyName, from, this.to, this.time);
	};

	return TweenAction;
});
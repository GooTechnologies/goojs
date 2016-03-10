var Action = require('../../../fsmpack/statemachine/actions/Action');
var FsmUtils = require('../../../fsmpack/statemachine/FsmUtils');

	'use strict';

	function NumberCompareAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	NumberCompareAction.prototype = Object.create(Action.prototype);
	NumberCompareAction.prototype.constructor = NumberCompareAction;

	NumberCompareAction.prototype.configure = function (settings) {
		this.everyFrame = settings.everyFrame !== false;
		this.leftHand = settings.leftHand || 0;
		this.rightHand = settings.rightHand || 0;
		this.tolerance = settings.tolerance || 0.0001;
		this.lessThanEvent = { channel: settings.transitions.less };
		this.equalEvent = { channel: settings.transitions.equal };
		this.greaterThanEvent = { channel: settings.transitions.greater };
	};

	NumberCompareAction.external = {
		parameters: [{
			name: 'Left hand value',
			key: 'leftHand',
			type: 'float'
		}, {
			name: 'Right hand value',
			key: 'rightHand',
			type: 'float'
		}, {
			name: 'Tolerance',
			key: 'tolerance',
			type: 'float',
			'default': 0.001
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: [{
			key: 'less',
			description: 'Event fired if left hand argument is smaller than right hand argument.'
		}, {
			key: 'equal',
			description: 'Event fired if both sides are approximately equal.'
		}, {
			key: 'greater',
			description: 'Event fired if left hand argument is greater than right hand argument.'
		}]
	};

	var labels = {
		less: 'On X < Y',
		equal: 'On X == Y',
		greater: 'On X > Y'
	};

	NumberCompareAction.getTransitionLabel = function(transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	NumberCompareAction.prototype.compare = function (fsm) {
		var leftHand = FsmUtils.getValue(this.leftHand, fsm);
		var rightHand = FsmUtils.getValue(this.rightHand, fsm);
		var diff = rightHand - leftHand;

		if (Math.abs(diff) <= this.tolerance) {
			if (this.equalEvent.channel) { fsm.send(this.equalEvent.channel); }
		} else if (diff > 0) {
			if (this.lessThanEvent.channel) { fsm.send(this.lessThanEvent.channel); }
		} else {
			if (this.greaterThanEvent.channel) { fsm.send(this.greaterThanEvent.channel); }
		}
	};

	NumberCompareAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.compare(fsm);
		}
	};

	NumberCompareAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.compare(fsm);
		}
	};

	module.exports = NumberCompareAction;
var Action = require('../../../fsmpack/statemachine/actions/Action');
var FsmUtils = require('../../../fsmpack/statemachine/FsmUtils');

function NumberCompareAction() {
	Action.apply(this, arguments);
}

NumberCompareAction.prototype = Object.create(Action.prototype);
NumberCompareAction.prototype.constructor = NumberCompareAction;

NumberCompareAction.prototype.configure = function (settings) {
	this.everyFrame = settings.everyFrame !== false;
	this.leftHand = settings.leftHand || 0;
	this.rightHand = settings.rightHand || 0;
	this.tolerance = settings.tolerance || 0.0001;
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

NumberCompareAction.getTransitionLabel = function (transitionKey /*, actionConfig*/){
	return labels[transitionKey];
};

NumberCompareAction.prototype.compare = function () {
	var leftHand = FsmUtils.getValue(this.leftHand);
	var rightHand = FsmUtils.getValue(this.rightHand);
	var diff = rightHand - leftHand;

	if (Math.abs(diff) <= this.tolerance) {
		this.sendEvent('equal');
	} else if (diff > 0) {
		this.sendEvent('less');
	} else {
		this.sendEvent('greater');
	}
};

NumberCompareAction.prototype.enter = function () {
	if (!this.everyFrame) {
		this.compare();
	}
};

NumberCompareAction.prototype.update = function () {
	if (this.everyFrame) {
		this.compare();
	}
};

module.exports = NumberCompareAction;
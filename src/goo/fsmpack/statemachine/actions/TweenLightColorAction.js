var Action = require('../../../fsmpack/statemachine/actions/Action');
var Vector3 = require('../../../math/Vector3');
var Easing = require('../../../util/Easing');

function TweenLightColorAction() {
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

TweenLightColorAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
	return transitionKey === 'complete' ? 'On Tween Light Complete' : undefined;
};

TweenLightColorAction.prototype.enter = function () {
	var entity = this.getEntity();
	if (!entity.lightComponent) {
		return;
	}

	this.fromCol.set(entity.lightComponent.light.color);
	this.toCol.setArray(this.to);

	this.startTime = this.getEntity()._world.time;

	this.completed = false;
};

TweenLightColorAction.prototype.update = function () {
	if (this.completed) {
		return;
	}

	var entity = this.getEntity();
	if (!entity.lightComponent) {
		return;
	}

	var t = Math.min((this.getEntity()._world.time - this.startTime) * 1000 / this.time, 1);
	var fT = Easing[this.easing1][this.easing2](t);

	var color = entity.lightComponent.light.color;
	color.set(this.fromCol).lerp(this.toCol, fT);

	if (t >= 1) {
		this.sendEvent('complete');
		this.completed = true;
	}
};

module.exports = TweenLightColorAction;
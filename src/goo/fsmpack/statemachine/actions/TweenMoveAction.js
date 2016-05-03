var Action = require('../../../fsmpack/statemachine/actions/Action');
var Vector3 = require('../../../math/Vector3');
var Easing = require('../../../util/Easing');

function TweenMoveAction() {
	Action.apply(this, arguments);

	this.fromPos = new Vector3();
	this.toPos = new Vector3();
	this.deltaPos = new Vector3();
	this.oldPos = new Vector3();
	this.completed = false;
}

TweenMoveAction.prototype = Object.create(Action.prototype);
TweenMoveAction.prototype.constructor = TweenMoveAction;

TweenMoveAction.external = {
	key: 'Tween Move',
	name: 'Tween Move',
	type: 'animation',
	description: 'Transition to the set location.',
	canTransition: true,
	parameters: [{
		name: 'Translation',
		key: 'to',
		type: 'position',
		description: 'Move.',
		'default': [0, 0, 0]
	}, {
		name: 'Relative',
		key: 'relative',
		type: 'boolean',
		description: 'If true add, otherwise set.',
		'default': true
	}, {
		name: 'Time (ms)',
		key: 'time',
		type: 'float',
		description: 'Time it takes for this movement to complete.',
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
		description: 'State to transition to when the movement completes.'
	}]
};

TweenMoveAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
	return transitionKey === 'complete' ? 'On Tween Move Complete' : undefined;
};

TweenMoveAction.prototype.enter = function () {
	var transformComponent = this.getEntity().transformComponent.sync();

	this.fromPos.set(transformComponent.transform.translation);
	this.toPos.setDirect(this.to[0], this.to[1], this.to[2]);
	if (this.relative) {
		this.oldPos.set(this.fromPos);
		this.toPos.add(this.fromPos);
	}

	this.startTime = this.getEntity()._world.time;
	this.completed = false;
};

TweenMoveAction.prototype.update = function () {
	if (this.completed) {
		return;
	}
	var transformComponent = this.getEntity().transformComponent.sync();

	var t = Math.min((this.getEntity()._world.time - this.startTime) * 1000 / this.time, 1);
	var fT = Easing[this.easing1][this.easing2](t);

	if (this.relative) {
		this.deltaPos.set(this.fromPos).lerp(this.toPos, fT).sub(this.oldPos);
		transformComponent.transform.translation.add(this.deltaPos);
		this.oldPos.add(this.deltaPos);
	} else {
		transformComponent.transform.translation.set(this.fromPos).lerp(this.toPos, fT);
	}

	transformComponent.setUpdated();

	if (t >= 1) {
		this.sendEvent('complete');
		this.completed = true;
	}
};

module.exports = TweenMoveAction;
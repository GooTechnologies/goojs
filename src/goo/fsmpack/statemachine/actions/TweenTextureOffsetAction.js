var Action = require('../../../fsmpack/statemachine/actions/Action');
var Vector2 = require('../../../math/Vector2');
var Easing = require('../../../util/Easing');

function TweenTextureOffsetAction(/*id, settings*/) {
	Action.apply(this, arguments);

	this.fromOffset = new Vector2();
	this.toOffset = new Vector2();
	this.completed = false;
}

TweenTextureOffsetAction.prototype = Object.create(Action.prototype);
TweenTextureOffsetAction.prototype.constructor = TweenTextureOffsetAction;

TweenTextureOffsetAction.external = {
	key: 'Tween Texture Offset',
	name: 'Tween Texture Offset',
	type: 'texture',
	description: 'Smoothly changes the texture offset of the entity.',
	canTransition: true,
	parameters: [{
		name: 'X Offset',
		key: 'toX',
		type: 'float',
		control: 'slider',
		min: 0,
		max: 1,
		description: 'X Offset.',
		'default': 1
	}, {
		name: 'Y Offset',
		key: 'toY',
		type: 'float',
		control: 'slider',
		min: 0,
		max: 1,
		description: 'Y Offset.',
		'default': 1
	}, {
		name: 'Time (ms)',
		key: 'time',
		type: 'float',
		description: 'Time it takes for this transition to complete.',
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
		description: 'State to transition to when the transition completes.'
	}]
};

TweenTextureOffsetAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
	return transitionKey === 'complete' ? 'On UV Tween Complete' : undefined;
};

TweenTextureOffsetAction.prototype.ready = function () {
	if (this.easing1 === 'Linear') {
		this.easing = Easing.Linear.None;
	} else {
		this.easing = Easing[this.easing1][this.easing2];
	}
};

TweenTextureOffsetAction.prototype.enter = function (fsm) {
	var entity = fsm.getOwnerEntity();
	var meshRendererComponent = entity.meshRendererComponent;
	this.texture = null;
	if (!meshRendererComponent || meshRendererComponent.materials.length === 0) {
		return;
	}
	var material = meshRendererComponent.materials[0];
	this.texture = material.getTexture('DIFFUSE_MAP');
	if (!this.texture) {
		return;
	}

	this.fromOffset.set(this.texture.offset);
	this.toOffset.setDirect(this.toX, this.toY);
	if (this.relative) {
		this.toOffset.add(this.fromOffset);
	}

	this.startTime = fsm.getTime();
	this.completed = false;
};

TweenTextureOffsetAction.prototype.update = function (fsm) {
	if (this.completed) {
		return;
	}
	if (!this.texture) {
		return;
	}

	var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
	var fT = this.easing(t);

	this.texture.offset.set(this.fromOffset).lerp(this.toOffset, fT);

	if (t >= 1) {
		fsm.send(this.transitions.complete);
		this.completed = true;
	}
};

module.exports = TweenTextureOffsetAction;
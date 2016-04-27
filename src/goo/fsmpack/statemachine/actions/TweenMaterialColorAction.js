var Action = require('../../../fsmpack/statemachine/actions/Action');
var Vector3 = require('../../../math/Vector3');
var Easing = require('../../../util/Easing');

function TweenMaterialColorAction(/*id, settings*/) {
	Action.apply(this, arguments);

	this.fromColor = new Vector3();
	this.toColor = new Vector3();
	this.calc = new Vector3();
	this.completed = false;
}

TweenMaterialColorAction.prototype = Object.create(Action.prototype);
TweenMaterialColorAction.prototype.constructor = TweenMaterialColorAction;

TweenMaterialColorAction.external = {
	key: 'Tween Material Color',
	name: 'Tween Material Color',
	type: 'texture',
	description: 'Tweens the color of a material.',
	parameters: [{
		name: 'Entity (optional)',
		key: 'entity',
		type: 'entity',
		description: 'Entity that has a material.'
	}, {
		name: 'Color type',
		key: 'type',
		type: 'string',
		control: 'dropdown',
		description: 'Color type.',
		'default': 'Diffuse',
		options: ['Diffuse', 'Emissive', 'Specular', 'Ambient']
	}, {
		name: 'Color',
		key: 'color',
		type: 'vec3',
		control: 'color',
		description: 'Color.',
		'default': [1, 1, 1]
	}, {
		name: 'Time (ms)',
		key: 'time',
		type: 'float',
		control: 'spinner',
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
		description: 'State to transition to when the transition completes.'
	}]
};

var MAPPING = {
	Diffuse: 'materialDiffuse',
	Emissive: 'materialEmissive',
	Specular: 'materialSpecular',
	Ambient: 'materialAmbient'
};

TweenMaterialColorAction.getTransitionLabel = function (transitionKey, actionConfig){
	return transitionKey === 'complete' ? 'On Tween ' + (actionConfig.options.type || 'Color') + ' Complete' : undefined;
};

TweenMaterialColorAction.prototype.enter = function (fsm) {
	var entity = (this.entity && fsm.getEntityById(this.entity.entityRef)) || fsm.getOwnerEntity();
	var meshRendererComponent = entity.meshRendererComponent;
	if (!meshRendererComponent) {
		return;
	}

	this.startTime = fsm.getTime();

	this.material = meshRendererComponent.materials[0];
	this.typeName = MAPPING[this.type];
	this.materialColor = this.material.uniforms[this.typeName] = this.material.uniforms[this.typeName] || [1, 1, 1, 1];
	this.fromColor.setDirect(this.materialColor[0], this.materialColor[1], this.materialColor[2]);
	this.toColor.setDirect(this.color[0], this.color[1], this.color[2]);

	this.completed = false;
};

TweenMaterialColorAction.prototype.update = function (fsm) {
	if (this.completed) {
		return;
	}
	var entity = (this.entity && fsm.getEntityById(this.entity.entityRef)) || fsm.getOwnerEntity();
	var meshRendererComponent = entity.meshRendererComponent;
	if (!meshRendererComponent) {
		return;
	}

	var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
	var fT = Easing[this.easing1][this.easing2](t);

	this.calc.set(this.fromColor).lerp(this.toColor, fT);
	this.materialColor[0] = this.calc.x;
	this.materialColor[1] = this.calc.y;
	this.materialColor[2] = this.calc.z;

	if (t >= 1) {
		fsm.send(this.transitions.complete);
		this.completed = true;
	}
};

module.exports = TweenMaterialColorAction;
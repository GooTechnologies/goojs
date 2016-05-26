import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var Easing = require('../../../util/Easing');
var MathUtils = require('../../../math/MathUtils');

class TweenOpacityAction extends Action {
	completed: boolean;
	time: number;
	startTime: number;
	material: any;
	uniforms: any;
	easing1: string;
	easing2: string;
	from: number;
	to: number;
	constructor(id: string, options: any){
		super(id, options);
		this.completed = false;
	}

	static external: External = {
		key: 'Tween Opacity',
		name: 'Tween Material Opacity',
		type: 'texture',
		description: 'Tweens the opacity of a material.',
		parameters: [{
			name: 'Opacity',
			key: 'to',
			type: 'float',
			control: 'spinner',
			description: 'Opacity.',
			'default': 1
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

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return transitionKey === 'complete' ? 'On Tween Opacity Complete' : undefined;
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		var meshRendererComponent = entity.meshRendererComponent;
		if (!meshRendererComponent) {
			return;
		}

		this.startTime = fsm.getTime();

		this.material = meshRendererComponent.materials[0];
		if (this.material.blendState.blending === 'NoBlending') {
			this.material.blendState.blending = 'TransparencyBlending';
		}
		if (this.material.renderQueue < 2000) {
			this.material.renderQueue = 2000;
		}
		if (this.material.uniforms.opacity === undefined) {
			this.material.uniforms.opacity = 1;
		}

		this.uniforms = this.material.uniforms;
		this.from = this.uniforms.opacity;
		this.completed = false;
	};

	update (fsm) {
		if (this.completed) {
			return;
		}
		var entity = fsm.getOwnerEntity();
		var meshRendererComponent = entity.meshRendererComponent;
		if (!meshRendererComponent) {
			return;
		}

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = Easing[this.easing1][this.easing2](t);

		this.uniforms.opacity = MathUtils.lerp(fT, this.from, this.to);

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};
}

export = TweenOpacityAction;
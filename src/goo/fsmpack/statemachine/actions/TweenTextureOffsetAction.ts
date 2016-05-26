import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var Vector2 = require('../../../math/Vector2');
var Easing = require('../../../util/Easing');

class TweenTextureOffsetAction extends Action {
	fromOffset: any;
	toOffset: any;
	completed: boolean;
	relative: boolean;
	texture: any;
	toX: number;
	toY: number;
	easing1: string;
	easing2: string;
	startTime: number;
	time: number;
	constructor(id: string, options: any){
		super(id, options);
		this.fromOffset = new Vector2();
		this.toOffset = new Vector2();
		this.completed = false;
	}

	static external: External = {
		key: 'Tween Texture Offset',
		name: 'Tween Texture Offset',
		type: 'texture',
		description: 'Smoothly changes the texture offset of the entity.',
		canTransition: true,
		parameters: [{
			name: 'X Offset',
			key: 'toX',
			type: 'float',
			description: 'X Offset.',
			'default': 1
		}, {
			name: 'Y Offset',
			key: 'toY',
			type: 'float',
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

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return transitionKey === 'complete' ? 'On UV Tween Complete' : undefined;
	};

	enter (fsm) {
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

	update (fsm) {
		if (this.completed) {
			return;
		}

		if (!this.texture) {
			return;
		}

		var t = Math.min((fsm.getTime() - this.startTime) * 1000 / this.time, 1);
		var fT = Easing[this.easing1][this.easing2](t);

		this.texture.offset.set(this.fromOffset).lerp(this.toOffset, fT);

		if (t >= 1) {
			fsm.send(this.transitions.complete);
			this.completed = true;
		}
	};
}

export = TweenTextureOffsetAction;
import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var FsmUtils = require('../../../fsmpack/statemachine/FsmUtils');

var labels = {
	less: 'On X < Y',
	equal: 'On X == Y',
	greater: 'On X > Y'
};

class NumberCompareAction extends Action {
	everyFrame: boolean;
	leftHand: number;
	rightHand: number;
	tolerance: number;
	lessThanEvent: any;
	equalEvent: any;
	greaterThanEvent: any;
	constructor(id: string, options: any){
		super(id, options);
	}

	configure (settings) {
		this.everyFrame = settings.everyFrame !== false;
		this.leftHand = settings.leftHand || 0;
		this.rightHand = settings.rightHand || 0;
		this.tolerance = settings.tolerance || 0.0001;
		this.lessThanEvent = { channel: settings.transitions.less };
		this.equalEvent = { channel: settings.transitions.equal };
		this.greaterThanEvent = { channel: settings.transitions.greater };
	};

	static external: External = {
		key: 'numberCompare',
		name: 'Number Compare',
		description: 'Number Compare',
		type: 'misc',
		parameters: [{
			name: 'Left hand value',
			key: 'leftHand',
			description: 'Left hand value',
			type: 'float'
		}, {
			name: 'Right hand value',
			key: 'rightHand',
			description: 'Right hand value',
			type: 'float'
		}, {
			name: 'Tolerance',
			key: 'tolerance',
			type: 'float',
			description: 'Tolerance',
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

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey , actionConfig){
		return labels[transitionKey];
	};

	compare (fsm) {
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

	enter (fsm) {
		if (!this.everyFrame) {
			this.compare(fsm);
		}
	};

	update (fsm) {
		if (this.everyFrame) {
			this.compare(fsm);
		}
	};
}

export = NumberCompareAction;
import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var FsmUtils = require('../FsmUtils');

class CopyVariableAction extends Action {
	everyFrame: boolean;
	variableTarget: string;
	variableSource: string;
	constructor(id: string, options: any){
		super(id, options)
	}

	static external: External = {
		key: 'Copy Variable',
		name: 'Copy Variable',
		type: 'variables',
		description: '',
		parameters: [{
			name: 'Variable Target',
			key: 'variableTarget',
			type: 'identifier'
		}, {
			name: 'Variable Source',
			key: 'variableSource',
			type: 'identifier'
		}, {
			name: 'Value',
			key: 'value',
			type: 'float'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': false
		}],
		transitions: []
	};

	enter (fsm) {
		if (!this.everyFrame) {
			this.copy(fsm);
		}
	};

	update (fsm) {
		if (this.everyFrame) {
			this.copy(fsm);
		}
	};

	copy (fsm) {
		var ownerEntity = fsm.getOwnerEntity();
		if (this.variableTarget && ownerEntity) {
			try {
				var val;
				if (this.variableSource) {
					val = FsmUtils.getValue(this.variableSource, fsm);
				} else {
					val = FsmUtils.getValue(this.value, fsm);
				}
				ownerEntity[this.variableTarget] = val;
			} catch (err) {
				console.warn(err);
			}
		}
	};
}

export = CopyVariableAction;
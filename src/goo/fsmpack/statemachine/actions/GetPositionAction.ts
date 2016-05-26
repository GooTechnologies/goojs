import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class GetPositionAction extends Action {
	everyFrame: boolean;
	entity: any;
	variableX: number;
	variableY: number;
	variableZ: number;
	constructor(id: string, options: any){
		super(id, options);
	}

	configure (settings) {
		this.everyFrame = settings.everyFrame !== false;
		this.entity = settings.entity || null;
		this.variableX = settings.variableX || null;
		this.variableY = settings.variableY || null;
		this.variableZ = settings.variableZ || null;
	};

	static external: External = {
		name: 'Get Position',
		key: 'getPosition',
		description: 'Get Position',
		type: 'misc',
		parameters: [{
			name: 'VariableX',
			key: 'variableX',
			description: '',
			type: 'identifier'
		}, {
			name: 'VariableY',
			key: 'variableY',
			description: '',
			type: 'identifier'
		}, {
			name: 'VariableZ',
			key: 'variableZ',
			description: '',
			type: 'identifier'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	update (fsm) {
		var translation = this.entity.transformComponent.transform.translation;
		if (this.entity !== null) {
			if (this.variableX) {  // !== undefined
				fsm.applyOnVariable(this.variableX, function () {
					return translation.x;
				});
			}
			if (this.variableY) {
				fsm.applyOnVariable(this.variableY, function () {
					return translation.y;
				});
			}
			if (this.variableZ) {
				fsm.applyOnVariable(this.variableZ, function () {
					return translation.z;
				});
			}
		}
	};
}

export = GetPositionAction;
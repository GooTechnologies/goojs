import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var FsmUtils = require('../../../fsmpack/statemachine/FsmUtils');

class SetPositionAction extends Action {
	entity: any;
	amountX: number;
	amountY: number;
	amountZ: number;
	everyFrame: boolean;
	constructor(id: string, options: any){
		super(id, options);
	}

	configure (settings) {
		this.everyFrame = !!settings.everyFrame;
		this.entity = settings.entity || null;
		this.amountX = settings.amountX || 0;
		this.amountY = settings.amountY || 0;
		this.amountZ = settings.amountZ || 0;
	};

	static external: External = {
		key: 'Set Position',
		name: 'Set Position',
		description: 'Set position',
		type: 'misc',
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Entity to move.'
		}, {
			name: 'Amount X',
			key: 'amountX',
			type: 'float',
			description: 'Position on the X axis.',
			'default': 0
		}, {
			name: 'Amount Y',
			key: 'amountY',
			type: 'float',
			description: 'Position on the Y axis.',
			'default': 0
		}, {
			name: 'Amount Z',
			key: 'amountZ',
			type: 'float',
			description: 'Position on the Z axis.',
			'default': 0
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
		if (this.entity !== null) {
			this.entity.transformComponent.transform.translation.setDirect(
				FsmUtils.getValue(this.amountX, fsm),
				FsmUtils.getValue(this.amountY, fsm),
				FsmUtils.getValue(this.amountZ, fsm)
			);
			this.entity.transformComponent.setUpdated();
		}
	};
}

export = SetPositionAction;
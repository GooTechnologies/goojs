import Action = require('./Action');
import {External} from './IAction';
var FsmUtils = require('../FsmUtils');

class AddPositionAction extends Action {
	entity: any;
	amountX: number;
	amountY: number;
	amountZ: number;
	speed: number;
	everyFrame: boolean;

	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		name: 'Add Position',
		key: 'AddPosition',
		description: 'Moves an entity',
		type: 'animation',
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Entity to move.'
		}, {
			name: 'Amount X',
			key: 'amountX',
			type: 'float',
			description: 'Amount to move on the X axis.',
			'default': 0
		}, {
			name: 'Amount Y',
			key: 'amountY',
			type: 'float',
			description: 'Amount to move on the Y axis.',
			'default': 0
		}, {
			name: 'Amount Z',
			key: 'amountZ',
			type: 'float',
			description: 'Amount to move on the Z axis.',
			'default': 0
		}, {
			name: 'Speed',
			key: 'speed',
			type: 'float',
			description: 'Speed to multiply.',
			'default': 1
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	}

	addPosition(fsm) {
		if (this.entity) {
			var tpf = fsm.getTpf();

			var dx = FsmUtils.getValue(this.amountX, fsm);
			var dy = FsmUtils.getValue(this.amountY, fsm);
			var dz = FsmUtils.getValue(this.amountZ, fsm);

			this.entity.transformComponent.transform.translation.addDirect(
				dx * this.speed * tpf,
				dy * this.speed * tpf,
				dz * this.speed * tpf
			);

			this.entity.transformComponent.setUpdated();
		}
	}

	enter(fsm) {
		if (!this.everyFrame) {
			this.addPosition(fsm);
		}
	}

	update(fsm) {
		if (this.everyFrame) {
			this.addPosition(fsm);
		}
	}
}

export = AddPositionAction;


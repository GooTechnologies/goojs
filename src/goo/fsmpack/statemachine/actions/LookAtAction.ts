import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var Vector3 = require('../../../math/Vector3');

class LookAtAction extends Action {
	lookAt: Array<number>;
	everyFrame: boolean;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Look At',
		name: 'Look At',
		type: 'animation',
		description: 'Reorients an entity so that it\'s facing a specific point.',
		parameters: [{
			name: 'Look at',
			key: 'lookAt',
			type: 'position',
			description: 'Position to look at.',
			'default': [0, 0, 0]
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	doLookAt (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;

		transformComponent.transform.lookAt(new Vector3(this.lookAt), Vector3.UNIT_Y);
		transformComponent.setUpdated();
	};

	enter (fsm) {
		if (!this.everyFrame) {
			this.doLookAt(fsm);
		}
	};

	update (fsm) {
		if (this.everyFrame) {
			this.doLookAt(fsm);
		}
	};
}

export = LookAtAction;
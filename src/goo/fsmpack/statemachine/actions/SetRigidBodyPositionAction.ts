import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var Vector3 = require('./../../../math/Vector3');

var tmpVector = new Vector3();

class SetRigidBodyPositionAction extends Action {
	position: Array<number>;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Set Rigid Body Position',
		name: 'Set Rigid Body Position',
		type: 'physics',
		description: 'Set the position of the rigid body.',
		canTransition: false,
		parameters: [{
			name: 'Position',
			key: 'position',
			type: 'position',
			description: 'Absolute world position to set.',
			'default': [0, 0, 0]
		}],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.rigidBodyComponent) { return; }
		tmpVector.setArray(this.position);
		entity.rigidBodyComponent.setPosition(tmpVector);
	};
}

export = SetRigidBodyPositionAction;
import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var Vector3 = require('./../../../math/Vector3');

var tmpVector = new Vector3();

class SetRigidBodyVelocityAction extends Action {
	velocity: Array<number>;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Set Rigid Body Velocity',
		name: 'Set Rigid Body Velocity',
		type: 'physics',
		description: 'Set the linear velocity of the rigid body component.',
		canTransition: false,
		parameters: [{
			name: 'Velocity',
			key: 'velocity',
			type: 'position',
			description: 'Velocity to set.',
			'default': [0, 0, 0]
		}],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.rigidBodyComponent) {
			return;
		}
		tmpVector.setArray(this.velocity);
		entity.rigidBodyComponent.setVelocity(tmpVector);
	};
}

export = SetRigidBodyVelocityAction;
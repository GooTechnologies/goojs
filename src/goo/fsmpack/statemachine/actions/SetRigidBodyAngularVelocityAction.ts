import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var Vector3 = require('./../../../math/Vector3');

var tmpVector = new Vector3();

class SetRigidBodyAngularVelocityAction extends Action {
	velocity: Array<number>;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Set Rigid Body Angular Velocity',
		name: 'Set Rigid Body Angular Velocity',
		type: 'physics',
		description: 'Set the angular velocity of the rigid body component.',
		canTransition: false,
		parameters: [{
			name: 'Angular velocity',
			key: 'velocity',
			type: 'position',
			description: 'Angular velocity to set.',
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
		entity.rigidBodyComponent.setAngularVelocity(tmpVector);
	};
}

export = SetRigidBodyAngularVelocityAction;
import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var Vector3 = require('../../../math/Vector3');
var SystemBus = require('../../../entities/SystemBus');

var torqueVector = new Vector3();

class ApplyTorqueAction extends Action {
	space: string;
	substepListener: () => void;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'ApplyTorque',
		name: 'Apply torque on rigid body',
		type: 'physics',
		description: 'Apply a torque to the attached rigid body.',
		canTransition: false,
		parameters: [{
			name: 'Torque',
			key: 'torque',
			type: 'position',
			description: 'Torque to apply to the body.',
			'default': [0, 0, 0]
		}, {
			name: 'Space',
			key: 'space',
			type: 'string',
			control: 'dropdown',
			description: 'Whether to apply the torque in local or world space.',
			'default': 'World',
			options: ['World', 'Local']
		}],
		transitions: []
	};

	enter (fsm) {
		SystemBus.addListener('goo.physics.substep', this.substepListener = function () {
			var entity = fsm.getOwnerEntity();
			if (!entity || !entity.rigidBodyComponent) { return; }

			torqueVector.setArray(this.torque);
			if (this.space === 'World') {
				entity.rigidBodyComponent.applyTorque(torqueVector);
			} else {
				entity.rigidBodyComponent.applyTorqueLocal(torqueVector);
			}
		}.bind(this));
	};

	exit () {
		SystemBus.removeListener('goo.physics.substep', this.substepListener);
	};
}

export = ApplyTorqueAction;
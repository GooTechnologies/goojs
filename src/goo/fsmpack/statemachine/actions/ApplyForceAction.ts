import {External} from './IAction';
import Action = require('./Action');

var Vector3 = require('../../../math/Vector3');
var SystemBus = require('../../../entities/SystemBus');

class ApplyForceAction extends Action {
	substepListener: () => void;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'ApplyForce',
		name: 'Apply force on rigid body',
		type: 'physics',
		description: 'Apply a force to the attached rigid body.',
		canTransition: false,
		parameters: [{
			name: 'Force',
			key: 'force',
			type: 'position',
			description: 'Force to apply to the body.',
			'default': [0, 0, 0]
		}, {
			name: 'Apply point',
			key: 'point',
			type: 'position',
			description: 'Where on the body to apply the force, relative to the center of mass.',
			'default': [0, 0, 0]
		}, {
			name: 'Space',
			key: 'space',
			type: 'string',
			control: 'dropdown',
			description: 'The space where the force and apply point are defined.',
			'default': 'World',
			options: ['World', 'Local']
		}],
		transitions: []
	}

	enter(fsm: any) {
		var forceVector = new Vector3();
		var applyPoint = new Vector3();

		SystemBus.addListener('goo.physics.substep', this.substepListener = function () {
			var entity = fsm.getOwnerEntity();
			if (!entity || !entity.rigidBodyComponent) { return; }

			forceVector.setArray(this.force);
			applyPoint.setArray(this.point);
			if (this.space === 'World') {
				entity.rigidBodyComponent.applyForce(forceVector, applyPoint);
			} else {
				entity.rigidBodyComponent.applyForceLocal(forceVector, applyPoint);
			}
		}.bind(this));
	}

	exit(fsm: any) {
		SystemBus.removeListener('goo.physics.substep', this.substepListener);
	}
}

export = ApplyForceAction;
import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var Matrix3 = require('../../../math/Matrix3');
var Quaternion = require('../../../math/Quaternion');
var MathUtils = require('../../../math/MathUtils');

var matrix = new Matrix3();
var matrix2 = new Matrix3();
var quaternion = new Quaternion();
var quaternion2 = new Quaternion();
var DEG_TO_RAD = MathUtils.DEG_TO_RAD;

class SetRigidBodyRotationAction extends Action {
	relative: boolean;
	rotation: Array<number>;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'setRigidBodyRotation',
		name: 'Set Rigid Body Rotation',
		description: 'Set Rigid Body Rotation',
		type: 'physics',
		canTransition: false,
		parameters: [{
			name: 'Rotation',
			key: 'rotation',
			type: 'vec3',
			description: 'Absolute rotation to set.',
			'default': [0, 0, 0]
		},{
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'Relative to the current rotation or absolute.',
			'default': false
		}],
		transitions: []
	};

	setRotation (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity && entity.rigidBodyComponent) {
			var rotation = this.rotation;
			matrix.fromAngles(
				rotation[0] * DEG_TO_RAD,
				rotation[1] * DEG_TO_RAD,
				rotation[2] * DEG_TO_RAD
			);

			if (this.relative) {
				entity.rigidBodyComponent.getQuaternion(quaternion2);
				matrix2.copyQuaternion(quaternion2);
				matrix.mul2(matrix2, matrix);
			}

			quaternion.fromRotationMatrix(matrix);
			entity.rigidBodyComponent.setQuaternion(quaternion);
		}
	}

	enter (fsm) {
		this.setRotation(fsm);
	}
}

export = SetRigidBodyRotationAction;
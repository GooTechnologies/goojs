import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var MathUtils = require('../../../math/MathUtils');

var DEG_TO_RAD = MathUtils.DEG_TO_RAD;

class RotateAction extends Action {
	rotation: any;
	relative: boolean;
	everyFrame: boolean;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Rotate',
		name: 'Rotate',
		type: 'animation',
		description: 'Rotates the entity with the set angles (in degrees).',
		parameters: [{
			name: 'Rotation',
			key: 'rotation',
			type: 'rotation',
			description: 'Rotatation.',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add to current rotation.',
			'default': true
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	applyRotation (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.sync().transform;

		var rotationX = this.rotation[0];
		var rotationY = this.rotation[1];
		var rotationZ = this.rotation[2];

		if (this.relative) {
			var rotationMatrix = transform.rotation;
			if (this.everyFrame) {
				var tpf = fsm.getTpf();
				rotationMatrix.rotateX(rotationX * DEG_TO_RAD * tpf);
				rotationMatrix.rotateY(rotationY * DEG_TO_RAD * tpf);
				rotationMatrix.rotateZ(rotationZ * DEG_TO_RAD * tpf);
			} else {
				rotationMatrix.rotateX(rotationX * DEG_TO_RAD);
				rotationMatrix.rotateY(rotationY * DEG_TO_RAD);
				rotationMatrix.rotateZ(rotationZ * DEG_TO_RAD);
			}
		} else {
			if (this.everyFrame) {
				var tpf = fsm.getTpf();
				transform.setRotationXYZ(
					rotationX * DEG_TO_RAD * tpf,
					rotationY * DEG_TO_RAD * tpf,
					rotationZ * DEG_TO_RAD * tpf
				);
			} else {
				transform.setRotationXYZ(
					rotationX * DEG_TO_RAD,
					rotationY * DEG_TO_RAD,
					rotationZ * DEG_TO_RAD
				);
			}
		}

		entity.transformComponent.setUpdated();
	};

	enter (fsm) {
		if (!this.everyFrame) {
			this.applyRotation(fsm);
		}
	};

	update (fsm) {
		if (this.everyFrame) {
			this.applyRotation(fsm);
		}
	};
}

export = RotateAction;
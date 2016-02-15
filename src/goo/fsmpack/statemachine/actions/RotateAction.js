define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/math/MathUtils'
], function (
	Action,
	MathUtils
) {
	'use strict';

	function RotateAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RotateAction.prototype = Object.create(Action.prototype);
	RotateAction.prototype.constructor = RotateAction;

	RotateAction.external = {
		name: 'Rotate',
		type: 'animation',
		description: 'Rotates the entity with the set angles (in degrees).',
		parameters: [{
			name: 'Rotation',
			key: 'rotation',
			type: 'rotation',
			description: 'Rotate',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add to current rotation',
			'default': true
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	RotateAction.prototype.applyRotation = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;
		if (this.relative) {
			if (this.everyFrame) {
				var tpf = fsm.getTpf();
				transform.rotation.rotateX(this.rotation[0] * MathUtils.DEG_TO_RAD * tpf);
				transform.rotation.rotateY(this.rotation[1] * MathUtils.DEG_TO_RAD * tpf);
				transform.rotation.rotateZ(this.rotation[2] * MathUtils.DEG_TO_RAD * tpf);
			} else {
				transform.rotation.rotateX(this.rotation[0] * MathUtils.DEG_TO_RAD);
				transform.rotation.rotateY(this.rotation[1] * MathUtils.DEG_TO_RAD);
				transform.rotation.rotateZ(this.rotation[2] * MathUtils.DEG_TO_RAD);
			}
		} else {
			if (this.everyFrame) {
				var tpf = fsm.getTpf();
				transform.setRotationXYZ(
					this.rotation[0] * MathUtils.DEG_TO_RAD * tpf,
					this.rotation[1] * MathUtils.DEG_TO_RAD * tpf,
					this.rotation[2] * MathUtils.DEG_TO_RAD * tpf
				);
			} else {
				transform.setRotationXYZ(
					this.rotation[0] * MathUtils.DEG_TO_RAD,
					this.rotation[1] * MathUtils.DEG_TO_RAD,
					this.rotation[2] * MathUtils.DEG_TO_RAD
				);
			}
		}

		entity.transformComponent.setUpdated();
	};

	RotateAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.applyRotation(fsm);
		}
	};

	RotateAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.applyRotation(fsm);
		}
	};

	return RotateAction;
});
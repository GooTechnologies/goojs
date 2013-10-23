define([
	'goo/statemachine/actions/Action',
	'goo/math/MathUtils'
],
/** @lends */
function(
	Action,
	MathUtils
) {
	"use strict";

	function RotateAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RotateAction.prototype = Object.create(Action.prototype);
	RotateAction.prototype.constructor = RotateAction;

	RotateAction.external = {
		description: 'Rotates the entity',
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
			description: 'If true add, otherwise set',
			'default': true
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Do this action every frame',
			'default': true
		}],
		transitions: []
	};

	RotateAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();

		var transform = entity.transformComponent.transform;
		if (this.relative) {
			transform.rotation.rotateX(this.rotation[0] * MathUtils.DEG_TO_RAD);
			transform.rotation.rotateY(this.rotation[1] * MathUtils.DEG_TO_RAD);
			transform.rotation.rotateZ(this.rotation[2] * MathUtils.DEG_TO_RAD);
		} else {
			transform.setRotationXYZ(
				this.rotation[0] * MathUtils.DEG_TO_RAD,
				this.rotation[1] * MathUtils.DEG_TO_RAD,
				this.rotation[2] * MathUtils.DEG_TO_RAD
			);
		}

		entity.transformComponent.setUpdated();
	};

	return RotateAction;
});
define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function RotateAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RotateAction.prototype = Object.create(Action.prototype);
	RotateAction.prototype.constructor = RotateAction;
	/*
	RotateAction.prototype.configure = function(settings) {
		FSMUtil.settings.call(this, settings, RotateAction.external.parameters);
	};
	*/
	RotateAction.external = {
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
			transform.rotation.rotateX(this.rotation[0]*Math.PI/180);
			transform.rotation.rotateY(this.rotation[1]*Math.PI/180);
			transform.rotation.rotateZ(this.rotation[2]*Math.PI/180);
		} else {
			transform.setRotationXYZ(
				this.rotation[0]*Math.PI/180,
				this.rotation[1]*Math.PI/180,
				this.rotation[2]*Math.PI/180);
		}

		entity.transformComponent.setUpdated();
	};

	return RotateAction;
});
define([
	'goo/statemachine/actions/Action',
	'goo/math/Vector3'
],
/** @lends */
function(
	Action,
	Vector3
) {
	"use strict";

	function MoveWithRotationAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MoveWithRotationAction.prototype = Object.create(Action.prototype);
	MoveWithRotationAction.prototype.constructor = MoveWithRotationAction;

	MoveWithRotationAction.external = {
		parameters: [{
			name: 'Translation',
			key: 'translation',
			type: 'position',
			description: 'Move',
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

	MoveWithRotationAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent();
		var transform = transformComponent.transform;

		var forward = new Vector3().copy(this.translation);
		var orientation = transform.rotation;
		orientation.applyPost(forward);

		if (this.relative) {
			transform.translation.add(forward);
		} else {
			transform.translation.set(forward);
		}

		transformComponent.setUpdated();
	};

	return MoveWithRotationAction;
});
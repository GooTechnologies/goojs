define([
	'goo/statemachine/actions/Action',
	'goo/math/Vector3'
],
/** @lends */
function(
	Action,
	Vector3
) {
	'use strict';

	function MoveAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MoveAction.prototype = Object.create(Action.prototype);
	MoveAction.prototype.constructor = MoveAction;

	MoveAction.external = {
		name: 'Move',
		description: 'Moves the entity',
		parameters: [{
			name: 'Translation',
			key: 'translation',
			type: 'position',
			description: 'Move',
			'default': [0, 0, 0]
		}, {
			name: 'Oriented',
			key: 'oriented',
			type: 'boolean',
			description: 'If true translate with rotation',
			'default': true
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

	MoveAction.prototype._setup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;
		this.forward = new Vector3().seta(this.translation);
		var orientation = transform.rotation;
		orientation.applyPost(this.forward);
	};

	MoveAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;

		if (this.oriented) {
			if (this.relative) {
				var forward = new Vector3().seta(this.translation);
				var orientation = transform.rotation;
				orientation.applyPost(forward);
				transform.translation.add(forward);
			} else {
				transform.translation.set(this.forward);
			}
		} else {
			if (this.relative) {
				transform.translation.add(this.translation);
			} else {
				transform.translation.set(this.translation);
			}
		}

		entity.transformComponent.setUpdated();
	};

	return MoveAction;
});
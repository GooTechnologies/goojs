define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function MoveAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MoveAction.prototype = Object.create(Action.prototype);
	MoveAction.prototype.constructor = MoveAction;

	MoveAction.external = {
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

	MoveAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;
		if (this.relative) {
			transform.translation.add(this.translation);
		} else {
			transform.translation.set(this.translation);
		}

		entity.transformComponent.setUpdated();
	};

	return MoveAction;
});
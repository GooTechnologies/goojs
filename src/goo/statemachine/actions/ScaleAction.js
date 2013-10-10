define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function ScaleAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ScaleAction.prototype = Object.create(Action.prototype);
	ScaleAction.prototype.constructor = ScaleAction;

	ScaleAction.external = {
		parameters: [{
			name: 'Scale',
			key: 'scale',
			type: 'vec3',
			description: 'Move',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add/multiply, otherwise set',
			'default': 'absolute'
		}, {
			name: 'Multiply',
			key: 'multiply',
			type: 'boolean',
			description: 'If true multiply, otherwise add',
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

	ScaleAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;
		if (this.relative) {
			if (this.multiply) {
				transform.translation.mul(this.translation);
			} else {
				transform.translation.add(this.translation);
			}
		} else {
			transform.translation.set(this.scale);
		}

		entity.transformComponent.setUpdated();
	};

	return ScaleAction;
});
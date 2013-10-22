define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function LookAtAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	LookAtAction.prototype = Object.create(Action.prototype);
	LookAtAction.prototype.constructor = LookAtAction;

	LookAtAction.external = {
		description: 'Reorients an entity so that it\'s facing a specific point',
		parameters: [{
			name: 'Look at entity',
			key: 'lookAtEntity',
			type: 'entity',
			description: 'Entity to look at',
			'default': null
		}, {
			name: 'Look at point',
			key: 'lookAtPoint',
			type: 'position',
			description: 'Point to look at',
			'default': [0, 0, 0]
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Do this action every frame',
			'default': true
		}],
		transitions: []
	};

	LookAtAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var transform = transformComponent.transform;

		if (this.lookAtEntity) {
			transform.lookAt(this.lookAtEntity.transformComponent.transform.translation);
			transformComponent.setUpdated();
		} else if (this.lookAtPoint) {
			transformComponent.transform.lookAt(this.lookAtPoint);
			transformComponent.setUpdated();
		}
	};

	return LookAtAction;
});
define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function InFrustumAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	InFrustumAction.prototype = Object.create(Action.prototype);
	InFrustumAction.prototype.constructor = InFrustumAction;

	InFrustumAction.external = {
		parameters: [{
			name: 'Observed entity',
			key: 'observedEntity',
			type: 'entity',
			description: 'Entity to check whether it is in the active camera\'s frustum',
			'default': null
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Do this action every frame',
			'default': true
		}],
		transitions: [{
			name: 'in',
			description: 'State to transition to if entity is in frustum'
		}, {
			name: 'out',
			description: 'State to transition to if entity is out of frustum'
		}]
	};

	InFrustumAction.prototype._run = function(fsm) {
		if (this.observedEntity) {
		    if (this.observedEntity.isVisible) {
				fsm.send('in');
			} else {
				fsm.send('out');
			}
		}
	};

	return InFrustumAction;
});
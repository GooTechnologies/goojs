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
		name: 'In Frustum',
		description: 'Perfrms a transition based on whether the entity is in the current camera\'s frustum or not',
		canTransition: true,
		parameters: [{
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Do this action every frame',
			'default': true
		}],
		transitions: [{
			key: 'inside',
			name: 'Inside',
			description: 'State to transition to if entity is in frustum'
		}, {
			key: 'outside',
			name: 'Outside',
			description: 'State to transition to if entity is out of frustum'
		}]
	};

	InFrustumAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.isVisible) {
			fsm.send(this.transitions.inside);
		} else {
			fsm.send(this.transitions.outside);
		}
	};

	return InFrustumAction;
});
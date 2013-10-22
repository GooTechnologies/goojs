define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function InBoxAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	InBoxAction.prototype = Object.create(Action.prototype);
	InBoxAction.prototype.constructor = InBoxAction;

	InBoxAction.external = {
		description: 'Performs a transition based on whether an entity is inside a user defined box or not',
		canTransition: true,
		parameters: [{
			name: 'Point1',
			key: 'point1',
			type: 'position',
			description: 'First box point',
			'default': [-1, -1, -1]
		}, {
			name: 'Point2',
			key: 'point2',
			type: 'position',
			description: 'Second box point',
			'default': [1, 1, 1]
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Do this action every frame',
			'default': true
		}],
		transitions: [{
			key: 'inside',
			name: 'Inside',
			description: 'Event fired if the entity is inside the box'
		}, {
			key: 'outside',
			name: 'Outside',
			description: 'Event fired if the entity is outside the box'
		}]
	};

	InBoxAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		var translation = entity.transformComponent.worldTransform.translation;
		if (translation.data[0] > this.point1[0] && translation.data[1] > this.point1[1] && translation.data[2] > this.point1[2] &&
			translation.data[0] < this.point2[0] && translation.data[1] < this.point2[1] && translation.data[2] < this.point2[2]) {
			fsm.send(this.transitions.inside);
		} else {
			fsm.send(this.transitions.outside);
		}
	};

	return InBoxAction;
});
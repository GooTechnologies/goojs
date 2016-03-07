define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function InBoxAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	InBoxAction.prototype = Object.create(Action.prototype);
	InBoxAction.prototype.constructor = InBoxAction;

	InBoxAction.external = {
		name: 'In Box',
		type: 'collision',
		description: 'Performs a transition based on whether an entity is inside a user defined box volume or not. The volume is defined by setting two points which, when connected, form a diagonal through the box volume.',
		canTransition: true,
		parameters: [{
			name: 'Point1',
			key: 'point1',
			type: 'position',
			description: 'First box point.',
			'default': [-1, -1, -1]
		}, {
			name: 'Point2',
			key: 'point2',
			type: 'position',
			description: 'Second box point.',
			'default': [1, 1, 1]
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: [{
			key: 'inside',
			description: 'State to transition to if the entity is inside the box.'
		}, {
			key: 'outside',
			description: 'State to transition to if the entity is outside the box.'
		}]
	};

	var labels = {
		inside: 'Inside Box',
		outside: 'Outside Box'
	};

	InBoxAction.getTransitionLabel = function(transitionKey/*, actionConfig*/){
		return labels[transitionKey];
	};

	// TODO: Find this in some Util class
	function checkInside(pos, pt1, pt2) {
		var inside = false;

		var inOnAxis = function (pos, pt1, pt2) {
			if (pt1 > pt2) {
				if (pos < pt1 && pos > pt2) {
					return true;
				}
			} else if (pt2 > pt1) {
				if (pos < pt2 && pos > pt1) {
					return true;
				}
			} else {
				if (pos === pt2) {
					return true;
				}
			}
			return false;
		};

		var isInsideX = inOnAxis(pos[0], pt1[0], pt2[0]);
		var isInsideY = inOnAxis(pos[1], pt1[1], pt2[1]);
		var isInsideZ = inOnAxis(pos[2], pt1[2], pt2[2]);

		if (isInsideX && isInsideY && isInsideZ) {
			inside = true;
		}

		return inside;
	}

	InBoxAction.prototype.checkInside = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var translation = entity.transformComponent.worldTransform.translation;

		var inside = checkInside([translation.x, translation.y, translation.z], this.point1, this.point2);

		if (inside) {
			fsm.send(this.transitions.inside);
		} else {
			fsm.send(this.transitions.outside);
		}
	};

	InBoxAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.checkInside(fsm);
		}
	};

	InBoxAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.checkInside(fsm);
		}
	};

	return InBoxAction;
});
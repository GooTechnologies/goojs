define([
	'goo/statemachine/actions/Action',
	'goo/entities/systems/ProximitySystem'
],
/** @lends */
function(
	Action,
	ProximitySystem
) {
	"use strict";

	function CollidesAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
	}

	CollidesAction.prototype = Object.create(Action.prototype);
	CollidesAction.prototype.constructor = CollidesAction;

	CollidesAction.external = {
		name: 'Collides',
		description: 'Checks for collisions with other entities; Collisions are based on the entities\' bounding volumes',
		parameters: [{
			name: 'Tag',
			key: 'tag',
			type: 'dropdown',
			description: 'Checks for collisions with other objects having this tag',
			'default': 'red',
			options: ['red', 'blue', 'green', 'yellow']
		}],
		transitions: [{
			key: 'collides',
			name: 'On Collision',
			description: 'States to transition to when a collision occurs'
		}, {
			key: 'notCollides',
			name: 'On Divergence',
			description: 'States to transition to when a collision is not occurring'
		}]
	};

	CollidesAction.prototype.ready = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var world = entity._world;
		if (!world.getSystem('ProximitySystem')) {
			world.setSystem(new ProximitySystem());
		}
	};

	CollidesAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var world = entity._world;
		var proximitySystem = world.getSystem('ProximitySystem');
		var collection = proximitySystem.getFor(this.tag);

		var worldBound = entity.meshRendererComponent.worldBound;
		for (var i = 0; i < collection.length; i++) {
			if (worldBound.intersects(collection[i].meshRendererComponent.worldBound)) {
				fsm.send(this.transitions.collides);
				return;
			}
		}
		fsm.send(this.transitions.notCollides);
	};

	return CollidesAction;
});
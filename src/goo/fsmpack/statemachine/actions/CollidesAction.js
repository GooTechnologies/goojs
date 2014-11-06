define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/fsmpack/proximity/ProximitySystem'
],
/** @lends */
function(
	Action,
	ProximitySystem
) {
	'use strict';

	function CollidesAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
	}

	CollidesAction.prototype = Object.create(Action.prototype);
	CollidesAction.prototype.constructor = CollidesAction;

	CollidesAction.external = {
		key: 'Collides',
		name: 'Collision',
		type: 'collision',
		description: 'Checks for collisions or non-collisions with other entities. Collisions are based on the entities\' bounding volumes. Before using collisions you first need to tag objects using the \'Tag\' action.',
		canTransition: true,
		parameters: [{
			name: 'Tag',
			key: 'tag',
			type: 'string',
			control: 'dropdown',
			description: 'Checks for collisions with other objects having this tag',
			'default': 'red',
			options: ['red', 'blue', 'green', 'yellow']
		}],
		transitions: [{
			key: 'collides',
			name: 'On Collision',
			description: 'State to transition to when a collision occurs'
		}, {
			key: 'notCollides',
			name: 'On Divergence',
			description: 'State to transition to when a collision is not occurring'
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

		var collides = false;
		entity.traverse(function (entity) {
			var worldBound;
			if (entity.meshRendererComponent &&
				!entity.particleComponent) {
				worldBound = entity.meshRendererComponent.worldBound;
				for (var i = 0; i < collection.length; i++) {
					collection[i].traverse(function (entity) {
						if (entity.meshRendererComponent &&
							entity.meshRendererComponent.worldBound &&
							!entity.particleComponent &&
							worldBound.intersects(entity.meshRendererComponent.worldBound)) {
							collides = true;
							return false;
						}
					});
					if (collides) {
						return false;
					}
				}
			}
		});

		if (collides) {
			fsm.send(this.transitions.collides);
		} else {
			fsm.send(this.transitions.notCollides);
		}
	};

	return CollidesAction;
});
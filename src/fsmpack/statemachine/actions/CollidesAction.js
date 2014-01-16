define([
	'fsmpack/statemachine/actions/Action',
	'goo/entities/systems/ProximitySystem',
	'goo/entities/EntityUtils'
],
/** @lends */
function(
	Action,
	ProximitySystem,
	EntityUtils
) {
	'use strict';

	function CollidesAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
	}

	CollidesAction.prototype = Object.create(Action.prototype);
	CollidesAction.prototype.constructor = CollidesAction;

	CollidesAction.external = {
		name: 'Collides',
		description: 'Checks for collisions with other entities. Collisions are based on the entities\' bounding volumes. Before using collisions you first need to tag objects using the \'Tag\' action',
		canTransition: true,
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

		var collides = false;
		EntityUtils.traverse(entity, function(entity) {
			var worldBound;
			if (entity.meshRendererComponent) {
				worldBound = entity.meshRendererComponent.worldBound;
				for (var i = 0; i < collection.length; i++) {
					EntityUtils.traverse(collection[i], function(entity) {
						if (entity.meshRendererComponent && worldBound.intersects(entity.meshRendererComponent.worldBound)) {
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
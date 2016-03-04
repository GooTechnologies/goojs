define([
	'goo/entities/EntitySelection',
	'goo/fsmpack/statemachine/actions/Action',
	'goo/fsmpack/proximity/ProximitySystem'
], function (
	EntitySelection,
	Action,
	ProximitySystem
) {
	'use strict';

	function CollidesAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	CollidesAction.prototype = Object.create(Action.prototype);
	CollidesAction.prototype.constructor = CollidesAction;

	CollidesAction.external = {
		key: 'Collides',
		name: 'Collision (Bounding volume intersection)',
		type: 'collision',
		description: 'Checks for collisions or non-collisions with other entities. Collisions are based on the entities\' bounding volumes. Before using collisions you first need to tag your entities.',
		canTransition: true,
		parameters: [{
			name: 'Tag',
			key: 'tag',
			type: 'string',
			description: 'Checks for collisions with other objects having this tag',
			'default': 'red'
		}],
		transitions: [{
			key: 'collides',
			description: 'State to transition to when a collision occurs'
		}, {
			key: 'notCollides',
			description: 'State to transition to when a collision is not occurring'
		}]
	};

	var labels = {
		collides: 'Bounds Overlap',
		notCollides: 'Bounds Separate'
	};

	CollidesAction.getTransitionLabel = function(transitionKey /*, actionConfig*/){
		return labels[transitionKey];
	};

	CollidesAction.prototype.ready = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var world = entity._world;
		if (!world.getSystem('ProximitySystem')) {
			world.setSystem(new ProximitySystem());
		}
	};

	CollidesAction.prototype.update = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var world = entity._world;
		var proximitySystem = world.getSystem('ProximitySystem');

		var entities = new EntitySelection(proximitySystem.getFor(this.tag))
			.and(world.by.tag(this.tag))
			.toArray();

		var collides = false;

		entity.traverse(function (entity) {
			// Stop traversing when the entity can't collide with anything.
			if (!entity.meshRendererComponent || entity.particleComponent) {
				return false;
			}

			var worldBound = entity.meshRendererComponent.worldBound;

			for (var i = 0; i < entities.length; i++) {
				entities[i].traverse(function (entity) {
					if (!entity.meshRendererComponent || entity.particleComponent) {
						return true; // Move on to other entities.
					}

					var otherBound = entity.meshRendererComponent.worldBound;
					if (otherBound && worldBound.intersects(otherBound)) {
						collides = true;
						return false; // Stop traversing.
					}
				});

				if (collides) {
					return false; // Stop traversing.
				}
			}
		});

		fsm.send(collides ? this.transitions.collides : this.transitions.notCollides);
	};

	return CollidesAction;
});
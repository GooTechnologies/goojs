define([
	'goo/entities/systems/System'
],
/** @lends */
function (System) {
	'use strict';

	/**
	 * @class Processes all entities with collider components, making sure they are up to date.
	 * @extends System
	 */
	function ColliderSystem() {
		System.call(this, 'ColliderSystem', ['ColliderComponent', 'TransformComponent']);

		this.priority = 1; // Should be processed after TransformSystem
	}
	ColliderSystem.prototype = Object.create(System.prototype);
	ColliderSystem.prototype.constructor = ColliderSystem;

	ColliderSystem.prototype.process = function (entities) {
		var N = entities.length;

		for (var i = 0; i !== N; i++) {
			var entity = entities[i];
			var transformComp = entity.transformComp;
			var colliderComp = entity.colliderComp;

			colliderComp._updated = false;
			if (transformComp._updated) {
				entity.colliderComp.updateWorldCollider(transformComp.worldTransform);
			}
		}
	};

	return ColliderSystem;
});
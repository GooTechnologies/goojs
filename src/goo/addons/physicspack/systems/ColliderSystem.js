define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus'
], function (
	System,
	SystemBus
) {
	'use strict';

	/**
	 * Processes all entities with collider components, making sure they are up to date.
	 * @extends System
	 */
	function ColliderSystem() {
		System.call(this, 'ColliderSystem', ['ColliderComponent', 'TransformComponent']);
		this.priority = 1; // Should be processed after TransformSystem
	}
	ColliderSystem.prototype = Object.create(System.prototype);
	ColliderSystem.prototype.constructor = ColliderSystem;

	/**
	 * @private
	 * @param {array} entities
	 */
	ColliderSystem.prototype.process = function (/*entities*/) {
		// var N = entities.length;

		// for (var i = 0; i !== N; i++) {
		// 	var entity = entities[i];
		// 	var transformComp = entity.transformComponent;
		// 	var colliderComp = entity.colliderComponent;

		// 	colliderComp._updated = false;
		// 	if (transformComp._updated) {
		// 		entity.colliderComponent.updateWorldCollider();
		// 		entity.colliderComponent.setToDirty();
		// 	}
		// }
	};

	/**
	 * @private
	 * @param  {Entity} entity
	 */
	ColliderSystem.prototype.inserted = function (entity) {
		SystemBus.emit('goo.collider.inserted', {
			entity: entity
		});
	};

	/**
	 * @private
	 * @param  {Entity} entity
	 */
	ColliderSystem.prototype.deleted = function (entity) {
		SystemBus.emit('goo.collider.deleted', {
			entity: entity
		});
	};

	/**
	 * @private
	 * @param  {Entity} entity
	 * @param  {Component} component
	 */
	ColliderSystem.prototype.removedComponent = function (entity, component) {
		SystemBus.emit('goo.collider.deletedComponent', {
			entity: entity,
			component: component
		});
	};

	return ColliderSystem;
});
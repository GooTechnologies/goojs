define(['goo/entities/systems/System'],
	/** @lends */
	function (System) {
	"use strict";

	/**
	 * @class Processes all entities with transform components, making sure they are up to date and valid according to the "scenegraph"
	 */
	function TransformSystem() {
		System.call(this, 'TransformSystem', null);
	}

	TransformSystem.prototype = Object.create(System.prototype);

	TransformSystem.prototype.process = function (entities) {
		var i, entity;
		for (i = 0; i < entities.length; i++) {
			entity = entities[i];
			entity._updated = false;
			if (entity._dirty) {
				entity.updateTransform();
			}
		}
		for (i = 0; i < entities.length; i++) {
			entity = entities[i];
			if (entity._dirty) {
				this.updateWorldTransform(entity);
			}
		}
	};

	TransformSystem.prototype.updateWorldTransform = function (entity) {
		entity.updateWorldTransform();

		for (var i = 0; i < entity.children.length; i++) {
			this.updateWorldTransform(entity.children[i]);
		}
	};

	return TransformSystem;
});
define([
	'goo/entities/systems/System'
],
/** @lends */
function (System) {
	'use strict';

	/**
	 * @class Processes all entities with transform components, making sure they are up to date and valid according to the "scenegraph"
	 * @extends System
	 */
	function TransformSystem() {
		System.call(this, 'TransformSystem', ['TransformComponent']);
		this.numUpdates = 0;
	}

	TransformSystem.prototype = Object.create(System.prototype);

	TransformSystem.prototype.process = function (entities) {
		this.numUpdates = 0;
		var i, transformComponent;
		for (i = 0; i < entities.length; i++) {
			transformComponent = entities[i].transformComponent;
			transformComponent._updated = false;
			if (transformComponent._dirty) {
				transformComponent.updateTransform();
			}
		}


		for (i = 0; i < entities.length; i++) {
			transformComponent = entities[i].transformComponent;
			if (transformComponent.parent === null && !transformComponent._dirty) {
				// Root node that is not dirty. We don't need to update it.
				transformComponent._updated2 = true;
			} else {
				transformComponent._updated2 = false;
			}
		}

		for (i = 0; i < entities.length; i++) {
			transformComponent = entities[i].transformComponent;
			this.updateWorldTransform(transformComponent);
		}

		// Should not be needed, but safe it up
		for (i = 0; i < entities.length; i++) {
			transformComponent = entities[i].transformComponent;
			if (transformComponent._dirty) {
				transformComponent.updateWorldTransform();
			}
		}
	};

	TransformSystem.prototype.updateWorldTransform = function (transformComponent) {
		var isRoot = transformComponent.parent === null;
		var isUpdated = transformComponent._updated2;
		var hasUpdatedParent = (transformComponent.parent && transformComponent.parent._updated2);
		if (!isUpdated && (isRoot || hasUpdatedParent)) {
			this.numUpdates++;
			transformComponent.updateWorldTransform();
			transformComponent._updated2 = true;
		}

		for (var i = 0; i < transformComponent.children.length; i++) {
			this.updateWorldTransform(transformComponent.children[i]);
		}
	};

	return TransformSystem;
});
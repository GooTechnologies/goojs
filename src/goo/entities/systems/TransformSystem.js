define(['goo/entities/systems/System'],
	/** @lends */
	function (System) {
	"use strict";

	/**
	 * @class Processes all entities with transform components, making sure they are up to date and valid according to the "scenegraph"
	 */
	function TransformSystem() {
		System.call(this, 'TransformSystem', ['TransformComponent']);
	}

	TransformSystem.prototype = Object.create(System.prototype);

	TransformSystem.prototype.removed = function (entity) {
		var transformComponent = entity.transformComponent;

		// detach from parent
		if(transformComponent.parent) {
			transformComponent.parent.detachChild(transformComponent);
		}

		// detach children
		var children = transformComponent.children;
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			child.parent = null;
		}

		transformComponent.parent = null;
		transformComponent.children = [];
	};

	TransformSystem.prototype.process = function (entities) {
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
			if (transformComponent._dirty) {
				this.updateWorldTransform(transformComponent);
			}
		}
	};

	TransformSystem.prototype.updateWorldTransform = function (transformComponent) {
		transformComponent.updateWorldTransform();

		for (var i = 0; i < transformComponent.children.length; i++) {
			this.updateWorldTransform(transformComponent.children[i]);
		}
	};

	return TransformSystem;
});
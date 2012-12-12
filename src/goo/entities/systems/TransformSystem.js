define(['goo/entities/systems/System'], function(System) {
	"use strict";

	/**
	 * @name TransformSystem
	 * @class Processes all entities with transform components, making sure they are up to date and valid according to the "scenegraph"
	 */
	function TransformSystem() {
		System.call(this, 'TransformSystem', ['TransformComponent']);
	}

	TransformSystem.prototype = Object.create(System.prototype);

	TransformSystem.prototype.process = function(entities) {
		for ( var i in entities) {
			var transformComponent = entities[i].transformComponent;
			transformComponent._updated = false;
			if (transformComponent._dirty) {
				transformComponent.updateTransform();
			}
		}
		for (i in entities) {
			transformComponent = entities[i].transformComponent;
			if (transformComponent._dirty) {
				this.updateWorldTransform(transformComponent);
			}
		}
	};

	TransformSystem.prototype.updateWorldTransform = function(transformComponent) {
		transformComponent.updateWorldTransform();

		for ( var i in transformComponent.children) {
			this.updateWorldTransform(transformComponent.children[i]);
		}
	};

	return TransformSystem;
});
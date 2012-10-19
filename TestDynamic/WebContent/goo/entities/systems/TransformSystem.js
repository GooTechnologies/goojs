"use strict";

define([ 'goo/entities/systems/System' ], function(System) {
	function TransformSystem() {
		System.call(this, 'TransformSystem', [ 'TransformComponent' ]);
	}

	TransformSystem.prototype = Object.create(System.prototype);

	TransformSystem.prototype.process = function(entities) {
		for ( var i in entities) {
			var transformComponent = entities[i].TransformComponent;
			transformComponent._updated = false;
			if (transformComponent._dirty) {
				transformComponent.updateTransform();
			}
		}
		for ( var i in entities) {
			var transformComponent = entities[i].TransformComponent;
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
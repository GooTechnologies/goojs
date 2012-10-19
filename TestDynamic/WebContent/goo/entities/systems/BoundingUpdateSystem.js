"use strict";

define([ 'goo/entities/systems/System' ], function(System) {
	function BoundingUpdateSystem() {
		System.call(this, 'BoundingUpdateSystem',
				[ 'TransformComponent', 'MeshRendererComponent', 'MeshDataComponent' ]);
	}

	BoundingUpdateSystem.prototype = Object.create(System.prototype);

	BoundingUpdateSystem.prototype.process = function(entities) {
		for ( var i in entities) {
			var entity = entities[i];
			var meshDataComponent = entity.MeshDataComponent;
			var transformComponent = entity.TransformComponent;
			var meshRendererComponent = entity.MeshRendererComponent;

			if (meshDataComponent.autoCompute) {
				meshDataComponent.computeBoundFromPoints();
			}
			if (transformComponent._updated) {
				meshRendererComponent.updateBounds(meshDataComponent.modelBound, transformComponent.worldTransform);
				// meshDataComponent.setDirty(false);
			}
		}
	};

	return BoundingUpdateSystem;
});
define(['goo/entities/systems/System'],
/** @lends */
function (System) {
	"use strict";

	/**
	 * @class Calculates and updates all boundings on entities with both transform, meshrenderer and meshdata components
	 */
	function BoundingUpdateSystem () {
		System.call(this, 'BoundingUpdateSystem', ['TransformComponent', 'MeshRendererComponent', 'MeshDataComponent']);
	}

	BoundingUpdateSystem.prototype = Object.create(System.prototype);

	BoundingUpdateSystem.prototype.process = function (entities) {
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var meshDataComponent = entity.meshDataComponent;
			var transformComponent = entity.transformComponent;
			var meshRendererComponent = entity.meshRendererComponent;

			if (meshDataComponent.autoCompute) {
				meshDataComponent.computeBoundFromPoints();
				meshRendererComponent.updateBounds(meshDataComponent.modelBound, transformComponent.worldTransform);
			} else if (transformComponent._updated) {
				meshRendererComponent.updateBounds(meshDataComponent.modelBound, transformComponent.worldTransform);
				// meshDataComponent.setDirty(false);
			}
		}
	};

	return BoundingUpdateSystem;
});
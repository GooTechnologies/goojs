define(['goo/renderer/Camera'],
	/** @lends SimplePartitioner */
	function (Camera) {
	"use strict";

	/**
	 * @class Culls entities based on camera frustum and boundings
	 */
	function SimplePartitioner() {
	}

	SimplePartitioner.prototype.added = function () {
		// needed for things like quadtrees etc
	};

	SimplePartitioner.prototype.removed = function () {
		// needed for things like quadtrees etc
	};

	/**
	 * Calculates which entities are inside the frustum.
	 * @param renderList Visible entities will be added to this array.
	 */
	SimplePartitioner.prototype.process = function (camera, entities, renderList) {
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];

			if (entity.skip) {
				continue;
			}

			if (entity.meshRendererComponent.cullMode === 'Never') {
				renderList.push(entity);
				entity.isVisible = true;
			} else {
				var bounds = entity.meshRendererComponent.worldBound;
				var result = camera.contains(bounds);
				if (result !== Camera.Outside) {
					renderList.push(entity);
					entity.isVisible = true;
				} else {
					entity.isVisible = false;
				}
			}
		}
	};

	return SimplePartitioner;
});
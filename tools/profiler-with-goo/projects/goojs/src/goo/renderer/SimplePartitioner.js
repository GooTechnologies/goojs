define(['goo/renderer/Camera'],
	/** @lends */
	function (Camera) {
	'use strict';

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

	SimplePartitioner.prototype.process = function (camera, entities, renderList) {
		var index = 0;
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];

			if (entity.skip || entity.meshRendererComponent.hidden) {
				continue;
			}

			if (entity.meshRendererComponent.cullMode === 'Never') {
				renderList[index++] = entity;
				entity.isVisible = true;
			} else {
				var bounds = entity.meshRendererComponent.worldBound;
				var result = camera.contains(bounds);
				if (result !== Camera.Outside) {
					renderList[index++] = entity;
					entity.isVisible = true;
				} else {
					entity.isVisible = false;
				}
			}
		}
		renderList.length = index;
	};

	return SimplePartitioner;
});
define(function() {
	"use strict";

	function SimplePartitioner() {
	}

	SimplePartitioner.prototype.added = function(entity) {
		// needed for things like quadtrees etc
	};

	SimplePartitioner.prototype.removed = function(entity) {
		// needed for things like quadtrees etc
	};

	SimplePartitioner.prototype.process = function(camera, entities, renderList) {
		camera.onFrameChange(); // TODO: not needed anymore?
		for ( var i in entities) {
			var entity = entities[i];

			var bounds = entity.meshRendererComponent.worldBound;
			var isVisible = camera.contains(bounds);
			if (isVisible) {
				renderList.push(entity);
				entity.isVisible = true;
			} else {
				entity.isVisible = false;
			}
		}
	};

	return SimplePartitioner;
});
define(function() {
	"use strict";

	function SimplePartitioner(camera) {
		this.camera = camera;
	}

	SimplePartitioner.prototype.added = function(entity) {
		// needed for things like quadtrees etc
	};

	SimplePartitioner.prototype.removed = function(entity) {
		// needed for things like quadtrees etc
	};

	SimplePartitioner.prototype.process = function(entities, renderList) {
		this.camera.updateFrustum();
		for ( var i in entities) {
			var entity = entities[i];

			var bounds = entity.meshRendererComponent.worldBound;
			var isVisible = this.contains(this.camera.frustum, bounds);
			if (isVisible) {
				renderList.push(entity);
			}
		}
	};

	SimplePartitioner.prototype.contains = function(frustum, bounds) {
		var planes = frustum.planes;
		for ( var i = 0; i < 6; i++) {
			var side = bounds.whichSide(planes[i]);
			if (side < 0) {
				return false;
			}
		}

		return true;
	};

	return SimplePartitioner;
});
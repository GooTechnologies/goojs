"use strict";

define(function() {
	function SimplePartitioner(camera) {
		this.camera = camera;
	}

	SimplePartitioner.prototype.added = function(entity) {

	};

	SimplePartitioner.prototype.removed = function(entity) {

	};

	SimplePartitioner.prototype.process = function(entities, renderList) {
		this.camera.updateFrustum();
		for ( var i in entities) {
			var entity = entities[i];

			var bounds = entity.MeshRendererComponent.worldBound;
			var isVisible = this.contains(this.camera.frustum, bounds);
			if (isVisible) {
				renderList.push(entity);
			}
		}
	};

	SimplePartitioner.prototype.contains = function(frustum, bounds) {
		// var distance = 0.0;
		// var planes = frustum.planes;
		// var matrix = bounds.worldTransform.matrix;
		// var me = matrix.elements;
		//
		// var radius = -bounds.radius * matrix.getMaxScaleOnAxis();
		//
		// for ( var i = 0; i < 6; i++) {
		// distance = planes[i].x * me[12] + planes[i].y * me[13] + planes[i].z
		// * me[14] + planes[i].w;
		// if (distance <= radius) {
		// return false;
		// }
		// }

		return true;
	};

	return SimplePartitioner;
});
define([
	'goo/math/Vector3',
	'goo/renderer/bounds/BoundingVolume',
	'goo/renderer/bounds/BoundingSphere',
	'goo/math/MathUtils'
], function (
	Vector3,
	BoundingVolume,
	BoundingSphere,
	MathUtils
) {
	'use strict';

	/**
	 */
	function BoundingPicker() {
	}

	var pickRay = new Vector3();

	BoundingPicker.prototype.pick = function (world, entity) {
		var pickList = [];
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var meshRendererComponent = entity.meshRendererComponent;

			if (!meshRendererComponent.isPickable) {
				continue;
			}

			// If we have custom pickLogic, use that.
			if (this.pickLogic) {
				if (!this.pickLogic.isConstructed(entity)) {
					this.pickLogic.added(entity);
				}

				var result = this.pickLogic.getPickResult(this.pickRay, entity);
				if (result && result.distances && result.distances.length) {
					pickList.push({
						'entity': entity,
						'intersection': result
					});
				}
			}

			// just use bounding pick instead... first must have a world bound
			else if (meshRendererComponent.worldBound) {
				// pick ray must intersect world bound
				var result = meshRendererComponent.worldBound.intersectsRayWhere(this.pickRay);
				if (result && result.distances.length) {
					pickList.push({
						'entity': entity,
						'intersection': result
					});
				}
			}
		}

		pickList.sort(function (a, b) {
			return a.intersection.distances[0] - b.intersection.distances[0];
		});
	};

	return BoundingPicker;
});
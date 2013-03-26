define(['goo/entities/systems/System'],
/** @lends PickingSystem */
function (System) {
	"use strict";

	/**
	 * @class Helps gather pickable entities
	 */
	function PickingSystem () {
		System.call(this, 'PickingSystem', ['MeshRendererComponent', 'TransformComponent']);
		this.passive = true;
		this.pickRay = null;
		this.onPick = null;
		this.pickLogic = null;
	}

	PickingSystem.prototype = Object.create(System.prototype);

	PickingSystem.prototype.inserted = function (entity) {
		if (this.pickLogic) {
			this.pickLogic.added(entity);
		}
	};

	PickingSystem.prototype.deleted = function (entity) {
		if (this.pickLogic) {
			this.pickLogic.removed(entity);
		}
	};

	PickingSystem.prototype.process = function (entities) {
		var pickList = [];
		if (!this.pickRay || !this.onPick) {
			return;
		}
		for ( var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var meshRendererComponent = entity.meshRendererComponent;

			// If we have custom pickLogic, use that.
			if (this.pickLogic) {
				var result = this.pickLogic.getPickResult(this.pickRay, entity);
				if (result && result.distances && result.distances.length) {
					pickList.push({
						"entity" : entity,
						"intersection" : result
					});
				}
			}

			// just use bounding pick instead... first must have a world bound
			else if (meshRendererComponent.worldBound) {
				// pick ray must intersect world bound
				var result = meshRendererComponent.worldBound.intersectsRayWhere(this.pickRay);
				if (result && result.distances.length) {
					pickList.push({
						"entity" : entity,
						"intersection" : result
					});
				}
			}
		}

		this.onPick(pickList);
	};

	return PickingSystem;
});
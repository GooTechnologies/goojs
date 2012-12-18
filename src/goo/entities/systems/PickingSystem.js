define(['goo/entities/systems/System'], function (System) {
	"use strict";

	/**
	 * @name PickingSystem
	 * @class Helps gather pickable entities
	 */
	function PickingSystem() {
		System.call(this, 'PickingSystem', ['MeshRendererComponent']);
		this.passive = true;
		this.pickRay = null;
		this.onPick = null;
	}

	PickingSystem.prototype = Object.create(System.prototype);

	PickingSystem.prototype.process = function (entities) {
		var pickList = [];
		if (!this.pickRay || !this.onPick) {
			return;
		}
		for (var i in entities) {
			var entity = entities[i];
			var meshRendererComponent = entity.meshRendererComponent;

			if (meshRendererComponent.worldBound) {
				var result = meshRendererComponent.worldBound.intersectsRayWhere(this.pickRay);
				if (result && result.distances.length) {
					pickList.push({"entity": entity, "intersection": result});
				}
			}
		}
		if (pickList.length) {
			this.onPick(pickList);
		}
	};

	return PickingSystem;
});
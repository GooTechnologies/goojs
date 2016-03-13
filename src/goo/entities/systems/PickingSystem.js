var System = require('../../entities/systems/System');



/**
 * Helps gather pickable entities
 * @extends System
 */
function PickingSystem (settings) {
	System.call(this, 'PickingSystem', ['MeshRendererComponent', 'TransformComponent']);
	this.passive = true;
	this.pickRay = null;
	this.onPick = null;

	settings = settings || {};

	this.setPickLogic(settings.pickLogic || null);
}

PickingSystem.prototype = Object.create(System.prototype);
PickingSystem.prototype.constructor = PickingSystem;

PickingSystem.prototype.setPickLogic = function (pickLogic) {
	this.pickLogic = pickLogic;
	if (pickLogic) {
		if (this.interests.indexOf('MeshDataComponent') === -1) {
			this.interests.push('MeshDataComponent');
		}
	}
};

PickingSystem.prototype.inserted = function (entity) {
	if (entity.meshRendererComponent.isPickable && this.pickLogic) {
		this.pickLogic.added(entity);
	}
};

PickingSystem.prototype.deleted = function (entity) {
	if (this.pickLogic) {
		this.pickLogic.removed(entity);
	}
};

PickingSystem.prototype.process = function (entities) {
	if (!this.pickRay || !this.onPick) {
		return;
	}
	var pickList = [];
	for ( var i = 0; i < entities.length; i++) {
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

	this.onPick(pickList);
};

module.exports = PickingSystem;
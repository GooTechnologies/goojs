var System = require('../../entities/systems/System');
var BoundingBox = require('../../renderer/bounds/BoundingBox');

/**
 * Calculates and updates all boundings on entities with both transform, meshrenderer and meshdata components
 * @extends System
 */
function BoundingUpdateSystem() {
	System.call(this, 'BoundingUpdateSystem', ['TransformComponent', 'MeshRendererComponent', 'MeshDataComponent']);
	this._worldBound = new BoundingBox();
	this._computeWorldBound = null;
}

BoundingUpdateSystem.prototype = Object.create(System.prototype);
BoundingUpdateSystem.prototype.constructor = BoundingUpdateSystem;

BoundingUpdateSystem.prototype.process = function (entities) {
	var l = entities.length;
	if (l === 0) {
		this._computeWorldBound = null;
		return;
	}

	for (var i = 0; i < l; i++) {
		var entity = entities[i];
		var meshDataComponent = entity.meshDataComponent;
		var transformComponent = entity.transformComponent;
		var meshRendererComponent = entity.meshRendererComponent;

		transformComponent.sync();

		if (meshDataComponent.modelBoundDirty) {
			meshDataComponent.computeBoundFromPoints();
			meshRendererComponent.updateBounds(meshDataComponent.modelBound, transformComponent.worldTransform);
		} else if (meshRendererComponent._worldBoundDirty) {
			meshRendererComponent.updateBounds(meshDataComponent.modelBound, transformComponent.worldTransform);
		}
	}
	if (this._computeWorldBound && this._computeWorldBound instanceof Function) {
		//this._worldBound = new BoundingSphere(new Vector3(0, 0, 0), 0); // optional for including the center of the scene into the world bound

		// generally we don't want particle systems to end up in our world bound computing since they have huge world bounds and can mess up stuff
		for (var i = 0; i < l; i++) {
			if (!entities[i].particleComponent) {
				this._worldBound = entities[i].meshRendererComponent.worldBound.clone();
				break;
			}
		}

		for (; i < l; i++) {
			if (!entities[i].particleComponent) {
				var mrc = entities[i].meshRendererComponent;
				this._worldBound = this._worldBound.merge(mrc.worldBound);
			}
		}

		this._computeWorldBound(this._worldBound);
		this._computeWorldBound = null;
	}
};

// function named get actually does a set
BoundingUpdateSystem.prototype.getWorldBound = function (callback) {
	this._computeWorldBound = callback;
};

BoundingUpdateSystem.prototype.deleted = function (entity) {
	if (entity.meshRendererComponent) {
		entity.meshRendererComponent.worldBound = new BoundingBox();
	}
};

module.exports = BoundingUpdateSystem;
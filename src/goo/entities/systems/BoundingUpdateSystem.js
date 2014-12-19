define([
	'goo/entities/systems/System',
	'goo/renderer/bounds/BoundingBox'
],
/** @lends */
function (
	System,
	BoundingBox
) {
	'use strict';

	/**
	 * @class Calculates and updates all boundings on entities with both transform, meshrenderer and meshdata components
	 * @extends System
	 */
	function BoundingUpdateSystem () {
		System.call(this, 'BoundingUpdateSystem', ['TransformComponent', 'MeshRendererComponent', 'MeshDataComponent']);
		this._worldBound = new BoundingBox();
		this._computeWorldBound = null;
	}

	BoundingUpdateSystem.prototype = Object.create(System.prototype);
	BoundingUpdateSystem.prototype.constructor = BoundingUpdateSystem;

	BoundingUpdateSystem.prototype.process = function (entities) {
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var meshDataComponent = entity.meshDataComponent;
			var transformComponent = entity.transformComponent;
			var meshRendererComponent = entity.meshRendererComponent;

			if (meshDataComponent.autoCompute) {
				meshDataComponent.computeBoundFromPoints();
				meshRendererComponent.updateBounds(meshDataComponent.modelBound, transformComponent.worldTransform);
			} else if (transformComponent._updated) {
				meshRendererComponent.updateBounds(meshDataComponent.modelBound, transformComponent.worldTransform);
				// meshDataComponent.setDirty(false);
			}
		}
		if (this._computeWorldBound && this._computeWorldBound instanceof Function) {
			if (entities.length === 0) {
				this._computeWorldBound = null;
				return;
			}

			//this._worldBound = new BoundingSphere(new Vector3(0, 0, 0), 0); // optional for including the center of the scene into the world bound

			// generally we don't want particle systems to end up in our world bound computing since they have huge world bounds and can mess up stuff
			for (var i = 0; i < entities.length; i++) {
				if (!entities[i].particleComponent) {
					this._worldBound = entities[i].meshRendererComponent.worldBound.clone();
					break;
				}
			}

			for (; i < entities.length; i++) {
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

	return BoundingUpdateSystem;
});
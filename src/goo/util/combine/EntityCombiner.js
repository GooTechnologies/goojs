define([
	'goo/entities/EntityUtils',
	'goo/util/MeshBuilder',
	'goo/math/Transform',
	'goo/math/Vector3',
	'goo/renderer/bounds/BoundingBox',
	'goo/renderer/bounds/BoundingSphere'
],
/** @lends */
function(
	EntityUtils,
	MeshBuilder,
	Transform,
	Vector3,
	BoundingBox,
	BoundingSphere
) {
	"use strict";

	function EntityCombiner(rootEntity, gridSize) {
		this.rootEntity = rootEntity;
		this.gridSize = gridSize;
	}

	EntityCombiner.prototype.combine = function(removeOld) {
		var world = this.rootEntity._world;
		var rootParent = this.rootEntity.transformComponent.parent;
		// this.rootEntity.removeFromWorld();

		var rootTransform = this.rootEntity.transformComponent.transform;
		var saveTransform = new Transform();
		saveTransform.copy(rootTransform);
		// rootTransform.setIdentity();

		EntityUtils.traverse(this.rootEntity, function(entity) {
			if (entity.transformComponent._dirty) {
				entity.transformComponent.updateTransform();
			}
		});
		EntityUtils.traverse(this.rootEntity, function(entity) {
			if (entity.transformComponent._dirty) {
				EntityUtils.updateWorldTransform(entity.transformComponent);
			}
		});

		var bounds = this._calculateBounds(this.rootEntity);
		var gridSizeX = bounds.xExtent * 2.0 / this.gridSize;
		var gridSizeZ = bounds.zExtent * 2.0 / this.gridSize;

		var entities = new Map();
		EntityUtils.traverse(this.rootEntity, function(entity) {
			if (entity.animationComponent) {
				return false;
			}

			// if (entity.isStatic && entity.meshDataComponent) {
			if (entity.meshDataComponent && entity.meshRendererComponent) {
				var key = entity.meshRendererComponent.materials[0];

				var attributeMap = entity.meshDataComponent.meshData.attributeMap;
				var key2 = Object.keys(attributeMap);
				key2.sort();
				key2 = key2.join('_');

				var xBucket = entity.meshRendererComponent.worldBound.center.x / gridSizeX;
				var zBucket = entity.meshRendererComponent.worldBound.center.z / gridSizeZ;
				key2 = key2 + '_' + Math.round(xBucket) + '_' + Math.round(zBucket);

				var set = entities.get(key);
				if (!set) {
					set = new Map();
					entities.put(key, set);
				}
				var set2 = set.get(key2);
				if (!set2) {
					set2 = [];
					set.put(key2, set2);
				}

				set2.push(entity);
			}
		});

		var newRoot = world.createEntity();
		// newRoot.transformComponent.transform.copy(saveTransform);
		var sets = entities.getKeys();

		for (var i = 0; i < sets.length; i++) {
			var material = sets[i];
			var entities2 = entities.get(material);
			var sets2 = entities2.getKeys();
			for (var j = 0; j < sets2.length; j++) {
				var toCombine = entities2.get(sets2[j]);

				if (toCombine.length === 1) {
					// toCombine[0].transformComponent.transform.setIdentity();
					// newRoot.transformComponent.attachChild(toCombine[0].transformComponent);
					continue;
				}

				var meshBuilder = new MeshBuilder();
				for (var k = 0; k < toCombine.length; k++) {
					var entity = toCombine[k];

					meshBuilder.addMeshData(entity.meshDataComponent.meshData, entity.transformComponent.worldTransform);

					if (removeOld) {
						entity.clearComponent('meshDataComponent');
						entity.clearComponent('meshRendererComponent');
					} else {
						entity.skip = true;
						entity.hidden = true;
					}
				}
				var meshDatas = meshBuilder.build();

				// var meshRoot = world.createEntity();
				// newRoot.transformComponent.attachChild(meshRoot.transformComponent);
				for (var key in meshDatas) {
					var entity = EntityUtils.createTypicalEntity(world, meshDatas[key], material);
					// meshRoot.transformComponent.attachChild(entity.transformComponent);
					newRoot.transformComponent.attachChild(entity.transformComponent);
				}
			}
		}

		if (rootParent) {
			rootParent.attachChild(newRoot.transformComponent);
		}
		this.newRoot = newRoot;
		newRoot.addToWorld();
		return newRoot;
	};

	EntityCombiner.prototype.uncombine = function() {
		if (this.newRoot) {
			this.newRoot.removeFromWorld();

			EntityUtils.traverse(this.rootEntity, function(entity) {
				entity.skip = false;
				entity.hidden = false;
			});
		}
	};

	EntityCombiner.prototype._calculateBounds = function (rootEntity) {
		var first = true;
		var wb = new BoundingBox();
		EntityUtils.traverse(rootEntity, function(entity) {
			if (entity.meshRendererComponent && !entity.particleComponent) {
				if (first) {
					var bound = entity.meshRendererComponent.worldBound;
					if (bound instanceof BoundingBox) {
						bound.clone(wb);
					} else if (bound instanceof BoundingSphere) {
						wb.center.setv(bound.center);
						wb.xExtent = wb.yExtent = wb.zExtent = bound.radius;
					} else {
						wb.center.setv(Vector3.ZERO);
						wb.xExtent = wb.yExtent = wb.zExtent = 10;
					}

					first = false;
				} else {
					wb.merge(entity.meshRendererComponent.worldBound);
				}
			}
		});
		return wb;
	};

	function Map() {
		var keys = [],
			values = [];

		return {
			put: function(key, value) {
				var index = keys.indexOf(key);
				if (index === -1) {
					keys.push(key);
					values.push(value);
				} else {
					values[index] = value;
				}
			},
			get: function(key) {
				return values[keys.indexOf(key)];
			},
			getKeys: function() {
				return keys;
			},
			getValues: function() {
				return values;
			}
		};
	}

	return EntityCombiner;
});
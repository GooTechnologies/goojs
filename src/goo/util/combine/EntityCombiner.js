define([
	'goo/entities/EntityUtils',
	'goo/entities/Entity',
	'goo/util/MeshBuilder',
	'goo/math/Transform',
	'goo/math/Vector3',
	'goo/renderer/bounds/BoundingBox',
	'goo/renderer/bounds/BoundingSphere'
],
/** @lends */
function(
	EntityUtils,
	Entity,
	MeshBuilder,
	Transform,
	Vector3,
	BoundingBox,
	BoundingSphere
) {
	'use strict';

	/**
	 * @class Runs a mesh combine optimization on the whole scene, based on
	 * material, components etc
	 * @param {World} gooWorld An instance of a goo.world object
	 * @param {number} [gridCount=1] Number of grid segments to split the world in during combine
	 * @param {boolean} [removeOldData=true] Remove old data which is now unused after combining
	 */
	function EntityCombiner(gooWorld, gridCount, removeOldData) {
		this.world = gooWorld;
		this.gridCount = gridCount || 1;
		this.gridSize = 1;
		this.removeOldData = removeOldData !== undefined ? removeOldData : true;

		this.invertTransform = new Transform();
		this.calcTransform = new Transform();
	}

	/**
	 * Runs the combiner
	 */
	EntityCombiner.prototype.combine = function() {
		this.world.processEntityChanges();
		this.world.getSystem('TransformSystem')._process();
		this.world.getSystem('BoundingUpdateSystem')._process();

		var topEntities = this.world.entityManager.getTopEntities();
		if (this.gridSize > 1) {
			this.gridSize = this._calculateBounds(topEntities) / this.gridCount;
		}
		this._combineList(topEntities);
	};

	EntityCombiner.prototype._combineList = function(entities) {
		var root = entities;
		if (entities instanceof Entity === false) {
			root = this.world.createEntity('root');
			root.addToWorld();
			for (var i = 0; i < entities.length; i++) {
				root.attachChild(entities[i]);
			}
		}

		var baseSubs = new Map();
		this._buildSubs(root, baseSubs);

		// var keys = baseSubs.keys();
		baseSubs.forEach(function (combineList, entity) {
		// for (var i = 0; i < keys.length; i++) {
			// var entity = keys[i];
			// var combineList = baseSubs.get(entity);

			this._combine(entity, combineList);
		// }
		}.bind(this));
	};

	EntityCombiner.prototype._buildSubs = function(entity, baseSubs, subs) {
		if (entity._hidden || entity.skip || entity.animationComponent || entity.particleComponent) {
			return;
		}

		// Non static entities become roots in the tree of combined ones so one can have statics under a moving node that combines but you can still move the parent node.
		if (!subs || entity.static === false) {
			subs = [];
			baseSubs.set(entity, subs);
		}

		if (entity.meshDataComponent && entity.meshRendererComponent &&
			entity.meshRendererComponent.worldBound) {
			subs.push(entity);
		}

		for (var i = 0; i < entity.transformComponent.children.length; i++) {
			var child = entity.transformComponent.children[i];
			this._buildSubs(child.entity, baseSubs, subs);
		}
	};

	EntityCombiner.prototype._combine = function(root, combineList) {
		var rootTransform = root.transformComponent.worldTransform;
		rootTransform.invert(this.invertTransform);

		var entities = new Map();
		for (var i = 0; i < combineList.length; i++) {
			var entity = combineList[i];

			var key = entity.meshRendererComponent.materials[0];

			var attributeMap = entity.meshDataComponent.meshData.attributeMap;
			var key2 = Object.keys(attributeMap);
			key2.sort();
			key2 = key2.join('_');

			if (this.gridSize > 1) {
				var xBucket = entity.meshRendererComponent.worldBound.center.x / this.gridSize;
				var zBucket = entity.meshRendererComponent.worldBound.center.z / this.gridSize;
				key2 = key2 + '_' + Math.round(xBucket) + '_' + Math.round(zBucket);
			}

			var set = entities.get(key);
			if (!set) {
				set = new Map();
				entities.set(key, set);
			}
			var set2 = set.get(key2);
			if (!set2) {
				set2 = [];
				set.set(key2, set2);
			}

			set2.push(entity);
		}

		var that = this;
		entities.forEach(function (entities2, material) {
			entities2.forEach(function (toCombine) {
				if (toCombine.length === 1) {
					return;
				}

				var meshBuilder = new MeshBuilder();
				for (var k = 0; k < toCombine.length; k++) {
					var entity = toCombine[k];

					if (root !== entity) {
						that.calcTransform.multiply(that.invertTransform, entity.transformComponent.worldTransform);
					} else {
						that.calcTransform.setIdentity();
					}

					meshBuilder.addMeshData(entity.meshDataComponent.meshData, that.calcTransform);

					if (that.removeOldData) {
						entity.clearComponent('meshDataComponent');
						entity.clearComponent('meshRendererComponent');

						// Remove empty leaf children
						if (entity._components.length === 1 && entity.transformComponent.children.length === 0) {
							entity.removeFromWorld();
						}
					} else {
						entity.skip = true;
						entity._hidden = true;
					}
				}
				var meshDatas = meshBuilder.build();

				for (var i = 0; i < meshDatas.length; i++) {
					var entity = that.world.createEntity(meshDatas[i], material);
					entity.addToWorld();
					root.attachChild(entity);
				}
			});
		});
	};

	EntityCombiner.prototype._calculateBounds = function(entities) {
		var first = true;
		var wb = new BoundingBox();
		for (var i = 0; i < entities.length; i++) {
			var rootEntity = entities[i];
			rootEntity.traverse(function (entity) {
				if (entity.meshRendererComponent && !entity.particleComponent) {
					if (first) {
						var bound = entity.meshRendererComponent.worldBound;
						if (bound instanceof BoundingBox) {
							bound.clone(wb);
						} else if (bound instanceof BoundingSphere) {
							wb.center.setVector(bound.center);
							wb.xExtent = wb.yExtent = wb.zExtent = bound.radius;
						} else {
							wb.center.setVector(Vector3.ZERO);
							wb.xExtent = wb.yExtent = wb.zExtent = 10;
						}

						first = false;
					} else {
						wb.merge(entity.meshRendererComponent.worldBound);
					}
				}
			});
		}
		return Math.max(wb.xExtent, wb.zExtent) * 2.0;
	};

	return EntityCombiner;
});
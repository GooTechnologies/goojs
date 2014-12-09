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
		this.gridCount = gridCount > 1 ? gridCount : 1;
		this.gridSize = 1;
		this.removeOldData = removeOldData !== undefined ? removeOldData : true;

		// this.invertTransform = new Transform();
		this.calcTransform = new Transform();

		this.grid = new Map();
		this.oldEntities = new Set();
		this.newEntities = new Set();
	}

	/**
	 * Runs the combiner
	 */
	EntityCombiner.prototype.combine = function() {
		this.grid.clear();
		this.oldEntities.clear();
		this.newEntities.clear();

		this.world.processEntityChanges();
		this.world.getSystem('TransformSystem')._process();
		this.world.getSystem('BoundingUpdateSystem')._process();

		var topEntities = this.world.entityManager.getTopEntities();
		if (this.gridCount > 1) {
			this.gridSize = this._calculateBounds(topEntities) / this.gridCount;
		}
		this._combineList(topEntities);
	};

	/**
	 * Runs the uncombiner
	 */
	EntityCombiner.prototype.uncombine = function(targetEntity) {
		this.newEntities.forEach(function(entity) {
			entity.removeFromWorld();
		});
		this.oldEntities.forEach(function(entity) {
			entity.skip = false;
			entity._hidden = false;
			entity.addTranslation(0, -10, 0);
		});
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

		baseSubs.forEach(function(combineList, entity) {
			this._combine(entity, combineList);
		}, this);

		var that = this;
		this.grid.forEach(function(gridCell) {
			gridCell.forEach(function(subListMap, root) {
				subListMap.forEach(function(materialSet, material) {
					materialSet.forEach(function(entityList) {
						that._combineMeshes(root, material, entityList);
					});
				});
			});
		});
	};

	EntityCombiner.prototype._traverseGridCell = function(entity, callback) {
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
		var combineListLength = combineList.length;
		if (combineListLength === 0) {
			return;
		}

		var rootTransform = root.transformComponent.worldTransform;
		root.invertTransform = root.invertTransform || new Transform();
		rootTransform.invert(root.invertTransform);

		// var subListMap = new Map();
		for (var i = 0; i < combineListLength; i++) {
			var entity = combineList[i];

			var gridKey = '';
			if (this.gridSize > 1) {
				var xBucket = entity.meshRendererComponent.worldBound.center.x / this.gridSize;
				var zBucket = entity.meshRendererComponent.worldBound.center.z / this.gridSize;
				gridKey = Math.round(xBucket) + '_' + Math.round(zBucket);
			}

			var gridCell = this.grid.get(gridKey);
			if (!gridCell) {
				gridCell = new Map();
				this.grid.set(gridKey, gridCell);
			}

			var subListMap = gridCell.get(root);
			if (!subListMap) {
				subListMap = new Map();
				gridCell.set(root, subListMap);
			}

			// gridCell.add(subListMap);

			var materialKey = entity.meshRendererComponent.materials[0];

			var attributeKey = Object.keys(entity.meshDataComponent.meshData.attributeMap);
			attributeKey.sort();
			attributeKey = attributeKey.join('_');

			var materialSet = subListMap.get(materialKey);
			if (!materialSet) {
				materialSet = new Map();
				subListMap.set(materialKey, materialSet);
			}
			var entityList = materialSet.get(attributeKey);
			if (!entityList) {
				entityList = [];
				materialSet.set(attributeKey, entityList);
			}

			entityList.push(entity);
			console.log(entity.name);
		}
	};

	EntityCombiner.prototype._combineMeshes = function(root, material, entityList) {
		if (entityList.length <= 1) {
			return;
		}

		var meshBuilder = new MeshBuilder();
		for (var k = 0; k < entityList.length; k++) {
			var entity = entityList[k];

			if (root !== entity) {
				this.calcTransform.multiply(root.invertTransform, entity.transformComponent.worldTransform);
			} else {
				this.calcTransform.setIdentity();
			}

			console.log(entity.name, entity.id);
			meshBuilder.addMeshData(entity.meshDataComponent.meshData, this.calcTransform);

			if (this.removeOldData) {
				// Maybe also destroy MeshData, but how do we know if it's shared or not?
				entity.clearComponent('meshDataComponent');
				entity.clearComponent('meshRendererComponent');

				// Remove empty leaf children
				if (entity._components.length === 1 && entity.transformComponent.children.length === 0) {
					entity.removeFromWorld();
				}
			} else {
				entity.skip = true;
				entity._hidden = true;
				this.oldEntities.add(entity);
			}
		}
		var meshDatas = meshBuilder.build();

		for (var i = 0; i < meshDatas.length; i++) {
			var entity = this.world.createEntity(meshDatas[i], material).addToWorld();
			root.attachChild(entity);
			if (!this.removeOldData) {
				this.newEntities.add(entity);
			}
		}
	};

	EntityCombiner.prototype._calculateBounds = function(entities) {
		var first = true;
		var wb = new BoundingBox();
		for (var i = 0; i < entities.length; i++) {
			var rootEntity = entities[i];
			rootEntity.traverse(function(entity) {
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
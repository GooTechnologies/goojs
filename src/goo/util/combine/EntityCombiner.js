var Entity = require('../../entities/Entity');
var MeshBuilder = require('../../util/MeshBuilder');
var Transform = require('../../math/Transform');
var Vector3 = require('../../math/Vector3');
var BoundingBox = require('../../renderer/bounds/BoundingBox');
var BoundingSphere = require('../../renderer/bounds/BoundingSphere');

/**
 * Runs a mesh combine optimization on the whole scene, based on
 * material, components etc
 * @param {World} gooWorld An instance of a goo.world object
 * @param {number} [gridCount=1] Number of grid segments to split the world in during combine
 * @param {boolean} [removeOldData=true] Remove old data which is now unused after combining
 * @param {boolean} [keepEntities=false] Keep all entities even if they are unused after combine
 */
function EntityCombiner(gooWorld, gridCount, removeOldData, keepEntities) {
	this.world = gooWorld;
	this.gridCount = gridCount || 1;
	this.gridSize = 1;
	this.removeOldData = removeOldData !== undefined ? removeOldData : true;
	this.keepEntities = keepEntities !== undefined ? keepEntities : false;
	this.createdEntities = [];
}

/**
 * Runs the combiner
 */
EntityCombiner.prototype.combine = function () {
	this.world.processEntityChanges();
	this.world.getSystem('TransformSystem')._process();
	this.world.getSystem('BoundingUpdateSystem')._process();

	var topEntities = this.world.entityManager.getTopEntities();
	if (this.gridSize > 1) {
		this.gridSize = this._calculateBounds(topEntities) / this.gridCount;
	}
	this._combineList(topEntities);
};

EntityCombiner.prototype._combineList = function (entities) {
	var root = entities;
	this.createdEntities = [];
	if (entities instanceof Entity === true) {
		root = [entities];
	}

	var baseSubs = new Map();
	var subs = [];
	for (var i = 0; i < root.length; i++) {
		this._buildSubs(root[i], baseSubs, subs);
	}
	if (subs.length > 1) {
		root = this.world.createEntity('RootCombined').addToWorld();
		baseSubs.put(root, subs);
	}

	var keys = baseSubs.getKeys();
	for (var i = 0; i < keys.length; i++) {
		var entity = keys[i];
		var combineList = baseSubs.get(entity);
		if (combineList.length > 0) {
			this._combine(entity, combineList);
		}
	}
};

EntityCombiner.prototype._buildSubs = function (entity, baseSubs, subs) {
	if (entity._hidden || entity.skip || entity.animationComponent || entity.particleComponent) {
		return;
	}

	// Non static entities become roots in the tree of combined ones so one can have statics under a moving node that combines but you can still move the parent node.
	if (!subs || entity.static === false) {
		subs = [];
		baseSubs.put(entity, subs);
	}

	if (entity.static && entity.meshDataComponent && entity.meshRendererComponent &&
		entity.meshRendererComponent.worldBound) {
		subs.push(entity);
	}

	for (var i = 0; i < entity.transformComponent.children.length; i++) {
		var child = entity.transformComponent.children[i];
		this._buildSubs(child.entity, baseSubs, subs);
	}
};

EntityCombiner.prototype._combine = function (root, combineList) {
	var rootTransform = root.transformComponent.worldTransform;
	var invertTransform = new Transform();
	var calcTransform = new Transform();
	rootTransform.invert(invertTransform);

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
			entities.put(key, set);
		}
		var set2 = set.get(key2);
		if (!set2) {
			set2 = [];
			set.put(key2, set2);
		}

		set2.push(entity);
	}

	var sets = entities.getKeys();
	for (var i = 0; i < sets.length; i++) {
		var material = sets[i];
		var entities2 = entities.get(material);
		var sets2 = entities2.getKeys();
		for (var j = 0; j < sets2.length; j++) {
			var toCombine = entities2.get(sets2[j]);

			if (toCombine.length === 1) {
				continue;
			}

			var meshBuilder = new MeshBuilder();
			for (var k = 0; k < toCombine.length; k++) {
				var entity = toCombine[k];

				if (root !== entity) {
					calcTransform.multiply(invertTransform, entity.transformComponent.worldTransform);
				} else {
					calcTransform.setIdentity();
				}

				meshBuilder.addMeshData(entity.meshDataComponent.meshData, calcTransform);

				if (this.removeOldData) {
					entity.clearComponent('meshDataComponent');
					entity.clearComponent('meshRendererComponent');

					// Remove empty leaf children
					if (!this.keepEntities && entity._components.length === 1 && entity.transformComponent.children.length === 0) {
						entity.removeFromWorld();
					}
				} else {
					entity.skip = true;
					entity._hidden = true;
				}
			}
			var meshDatas = meshBuilder.build();

			for (var key in meshDatas) {
				var entity = this.world.createEntity(meshDatas[key], material);
				entity.addToWorld();
				root.attachChild(entity);
				this.createdEntities.push(entity);
			}
		}
	}
};

EntityCombiner.prototype._calculateBounds = function (entities) {
	var first = true;
	var wb = new BoundingBox();
	for (var i = 0; i < entities.length; i++) {
		var rootEntity = entities[i];
		rootEntity.traverse(function (entity) {
			if (entity.meshRendererComponent && !entity.particleComponent) {
				if (first) {
					var bound = entity.meshRendererComponent.worldBound;
					if (bound instanceof BoundingBox) {
						wb.copy(bound);
					} else if (bound instanceof BoundingSphere) {
						wb.center.set(bound.center);
						wb.xExtent = wb.yExtent = wb.zExtent = bound.radius;
					} else {
						wb.center.set(Vector3.ZERO);
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

EntityCombiner.prototype.cleanup = function () {
	for (var i = 0; i < this.createdEntities.length; i++) {
		var entity = this.createdEntities[i];

		entity.removeFromWorld();

		entity.parent().each(function (parent) {
			parent.detachChild(entity);
		});
	}
};


// TODO: remove & test, use native Map instead
function Map() {
	var keys = [],
		values = [];

	return {
		put: function (key, value) {
			var index = keys.indexOf(key);
			if (index === -1) {
				keys.push(key);
				values.push(value);
			} else {
				values[index] = value;
			}
		},
		get: function (key) {
			return values[keys.indexOf(key)];
		},
		getKeys: function () {
			return keys;
		},
		getValues: function () {
			return values;
		}
	};
}

module.exports = EntityCombiner;
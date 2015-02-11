define([
	'goo/entities/EntityUtils',
	'goo/entities/Entity',
	'goo/util/MeshBuilder',
	'goo/math/Transform'
],
function(
	EntityUtils,
	Entity,
	MeshBuilder,
	Transform
) {
	'use strict';

	/**
	 * Runs a mesh combine optimization on the whole scene, based on
	 * material, vertex attributes etc
	 * @param {World} world An instance of a goo.world object
	 * @param {boolean} [removeOldData=true] Remove old data which is now unused after combining (prevents uncombine)
	 */
	function EntityCombiner(world, removeOldData) {
		this.world = world;
		this.removeOldData = removeOldData !== undefined ? removeOldData : true;

		this.calcTransform = new Transform();

		this.rootMap = new Map();
		this.entityToRoot = new Map();
		this.unlockOldMap = new Map();
		this.unlockNewMap = new Map();
	}

	/**
	 * Combines everything below provided entity, or everything in the World if called without arguments
	 * @param {Entity} [entity] optional entity to combine
	 */
	EntityCombiner.prototype.combine = function(entity) {
		this.world.processEntityChanges();
		this.world.getSystem('TransformSystem')._process();

		this.uncombine();

		if (entity) {
			this.combineList([entity]);
		} else {
			this.combineList(this.world.entityManager.getTopEntities());
		}
	};

	/**
	 * Uncombines the group containing the provided entity, or uncombines everything if called without arguments
	 * @param {Entity} [targetEntity] Optional entity to unlock
	 */
	EntityCombiner.prototype.uncombine = function(targetEntity) {
		var roots = [];
		if (targetEntity) {
			roots[0] = this.entityToRoot.get(targetEntity);
			if (!roots[0]) {
				return;
			}
			this.rootMap.delete(roots[0]);
		} else {
			this.rootMap.forEach(function(subListMap, root) {
				roots.push(root);
			});
			this.rootMap.clear();
		}

		for (var j = 0; j < roots.length; j++) {
			var root = roots[j];

			var newEntities = this.unlockNewMap.get(root);
			if (newEntities) {
				for (var i = 0; i < newEntities.length; i++) {
					newEntities[i].removeFromWorld();
				}
				this.unlockNewMap.delete(root);
			}

			var oldEntities = this.unlockOldMap.get(root);
			if (oldEntities) {
				for (var i = 0; i < oldEntities.length; i++) {
					var entity = oldEntities[i];
					entity.show();
					this.entityToRoot.delete(entity);
				}
				this.unlockOldMap.delete(root);
			}
		}
	};

	/**
	 * Combines an array of entities
	 * @param {Array} entities Entities to combine
	 */
	EntityCombiner.prototype.combineList = function(entities) {
		// Hack for backwards compatibility
		if (entities instanceof Entity) {
			entities = [entities];
		}

		var baseSubs = new Map();
		var subs = [];
		baseSubs.set({name: 'CombineRoot'}, subs);
		for (var i = 0; i < entities.length; i++) {
			this._buildSubs(entities[i], baseSubs, subs);
		}

		baseSubs.forEach(function(combineList, entity) {
			this._combine(entity, combineList);
		}, this);

		var that = this;
		this.rootMap.forEach(function(subListMap, root) {
			subListMap.forEach(function(materialSet, material) {
				materialSet.forEach(function(entityList) {
					that._combineMeshes(root, material, entityList);
				});
			});
		});
	};

	EntityCombiner.prototype._buildSubs = function(entity, baseSubs, subs) {
		if (entity._hidden || entity.animationComponent || entity.particleComponent) {
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

		root.invertTransform = root.invertTransform || new Transform();
		if (root instanceof Entity) {
			root.transformComponent.worldTransform.invert(root.invertTransform);
		}

		for (var i = 0; i < combineListLength; i++) {
			var entity = combineList[i];

			var subListMap = this.rootMap.get(root);
			if (!subListMap) {
				subListMap = new Map();
				this.rootMap.set(root, subListMap);
			}

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
		}
	};

	EntityCombiner.prototype._combineMeshes = function(root, material, entityList) {
		if (entityList.length <= 1) {
			return;
		}

		var meshBuilder = new MeshBuilder();
		for (var k = 0, l = entityList.length; k < l; k++) {
			var entity = entityList[k];

			if (root !== entity) {
				this.calcTransform.multiply(root.invertTransform, entity.transformComponent.worldTransform);
			} else {
				this.calcTransform.setIdentity();
			}

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
				entity.hide();
				entity.skip = true;
				this.entityToRoot.set(entity, root);
				var list = this.unlockOldMap.get(root);
				if (!list) {
					list = [];
					this.unlockOldMap.set(root, list);
				}
				list.push(entity);
			}
		}

		var meshDatas = meshBuilder.build();
		for (var i = 0; i < meshDatas.length; i++) {
			var entity = this.world.createEntity(meshDatas[i], material).addToWorld();
			if (root instanceof Entity) {
				root.attachChild(entity);
			}
			if (!this.removeOldData) {
				var list = this.unlockNewMap.get(root);
				if (!list) {
					list = [];
					this.unlockNewMap.set(root, list);
				}
				list.push(entity);
			}
		}
	};

	return EntityCombiner;
});
define([
	'goo/picking/BoundingTree'
], function (
	BoundingTree
) {
	'use strict';

	/**
	 * Primitive pick logic
	 */
	function PrimitivePickLogic () {}

	PrimitivePickLogic.prototype.getPickResult = function (pickRay, entity) {
		// look in pick tree for intersection
		var tree = entity.meshDataComponent.meshData.__boundingTree;
		if (!tree) {
			return null;
		}

		return tree.findPick(pickRay, entity, {});
	};

	PrimitivePickLogic.prototype.added = function (entity) {
		// Build boundingtree if not existing
		if (!this.isConstructed(entity)) {
			this.rebuild(entity);
		}
	};

	PrimitivePickLogic.prototype.removed = function (entity) {
		// clear bounding tree
		if( entity.meshDataComponent && entity.meshDataComponent.meshData) {
			entity.meshDataComponent.meshData.__boundingTree = null;
		}
	};

	PrimitivePickLogic.prototype.isConstructed = function (entity) {
		return !!entity.meshDataComponent.meshData.__boundingTree;
	};

	PrimitivePickLogic.prototype.rebuild = function (entity) {
		// build bounding tree
		entity.meshDataComponent.meshData.__boundingTree = new BoundingTree();

		// calculate bounding tree.
		entity.meshDataComponent.meshData.__boundingTree.construct(entity);
	};

	return PrimitivePickLogic;
});
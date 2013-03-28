define(['goo/picking/BoundingTree'],
/** @lends PrimitivePickLogic */
function (BoundingTree) {
	"use strict";

	function PrimitivePickLogic () {
	}

	PrimitivePickLogic.prototype.getPickResult = function (pickRay, entity) {
		// look in pick tree for intersection
		var tree = entity.__boundingTree;
		if (!tree) {
			return null;
		}

		return tree.findPick(pickRay, entity, {});
	};

	PrimitivePickLogic.prototype.added = function (entity) {
		// build bounding tree
		entity.__boundingTree = new BoundingTree();

		// calculate bounding tree.
		entity.__boundingTree.construct(entity);
	};

	PrimitivePickLogic.prototype.removed = function (entity) {
		// clear bounding tree
		entity.__boundingTree = null;
	};

	return PrimitivePickLogic;
});
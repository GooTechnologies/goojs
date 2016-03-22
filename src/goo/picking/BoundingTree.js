define([
	'goo/renderer/bounds/BoundingBox',
	'goo/renderer/bounds/BoundingSphere',
	'goo/math/Vector3'
], function (
	BoundingBox,
	BoundingSphere,
	Vector3
) {
	'use strict';

	/**
	 * Bounding tree node
	 * @param boundType
	 */
	function BoundingTree (boundType) {
		this.leftTree = null;
		this.rightTree = null;
		this.localBound = null;
		this.worldBound = null;

		this.section = 0;
		this.start = 0;
		this.end = 0;

		this.boundType = boundType ? boundType : BoundingTree.BOUNDTYPE_BOX;
	}

	var vecStore = new Vector3();

	BoundingTree.BOUNDTYPE_SPHERE = 'sphere';
	BoundingTree.BOUNDTYPE_BOX = 'box';

	BoundingTree.MAX_PRIMITIVES_PER_LEAF = 16;

	BoundingTree.prototype.construct = function (entity) {
		// check entity has required components
		if (!entity.meshRendererComponent || !entity.meshDataComponent || !entity.transformComponent) {
			console.warn('Entity missing required components for boundingtree construction: ', entity);
			return;
		}

		var meshData = entity.meshDataComponent.meshData;
		// XXX: updatePrimitiveCounts could potentially be done as needed in MeshData instead.
		meshData.updatePrimitiveCounts();
		if (meshData.getSectionCount() === 1) {
			this.primitiveIndices = [];
			for ( var i = 0, max = meshData.getPrimitiveCount(0); i < max; i++) {
				this.primitiveIndices.push(i);
			}
			this.createTree(entity, 0, 0, this.primitiveIndices.length);
		} else {
			this.split(entity, 0, meshData.getSectionCount());
		}
	};

	BoundingTree.prototype.createTree = function (entity, section, start, end) {
		var meshData = entity.meshDataComponent.meshData;

		this.section = section;
		this.start = start;
		this.end = end;

		if (!this.primitiveIndices) {
			return;
		}

		this.createBounds();

		// the bounds at this level should contain all the primitives this level is responsible for.
		this.localBound.computeFromPrimitives(meshData, section, this.primitiveIndices, start, end);

		// check to see if we are a leaf, if the number of primitives we reference is less than or equal to the maximum
		// defined by the CollisionTreeManager we are done.
		if (end - start + 1 <= BoundingTree.MAX_PRIMITIVES_PER_LEAF) {
			return;
		}

		// create the left child
		if (!this.leftTree) {
			this.leftTree = new BoundingTree(this.boundType);
		}
		this.leftTree.primitiveIndices = this.primitiveIndices;
		this.leftTree.createTree(entity, section, start, Math.floor((start + end) / 2));

		// create the right child
		if (!this.rightTree) {
			this.rightTree = new BoundingTree(this.boundType);
		}
		this.rightTree.primitiveIndices = this.primitiveIndices;
		this.rightTree.createTree(entity, section, Math.floor((start + end) / 2), end);
	};

	BoundingTree.prototype.split = function (entity, sectionStart, sectionEnd) {
		// Split range in half
		var rangeSize = sectionEnd - sectionStart;
		var halfRange = Math.floor(rangeSize / 2); // odd number will give +1 to right.

		// left half:
		// if half size === 1, create as regular CollisionTree
		if (halfRange === 1) {
			// compute section
			var section = sectionStart;

			// create the left child
			this.leftTree = new BoundingTree(this.boundType);

			this.leftTree.primitiveIndices = [];
			for (var i = 0; i < this.leftTree.primitiveIndices.length; i++) {
				this.leftTree.primitiveIndices.push(i);
			}
			this.leftTree.createTree(entity, section, 0, this.leftTree.primitiveIndices.length);
		} else {
			// otherwise, make an empty collision tree and call split with new range
			this.leftTree = new BoundingTree(this.boundType);
			this.leftTree.split(entity, sectionStart, sectionStart + halfRange);
		}

		// right half:
		// if rangeSize - half size === 1, create as regular CollisionTree
		if (rangeSize - halfRange === 1) {
			// compute section
			var section = sectionStart + 1;

			// create the left child
			this.rightTree = new BoundingTree(this.boundType);

			this.rightTree._primitiveIndices = [];
			for (var i = 0; i < this.rightTree.primitiveIndices.length; i++) {
				this.rightTree.primitiveIndices.push(i);
			}
			this.rightTree.createTree(entity, section, 0, this.rightTree.primitiveIndices.length);
		} else {
			// otherwise, make an empty collision tree and call split with new range
			this.rightTree = new BoundingTree(this.boundType);
			this.rightTree.split(entity, sectionStart + halfRange, sectionEnd);
		}

		// Ok, now since we technically have no primitives, we need our bounds to be the merging of our children bounds
		// instead:
		this.localBound = this.leftTree.localBound.clone();
		this.localBound.merge(this.rightTree.localBound);
		this.worldBound = this.localBound.clone();
	};

	BoundingTree.prototype.createBounds = function () {
		switch (this.boundType) {
			case BoundingTree.BOUNDTYPE_BOX:
				this.localBound = new BoundingBox();
				this.worldBound = new BoundingBox();
				break;
			case BoundingTree.BOUNDTYPE_SPHERE:
				this.localBound = new BoundingSphere();
				this.worldBound = new BoundingSphere();
				break;
			default:
				break;
		}
	};

	BoundingTree.prototype.findPick = function (ray, entity, result) {
		if (!result) {
			result = [];
		}

		// if our ray doesn't hit the bounds, then it must not hit a primitive.
		if (!this.localBound.intersectsRay(ray)) {
			return result;
		}

		// This is not a leaf node, therefore, check each child (left/right) for intersection with the ray.
		if (this.leftTree) {
			this.leftTree.findPick(ray, entity, result);
		}

		if (this.rightTree) {
			this.rightTree.findPick(ray, entity, result);
		} else if (!this.leftTree) {
			// This is a leaf node. We can therefore check each primitive this node contains. If an intersection occurs, place it in the list.
			var data = entity.meshDataComponent.meshData;

			var vertices = null;
			for (var i = this.start, l = this.end; i < l; i++) {
				vertices = data.getPrimitiveVertices(this.primitiveIndices[i], this.section, vertices);
				if (ray.intersects(vertices, false, vecStore)) {
					var worldTransform = entity.transformComponent.worldTransform;

					var point = new Vector3();
					point.set(vecStore);
					point.applyPostPoint(worldTransform.matrix);

					vecStore.sub(ray.origin);
					vecStore.applyPostPoint(worldTransform.matrix);
					var distance = vecStore.length();

					var verticesCopy = [];
					for (var copyIndex = vertices.length - 1; copyIndex >= 0; copyIndex--) {
						verticesCopy[copyIndex] = new Vector3().set(vertices[copyIndex]);
						verticesCopy[copyIndex].applyPostPoint(worldTransform.matrix);
					}

					result.push({
						distance: distance,
						point: point,
						vertices: verticesCopy,
					});
				}
			}
		}

		return result;
	};

	return BoundingTree;
});
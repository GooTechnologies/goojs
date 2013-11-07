define([
	'goo/renderer/bounds/BoundingBox',
	'goo/renderer/bounds/BoundingSphere',
	'goo/math/Vector3',
	'goo/shapes/ShapeCreator',
	'goo/renderer/MeshData'
], function(
	BoundingBox,
	BoundingSphere,
	Vector3,
	ShapeCreator,
	MeshData
) {
	'use strict';

	describe('BoundingBox', function() {
		var boundingBox1, boundingBox2;

		function buildCustomTriangle(verts) {
			var indices = [];
			indices.push(0, 1, 2);

			var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 3, indices.length);

			meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
			meshData.getIndexBuffer().set(indices);

			meshData.indexLengths = [3];
			meshData.indexModes = ['Triangles'];

			return meshData;
		}

		describe('computeFromPoints', function() {
			it('computes the center of the bounding box from verts (of default box)', function() {
				boundingBox1 = new BoundingBox();

				var boxMeshData = ShapeCreator.createBox();
				boundingBox1.computeFromPoints(boxMeshData.dataViews.POSITION);
				expect(boundingBox1.center.data[0]).toBeCloseTo(0);
				expect(boundingBox1.center.data[1]).toBeCloseTo(0);
				expect(boundingBox1.center.data[2]).toBeCloseTo(0);
			});

			it('computes the center of the bounding box from verts (of custom triangle)', function() {
				boundingBox1 = new BoundingBox();
				var triangleMeshData = buildCustomTriangle([0, -5, 10, 2, 5, 20, 0, 1, 11]);
				boundingBox1.computeFromPoints(triangleMeshData.dataViews.POSITION);
				expect(boundingBox1.center.data[0]).toBeCloseTo(1);
				expect(boundingBox1.center.data[1]).toBeCloseTo(0);
				expect(boundingBox1.center.data[2]).toBeCloseTo(15);
			});

			it('computes max & min of the bounding box from verts (of default box)', function() {
				boundingBox1 = new BoundingBox();
				var boxMeshData = ShapeCreator.createBox();
				boundingBox1.computeFromPoints(boxMeshData.dataViews.POSITION);
				expect(boundingBox1.min.data[0]).toBeCloseTo(-0.5);
				expect(boundingBox1.min.data[1]).toBeCloseTo(-0.5);
				expect(boundingBox1.min.data[2]).toBeCloseTo(-0.5);
				expect(boundingBox1.max.data[0]).toBeCloseTo(0.5);
				expect(boundingBox1.max.data[1]).toBeCloseTo(0.5);
				expect(boundingBox1.max.data[2]).toBeCloseTo(0.5);
			});

			it('computes max & min of the bounding box from verts (of custom triangle)', function() {
				boundingBox1 = new BoundingBox();
				var triangleMeshData = buildCustomTriangle([0, -5, 10, 2, 5, 20, 0, 1, 11]);
				boundingBox1.computeFromPoints(triangleMeshData.dataViews.POSITION);
				expect(boundingBox1.min.data[0]).toBeCloseTo(0);
				expect(boundingBox1.min.data[1]).toBeCloseTo(-5);
				expect(boundingBox1.min.data[2]).toBeCloseTo(10);
				expect(boundingBox1.max.data[0]).toBeCloseTo(2);
				expect(boundingBox1.max.data[1]).toBeCloseTo(5);
				expect(boundingBox1.max.data[2]).toBeCloseTo(20);
			});

			it('computes x/y/zExtent of the bounding box from verts (of default box)', function() {
				boundingBox1 = new BoundingBox();
				var boxMeshData = ShapeCreator.createBox();
				boundingBox1.computeFromPoints(boxMeshData.dataViews.POSITION);
				expect(boundingBox1.xExtent).toBeCloseTo(0.5);
				expect(boundingBox1.yExtent).toBeCloseTo(0.5);
				expect(boundingBox1.zExtent).toBeCloseTo(0.5);
			});

			it('computes x/y/zExtent of the bounding box from verts (of custom triangle)', function() {
				boundingBox1 = new BoundingBox();
				var triangleMeshData = buildCustomTriangle([0, -5, 10, 2, 5, 20, 0, 1, 11]);
				boundingBox1.computeFromPoints(triangleMeshData.dataViews.POSITION);
				expect(boundingBox1.xExtent).toBeCloseTo(1);
				expect(boundingBox1.yExtent).toBeCloseTo(5);
				expect(boundingBox1.zExtent).toBeCloseTo(5);
			});
		});

		describe('merge', function() {
			it('merges two identical boxes', function() {
				var boxMeshData = ShapeCreator.createBox(2, 3, 4);
				boundingBox1 = new BoundingBox();
				boundingBox1.computeFromPoints(boxMeshData.dataViews.POSITION);
				boundingBox2 = new BoundingBox();
				boundingBox2.computeFromPoints(boxMeshData.dataViews.POSITION);
				var mergedBoundingBox = boundingBox1.merge(boundingBox2);
				expect(mergedBoundingBox.center.data[0]).toBeCloseTo(0);
				expect(mergedBoundingBox.center.data[1]).toBeCloseTo(0);
				expect(mergedBoundingBox.center.data[2]).toBeCloseTo(0);
				expect(mergedBoundingBox.xExtent).toBeCloseTo(1);
				expect(mergedBoundingBox.yExtent).toBeCloseTo(1.5);
				expect(mergedBoundingBox.zExtent).toBeCloseTo(2);
			});

			it('merges two distinct boxes', function() {
				var boxMeshData1 = ShapeCreator.createBox(2, 30, 4);
				boundingBox1 = new BoundingBox();
				boundingBox1.computeFromPoints(boxMeshData1.dataViews.POSITION);
				var boxMeshData2 = ShapeCreator.createBox(20, 3, 40);
				boundingBox2 = new BoundingBox();
				boundingBox2.computeFromPoints(boxMeshData2.dataViews.POSITION);
				var mergedBoundingBox = boundingBox1.merge(boundingBox2);
				expect(mergedBoundingBox.center.data[0]).toBeCloseTo(0);
				expect(mergedBoundingBox.center.data[1]).toBeCloseTo(0);
				expect(mergedBoundingBox.center.data[2]).toBeCloseTo(0);
				expect(mergedBoundingBox.xExtent).toBeCloseTo(10);
				expect(mergedBoundingBox.yExtent).toBeCloseTo(15);
				expect(mergedBoundingBox.zExtent).toBeCloseTo(20);
			});

			it('merges a triangle and a box', function() {
				var boxMeshData = ShapeCreator.createBox(2, 2, 2);
				var triangleMeshData = buildCustomTriangle([0, 0, 9, 0, 0, 10, 0, 1, 10]);
				boundingBox1 = new BoundingBox();
				boundingBox1.computeFromPoints(boxMeshData.dataViews.POSITION);
				boundingBox2 = new BoundingBox();
				boundingBox2.computeFromPoints(triangleMeshData.dataViews.POSITION);
				var mergedBoundingBox = boundingBox1.merge(boundingBox2);
				expect(mergedBoundingBox.center.data[0]).toBeCloseTo(0);
				expect(mergedBoundingBox.center.data[1]).toBeCloseTo(0);
				expect(mergedBoundingBox.center.data[2]).toBeCloseTo(4.5);
				expect(mergedBoundingBox.xExtent).toBeCloseTo(1);
				expect(mergedBoundingBox.yExtent).toBeCloseTo(1);
				expect(mergedBoundingBox.zExtent).toBeCloseTo(5.5);
			});
		});

		describe('intersects', function() {
			it('does not intersect a bounding sphere', function() {
				var boundingBox = new BoundingBox(new Vector3(0, 0, 0), 10, 10, 10);
				var boundingSphere = new BoundingSphere(new Vector3(20, 20, 0), 12);
				// the distance between bounding box and the bounding sphere should be 12 - sqrt(10*10*2) > 0

				expect(boundingBox.intersects(boundingSphere)).toBeFalsy();
			});
		});
	});
});

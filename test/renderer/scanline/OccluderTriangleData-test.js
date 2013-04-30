define([
'goo/renderer/scanline/OccluderTriangleData'
],

function (OccluderTriangleData) {
	"use strict";

	describe('OccluderTriangleData', function() {
		var triangleData;
		var entityPositions = 30;
		var maxVertices = 100;
		var maxIndices = 20;
		var posArray = new Float32Array(4);
		triangleData = new OccluderTriangleData({'vertCount': maxVertices, 'indexCount': maxIndices});

		it('Add vertices and indices', function() {
			triangleData.setCountersToNewEntity(entityPositions);
			var vertices = entityPositions / 3;
			var startPositionCount = 4 * vertices;
			var startLargestIndex = vertices - 1;

			expect(triangleData.posCount).toEqual(startPositionCount);
			expect(triangleData.indexCount).toEqual(0);
			expect(triangleData.largestIndex).toEqual(startLargestIndex);

			triangleData.addVertex(posArray);

			expect(triangleData.posCount).toEqual(startPositionCount + 4);
			expect(triangleData.indexCount).toEqual(0);
			expect(triangleData.largestIndex).toEqual(startLargestIndex + 1);

			triangleData.addIndices([0, 2, 1]);

			expect(triangleData.posCount).toEqual(startPositionCount + 4);
			expect(triangleData.indexCount).toEqual(3);
			expect(triangleData.largestIndex).toEqual(startLargestIndex + 1);
		});
	});
});
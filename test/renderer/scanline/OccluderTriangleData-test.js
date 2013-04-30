define([
'goo/renderer/scanline/OccluderTriangleData'
],

function (OccluderTriangleData) {
	"use strict";

	describe('OccluderTriangleData', function() {
		var triangleData;
		beforeEach(function() {
			var maxVertices = 100;
			var maxIndices = 20;
			triangleData = new OccluderTriangleData({'vertCount': maxVertices, 'indexCount': maxIndices});
		});
	});
});
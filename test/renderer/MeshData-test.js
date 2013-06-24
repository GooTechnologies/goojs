define(
[
	"goo/shapes/ShapeCreator"
], function(
	ShapeCreator
) {
	"use strict";

	describe("MeshData", function() {
		it("getNormalsMeshData: number of vertices and indices", function() {
			var box = ShapeCreator.createBox();
			var normalsMD = box.getNormalsMeshData();

			var nNormalsPerFace = 4;
			var nFaces = 6;
			var nVerticesPerLine = 2;
			var nDimensions = 3;

			expect(normalsMD.vertexCount).toEqual(nNormalsPerFace * nFaces * nVerticesPerLine * nDimensions);
			expect(normalsMD.indexCount).toEqual(nNormalsPerFace * nFaces * nVerticesPerLine);
		});
	});
});

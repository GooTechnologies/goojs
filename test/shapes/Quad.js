define(
[
	"goo/shapes/ShapeCreator",
	"goo/shapes/Quad"
], function(
	ShapeCreator,
	Quad
) {
	"use strict";

	describe("Quad", function() {
		var a = ShapeCreator.createQuad();

		it("Number of vertices and indices", function() {
			expect(a.vertexCount).toEqual(4);
			expect(a.indexCount).toEqual(6);
		});
	});
});

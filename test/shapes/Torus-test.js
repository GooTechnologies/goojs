define(
[
	"goo/shapes/ShapeCreator"
], function(
	ShapeCreator
) {
	"use strict";

	describe("Torus", function() {
		var a = ShapeCreator.createTorus(8, 4);

		it("Number of vertices and indices", function() {
			expect(a.vertexCount).toEqual(45);
			expect(a.indexCount).toEqual(192);
		});
	});
});

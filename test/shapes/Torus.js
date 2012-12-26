define(
[
	"goo/shapes/ShapeCreator",
	"goo/shapes/Torus"
], function(
	ShapeCreator,
	Torus
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

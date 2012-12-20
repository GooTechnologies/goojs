define(
[
	"goo/shapes/ShapeCreator",
	"goo/shapes/Box"
], function(
	ShapeCreator,
	Box
) {
	"use strict";

	describe("Box", function() {
		var a = ShapeCreator.createBox();

		it("Number of vertices and indices", function() {
			expect(a.vertexCount).toEqual(24);
			expect(a.indexCount).toEqual(36);
		});
	});
});

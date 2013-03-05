define(
[
	"goo/shapes/ShapeCreator"
], function(
	ShapeCreator
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

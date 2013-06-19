define(
[
	"goo/shapes/ShapeCreator"
], function(
	ShapeCreator
) {
	"use strict";

	describe("Sphere", function() {
		var a = ShapeCreator.createSphere(8, 4);

		it("Number of vertices and indices", function() {
			expect(a.vertexCount).toEqual(37);
			expect(a.indexCount).toEqual(168);
		});
	});
});

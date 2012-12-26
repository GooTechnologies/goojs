define(
[
	"goo/shapes/ShapeCreator",
	"goo/shapes/Teapot"
], function(
	ShapeCreator,
	Teapot
) {
	"use strict";

	describe("Teapot", function() {
		var a = ShapeCreator.createTeapot();

		it("Number of vertices and indices", function() {
			expect(a.vertexCount).toEqual(2349);
			expect(a.indexCount).toEqual(2976);
		});
	});
});

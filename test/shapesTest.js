define(
[
	"goo/shapes/ShapeCreator",
	"goo/shapes/Box",
	"goo/shapes/Quad",
	"goo/shapes/Sphere",
	"goo/shapes/Teapot",
	"goo/shapes/Torus"
], function(
	ShapeCreator,
	Box,
	Quad,
	Sphere,
	Teapot,
	Torus
) {
	"use strict";

	describe("Box", function() {
		var a = ShapeCreator.createBox();

		it("Number of vertices and indices", function() {
			expect(a.vertexCount).toEqual(24);
			expect(a.indexCount).toEqual(36);
		});
	});

	describe("Quad", function() {
		var a = ShapeCreator.createQuad();

		it("Number of vertices and indices", function() {
			expect(a.vertexCount).toEqual(4);
			expect(a.indexCount).toEqual(6);
		});
	});

	describe("Sphere", function() {
		var a = ShapeCreator.createSphere(8, 4);

		it("Number of vertices and indices", function() {
			expect(a.vertexCount).toEqual(32);
			expect(a.indexCount).toEqual(144);
		});
	});

	describe("Teapot", function() {
		var a = ShapeCreator.createTeapot();

		it("Number of vertices and indices", function() {
			expect(a.vertexCount).toEqual(2349);
			expect(a.indexCount).toEqual(2976);
		});
	});

	describe("Torus", function() {
		var a = ShapeCreator.createTorus(8, 4);

		it("Number of vertices and indices", function() {
			expect(a.vertexCount).toEqual(45);
			expect(a.indexCount).toEqual(192);
		});
	});
});

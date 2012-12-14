define(["goo/math/Vector"], function(Vector) {
	"use strict";

	describe("Vector", function() {
		var a = new Vector(2).set(2, 4);
		var b = new Vector(2).set(-3, -4);

		// REVIEW: unclear description.
		// Keep in mind what "it" means. It should read like a sentence. Try:
		// it('can copy a vector')
		it("Vector.copy", function() {
			expect(Vector.copy(a)).toEqual(new Vector(2).set(2, 4));
		});

		// REVIEW: it('can add two vectors') or
		// it('can add a vector to itself') or whatever is the idea here.
		it("Vector.add", function() {
			expect(Vector.add(a, a)).toEqual(new Vector(2).set(4, 8));
		});

		// REVIEW: it('can add a vector and an array') etc...
		it("Vector.add", function() {
			expect(Vector.add(a, [1, 2])).toEqual(new Vector(2).set(3, 6));
		});

		it("Vector.sub", function() {
			expect(Vector.sub(a, a)).toEqual(new Vector(2).set(0, 0));
		});

		it("Vector.mul", function() {
			expect(Vector.mul(a, a)).toEqual(new Vector(2).set(4, 16));
		});

		it("Vector.div", function() {
			expect(Vector.div(a, a)).toEqual(new Vector(2).set(1, 1));
		});

		it("Vector.scalarAdd", function() {
			expect(Vector.scalarAdd(a, 2)).toEqual(new Vector(2).set(4, 6));
		});

		it("Vector.scalarSub", function() {
			expect(Vector.scalarSub(a, 2)).toEqual(new Vector(2).set(0, 2));
		});

		it("Vector.scalarMul", function() {
			expect(Vector.scalarMul(a, 2)).toEqual(new Vector(2).set(4, 8));
		});

		it("Vector.scalarDiv", function() {
			expect(Vector.scalarDiv(a, 2)).toEqual(new Vector(2).set(1, 2));
		});

		it("Vector.prototype.invert", function() {
			expect(b.invert()).toEqual(new Vector(2).set(3, 4));
		});

		it("Vector.prototype.length", function() {
			expect(b.length()).toEqual(5);
		});

		it("Vector.prototype.squareLength", function() {
			expect(b.squareLength()).toEqual(25);
		});

		it("Vector.prototype.normalize", function() {
			expect(b.normalize()).toEqual(new Vector(2).set(0.6, 0.8));
		});
		// REVIEW: Missing test about normalizing a zero vector

		// REVIEW: Missing test of dot, set and toString
	});
});

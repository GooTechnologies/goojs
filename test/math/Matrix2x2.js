define(["goo/math/Matrix2x2"], function(Matrix2x2) {
	"use strict";

	describe("Matrix2x2", function() {
		// REVIEW: Missing at least one test (determinant). Make sure everything is covered.
		var a = new Matrix2x2(1, 2, 3, 4);
		var b = new Matrix2x2(0, 1, -1, 0);

		it("Matrix2x2.combine", function() {
			expect(Matrix2x2.combine(a, a)).toEqual(new Matrix2x2(7, 10, 15, 22));
		});

		it("Matrix2x2.invert", function() {
			expect(Matrix2x2.invert(a)).toEqual(new Matrix2x2(-2, 1, 1.5, -0.5));
		});

		it("Matrix2x2.prototype.isOrthogonal", function() {
			expect(a.isOrthogonal()).toEqual(false);
			expect(b.isOrthogonal()).toEqual(true);
		});

		it("Matrix2x2.prototype.isNormal", function() {
			expect(a.isNormal()).toEqual(false);
			expect(b.isNormal()).toEqual(true);
		});

		it("Matrix2x2.prototype.isOrthonormal", function() {
			expect(a.isOrthonormal()).toEqual(false);
			expect(b.isOrthonormal()).toEqual(true);
		});

		it("Matrix2x2.prototype.transpose", function() {
			expect(b.transpose()).toEqual(new Matrix2x2(0, -1, 1, 0));
		});
	});
});

define(["goo/math/Matrix3x3"], function(Matrix3x3) {
	"use strict";

	describe("Matrix3x3", function() {
		// REVIEW: Missing at least one test (determinant). Make sure everything is covered.
		var a = new Matrix3x3(1, 2, 3, 4, 5, 6, 7, 8, 9);
		var b = new Matrix3x3(0, 0, 1, -1, 2, 0, 0, 1, -2);
		var c = new Matrix3x3(0, -1, 0, 1, 0, 0, 0, 0, -1);

		it("Matrix3x3.combine", function() {
			expect(Matrix3x3.combine(a, a)).toEqual(new Matrix3x3(30, 36, 42, 66, 81, 96, 102, 126, 150));
		});

		it("Matrix3x3.invert", function() {
			expect(Matrix3x3.invert(b)).toEqual(new Matrix3x3(4, -1, 2, 2, 0, 1, 1, 0, 0));
		});

		it("Matrix3x3.prototype.isOrthogonal", function() {
			expect(b.isOrthogonal()).toEqual(false);
			expect(c.isOrthogonal()).toEqual(true);
		});

		it("Matrix3x3.prototype.isNormal", function() {
			expect(b.isNormal()).toEqual(false);
			expect(c.isNormal()).toEqual(true);
		});

		it("Matrix3x3.prototype.isOrthonormal", function() {
			expect(b.isOrthonormal()).toEqual(false);
			expect(c.isOrthonormal()).toEqual(true);
		});

		it("Matrix3x3.prototype.transpose", function() {
			expect(c.transpose()).toEqual(new Matrix3x3(0, 1, 0, -1, 0, 0, 0, 0, -1));
		});
	});
});

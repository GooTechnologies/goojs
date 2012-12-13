define(["goo/math/Matrix4x4"], function(Matrix4x4) {
	"use strict";

	describe("Matrix4x4", function() {
		// REVIEW: Missing at least one test (determinant). Make sure everything is covered.
		var a = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
		var b = new Matrix4x4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
		var c = new Matrix4x4(0, -1, 0, 0, 1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

		it("Matrix4x4.combine", function() {
			expect(Matrix4x4.combine(a, a)).toEqual(new Matrix4x4(90, 100, 110, 120, 202, 228, 254, 280, 314, 356, 398, 440, 426, 484, 542, 600));
		});

		it("Matrix4x4.invert", function() {
			expect(Matrix4x4.invert(b)).toEqual(new Matrix4x4(-0.5, 1, -1.5, -0.5, 0, 0.5, -0.5, -0.5, 0.5, 0, 0.5, 0.5, 0.5, 0, -0.5, 0.5));
		});

		it("Matrix4x4.prototype.isOrthogonal", function() {
			expect(b.isOrthogonal()).toEqual(false);
			expect(c.isOrthogonal()).toEqual(true);
		});

		it("Matrix4x4.prototype.isNormal", function() {
			expect(b.isNormal()).toEqual(false);
			expect(c.isNormal()).toEqual(true);
		});

		it("Matrix4x4.prototype.isOrthonormal", function() {
			expect(b.isOrthonormal()).toEqual(false);
			expect(c.isOrthonormal()).toEqual(true);
		});

		it("Matrix4x4.prototype.transpose", function() {
			expect(c.transpose()).toEqual(new Matrix4x4(0, 1, 0, 0, -1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1));
		});
	});
});

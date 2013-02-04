define(["goo/math/Matrix2x2"], function(Matrix2x2) {
	"use strict";

	describe("Matrix2x2", function() {
		it("can combine multiple matrices into a single matrix", function() {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2(1, 2, 3, 4);

			a.combine(a);

			expect(a).toEqual(new Matrix2x2(7, 10, 15, 22));
			expect(Matrix2x2.combine(b, b)).toEqual(new Matrix2x2(7, 10, 15, 22));
		});

		it("can be transposed", function() {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2(1, 2, 3, 4);

			a.transpose();

			expect(a).toEqual(new Matrix2x2(1, 3, 2, 4));
			expect(Matrix2x2.transpose(b)).toEqual(new Matrix2x2(1, 3, 2, 4));
		});

		it("can be inverted", function() {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2(1, 2, 3, 4);
			var c = new Matrix2x2(0, 0, 1, 2);

			a.invert();

			expect(a).toEqual(new Matrix2x2(-2, 1, 1.5, -0.5));
			expect(Matrix2x2.invert(b)).toEqual(new Matrix2x2(-2, 1, 1.5, -0.5));
			expect(function() { c.invert(); }).toThrow();
		});

		it("can determine orthogonality", function() {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2(0, 1, -1, 0);

			expect(a.isOrthogonal()).toEqual(false);
			expect(b.isOrthogonal()).toEqual(true);
		});

		it("can determine normality", function() {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2(0, 1, -1, 0);

			expect(a.isNormal()).toEqual(false);
			expect(b.isNormal()).toEqual(true);
		});

		it("can determine orthonormality", function() {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2(0, 1, -1, 0);

			expect(a.isOrthonormal()).toEqual(false);
			expect(b.isOrthonormal()).toEqual(true);
		});

		it("can compute determinants", function() {
			var a = new Matrix2x2(1, 2, 3, 4);

			expect(a.determinant()).toEqual(-2);
		});

		it("can be set to identity", function() {
			var a = new Matrix2x2();
			var b = new Matrix2x2(1, 2, 3, 4);

			b.setIdentity();

			expect(a).toEqual(Matrix2x2.IDENTITY);
			expect(b).toEqual(Matrix2x2.IDENTITY);
		});
	});
});

define(["goo/math/Matrix"], function(Matrix) {
	"use strict";

	describe("Matrix", function() {
		it("can perform component-wise addition between two matrices", function() {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.add(a);

			expect(a).toEqual(new Matrix(2, 2).set(4, 8, 12, 16));
			expect(Matrix.add(b, b)).toEqual(new Matrix(2, 2).set(4, 8, 12, 16));
		});

		it("can perform component-wise subtraction between two matrices", function() {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.sub(a);

			expect(a).toEqual(new Matrix(2, 2).set(0, 0, 0, 0));
			expect(Matrix.sub(b, b)).toEqual(new Matrix(2, 2).set(0, 0, 0, 0));
		});

		it("can perform component-wise multiplication between two matrices", function() {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.mul(a);

			expect(a).toEqual(new Matrix(2, 2).set(4, 16, 36, 64));
			expect(Matrix.mul(b, b)).toEqual(new Matrix(2, 2).set(4, 16, 36, 64));
		});

		it("can perform component-wise division between two matrices", function() {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.div(a);

			expect(a).toEqual(new Matrix(2, 2).set(1, 1, 1, 1));
			expect(Matrix.div(b, b)).toEqual(new Matrix(2, 2).set(1, 1, 1, 1));
		});

		it("Can perform component-wise addition between a matrix and a scalar", function() {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.add(2);

			expect(a).toEqual(new Matrix(2, 2).set(4, 6, 8, 10));
			expect(Matrix.add(b, 2)).toEqual(new Matrix(2, 2).set(4, 6, 8, 10));
		});

		it("can perform component-wise subtraction between a matrix and a scalar", function() {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.sub(2);

			expect(a).toEqual(new Matrix(2, 2).set(0, 2, 4, 6));
			expect(Matrix.sub(b, 2)).toEqual(new Matrix(2, 2).set(0, 2, 4, 6));
		});

		it("can perform component-wise multiplication between a matrix and a scalar", function() {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.mul(2);

			expect(a).toEqual(new Matrix(2, 2).set(4, 8, 12, 16));
			expect(Matrix.mul(b, 2)).toEqual(new Matrix(2, 2).set(4, 8, 12, 16));
		});

		it("can perform component-wise division between a matrix and a scalar", function() {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.div(2);

			expect(a).toEqual(new Matrix(2, 2).set(1, 2, 3, 4));
			expect(Matrix.div(b, 2)).toEqual(new Matrix(2, 2).set(1, 2, 3, 4));
		});

		it("can combine multiple matrices into a single matrix", function() {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.combine(a);

			expect(a).toEqual(new Matrix(2, 2).set(28, 40, 60, 88));
			expect(Matrix.combine(b, b)).toEqual(new Matrix(2, 2).set(28, 40, 60, 88));
		});

		it("can be transposed", function() {
			var a = new Matrix(2, 2).set(0, 1, 2, 3);
			var b = new Matrix(2, 2).set(0, 1, 2, 3);
			var c = new Matrix(3, 2).set(0, 1, 2, 3, 4, 5);

			a.transpose();

			expect(a).toEqual(new Matrix(2, 2).set(0, 2, 1, 3));
			expect(Matrix.transpose(b, b)).toEqual(new Matrix(2, 2).set(0, 2, 1, 3));
			expect(Matrix.transpose(c)).toEqual(new Matrix(2, 3).set(0, 3, 1, 4, 2, 5));
			expect(function() { Matrix.transpose(c, c); }).toThrow();
		});

		it("can be copied", function() {
			var a = new Matrix(2, 2).set(0, 1, 2, 3);
			var b = new Matrix(2, 2).set();

			b.copy(a);

			expect(b).toEqual(a);
			expect(Matrix.copy(b, a)).toEqual(a);
		});

		it("can be set", function() {
			var a = new Matrix(2, 2);
			var b = new Matrix(2, 2);
			var c = new Matrix(2, 2);

			expect(a.set(0, 1, 2, 3)).toEqual(new Matrix(2, 2).set(0, 1, 2, 3));
			expect(b.set(a)).toEqual(a);
			expect(c.set([0, 1, 2, 3])).toEqual(new Matrix(2, 2).set(0, 1, 2, 3));
		});

		it("can be converted to a string", function() {
			var a = new Matrix(2, 2).set(0, 1, 2, 3);

			expect(a.toString()).toEqual("[0, 1], [2, 3]");
		});

		it("can determine orthogonality", function() {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(0, 1, -1, 0);

			expect(a.isOrthogonal()).toEqual(false);
			expect(b.isOrthogonal()).toEqual(true);
		});

		it("can determine normality", function() {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(0, 1, -1, 0);

			expect(a.isNormal()).toEqual(false);
			expect(b.isNormal()).toEqual(true);
		});

		it("can determine orthonormality", function() {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(0, 1, -1, 0);

			expect(a.isOrthonormal()).toEqual(false);
			expect(b.isOrthonormal()).toEqual(true);
		});

		it("can be tested for approximate equaltiy", function() {
			var a = new Matrix(2, 2).set(1, 2, 3, 4);
			var b = new Matrix(2, 2).set(1, 2, 3, 4);
			var c = new Matrix(2, 2).set(0, 1, 2, 3);

			expect(a.equals(b)).toEqual(true);
			expect(Matrix.equals(a, b)).toEqual(true);
			expect(a.equals(c)).toEqual(false);
			expect(Matrix.equals(a, c)).toEqual(false);
		});
	});
});

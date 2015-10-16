define([
	'goo/math/Matrix2',
	'test/CustomMatchers'
], function (
	Matrix2,
	CustomMatchers
) {
	'use strict';

	describe('Matrix2', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		describe('constructor', function () {
			it('creates an identity matrix when given no parameters', function () {
				expect(new Matrix2()).toBeCloseToMatrix(Matrix2.IDENTITY);
			});

			it('creates a matrix when given 4 parameters', function () {
				var matrix = new Matrix2(11, 22, 33, 44);
				var expected = new Matrix2();

				for (var i = 0; i < 4; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(matrix).toBeCloseToMatrix(expected);
			});
		});

		describe('mul', function () {
			it('can multiply this matrix with another matrix', function () {
				var a = new Matrix2(1, 2, 3, 4);
				var b = new Matrix2(2, 3, 5, 7);

				a.mul(b);

				expect(a).toBeCloseToMatrix(new Matrix2(12, 17, 24, 37));
			});
		});

		describe('mul2', function () {
			it('can multiply 2 matrices and store the result in this matrix', function () {
				var a = new Matrix2(1, 2, 3, 4);
				var b = new Matrix2(2, 3, 5, 7);
				var result = new Matrix2();

				result.mul2(a, b);

				expect(result).toBeCloseToMatrix(new Matrix2(11, 16, 24, 38));
			});
		});

		it('can be transposed', function () {
			var a = new Matrix2(1, 2, 3, 4);

			a.transpose();

			expect(a).toBeCloseToMatrix(new Matrix2(1, 3, 2, 4));
		});

		it('can be inverted', function () {
			var a = new Matrix2(1, 2, 3, 4);

			a.invert();

			expect(a).toBeCloseToMatrix(new Matrix2(-2, 1, 1.5, -0.5));
		});

		it('can determine orthogonality', function () {
			var a = new Matrix2(1, 2, 3, 4);
			var b = new Matrix2(0, 1, -1, 0);

			expect(a.isOrthogonal()).toEqual(false);
			expect(b.isOrthogonal()).toEqual(true);
		});

		it('can determine normality', function () {
			var a = new Matrix2(1, 2, 3, 4);
			var b = new Matrix2(0, 1, -1, 0);

			expect(a.isNormal()).toEqual(false);
			expect(b.isNormal()).toEqual(true);
		});

		it('can determine orthonormality', function () {
			var a = new Matrix2(1, 2, 3, 4);
			var b = new Matrix2(0, 1, -1, 0);

			expect(a.isOrthonormal()).toEqual(false);
			expect(b.isOrthonormal()).toEqual(true);
		});

		it('can compute determinants', function () {
			var a = new Matrix2(1, 2, 3, 4);

			expect(a.determinant()).toEqual(-2);
		});

		it('can be set to identity', function () {
			var a = new Matrix2();
			var b = new Matrix2(1, 2, 3, 4);

			b.setIdentity();

			expect(a).toEqual(Matrix2.IDENTITY);
			expect(b).toEqual(Matrix2.IDENTITY);
		});

		describe('add', function () {
			it('can add 2 matrices', function () {
				var a = new Matrix2(1, 2, 3, 4);
				var b = new Matrix2(2, 3, 5, 7);

				a.add(b);

				expect(a).toBeCloseToMatrix(new Matrix2(1 + 2, 2 + 3, 3 + 5, 4 + 7));
			});
		});

		describe('sub', function () {
			it('can subtract one matrix from another', function () {
				var a = new Matrix2(1, 2, 3, 4);
				var b = new Matrix2(2, 3, 5, 7);

				b.sub(a);

				expect(b).toBeCloseToMatrix(new Matrix2(2 - 1, 3 - 2, 5 - 3, 7 - 4));
			});
		});

		describe('equals', function () {
			it('can be tested for approximate equaltiy', function () {
				var a = new Matrix2(1, 2, 3, 4);
				var b = new Matrix2(1, 2, 3, 4);
				var c = new Matrix2(0, 1, 2, 3);

				expect(a.equals(b)).toBe(true);
				expect(a.equals(c)).toBe(false);
			});

			it('preserves behaviour of comparing with NaN', function () {
				// 1 === NaN // false in JS, so (1, 2) === (1, NaN) should return the same
				var m1 = new Matrix2(1, 2, 3, 4);
				var m2 = new Matrix2(1, 2, 3, NaN);

				expect(m1.equals(m2)).toBe(false);
			});
		});

		describe('copy', function () {
			it('can copy from another matrix', function () {
				var original = new Matrix2(11, 22, 33, 44);
				var copy = new Matrix2(55, 66, 77, 88);
				copy.copy(original);
				expect(copy).toBeCloseToMatrix(new Matrix2(11, 22, 33, 44));
			});
		});

		describe('clone', function () {
			it('clones a matrix', function () {
				var original = new Matrix2(11, 22, 33, 44);
				var clone = original.clone();

				expect(clone).toBeCloseToMatrix(original);
				expect(clone).not.toBe(original);
			});
		});

		describe('deprecated shim added 2015-10-07 (v1.0)', function () {

			it('can add', function () {
				var a = new Matrix2(1, 2, 3, 4);
				var b = new Matrix2();
				Matrix2.add(a,a,b);
				expect(b).toBeCloseToMatrix(new Matrix2(2, 4, 6, 8));
				expect(Matrix2.add(a,a)).toBeCloseToMatrix(new Matrix2(2, 4, 6, 8));
				expect(a.add(a)).toBeCloseToMatrix(new Matrix2(2, 4, 6, 8));
			});

			it('can add scalar', function () {
				var a = new Matrix2(1, 2, 3, 4);
				var b = new Matrix2();
				Matrix2.add(a, 1,b);
				expect(b).toBeCloseToMatrix(new Matrix2(2, 3, 4, 5));
			});

			it('can combine multiple matrices into a single matrix', function () {
				var a = new Matrix2(1, 2, 3, 4);
				var b = new Matrix2(1, 2, 3, 4);

				a.combine(a);

				expect(a).toBeCloseToMatrix(new Matrix2(7, 10, 15, 22));
				expect(Matrix2.combine(b, b)).toBeCloseToMatrix(new Matrix2(7, 10, 15, 22));
			});
			it('can divide', function () {
				var a = new Matrix2(1, 2, 3, 4);
				var b = new Matrix2(1, 2, 3, 4);

				a.div(a);

				expect(a).toBeCloseToMatrix(new Matrix2(1, 1, 1, 1));
				expect(Matrix2.div(b, b)).toBeCloseToMatrix(new Matrix2(1, 1, 1, 1));
			});
			it('can divide with scalar', function () {
				var a = new Matrix2(2, 2, 2, 2);
				var b = 2;

				a.div(b);

				expect(a).toBeCloseToMatrix(new Matrix2(1, 1, 1, 1));
			});
			it('can be transposed', function () {
				var a = new Matrix2(1, 2, 3, 4);
				Matrix2.transpose(a,a);
				expect(a).toBeCloseToMatrix(new Matrix2(1, 3, 2, 4));
			});
			it('can subtract one matrix from another', function () {
				var a = new Matrix2(1, 2, 3, 4);
				var b = new Matrix2(2, 3, 5, 7);

				Matrix2.sub(b, a, b);

				expect(b).toBeCloseToMatrix(new Matrix2(2 - 1, 3 - 2, 5 - 3, 7 - 4));
			});
		});
	});
});

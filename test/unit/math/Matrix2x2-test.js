define([
	'goo/math/Matrix2x2',
	'test/CustomMatchers'
], function (
	Matrix2x2,
	CustomMatchers
) {
	'use strict';

	describe('Matrix2x2', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		describe('constructor', function () {
			it('creates an identity matrix when given no parameters', function () {
				expect(new Matrix2x2()).toBeCloseToMatrix(Matrix2x2.IDENTITY);
			});

			it('creates a matrix when given 4 parameters', function () {
				var matrix = new Matrix2x2(11, 22, 33, 44);
				var expected = new Matrix2x2();

				for (var i = 0; i < 4; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(matrix).toBeCloseToMatrix(expected);
			});

			it('creates a matrix when given an array', function () {
				var matrix = new Matrix2x2([11, 22, 33, 44]);
				var expected = new Matrix2x2();

				for (var i = 0; i < 4; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(matrix).toBeCloseToMatrix(expected);
			});

			it('creates a matrix when given a matrix', function () {
				var original = new Matrix2x2();
				for (var i = 0; i < 4; i++) {
					original.data[i] = (i + 1) * 11;
				}

				var matrix = new Matrix2x2(original);

				var expected = new Matrix2x2();

				for (var i = 0; i < 4; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(matrix).toBeCloseToMatrix(expected);
			});
		});

		it('can combine multiple matrices into a single matrix', function () {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2(1, 2, 3, 4);

			a.combine(a);

			expect(a).toBeCloseToMatrix(new Matrix2x2(7, 10, 15, 22));
			expect(Matrix2x2.combine(b, b)).toBeCloseToMatrix(new Matrix2x2(7, 10, 15, 22));
		});

		it('can be transposed', function () {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2(1, 2, 3, 4);

			a.transpose();

			expect(a).toBeCloseToMatrix(new Matrix2x2(1, 3, 2, 4));
			expect(Matrix2x2.transpose(b)).toBeCloseToMatrix(new Matrix2x2(1, 3, 2, 4));
		});

		it('can be inverted', function () {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2(1, 2, 3, 4);

			a.invert();

			expect(a).toBeCloseToMatrix(new Matrix2x2(-2, 1, 1.5, -0.5));
			expect(Matrix2x2.invert(b)).toBeCloseToMatrix(new Matrix2x2(-2, 1, 1.5, -0.5));
		});

		it('can determine orthogonality', function () {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2(0, 1, -1, 0);

			expect(a.isOrthogonal()).toEqual(false);
			expect(b.isOrthogonal()).toEqual(true);
		});

		it('can determine normality', function () {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2(0, 1, -1, 0);

			expect(a.isNormal()).toEqual(false);
			expect(b.isNormal()).toEqual(true);
		});

		it('can determine orthonormality', function () {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2(0, 1, -1, 0);

			expect(a.isOrthonormal()).toEqual(false);
			expect(b.isOrthonormal()).toEqual(true);
		});

		it('can compute determinants', function () {
			var a = new Matrix2x2(1, 2, 3, 4);

			expect(a.determinant()).toEqual(-2);
		});

		it('can be set to identity', function () {
			var a = new Matrix2x2();
			var b = new Matrix2x2(1, 2, 3, 4);

			b.setIdentity();

			expect(a).toEqual(Matrix2x2.IDENTITY);
			expect(b).toEqual(Matrix2x2.IDENTITY);
		});

		it('can add', function () {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2();
			Matrix2x2.add(a,a,b);
			expect(b).toBeCloseToMatrix(new Matrix2x2(2, 4, 6, 8));
			expect(Matrix2x2.add(a,a)).toBeCloseToMatrix(new Matrix2x2(2, 4, 6, 8));
			expect(a.add(a)).toBeCloseToMatrix(new Matrix2x2(2, 4, 6, 8));
		});

		it('can add scalar', function () {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2();
			Matrix2x2.add(a, 1,b);
			expect(b).toBeCloseToMatrix(new Matrix2x2(2, 3, 4, 5));
		});

		it('can subtract', function () {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2();
			Matrix2x2.sub(a,a,b);
			expect(b).toBeCloseToMatrix(new Matrix2x2(0, 0, 0, 0));
			expect(Matrix2x2.sub(a,a)).toBeCloseToMatrix(new Matrix2x2(0, 0, 0, 0));
			expect(a.sub(a)).toBeCloseToMatrix(new Matrix2x2(0, 0, 0, 0));
		});

		it('can subtract scalar', function () {
			var a = new Matrix2x2(1, 2, 3, 4);
			var b = new Matrix2x2();
			Matrix2x2.sub(a, 1,b);
			expect(b).toBeCloseToMatrix(new Matrix2x2(0, 1, 2, 3));
		});

		describe('copy', function () {
		    it('can copy from another matrix', function () {
    			var original = new Matrix2x2(11, 22, 33, 44);
    			var copy = new Matrix2x2(55, 66, 77, 88);
    			copy.copy(original);
    			expect(copy).toBeCloseToMatrix(new Matrix2x2(11, 22, 33, 44));
    		});
		});

		describe('clone', function () {
		    it('can clone to another matrix', function () {
    			var original = new Matrix2x2(11, 22, 33, 44);
    			var clone = original.clone();
    
    			expect(clone).not.toBe(original);
    			expect(clone).toBeCloseToMatrix(new Matrix2x2(11, 22, 33, 44));
    		});
		});
	});
});

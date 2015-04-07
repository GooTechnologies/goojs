define([
	'goo/math/Matrix',
	'test/CustomMatchers'
], function (
	Matrix,
	CustomMatchers
) {
	'use strict';

	describe('Matrix', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		it('can be converted to a string', function () {
			var a = new Matrix(2, 2).set(0, 1, 2, 3);

			expect(a.toString()).toEqual('[0, 1], [2, 3]');
		});

		it('can determine orthogonality', function () {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(0, 1, -1, 0);

			expect(a.isOrthogonal()).toEqual(false);
			expect(b.isOrthogonal()).toEqual(true);
		});

		it('can determine normality', function () {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(0, 1, -1, 0);

			expect(a.isNormal()).toEqual(false);
			expect(b.isNormal()).toEqual(true);
		});

		it('can determine orthonormality', function () {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(0, 1, -1, 0);

			expect(a.isOrthonormal()).toEqual(false);
			expect(b.isOrthonormal()).toEqual(true);
		});

		describe('', function () {
			it('can be tested for approximate equaltiy', function () {
				var a = new Matrix(2, 2).set(1, 2, 3, 4);
				var b = new Matrix(2, 2).set(1, 2, 3, 4);
				var c = new Matrix(2, 2).set(0, 1, 2, 3);

				expect(a.equals(b)).toEqual(true);
				expect(Matrix.equals(a, b)).toEqual(true);
				expect(a.equals(c)).toEqual(false);
				expect(Matrix.equals(a, c)).toEqual(false);
			});

			it('preserves behaviour of comparing with NaN', function () {
				// 1 === NaN // false in JS, so (1, 2) === (1, NaN) should return the same
				var m1 = new Matrix(2, 2).set(1, 2, 3, 4);
				var m2 = new Matrix(2, 2).set(1, 2, 3, NaN);

				expect(m1.equals(m2)).toBeFalsy();
			});
		});
	});
});

var Matrix = require('src/goo/math/Matrix');
var CustomMatchers = require('test/unit/CustomMatchers');

describe('Matrix', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	// SHIM START

	describe('add', function () {
		it('can perform component-wise addition between two matrices', function () {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.add(a);

			expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(4, 8, 12, 16));
			expect(Matrix.add(b, b)).toBeCloseToMatrix(new Matrix(2, 2).set(4, 8, 12, 16));
		});

		it('performs partial addition when applied to matrices of different size', function () {
			var m2 = new Matrix(2, 2).set(1, 2, 3, 4);
			var m3 = new Matrix(3, 3).set(1, 2, 3, 4, 5, 6, 7, 8, 9);

			var expected1 = new Matrix(2, 2).set(2, 4, 6, 8);
			expect(Matrix.add(m2, m3)).toBeCloseToMatrix(expected1);

			var expected2 = new Matrix(3, 3).set(2, 4, 6, 8, NaN, NaN, NaN, NaN, NaN);
			expect(Matrix.add(m3, m2)).toBeCloseToMatrix(expected2);
		});
	});

	describe('sub', function () {
		it('can perform component-wise subtraction between two matrices', function () {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.sub(a);

			expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(0, 0, 0, 0));
			expect(Matrix.sub(b, b)).toBeCloseToMatrix(new Matrix(2, 2).set(0, 0, 0, 0));
		});

		it('performs partial subtraction when applied to matrices of different size', function () {
			var m2 = new Matrix(2, 2).set(1, 2, 3, 4);
			var m3 = new Matrix(3, 3).set(1, 2, 3, 4, 5, 6, 7, 8, 9);

			var expected1 = new Matrix(2, 2).set(0, 0, 0, 0);
			expect(Matrix.sub(m2, m3)).toBeCloseToMatrix(expected1);

			var expected2 = new Matrix(3, 3).set(0, 0, 0, 0, NaN, NaN, NaN, NaN, NaN);
			expect(Matrix.sub(m3, m2)).toBeCloseToMatrix(expected2);
		});
	});

	describe('mul', function () {
		it('can perform component-wise multiplication between two matrices', function () {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.mul(a);

			expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(4, 16, 36, 64));
			expect(Matrix.mul(b, b)).toBeCloseToMatrix(new Matrix(2, 2).set(4, 16, 36, 64));
		});

		it('performs partial multiplication when applied to matrices of different size', function () {
			var m2 = new Matrix(2, 2).set(1, 2, 3, 4);
			var m3 = new Matrix(3, 3).set(1, 2, 3, 4, 5, 6, 7, 8, 9);

			var expected1 = new Matrix(2, 2).set(1, 4, 9, 16);
			expect(Matrix.mul(m2, m3)).toBeCloseToMatrix(expected1);

			var expected2 = new Matrix(3, 3).set(1, 4, 9, 16, NaN, NaN, NaN, NaN, NaN);
			expect(Matrix.mul(m3, m2)).toBeCloseToMatrix(expected2);
		});
	});

	describe('div', function () {
		it('can perform component-wise division between two matrices', function () {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.div(a);

			expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(1, 1, 1, 1));
			expect(Matrix.div(b, b)).toBeCloseToMatrix(new Matrix(2, 2).set(1, 1, 1, 1));
		});

		it('performs partial multiplication when applied to matrices of different size', function () {
			var m2 = new Matrix(2, 2).set(1, 2, 3, 4);
			var m3 = new Matrix(3, 3).set(1, 2, 3, 4, 5, 6, 7, 8, 9);

			var expected1 = new Matrix(2, 2).set(1, 1, 1, 1);
			expect(Matrix.div(m2, m3)).toBeCloseToMatrix(expected1);

			var expected2 = new Matrix(3, 3).set(1, 1, 1, 1, NaN, NaN, NaN, NaN, NaN);
			expect(Matrix.div(m3, m2)).toBeCloseToMatrix(expected2);
		});
	});

	it('Can perform component-wise addition between a matrix and a scalar', function () {
		var a = new Matrix(2, 2).set(2, 4, 6, 8);
		var b = new Matrix(2, 2).set(2, 4, 6, 8);

		a.add(2);

		expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(4, 6, 8, 10));
		expect(Matrix.add(b, 2)).toBeCloseToMatrix(new Matrix(2, 2).set(4, 6, 8, 10));
	});

	it('can perform component-wise subtraction between a matrix and a scalar', function () {
		var a = new Matrix(2, 2).set(2, 4, 6, 8);
		var b = new Matrix(2, 2).set(2, 4, 6, 8);

		a.sub(2);

		expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(0, 2, 4, 6));
		expect(Matrix.sub(b, 2)).toBeCloseToMatrix(new Matrix(2, 2).set(0, 2, 4, 6));
	});

	it('can perform component-wise multiplication between a matrix and a scalar', function () {
		var a = new Matrix(2, 2).set(2, 4, 6, 8);
		var b = new Matrix(2, 2).set(2, 4, 6, 8);

		a.mul(2);

		expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(4, 8, 12, 16));
		expect(Matrix.mul(b, 2)).toBeCloseToMatrix(new Matrix(2, 2).set(4, 8, 12, 16));
	});

	it('can perform component-wise division between a matrix and a scalar', function () {
		var a = new Matrix(2, 2).set(2, 4, 6, 8);
		var b = new Matrix(2, 2).set(2, 4, 6, 8);

		a.div(2);

		expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(1, 2, 3, 4));
		expect(Matrix.div(b, 2)).toBeCloseToMatrix(new Matrix(2, 2).set(1, 2, 3, 4));
	});

	describe('combine', function () {
		it('can combine multiple matrices into a single matrix', function () {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.combine(a);

			expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(28, 40, 60, 88));
			expect(Matrix.combine(b, b)).toBeCloseToMatrix(new Matrix(2, 2).set(28, 40, 60, 88));
		});

		it('performs partial combination when applied to matrices of different size', function () {
			var m2 = new Matrix(2, 2).set(1, 2, 3, 4);
			var m3 = new Matrix(3, 3).set(1, 2, 3, 4, 5, 6, 7, 8, 9);

			// reusults are unpredictable - they're surely going to be some matrices partially filled with NaN
			expect(Matrix.combine(m2, m3)).toEqual(jasmine.any(Matrix));
			expect(Matrix.combine(m3, m2)).toEqual(jasmine.any(Matrix));
		});
	});

	describe('transpose', function () {
		it('can be transposed', function () {
			var a = new Matrix(2, 2).set(0, 1, 2, 3);
			var b = new Matrix(2, 2).set(0, 1, 2, 3);
			var c = new Matrix(3, 2).set(0, 1, 2, 3, 4, 5);

			a.transpose();

			expect(a).toBeCloseToMatrix(new Matrix(2, 2).set(0, 2, 1, 3));
			expect(Matrix.transpose(b, b)).toBeCloseToMatrix(new Matrix(2, 2).set(0, 2, 1, 3));
			expect(Matrix.transpose(c)).toBeCloseToMatrix(new Matrix(2, 3).set(0, 3, 1, 4, 2, 5));
		});

		it('performs partial combination when applied to matrices of different size', function () {
			var m32 = new Matrix(3, 2).set(0, 1, 2, 3, 4, 5);

			// reusults are unpredictable - they're surely going to be some matrices partially filled with NaN
			expect(Matrix.transpose(m32, m32)).toEqual(jasmine.any(Matrix));
		});
	});

	it('can be copied', function () {
		var a = new Matrix(2, 2).set(0, 1, 2, 3);
		var b = new Matrix(2, 2).set();

		b.copy(a);

		expect(b).toEqual(a);
		expect(Matrix.copy(b, a)).toEqual(a);
	});

	it('can be set', function () {
		var a = new Matrix(2, 2);
		var b = new Matrix(2, 2);
		var c = new Matrix(2, 2);

		expect(a.set(0, 1, 2, 3)).toBeCloseToMatrix(new Matrix(2, 2).set(0, 1, 2, 3));
		expect(b.set(a)).toEqual(a);
		expect(c.set([0, 1, 2, 3])).toBeCloseToMatrix(new Matrix(2, 2).set(0, 1, 2, 3));
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

	// SHIM END
});

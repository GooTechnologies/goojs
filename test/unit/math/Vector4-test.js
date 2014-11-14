define([
	'goo/math/Vector4',
	'test/CustomMatchers'
], function (
	Vector4,
	CustomMatchers
) {
	'use strict';

	describe('Vector4', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		it('can be accessed through indices', function () {
			var a = new Vector4(1, 2, 3, 4);

			expect(a[0]).toEqual(1);
			expect(a[1]).toEqual(2);
			expect(a[2]).toEqual(3);
			expect(a[3]).toEqual(4);
		});

		it('can be modified through indices', function () {
			var a = new Vector4();

			a[0] = 1;
			a[1] = 2;
			a[2] = 3;
			a[3] = 4;

			expect(a).toEqual(new Vector4(1, 2, 3, 4));
		});

		it('can be accessed through aliases', function () {
			var a = new Vector4(1, 2, 3, 4);

			expect(a.x).toEqual(1);
			expect(a.y).toEqual(2);
			expect(a.z).toEqual(3);
			expect(a.w).toEqual(4);
			expect(a.r).toEqual(1);
			expect(a.g).toEqual(2);
			expect(a.b).toEqual(3);
			expect(a.a).toEqual(4);
		});

		it('can be modified through aliases', function () {
			var a = new Vector4();

			a.x = 1;
			a.y = 2;
			a.z = 3;
			a.w = 4;

			expect(a).toEqual(new Vector4(1, 2, 3, 4));

			a.r = 2;
			a.g = 3;
			a.b = 4;
			a.a = 5;

			expect(a).toEqual(new Vector4(2, 3, 4, 5));
		});

		describe('add', function () {
			it('can perform addition', function () {
				var a = new Vector4(1, 2, 3, 4);
				var b = new Vector4(1, 2, 3, 4);

				a.add(a);

				expect(a).toEqual(new Vector4(2, 4, 6, 8));
				expect(Vector4.add(b, b)).toEqual(new Vector4(2, 4, 6, 8));

				expect(Vector4.add(b, 1)).toEqual(new Vector4(2, 3, 4, 5));
				expect(Vector4.add(1, b)).toEqual(new Vector4(2, 3, 4, 5));

				expect(Vector4.add(b, [1, 2, 3, 4])).toEqual(new Vector4(2, 4, 6, 8));
				expect(Vector4.add([1, 2, 3, 4], b)).toEqual(new Vector4(2, 4, 6, 8));
			});

			it('performs partial addition when applied to vectors of different size', function () {
				expect(Vector4.add([1, 2], [7])).toBeCloseToVector(new Vector4(1 + 7, NaN, NaN, NaN));
			});
		});

		describe('sub', function () {
			it('can perform subtraction', function () {
				var a = new Vector4(1, 2, 3, 4);
				var b = new Vector4(1, 2, 3, 4);

				a.sub(a);

				expect(a).toEqual(new Vector4(0, 0, 0, 0));
				expect(Vector4.sub(b, b)).toEqual(new Vector4(0, 0, 0, 0));

				expect(Vector4.sub(b, 1)).toEqual(new Vector4(0, 1, 2, 3));
				expect(Vector4.sub(1, b)).toEqual(new Vector4(0, -1, -2, -3));

				expect(Vector4.sub(b, [1, 2, 3, 4])).toEqual(new Vector4(0, 0, 0, 0));
				expect(Vector4.sub([1, 2, 3, 4], b)).toEqual(new Vector4(0, 0, 0, 0));
			});

			it('performs partial subtraction when applied to vectors of different size', function () {
				expect(Vector4.sub([1, 2], [7])).toBeCloseToVector(new Vector4(1 - 7, NaN, NaN, NaN));
			});
		});

		describe('mul', function () {
			it('can perform multiplication', function () {
				var a = new Vector4(1, 2, 3, 4);
				var b = new Vector4(1, 2, 3, 4);

				a.mul(a);

				expect(a).toEqual(new Vector4(1, 4, 9, 16));
				expect(Vector4.mul(b, b)).toEqual(new Vector4(1, 4, 9, 16));

				expect(Vector4.mul(b, 1)).toEqual(new Vector4(1, 2, 3, 4));
				expect(Vector4.mul(1, b)).toEqual(new Vector4(1, 2, 3, 4));

				expect(Vector4.mul(b, [1, 2, 3, 4])).toEqual(new Vector4(1, 4, 9, 16));
				expect(Vector4.mul([1, 2, 3, 4], b)).toEqual(new Vector4(1, 4, 9, 16));
			});

			it('performs partial subtraction when applied to vectors of different size', function () {
				expect(Vector4.mul([1, 2], [7])).toBeCloseToVector(new Vector4(1 * 7, NaN, NaN, NaN));
			});
		});

		describe('div', function () {
			it('can perform division', function () {
				var a = new Vector4(1, 2, 3, 4);
				var b = new Vector4(1, 2, 3, 4);

				a.div(a);

				expect(a).toEqual(new Vector4(1, 1, 1, 1));
				expect(Vector4.div(b, b)).toEqual(new Vector4(1, 1, 1, 1));

				expect(Vector4.div(b, 1)).toEqual(new Vector4(1, 2, 3, 4));
				expect(Vector4.div(1, b)).toEqual(new Vector4(1, 1 / 2, 1 / 3, 1 / 4));

				expect(Vector4.div(b, [1, 2, 3, 4])).toEqual(new Vector4(1, 1, 1, 1));
				expect(Vector4.div([1, 2, 3, 4], b)).toEqual(new Vector4(1, 1, 1, 1));
			});

			it('performs partial division when applied to vectors of different size', function () {
				expect(Vector4.div([1, 2], [7])).toBeCloseToVector(new Vector4(1 / 7, NaN, NaN, NaN));
			});
		});

		it('can calculate dot products', function () {
			var a = new Vector4(1, 2, 3, 4);
			var b = new Vector4(2, 3, 4, 5);

			expect(a.dot(b)).toEqual(40);
			expect(Vector4.dot(a, b)).toEqual(40);
		});

		it('can linearly interpolate', function () {
			var a = new Vector4(0, 0, 0, 0);
			var b = new Vector4(1, 1, 1, 1);

			expect(a.lerp(b, 0.0)).toEqual(new Vector4(0, 0, 0, 0));
			expect(a.lerp(b, 1.0)).toEqual(new Vector4(1, 1, 1, 1));
			a.set(0, 0, 0, 0);
			expect(a.lerp(b, 0.5)).toEqual(new Vector4(0.5, 0.5, 0.5, 0.5));
		});

		it('can be cloned', function () {
			var a = new Vector4(1, 2, 3, 4);
			var b = a.clone();
			expect(a).toEqual(b);
			expect(a === b).toEqual(false);
			expect(b).toEqual(jasmine.any(Vector4));
		});
	});
});

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

		describe('constructor', function () {
			it('creates a zero vector when given no parameters', function () {
				expect(new Vector4()).toBeCloseToVector(Vector4.ZERO);
			});

			it('creates a vector when given 4 parameters', function () {
				var vector = new Vector4(11, 22, 33, 44);

				var expected = new Vector4();
				expected.x = 11;
				expected.y = 22;
				expected.z = 33;
				expected.w = 44;

				expect(vector).toBeCloseToVector(expected);
			});

			it('creates a vector when given an array', function () {
				var vector = new Vector4([11, 22, 33, 44]);

				var expected = new Vector4();
				expected.x = 11;
				expected.y = 22;
				expected.z = 33;
				expected.w = 44;

				expect(vector).toBeCloseToVector(expected);
			});

			it('creates a vector when given a vector', function () {
				var original = new Vector4();
				original.x = 11;
				original.y = 22;
				original.z = 33;
				original.w = 44;

				var vector = new Vector4(original);

				var expected = new Vector4();
				expected.x = 11;
				expected.y = 22;
				expected.z = 33;
				expected.w = 44;

				expect(vector).toBeCloseToVector(expected);
			});
		});

		xit('can be accessed through indices', function () {
			var a = new Vector4(1, 2, 3, 4);

			expect(a[0]).toEqual(1);
			expect(a[1]).toEqual(2);
			expect(a[2]).toEqual(3);
			expect(a[3]).toEqual(4);
		});

		xit('can be modified through indices', function () {
			var a = new Vector4();

			a[0] = 1;
			a[1] = 2;
			a[2] = 3;
			a[3] = 4;

			expect(a).toBeCloseToVector(new Vector4(1, 2, 3, 4));
		});

		xit('can be accessed through aliases', function () {
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

		xit('can be modified through aliases', function () {
			var a = new Vector4();

			a.x = 1;
			a.y = 2;
			a.z = 3;
			a.w = 4;

			expect(a).toBeCloseToVector(new Vector4(1, 2, 3, 4));

			a.r = 2;
			a.g = 3;
			a.b = 4;
			a.a = 5;

			expect(a).toBeCloseToVector(new Vector4(2, 3, 4, 5));
		});

		xdescribe('add', function () {
			it('can perform addition', function () {
				var a = new Vector4(1, 2, 3, 4);
				var b = new Vector4(1, 2, 3, 4);

				a.add(a);

				expect(a).toBeCloseToVector(new Vector4(2, 4, 6, 8));
				expect(Vector4.add(b, b)).toBeCloseToVector(new Vector4(2, 4, 6, 8));

				expect(Vector4.add(b, 1)).toBeCloseToVector(new Vector4(2, 3, 4, 5));
				expect(Vector4.add(1, b)).toBeCloseToVector(new Vector4(2, 3, 4, 5));

				expect(Vector4.add(b, [1, 2, 3, 4])).toBeCloseToVector(new Vector4(2, 4, 6, 8));
				expect(Vector4.add([1, 2, 3, 4], b)).toBeCloseToVector(new Vector4(2, 4, 6, 8));
			});

			it('performs partial addition when applied to vectors of different size', function () {
				expect(Vector4.add([1, 2], [7])).toBeCloseToVector(new Vector4(1 + 7, NaN, NaN, NaN));
			});
		});

		xdescribe('sub', function () {
			it('can perform subtraction', function () {
				var a = new Vector4(1, 2, 3, 4);
				var b = new Vector4(1, 2, 3, 4);

				a.sub(a);

				expect(a).toBeCloseToVector(new Vector4(0, 0, 0, 0));
				expect(Vector4.sub(b, b)).toBeCloseToVector(new Vector4(0, 0, 0, 0));

				expect(Vector4.sub(b, 1)).toBeCloseToVector(new Vector4(0, 1, 2, 3));
				expect(Vector4.sub(1, b)).toBeCloseToVector(new Vector4(0, -1, -2, -3));

				expect(Vector4.sub(b, [1, 2, 3, 4])).toBeCloseToVector(new Vector4(0, 0, 0, 0));
				expect(Vector4.sub([1, 2, 3, 4], b)).toBeCloseToVector(new Vector4(0, 0, 0, 0));
			});

			it('performs partial subtraction when applied to vectors of different size', function () {
				expect(Vector4.sub([1, 2], [7])).toBeCloseToVector(new Vector4(1 - 7, NaN, NaN, NaN));
			});
		});

		xdescribe('mul', function () {
			it('can perform multiplication', function () {
				var a = new Vector4(1, 2, 3, 4);
				var b = new Vector4(1, 2, 3, 4);

				a.mul(a);

				expect(a).toBeCloseToVector(new Vector4(1, 4, 9, 16));
				expect(Vector4.mul(b, b)).toBeCloseToVector(new Vector4(1, 4, 9, 16));

				expect(Vector4.mul(b, 1)).toBeCloseToVector(new Vector4(1, 2, 3, 4));
				expect(Vector4.mul(1, b)).toBeCloseToVector(new Vector4(1, 2, 3, 4));

				expect(Vector4.mul(b, [1, 2, 3, 4])).toBeCloseToVector(new Vector4(1, 4, 9, 16));
				expect(Vector4.mul([1, 2, 3, 4], b)).toBeCloseToVector(new Vector4(1, 4, 9, 16));
			});

			it('performs partial subtraction when applied to vectors of different size', function () {
				expect(Vector4.mul([1, 2], [7])).toBeCloseToVector(new Vector4(1 * 7, NaN, NaN, NaN));
			});
		});

		describe('scale', function () {
			it('scales a vector', function () {
				var vector = new Vector4(1, 2, 3, 4);
				vector.scale(123);
				expect(vector).toBeCloseToVector(new Vector4(1 * 123, 2 * 123, 3 * 123, 4 * 123));
			});
		});

		xdescribe('div', function () {
			it('can perform division', function () {
				var a = new Vector4(1, 2, 3, 4);
				var b = new Vector4(1, 2, 3, 4);

				a.div(a);

				expect(a).toBeCloseToVector(new Vector4(1, 1, 1, 1));
				expect(Vector4.div(b, b)).toBeCloseToVector(new Vector4(1, 1, 1, 1));

				expect(Vector4.div(b, 1)).toBeCloseToVector(new Vector4(1, 2, 3, 4));
				expect(Vector4.div(1, b)).toBeCloseToVector(new Vector4(1, 1 / 2, 1 / 3, 1 / 4));

				expect(Vector4.div(b, [1, 2, 3, 4])).toBeCloseToVector(new Vector4(1, 1, 1, 1));
				expect(Vector4.div([1, 2, 3, 4], b)).toBeCloseToVector(new Vector4(1, 1, 1, 1));
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

		describe('dotVector', function () {
			it('can calculate dot products', function () {
				var a = new Vector4(1, 2, 3, 4);
				var b = new Vector4(2, 3, 4, 5);

				expect(a.dotVector(b)).toEqual(40);
			});
		});

		it('can linearly interpolate', function () {
			var a = new Vector4(0, 0, 0, 0);
			var b = new Vector4(1, 1, 1, 1);

			expect(a.lerp(b, 0.0)).toBeCloseToVector(new Vector4(0, 0, 0, 0));
			expect(a.lerp(b, 1.0)).toBeCloseToVector(new Vector4(1, 1, 1, 1));
			a.set(0, 0, 0, 0);
			expect(a.lerp(b, 0.5)).toBeCloseToVector(new Vector4(0.5, 0.5, 0.5, 0.5));
		});

		describe('copy', function () {
			it('can copy values from a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.copy(new Vector4(55, 66, 77, 88));
				expect(vector).toBeCloseToVector(new Vector4(55, 66, 77, 88));
			});
		});

		describe('clone', function () {
			it('clones a vector', function () {
				var original = new Vector4(11, 22, 33, 44);
				var clone = original.clone();

				expect(original).toBeCloseToVector(clone);
				expect(original).not.toBe(clone);
			});
		});

		describe('setd (deprecated)', function () {
			it('can set a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.setd(55, 66, 77, 88);
				expect(vector).toBeCloseToVector(new Vector4(55, 66, 77, 88));
			});
		});

		describe('seta (deprecated)', function () {
			it('can set a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.seta([55, 66, 77, 88]);
				expect(vector).toBeCloseToVector(new Vector4(55, 66, 77, 88));
			});
		});

		describe('setv (deprecated)', function () {
			it('can set a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.setv(new Vector4(55, 66, 77, 88));
				expect(vector).toBeCloseToVector(new Vector4(55, 66, 77, 88));
			});
		});


		describe('setDirect', function () {
			it('can set a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.setDirect(55, 66, 77, 88);
				expect(vector).toBeCloseToVector(new Vector4(55, 66, 77, 88));
			});
		});

		describe('setArray', function () {
			it('can set a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.setArray([55, 66, 77, 88]);
				expect(vector).toBeCloseToVector(new Vector4(55, 66, 77, 88));
			});
		});

		describe('setVector', function () {
			it('can set a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.setVector(new Vector4(55, 66, 77, 88));
				expect(vector).toBeCloseToVector(new Vector4(55, 66, 77, 88));
			});
		});


		describe('addDirect', function () {
			it('can add to a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.addDirect(55, 66, 77, 88);
				expect(vector).toBeCloseToVector(new Vector4(11 + 55, 22 + 66, 33 + 77, 44 + 88));
			});
		});

		describe('addVector', function () {
			it('can add to a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.addVector(new Vector4(55, 66, 77, 88));
				expect(vector).toBeCloseToVector(new Vector4(11 + 55, 22 + 66, 33 + 77, 44 + 88));
			});
		});


		describe('mulDirect', function () {
			it('can multiply with 4 numbers', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.mulDirect(55, 66, 77, 88);
				expect(vector).toBeCloseToVector(new Vector4(11 * 55, 22 * 66, 33 * 77, 44 * 88));
			});
		});

		describe('mulVector', function () {
			it('can multiply with a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.mulVector(new Vector4(55, 66, 77, 88));
				expect(vector).toBeCloseToVector(new Vector4(11 * 55, 22 * 66, 33 * 77, 44 * 88));
			});
		});


		describe('subDirect', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.subDirect(55, 66, 77, 88);
				expect(vector).toBeCloseToVector(new Vector4(11 - 55, 22 - 66, 33 - 77, 44 - 88));
			});
		});

		describe('subVector', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.subVector(new Vector4(55, 66, 77, 88));
				expect(vector).toBeCloseToVector(new Vector4(11 - 55, 22 - 66, 33 - 77, 44 - 88));
			});
		});
	});
});

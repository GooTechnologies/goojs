define([
	'goo/math/Vector2',
	'test/CustomMatchers'
], function (
	Vector2,
	CustomMatchers
) {
	'use strict';

	describe('Vector2', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		describe('constructor', function () {
			it('creates a zero vector when given no parameters', function () {
				expect(new Vector2()).toBeCloseToVector(Vector2.ZERO);
			});

			it('creates a vector when given 2 parameters', function () {
				var vector = new Vector2(11, 22);
				var expected = new Vector2();

				for (var i = 0; i < 2; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(vector).toBeCloseToVector(expected);
			});

			it('creates a vector when given an array', function () {
				var vector = new Vector2([11, 22]);
				var expected = new Vector2();

				for (var i = 0; i < 2; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(vector).toBeCloseToVector(expected);
			});

			it('creates a vector when given a vector', function () {
				var original = new Vector2();
				for (var i = 0; i < 2; i++) {
					original.data[i] = (i + 1) * 11;
				}

				var vector = new Vector2(original);

				var expected = new Vector2();

				for (var i = 0; i < 2; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(vector).toBeCloseToVector(expected);
			});
		});

		it('can be accessed through indices', function () {
			var a = new Vector2(1, 2);

			expect(a[0]).toEqual(1);
			expect(a[1]).toEqual(2);
		});

		it('can be modified through indices', function () {
			var a = new Vector2();

			a[0] = 1;
			a[1] = 2;

			expect(a).toBeCloseToVector(new Vector2(1, 2));
		});

		it('can be accessed through aliases', function () {
			var a = new Vector2(1, 2);

			expect(a.x).toEqual(1);
			expect(a.y).toEqual(2);
			expect(a.u).toEqual(1);
			expect(a.v).toEqual(2);
			expect(a.s).toEqual(1);
			expect(a.t).toEqual(2);
		});

		it('can be modified through aliases', function () {
			var a = new Vector2();

			a.x = 1;
			a.y = 2;

			expect(a).toBeCloseToVector(new Vector2(1, 2));

			a.u = 2;
			a.v = 3;

			expect(a).toBeCloseToVector(new Vector2(2, 3));

			a.s = 3;
			a.t = 4;

			expect(a).toBeCloseToVector(new Vector2(3, 4));
		});

		describe('add', function () {
			it('can perform addition', function () {
				var a = new Vector2(1, 2);
				var b = new Vector2(1, 2);

				a.add(a);

				expect(a).toBeCloseToVector(new Vector2(2, 4));
				expect(Vector2.add(b, b)).toBeCloseToVector(new Vector2(2, 4));

				expect(Vector2.add(b, 1)).toBeCloseToVector(new Vector2(2, 3));
				expect(Vector2.add(1, b)).toBeCloseToVector(new Vector2(2, 3));

				expect(Vector2.add(b, [1, 2])).toBeCloseToVector(new Vector2(2, 4));
				expect(Vector2.add([1, 2], b)).toBeCloseToVector(new Vector2(2, 4));
			});

			it('performs partial addition when adding vectors of different size', function () {
				expect(Vector2.add([1, 2], [7])).toBeCloseToVector(new Vector2(1 + 7, NaN));
			});
		});		

		describe('sub', function () {
			it('can perform subtraction', function () {
				var a = new Vector2(1, 2);
				var b = new Vector2(1, 2);

				a.sub(a);

				expect(a).toBeCloseToVector(new Vector2(0, 0));
				expect(Vector2.sub(b, b)).toBeCloseToVector(new Vector2(0, 0));

				expect(Vector2.sub(b, 1)).toBeCloseToVector(new Vector2(0, 1));
				expect(Vector2.sub(1, b)).toBeCloseToVector(new Vector2(0, -1));

				expect(Vector2.sub(b, [1, 2])).toBeCloseToVector(new Vector2(0, 0));
				expect(Vector2.sub([1, 2], b)).toBeCloseToVector(new Vector2(0, 0));
			});

			it('performs partial subtraction when applied to vectors of different size', function () {
				expect(Vector2.sub([1, 2], [7])).toBeCloseToVector(new Vector2(-6, NaN));
			});
		});

		describe('mul', function () {
			it('can perform multiplication', function () {
				var a = new Vector2(1, 2);
				var b = new Vector2(1, 2);

				a.mul(a);

				expect(a).toBeCloseToVector(new Vector2(1, 4));
				expect(Vector2.mul(b, b)).toBeCloseToVector(new Vector2(1, 4));

				expect(Vector2.mul(b, 1)).toBeCloseToVector(new Vector2(1, 2));
				expect(Vector2.mul(1, b)).toBeCloseToVector(new Vector2(1, 2));

				expect(Vector2.mul(b, [1, 2])).toBeCloseToVector(new Vector2(1, 4));
				expect(Vector2.mul([1, 2], b)).toBeCloseToVector(new Vector2(1, 4));
			});

			it('performs partial multiplication when applied to vectors of different size', function () {
				expect(Vector2.mul([1, 2], [7])).toBeCloseToVector(new Vector2(7, NaN));
			});
		});

		describe('scale', function () {
			it('scales a vector', function () {
				var vector = new Vector2(1, 2);
				vector.scale(123);
				expect(vector).toBeCloseToVector(new Vector2(1 * 123, 2 * 123));
			});
		});

		describe('div', function () {
			it('can perform division', function () {
				var a = new Vector2(1, 2);
				var b = new Vector2(1, 2);

				a.div(a);

				expect(a).toBeCloseToVector(new Vector2(1, 1));
				expect(Vector2.div(b, b)).toBeCloseToVector(new Vector2(1, 1));

				expect(Vector2.div(b, 1)).toBeCloseToVector(new Vector2(1, 2));
				expect(Vector2.div(1, b)).toBeCloseToVector(new Vector2(1, 1/2));

				expect(Vector2.div(b, [1, 2])).toBeCloseToVector(new Vector2(1, 1));
				expect(Vector2.div([1, 2], b)).toBeCloseToVector(new Vector2(1, 1));
			});

			it('performs partial division when applied to vectors of different size', function () {
				expect(Vector2.div([1, 2], [7])).toBeCloseToVector(new Vector2(1 / 7, NaN));
			});
		});

		describe('dot', function () {
			it('can calculate dot products', function () {
				var a = new Vector2(1, 2);
				var b = new Vector2(1, 2);

				expect(a.dot(b)).toEqual(5);
				expect(Vector2.dot(a, b)).toEqual(5);
			});

			it('returns garbage if supplied with garbage', function () {
				expect(Vector2.dot([1, 2], [5])).toEqual(NaN);
			});
		});

		it('can be normalized', function () {
			var a = new Vector2();

			a.set(0, 0).normalize();
			expect(a.x).toBeCloseTo(0);
			expect(a.y).toBeCloseTo(0);

			a.set(1, 1).normalize();
			expect(a.x).toBeCloseTo(1/Math.sqrt(2));
			expect(a.y).toBeCloseTo(1/Math.sqrt(2));

			a.set(-2, -3).normalize();
			expect(a.x).toBeCloseTo(-2/Math.sqrt(2*2+3*3));
			expect(a.y).toBeCloseTo(-3/Math.sqrt(2*2+3*3));

			a.set(12, 34).normalize();
			expect(a.x).toBeCloseTo(12/Math.sqrt(12*12+34*34));
			expect(a.y).toBeCloseTo(34/Math.sqrt(12*12+34*34));
		});

		describe('copy', function () {
			it('can copy values from a vector', function () {
				var vector = new Vector2(11, 22);
				vector.setVector(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(55, 66));
			});
		});

		it('can be cloned', function (){
			var a = new Vector2(1, 2);
			var b = a.clone();
			expect(a).toBeCloseToVector(b);
			expect(a === b).toEqual(false);
			expect(b).toEqual(jasmine.any(Vector2));
		});


		describe('setd (deprecated)', function () {
			it('can set a vector', function () {
				var vector = new Vector2(11, 22);
				vector.setd(55, 66);
				expect(vector).toBeCloseToVector(new Vector2(55, 66));
			});
		});

		describe('seta (deprecated)', function () {
			it('can set a vector', function () {
				var vector = new Vector2(11, 22);
				vector.seta([55, 66]);
				expect(vector).toBeCloseToVector(new Vector2(55, 66));
			});
		});

		describe('setv (deprecated)', function () {
			it('can set a vector', function () {
				var vector = new Vector2(11, 22);
				vector.setv(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(55, 66));
			});
		});


		describe('setDirect', function () {
			it('can set a vector', function () {
				var vector = new Vector2(11, 22);
				vector.setDirect(55, 66);
				expect(vector).toBeCloseToVector(new Vector2(55, 66));
			});
		});

		describe('setArray', function () {
			it('can set a vector', function () {
				var vector = new Vector2(11, 22);
				vector.setArray([55, 66]);
				expect(vector).toBeCloseToVector(new Vector2(55, 66));
			});
		});

		describe('setVector', function () {
			it('can set a vector', function () {
				var vector = new Vector2(11, 22);
				vector.setVector(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(55, 66));
			});
		});


		describe('addDirect', function () {
			it('can add to a vector', function () {
				var vector = new Vector2(11, 22);
				vector.addDirect(55, 66);
				expect(vector).toBeCloseToVector(new Vector2(66, 88));
			});
		});

		describe('addVector', function () {
			it('can add to a vector', function () {
				var vector = new Vector2(11, 22);
				vector.addVector(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(66, 88));
			});
		});


		describe('mulDirect', function () {
			it('can multiply with 2 numbers', function () {
				var vector = new Vector2(11, 22);
				vector.mulDirect(55, 66);
				expect(vector).toBeCloseToVector(new Vector2(11 * 55, 22 * 66));
			});
		});

		describe('mulVector', function () {
			it('can multiply with a vector', function () {
				var vector = new Vector2(11, 22);
				vector.mulVector(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(11 * 55, 22 * 66));
			});
		});


		describe('subDirect', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector2(11, 22);
				vector.subDirect(55, 66);
				expect(vector).toBeCloseToVector(new Vector2(11 - 55, 22 - 66));
			});
		});

		describe('subVector', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector2(11, 22);
				vector.subVector(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(11 - 55, 22 - 66));
			});
		});
	});
});

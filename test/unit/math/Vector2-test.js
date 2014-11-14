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

		it('can be accessed through indices', function () {
			var a = new Vector2(1, 2);

			expect(a[0]).toEqual(1);
			expect(a[1]).toEqual(2);
		});

		it('can be modified through indices', function () {
			var a = new Vector2();

			a[0] = 1;
			a[1] = 2;

			expect(a).toEqual(new Vector2(1, 2));
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

			expect(a).toEqual(new Vector2(1, 2));

			a.u = 2;
			a.v = 3;

			expect(a).toEqual(new Vector2(2, 3));

			a.s = 3;
			a.t = 4;

			expect(a).toEqual(new Vector2(3, 4));
		});

		describe('add', function () {
			it('can perform addition', function () {
				var a = new Vector2(1, 2);
				var b = new Vector2(1, 2);

				a.add(a);

				expect(a).toEqual(new Vector2(2, 4));
				expect(Vector2.add(b, b)).toEqual(new Vector2(2, 4));

				expect(Vector2.add(b, 1)).toEqual(new Vector2(2, 3));
				expect(Vector2.add(1, b)).toEqual(new Vector2(2, 3));

				expect(Vector2.add(b, [1, 2])).toEqual(new Vector2(2, 4));
				expect(Vector2.add([1, 2], b)).toEqual(new Vector2(2, 4));
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

				expect(a).toEqual(new Vector2(0, 0));
				expect(Vector2.sub(b, b)).toEqual(new Vector2(0, 0));

				expect(Vector2.sub(b, 1)).toEqual(new Vector2(0, 1));
				expect(Vector2.sub(1, b)).toEqual(new Vector2(0, -1));

				expect(Vector2.sub(b, [1, 2])).toEqual(new Vector2(0, 0));
				expect(Vector2.sub([1, 2], b)).toEqual(new Vector2(0, 0));
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

				expect(a).toEqual(new Vector2(1, 4));
				expect(Vector2.mul(b, b)).toEqual(new Vector2(1, 4));

				expect(Vector2.mul(b, 1)).toEqual(new Vector2(1, 2));
				expect(Vector2.mul(1, b)).toEqual(new Vector2(1, 2));

				expect(Vector2.mul(b, [1, 2])).toEqual(new Vector2(1, 4));
				expect(Vector2.mul([1, 2], b)).toEqual(new Vector2(1, 4));
			});

			it('performs partial multiplication when applied to vectors of different size', function () {
				expect(Vector2.mul([1, 2], [7])).toBeCloseToVector(new Vector2(7, NaN));
			});
		});

		describe('div', function () {
			it('can perform division', function () {
				var a = new Vector2(1, 2);
				var b = new Vector2(1, 2);

				a.div(a);

				expect(a).toEqual(new Vector2(1, 1));
				expect(Vector2.div(b, b)).toEqual(new Vector2(1, 1));

				expect(Vector2.div(b, 1)).toEqual(new Vector2(1, 2));
				expect(Vector2.div(1, b)).toEqual(new Vector2(1, 1/2));

				expect(Vector2.div(b, [1, 2])).toEqual(new Vector2(1, 1));
				expect(Vector2.div([1, 2], b)).toEqual(new Vector2(1, 1));
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

		it('can be cloned', function (){
			var a = new Vector2(1, 2);
			var b = a.clone();
			expect(a).toEqual(b);
			expect(a === b).toEqual(false);
			expect(b).toEqual(jasmine.any(Vector2));
		});
	});
});

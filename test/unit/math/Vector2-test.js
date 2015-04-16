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

				expected.x = 11;
				expected.y = 22;

				expect(vector).toBeCloseToVector(expected);
			});
		});

		describe('indices', function () {
			it('can be accessed through indices (debug only)', function () {
				var a = new Vector2(11, 22);

				expect(function () { a[0]; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
				expect(function () { a[1]; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
			});

			it('can be modified through indices (debug only)', function () {
				var a = new Vector2();

				expect(function () { a[0] = 11; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
				expect(function () { a[1] = 22; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
			});
		});

		describe('aliases', function () {
			it('can be accessed through aliases', function () {
				var a = new Vector2(11, 22);

				expect(a.x).toEqual(11);
				expect(a.y).toEqual(22);
				expect(a.u).toEqual(11);
				expect(a.v).toEqual(22);
			});

			it('can be modified through aliases', function () {
				var v1 = new Vector2();
				v1.x = 11;
				v1.y = 22;
				expect(v1).toBeCloseToVector(new Vector2(11, 22));

				var v2 = new Vector2();
				v2.u = 22;
				v2.v = 33;
				expect(v2).toBeCloseToVector(new Vector2(22, 33));
			});
		});

		describe('scale', function () {
			it('scales a vector', function () {
				var vector = new Vector2(1, 2);
				vector.scale(123);
				expect(vector).toBeCloseToVector(new Vector2(1 * 123, 2 * 123));
			});
		});

		describe('dot', function () {
			it('can calculate dot products', function () {
				var a = new Vector2(1, 2);
				var b = new Vector2(1, 2);

				expect(a.dot(b)).toEqual(5);
			});
		});

		describe('normalize', function () {
			it('can be normalized', function () {
				var a = new Vector2();
				// rewrite with toBeCloseToVector
				a.setDirect(0, 0).normalize();
				expect(a.x).toBeCloseTo(0);
				expect(a.y).toBeCloseTo(0);

				a.setDirect(1, 1).normalize();
				expect(a.x).toBeCloseTo(1 / Math.sqrt(2));
				expect(a.y).toBeCloseTo(1 / Math.sqrt(2));

				a.setDirect(-2, -3).normalize();
				expect(a.x).toBeCloseTo(-2 / Math.sqrt(2 * 2 + 3 * 3));
				expect(a.y).toBeCloseTo(-3 / Math.sqrt(2 * 2 + 3 * 3));

				a.setDirect(12, 34).normalize();
				expect(a.x).toBeCloseTo(12 / Math.sqrt(12 * 12 + 34 * 34));
				expect(a.y).toBeCloseTo(34 / Math.sqrt(12 * 12 + 34 * 34));
			});
		});

		describe('reflect', function () {
			it('can reflect a vector', function () {
				var plane = new Vector2(-1, 1).normalize(); // more like a vector
				var original = new Vector2(1, 0);
				var reflection = original.clone().reflect(plane);

				expect(reflection).toBeCloseToVector(new Vector2(0, 1));
			});
		});

		describe('copy', function () {
			it('can copy values from a vector', function () {
				var vector = new Vector2(11, 22);
				vector.set(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(55, 66));
			});
		});

		describe('clone', function () {
			it('clones a vector', function () {
				var original = new Vector2(11, 22);
				var clone = original.clone();

				expect(original).toBeCloseToVector(clone);
				expect(original).not.toBe(clone);
			});
		});

		describe('setDirect', function () {
			it('can set a vector', function () {
				var vector = new Vector2(11, 22);
				vector.setDirect(55, 66);
				expect(vector).toBeCloseToVector(new Vector2(55, 66));
			});
		});

		describe('set', function () {
			it('can set a vector', function () {
				var vector = new Vector2(11, 22);
				vector.set(new Vector2(55, 66));
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

		describe('add', function () {
			it('can add to a vector', function () {
				var vector = new Vector2(11, 22);
				vector.add(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(66, 88));
			});
		});


		describe('subDirect', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector2(11, 22);
				vector.subDirect(55, 66);
				expect(vector).toBeCloseToVector(new Vector2(11 - 55, 22 - 66));
			});
		});

		describe('sub', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector2(11, 22);
				vector.sub(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(11 - 55, 22 - 66));
			});
		});


		describe('mulDirect', function () {
			it('can multiply with 2 numbers', function () {
				var vector = new Vector2(11, 22);
				vector.mulDirect(55, 66);
				expect(vector).toBeCloseToVector(new Vector2(11 * 55, 22 * 66));
			});
		});

		describe('mul', function () {
			it('can multiply with a vector', function () {
				var vector = new Vector2(11, 22);
				vector.mul(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(11 * 55, 22 * 66));
			});
		});


		describe('divDirect', function () {
			it('can multiply with 2 numbers', function () {
				var vector = new Vector2(11, 22);
				vector.divDirect(55, 66);
				expect(vector).toBeCloseToVector(new Vector2(11 / 55, 22 / 66));
			});
		});

		describe('div', function () {
			it('can multiply with a vector', function () {
				var vector = new Vector2(11, 22);
				vector.div(new Vector2(55, 66));
				expect(vector).toBeCloseToVector(new Vector2(11 / 55, 22 / 66));
			});
		});

		describe('fromArray', function () {
			it('creates a Vector2 from an array', function () {
				expect(Vector2.fromArray([11, 22]))
					.toBeCloseToVector(new Vector2(11, 22));
			});
		});

		describe('fromAny', function () {
			it('creates a Vector2 from 2 numbers', function () {
				expect(Vector2.fromAny(11, 22))
					.toBeCloseToVector(new Vector2(11, 22));
			});

			it('creates a Vector2 from an array of 2 numbers', function () {
				expect(Vector2.fromAny([11, 22]))
					.toBeCloseToVector(new Vector2(11, 22));
			});

			it('creates a Vector2 from an { x, y } object', function () {
				expect(Vector2.fromAny({ x: 11, y: 22 }))
					.toBeCloseToVector(new Vector2(11, 22));
			});

			it('clones a Vector2', function () {
				var original = new Vector2(11, 22);
				var clone = Vector2.fromAny(original);

				expect(clone).toBeCloseToVector(original);
				expect(clone).not.toBe(original);
			});
		});
	});
});

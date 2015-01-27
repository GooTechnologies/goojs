define([
	'goo/math/Vector3',
	'test/CustomMatchers'
], function (
	Vector3,
	CustomMatchers
) {
	'use strict';

	describe('Vector3', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		describe('constructor', function () {
			it('creates a zero vector when given no parameters', function () {
				expect(new Vector3()).toBeCloseToVector(Vector3.ZERO);
			});

			it('creates a vector when given 2 parameters', function () {
				var vector = new Vector3(11, 22, 33);
				var expected = new Vector3();

				for (var i = 0; i < 3; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(vector).toBeCloseToVector(expected);
			});

			it('creates a vector when given an array', function () {
				var vector = new Vector3([11, 22, 33]);
				var expected = new Vector3();

				for (var i = 0; i < 3; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(vector).toBeCloseToVector(expected);
			});

			it('creates a vector when given a vector', function () {
				var original = new Vector3();
				for (var i = 0; i < 3; i++) {
					original.data[i] = (i + 1) * 11;
				}

				var vector = new Vector3(original);

				var expected = new Vector3();

				for (var i = 0; i < 3; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(vector).toBeCloseToVector(expected);
			});
		});
		
		it('can be accessed through indices', function () {
			var a = new Vector3(1, 2, 3);

			expect(a[0]).toEqual(1);
			expect(a[1]).toEqual(2);
			expect(a[2]).toEqual(3);
		});

		it('can be modified through indices', function () {
			var a = new Vector3();

			a[0] = 1;
			a[1] = 2;
			a[2] = 3;

			expect(a).toBeCloseToVector(new Vector3(1, 2, 3));
		});

		it('can be accessed through aliases', function () {
			var a = new Vector3(1, 2, 3);

			expect(a.x).toEqual(1);
			expect(a.y).toEqual(2);
			expect(a.z).toEqual(3);
			expect(a.u).toEqual(1);
			expect(a.v).toEqual(2);
			expect(a.w).toEqual(3);
			expect(a.r).toEqual(1);
			expect(a.g).toEqual(2);
			expect(a.b).toEqual(3);
		});

		it('can be modified through aliases', function () {
			var a = new Vector3();

			a.x = 1;
			a.y = 2;
			a.z = 3;

			expect(a).toBeCloseToVector(new Vector3(1, 2, 3));

			a.u = 2;
			a.v = 3;
			a.w = 4;

			expect(a).toBeCloseToVector(new Vector3(2, 3, 4));

			a.r = 3;
			a.g = 4;
			a.b = 5;

			expect(a).toBeCloseToVector(new Vector3(3, 4, 5));
		});

		describe('add', function () {
			it('can perform addition', function () {
				var a = new Vector3(1, 2, 3);
				var b = new Vector3(1, 2, 3);

				a.add(a);

				expect(a).toBeCloseToVector(new Vector3(2, 4, 6));
				expect(Vector3.add(b, b)).toBeCloseToVector(new Vector3(2, 4, 6));

				expect(Vector3.add(b, 1)).toBeCloseToVector(new Vector3(2, 3, 4));
				expect(Vector3.add(1, b)).toBeCloseToVector(new Vector3(2, 3, 4));

				expect(Vector3.add(b, [1, 2, 3])).toBeCloseToVector(new Vector3(2, 4, 6));
				expect(Vector3.add([1, 2, 3], b)).toBeCloseToVector(new Vector3(2, 4, 6));
			});

			it('performs partial addition when applied to vectors of different size', function () {
				expect(Vector3.add([1, 2], [7])).toBeCloseToVector(new Vector3(1 + 7, NaN, NaN));
			});
		});

		describe('sub', function () {
			it('can perform subtraction', function () {
				var a = new Vector3(1, 2, 3);
				var b = new Vector3(1, 2, 3);

				a.sub(a);

				expect(a).toBeCloseToVector(new Vector3(0, 0, 0));
				expect(Vector3.sub(b, b)).toBeCloseToVector(new Vector3(0, 0, 0));

				expect(Vector3.sub(b, 1)).toBeCloseToVector(new Vector3(0, 1, 2));
				expect(Vector3.sub(1, b)).toBeCloseToVector(new Vector3(0, -1, -2));

				expect(Vector3.sub(b, [1, 2, 3])).toBeCloseToVector(new Vector3(0, 0, 0));
				expect(Vector3.sub([1, 2, 3], b)).toBeCloseToVector(new Vector3(0, 0, 0));
			});

			it('performs partial subtraction when applied to vectors of different size', function () {
				expect(Vector3.sub([1, 2], [7])).toBeCloseToVector(new Vector3(1 - 7, NaN, NaN));
			});
		});

		it('can be negated', function () {
			var vector = new Vector3(123, 345, -567);

			vector.invert();

			expect(vector).toBeCloseToVector(new Vector3(-123, -345, 567));
		});

		describe('mul', function () {
			it('can perform multiplication', function () {
				var a = new Vector3(1, 2, 3);
				var b = new Vector3(1, 2, 3);

				a.mul(a);

				expect(a).toBeCloseToVector(new Vector3(1, 4, 9));
				expect(Vector3.mul(b, b)).toBeCloseToVector(new Vector3(1, 4, 9));

				expect(Vector3.mul(b, 1)).toBeCloseToVector(new Vector3(1, 2, 3));
				expect(Vector3.mul(1, b)).toBeCloseToVector(new Vector3(1, 2, 3));

				expect(Vector3.mul(b, [1, 2, 3])).toBeCloseToVector(new Vector3(1, 4, 9));
				expect(Vector3.mul([1, 2, 3], b)).toBeCloseToVector(new Vector3(1, 4, 9));
			});

			it('performs partial subtraction when applied to vectors of different size', function () {
				expect(Vector3.mul([1, 2], [7])).toBeCloseToVector(new Vector3(1 * 7, NaN, NaN));
			});
		});

		describe('scale', function () {
			it('scales a vector', function () {
				var vector = new Vector3(1, 2, 3);
				vector.scale(123);
				expect(vector).toBeCloseToVector(new Vector3(1 * 123, 2 * 123, 3 * 123));
			});
		});

		describe('div', function () {
			it('can perform division', function () {
				var a = new Vector3(1, 2, 3);
				var b = new Vector3(1, 2, 3);

				a.div(a);

				expect(a).toBeCloseToVector(new Vector3(1, 1, 1));
				expect(Vector3.div(b, b)).toBeCloseToVector(new Vector3(1, 1, 1));

				expect(Vector3.div(b, 1)).toBeCloseToVector(new Vector3(1, 2, 3));
				expect(Vector3.div(1, b)).toBeCloseToVector(new Vector3(1, 1/2, 1/3));

				expect(Vector3.div(b, [1, 2, 3])).toBeCloseToVector(new Vector3(1, 1, 1));
				expect(Vector3.div([1, 2, 3], b)).toBeCloseToVector(new Vector3(1, 1, 1));
			});

			it('performs partial division when applied to vectors of different size', function () {
				expect(Vector3.div([1, 2], [7])).toBeCloseToVector(new Vector3(1 / 7, NaN, NaN));
			});
		});

		describe('dot', function () {
			it('can calculate dot products', function () {
				var a = new Vector3(1, 2, 0);
				var b = new Vector3(1, 2, 0);

				expect(a.dot(b)).toEqual(5);
				expect(Vector3.dot(a, b)).toEqual(5);
			});

			it('returns garbage if supplied with garbage', function () {
				expect(Vector3.dot([1, 2], [5])).toEqual(NaN);
			});
		});

		describe('dotVector', function () {
			it('can calculate dot products', function () {
				var a = new Vector3(1, 2, 0);
				var b = new Vector3(1, 2, 0);

				expect(a.dotVector(b)).toEqual(5);
			});
		});

		describe('cross', function () {
			it('can calculate cross products', function () {
				var a = new Vector3(3, 2, 1);
				var b = new Vector3(3, 2, 1);
				var c = new Vector3(1, 2, 3);

				a.cross(c);

				expect(a).toBeCloseToVector(new Vector3(4, -8, 4));
				expect(Vector3.cross(b, c)).toBeCloseToVector(new Vector3(4, -8, 4));
			});

			it('can calculate cross products of two vectors given as arrays', function () {
				expect(Vector3.cross([3, 2, 1], [1, 2, 3])).toBeCloseToVector(new Vector3(4, -8, 4));
			});
		});

		describe('reflect', function () {
			it('can reflect a vector', function () {
				var plane = new Vector3(-1, 0, 1).normalize();
				var original = new Vector3(1, 0, 0);
				var reflection = original.clone().reflect(plane);

				expect(reflection).toBeCloseToVector(new Vector3(0, 0, 1));
			});
		});

		it('can calculate the distance', function () {
			var a = new Vector3(3, 2, 1);
			var b = new Vector3(1, 2, 3);

			var dist = a.distanceSquared(b);

			expect(dist).toEqual(8);
		});

		it('can be normalized', function () {
			var a = new Vector3();

			a.set(0, 0, 0).normalize();
			expect(a.x).toBeCloseTo(0);
			expect(a.y).toBeCloseTo(0);
			expect(a.z).toBeCloseTo(0);

			a.set(1, 1, 1).normalize();
			expect(a.x).toBeCloseTo(1/Math.sqrt(3));
			expect(a.y).toBeCloseTo(1/Math.sqrt(3));
			expect(a.z).toBeCloseTo(1/Math.sqrt(3));

			a.set(12, 34, 56).normalize();
			expect(a.x).toBeCloseTo(12/Math.sqrt(12*12+34*34+56*56));
			expect(a.y).toBeCloseTo(34/Math.sqrt(12*12+34*34+56*56));
			expect(a.z).toBeCloseTo(56/Math.sqrt(12*12+34*34+56*56));
		});

		describe('copy', function () {
			it('can copy values from a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.setVector(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(55, 66, 77));
			});
		});

		it('can be cloned', function () {
			var a = new Vector3(1, 2, 3);
			var b = a.clone();
			expect(a).toBeCloseToVector(b);
			expect(a === b).toEqual(false);
			expect(b).toEqual(jasmine.any(Vector3));
		});


		describe('setd (deprecated)', function () {
			it('can set a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.setd(55, 66, 77);
				expect(vector).toBeCloseToVector(new Vector3(55, 66, 77));
			});
		});

		describe('seta (deprecated)', function () {
			it('can set a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.seta([55, 66, 77]);
				expect(vector).toBeCloseToVector(new Vector3(55, 66, 77));
			});
		});

		describe('setv (deprecated)', function () {
			it('can set a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.setv(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(55, 66, 77));
			});
		});


		describe('setDirect', function () {
			it('can set a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.setDirect(55, 66, 77);
				expect(vector).toBeCloseToVector(new Vector3(55, 66, 77));
			});
		});

		describe('setArray', function () {
			it('can set a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.setArray([55, 66, 77]);
				expect(vector).toBeCloseToVector(new Vector3(55, 66, 77));
			});
		});

		describe('setVector', function () {
			it('can set a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.setVector(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(55, 66, 77));
			});
		});


		describe('add_d (deprecated)', function () {
			it('can add to a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.add_d(55, 66, 77);
				expect(vector).toBeCloseToVector(new Vector3(11 + 55, 22 + 66, 33 + 77));
			});
		});

		describe('addv (deprecated)', function () {
			it('can add to a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.addv(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(11 + 55, 22 + 66, 33 + 77));
			});
		});

		describe('static addv (deprecated)', function () {
			it('can add to a vector', function () {
				var vector1 = new Vector3(11, 22, 33);
				var vector2 = new Vector3(55, 66, 77);
				var result = new Vector3();

				var addOver1 = Vector3.addv(vector1, vector2, result);
				expect(result).toBeCloseToVector(new Vector3(11 + 55, 22 + 66, 33 + 77));
				expect(addOver1).toBe(result);

				var addOver2 = Vector3.addv(vector1, vector2);
				expect(addOver2).toBeCloseToVector(new Vector3(11 + 55, 22 + 66, 33 + 77));
			});
		});


		describe('addDirect', function () {
			it('can add to a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.addDirect(55, 66, 77);
				expect(vector).toBeCloseToVector(new Vector3(11 + 55, 22 + 66, 33 + 77));
			});
		});

		describe('addVector', function () {
			it('can add to a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.addVector(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(11 + 55, 22 + 66, 33 + 77));
			});
		});


		describe('muld (deprecated)', function () {
			it('can multiply with 3 numbers', function () {
				var vector = new Vector3(11, 22, 33);
				vector.muld(55, 66, 77);
				expect(vector).toBeCloseToVector(new Vector3(11 * 55, 22 * 66, 33 * 77));
			});
		});

		describe('mulv (deprecated)', function () {
			it('can multiply with a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.mulv(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(11 * 55, 22 * 66, 33 * 77));
			});
		});


		describe('mulDirect', function () {
			it('can multiply with 3 numbers', function () {
				var vector = new Vector3(11, 22, 33);
				vector.mulDirect(55, 66, 77);
				expect(vector).toBeCloseToVector(new Vector3(11 * 55, 22 * 66, 33 * 77));
			});
		});

		describe('mulVector', function () {
			it('can multiply with a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.mulVector(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(11 * 55, 22 * 66, 33 * 77));
			});
		});


		describe('sub_d (deprecated)', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.sub_d(55, 66, 77);
				expect(vector).toBeCloseToVector(new Vector3(11 - 55, 22 - 66, 33 - 77));
			});
		});

		describe('subv (deprecated)', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.subv(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(11 - 55, 22 - 66, 33 - 77));
			});
		});

		describe('static subv (deprecated)', function () {
			it('can subtract from a vector', function () {
				var vector1 = new Vector3(11, 22, 33);
				var vector2 = new Vector3(55, 66, 77);
				var result = new Vector3();

				var addOver1 = Vector3.subv(vector1, vector2, result);
				expect(result).toBeCloseToVector(new Vector3(11 - 55, 22 - 66, 33 - 77));
				expect(addOver1).toBe(result);

				var addOver2 = Vector3.subv(vector1, vector2);
				expect(addOver2).toBeCloseToVector(new Vector3(11 - 55, 22 - 66, 33 - 77));
			});
		});


		describe('subDirect', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.subDirect(55, 66, 77);
				expect(vector).toBeCloseToVector(new Vector3(11 - 55, 22 - 66, 33 - 77));
			});
		});

		describe('subVector', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.subVector(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(11 - 55, 22 - 66, 33 - 77));
			});
		});

		describe('NaN checks (only in dev)', function () {
			it('throws an exception when trying to set a vector component to NaN', function () {
				var vector1 = new Vector3();
				expect(function () { vector1.z = NaN; })
					.toThrow(new Error('Tried setting NaN to vector component z'));

				var vector2 = new Vector3();
				expect(function () { vector2[1] = NaN; })
					.toThrow(new Error('Tried setting NaN to vector component 1'));
			});

			it('throws an exception when trying to corrupt a vector by using methods', function () {
				var vector1 = new Vector3();
				expect(function () { vector1.add(NaN); })
					.toThrow(new Error('Vector contains NaN at index 0'));

				var vector2 = new Vector3();
				expect(function () { vector2.addDirect(); })
					.toThrow(new Error('Vector contains NaN at index 0'));

				var vector3 = new Vector3();
				expect(function () { vector3.scale(); })
					.toThrow(new Error('Vector contains NaN at index 0'));
			});
			
			it('throws an exception when a corrupt vector would return NaN', function () {
				var vector = new Vector3();
				// manually corrupting this vector
				// this is the only non-traceable way
				vector.data[0] = NaN;
				expect(function () { vector.lengthSquared(); })
					.toThrow(new Error('Vector method lengthSquared returned NaN'));
			});
		});
	});
});

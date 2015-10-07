define([
	'goo/math/Vector3',
	'goo/math/Matrix3',
	'goo/math/Matrix4',
	'test/CustomMatchers'
], function (
	Vector3,
	Matrix3,
	Matrix4,
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

			it('creates a vector when given 3 parameters', function () {
				var vector = new Vector3(11, 22, 33);
				var expected = new Vector3();

				expected.x = 11;
				expected.y = 22;
				expected.z = 33;

				expect(vector).toBeCloseToVector(expected);
			});

			it('creates a vector when given an array', function () {
				var vector = new Vector3([1, 2, 3]);
				var expected = new Vector3(1, 2, 3);

				expect(vector).toBeCloseToVector(expected);
			});

			it('creates a vector when given a vector', function () {
				var original = new Vector3(1, 2, 3);
				var vector = new Vector3(original);
				var expected = new Vector3(1, 2, 3);

				expect(vector).toBeCloseToVector(expected);
			});
		});

		describe('indices', function () {
			it('can be accessed through indices (debug only)', function () {
				var a = new Vector3(11, 22, 33);

				expect(function () { a[0]; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
				expect(function () { a[1]; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
				expect(function () { a[2]; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
			});

			it('can be modified through indices (debug only)', function () {
				var a = new Vector3();

				expect(function () { a[0] = 11; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
				expect(function () { a[1] = 22; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
				expect(function () { a[2] = 33; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
			});
		});

		describe('aliases', function () {
			it('can be accessed through aliases', function () {
				var vector = new Vector3(11, 22, 33);

				expect(vector.x).toBeCloseTo(11);
				expect(vector.y).toBeCloseTo(22);
				expect(vector.z).toBeCloseTo(33);

				expect(vector.u).toBeCloseTo(11);
				expect(vector.v).toBeCloseTo(22);
				expect(vector.w).toBeCloseTo(33);

				expect(vector.r).toBeCloseTo(11);
				expect(vector.g).toBeCloseTo(22);
				expect(vector.b).toBeCloseTo(33);
			});

			it('can be modified through aliases', function () {
				var vector = new Vector3();

				vector.x = 11;
				vector.y = 22;
				vector.z = 33;

				expect(vector).toBeCloseToVector(new Vector3(11, 22, 33));

				vector.u = 22;
				vector.v = 33;
				vector.w = 44;

				expect(vector).toBeCloseToVector(new Vector3(22, 33, 44));

				vector.r = 33;
				vector.g = 44;
				vector.b = 55;

				expect(vector).toBeCloseToVector(new Vector3(33, 44, 55));
			});
		});

		describe('set', function () {
			it('can set a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.set(new Vector3(55, 66, 77));
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


		describe('add', function () {
			it('can add to a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.add(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(11 + 55, 22 + 66, 33 + 77));
			});
		});

		describe('addDirect', function () {
			it('can add to a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.addDirect(55, 66, 77);
				expect(vector).toBeCloseToVector(new Vector3(11 + 55, 22 + 66, 33 + 77));
			});
		});


		describe('sub', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.sub(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(11 - 55, 22 - 66, 33 - 77));
			});
		});

		describe('subDirect', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.subDirect(55, 66, 77);
				expect(vector).toBeCloseToVector(new Vector3(11 - 55, 22 - 66, 33 - 77));
			});
		});


		describe('negate', function () {
			it('negates a vector', function () {
				var vector = new Vector3(123, 345, -567);
				vector.negate();
				expect(vector).toBeCloseToVector(new Vector3(-123, -345, 567));
			});
		});


		describe('mul', function () {
			it('can multiply with a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.mul(new Vector3(55, 66, 77));
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


		describe('scale', function () {
			it('scales a vector', function () {
				var vector = new Vector3(1, 2, 3);
				vector.scale(123);
				expect(vector).toBeCloseToVector(new Vector3(1 * 123, 2 * 123, 3 * 123));
			});
		});

		describe('dot', function () {
			it('can calculate dot products', function () {
				var a = new Vector3(1, 2, 0);
				var b = new Vector3(1, 2, 0);

				expect(a.dot(b)).toEqual(5);
			});
		});

		describe('cross', function () {
			it('can calculate cross products', function () {
				var a = new Vector3(3, 2, 1);
				var b = new Vector3(1, 2, 3);

				a.cross(b);

				expect(a).toBeCloseToVector(new Vector3(4, -8, 4));
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

		describe('normalize', function () {
			it('can be normalized', function () {
				var v1 = new Vector3(0, 0, 0);
				v1.normalize();
				expect(v1).toBeCloseToVector(new Vector3(0, 0, 0));

				var v2 = new Vector3(1, 1, 1);
				v2.normalize();
				expect(v2).toBeCloseToVector(new Vector3(
					1 / Math.sqrt(3),
					1 / Math.sqrt(3),
					1 / Math.sqrt(3)
				));

				var v3 = new Vector3(12, 34, 56);
				v3.normalize();
				expect(v3).toBeCloseToVector(new Vector3(
					12 / Math.sqrt(12 * 12 + 34 * 34 + 56 * 56),
					34 / Math.sqrt(12 * 12 + 34 * 34 + 56 * 56),
					56 / Math.sqrt(12 * 12 + 34 * 34 + 56 * 56)
				));
			});
		});

		describe('applyPost', function () {
			it('can transformed by a Matrix3', function () {
				var vector = new Vector3(1, 2, 3);
				var matrix = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);

				expect(vector.applyPost(matrix)).toBeCloseToVector(new Vector3(30, 36, 42));
			});
		});

		describe('applyPostPoint', function () {
			it('can transform three-dimensional vectors', function () {
				var vector = new Vector3(1, 2, 3);
				var matrix = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

				expect(vector.applyPostPoint(matrix)).toBeCloseToVector(new Vector3(51, 58, 65));
			});
		});

		describe('applyPostVector', function () {
			it('can transform three-dimensional normals', function () {
				var vector = new Vector3(1, 2, 3);
				var matrix = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

				expect(vector.applyPostVector(matrix)).toBeCloseToVector(new Vector3(38, 44, 50));
			});
		});

		describe('copy', function () {
			it('can copy values from a vector', function () {
				var vector = new Vector3(11, 22, 33);
				vector.set(new Vector3(55, 66, 77));
				expect(vector).toBeCloseToVector(new Vector3(55, 66, 77));
			});
		});

		describe('clone', function () {
			it('clones a vector', function () {
				var original = new Vector3(11, 22, 33);
				var clone = original.clone();

				expect(original).toBeCloseToVector(clone);
				expect(original).not.toBe(clone);
			});
		});

		describe('NaN checks (only in dev)', function () {
			it('throws an exception when trying to set a vector component to NaN', function () {
				var vector1 = new Vector3();
				expect(function () { vector1.z = NaN; })
					.toThrow(new Error('Tried setting NaN to vector component z'));

				//var vector2 = new Vector3();
				//expect(function () { vector2[1] = NaN; })
				//	.toThrow(new Error('Tried setting NaN to vector component 1'));
			});

			it('throws an exception when trying to corrupt a vector by using methods', function () {
				var vector1 = new Vector3();
				expect(function () { vector1.add(NaN); })
					.toThrow(new Error('Tried setting NaN to vector component x'));

				var vector2 = new Vector3();
				expect(function () { vector2.addDirect(); })
					.toThrow(new Error('Tried setting NaN to vector component x'));

				var vector3 = new Vector3();
				expect(function () { vector3.scale(); })
					.toThrow(new Error('Tried setting NaN to vector component x'));
			});

			it('throws an exception when a corrupt vector would return NaN', function () {
				var vector = new Vector3();
				// manually corrupting this vector
				// this is the only non-traceable way
				vector._x = NaN;
				expect(function () { vector.lengthSquared(); })
					.toThrow(new Error('Vector method lengthSquared returned NaN'));
			});
		});

		describe('fromArray', function () {
			it('creates a Vector3 from an array', function () {
				expect(Vector3.fromArray([11, 22, 33]))
					.toBeCloseToVector(new Vector3(11, 22, 33));
			});
		});

		describe('fromAny', function () {
			it('creates a Vector3 from 3 numbers', function () {
				expect(Vector3.fromAny(11, 22, 33))
					.toBeCloseToVector(new Vector3(11, 22, 33));
			});

			it('creates a Vector3 from an array of 3 numbers', function () {
				expect(Vector3.fromAny([11, 22, 33]))
					.toBeCloseToVector(new Vector3(11, 22, 33));
			});

			it('creates a Vector3 from an { x, y, z } object', function () {
				expect(Vector3.fromAny({ x: 11, y: 22, z: 33 }))
					.toBeCloseToVector(new Vector3(11, 22, 33));
			});

			it('clones a Vector3', function () {
				var original = new Vector3(11, 22, 33);
				var clone = Vector3.fromAny(original);

				expect(clone).toBeCloseToVector(original);
				expect(clone).not.toBe(original);
			});
		});

		describe('deprecated shim added 2015-10-07 (v1.0)', function () {
			describe('.data', function () {
				it('has working getters', function () {
					var v = new Vector3(1, 2, 3);
					expect(v.data[0]).toEqual(1);
					expect(v.data[1]).toEqual(2);
					expect(v.data[2]).toEqual(3);
				});

				it('has working setters', function () {
					var v = new Vector3();
					v.data[0] = 1;
					v.data[1] = 2;
					v.data[2] = 3;
					expect(v.x).toEqual(1);
					expect(v.y).toEqual(2);
					expect(v.z).toEqual(3);
				});

				it('distinguishes vectors', function () {
					var u = new Vector3(1, 2, 3);
					var v = new Vector3(4, 5, 6);
					expect(u.data[0]).toEqual(1);
					expect(v.data[0]).toEqual(4);
				});
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

			describe('clone', function () {
				it('clones a vector', function () {
					var original = new Vector3(11, 22, 33);
					var clone = original.clone();

					expect(original).toBeCloseToVector(clone);
					expect(original).not.toBe(clone);
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
		});
	});
});

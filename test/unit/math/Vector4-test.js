var Vector4 = require('src/goo/math/Vector4');
var Matrix4 = require('src/goo/math/Matrix4');
var CustomMatchers = require('test/unit/CustomMatchers');

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
				var vector = new Vector4([1, 2, 3, 4]);
				var expected = new Vector4(1, 2, 3, 4);

				expect(vector).toBeCloseToVector(expected);
			});

			it('creates a vector when given a vector', function () {
				var original = new Vector4(1, 2, 3, 4);
				var vector = new Vector4(original);
				var expected = new Vector4(1, 2, 3, 4);

				expect(vector).toBeCloseToVector(expected);
			});
		});

		describe('indices', function () {
			it('can be accessed through indices (debug only)', function () {
				var a = new Vector4(11, 22, 33, 44);

				expect(function () { a[0]; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
				expect(function () { a[1]; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
				expect(function () { a[2]; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
				expect(function () { a[3]; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
			});

			it('can be modified through indices (debug only)', function () {
				var a = new Vector4();

				expect(function () { a[0] = 11; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
				expect(function () { a[1] = 22; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
				expect(function () { a[2] = 33; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
				expect(function () { a[3] = 44; })
					.toThrow(new Error('Vector component access through indices is not supported anymore'));
			});
		});

		describe('aliases', function () {
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

				expect(a).toBeCloseToVector(new Vector4(1, 2, 3, 4));

				a.r = 2;
				a.g = 3;
				a.b = 4;
				a.a = 5;

				expect(a).toBeCloseToVector(new Vector4(2, 3, 4, 5));
			});
		});

		describe('scale', function () {
			it('scales a vector', function () {
				var vector = new Vector4(1, 2, 3, 4);
				vector.scale(123);
				expect(vector).toBeCloseToVector(new Vector4(1 * 123, 2 * 123, 3 * 123, 4 * 123));
			});
		});

		describe('dot', function () {
			it('can calculate dot products', function () {
				var a = new Vector4(1, 2, 3, 4);
				var b = new Vector4(2, 3, 4, 5);

				expect(a.dot(b)).toEqual(40);
			});
		});

		it('can linearly interpolate', function () {
			var a = new Vector4(0, 0, 0, 0);
			var b = new Vector4(1, 1, 1, 1);

			expect(a.lerp(b, 0.0)).toBeCloseToVector(new Vector4(0, 0, 0, 0));
			expect(a.lerp(b, 1.0)).toBeCloseToVector(new Vector4(1, 1, 1, 1));
			a.setDirect(0, 0, 0, 0);
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

		describe('set', function () {
			it('can set a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.set(new Vector4(55, 66, 77, 88));
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

		describe('add', function () {
			it('can add to a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.add(new Vector4(55, 66, 77, 88));
				expect(vector).toBeCloseToVector(new Vector4(11 + 55, 22 + 66, 33 + 77, 44 + 88));
			});
		});


		describe('subDirect', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.subDirect(55, 66, 77, 88);
				expect(vector).toBeCloseToVector(new Vector4(11 - 55, 22 - 66, 33 - 77, 44 - 88));
			});
		});

		describe('sub', function () {
			it('can subtract from a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.sub(new Vector4(55, 66, 77, 88));
				expect(vector).toBeCloseToVector(new Vector4(11 - 55, 22 - 66, 33 - 77, 44 - 88));
			});
		});


		describe('mulDirect', function () {
			it('can multiply with 4 numbers', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.mulDirect(55, 66, 77, 88);
				expect(vector).toBeCloseToVector(new Vector4(11 * 55, 22 * 66, 33 * 77, 44 * 88));
			});
		});

		describe('mul', function () {
			it('can multiply with a vector', function () {
				var vector = new Vector4(11, 22, 33, 44);
				vector.mul(new Vector4(55, 66, 77, 88));
				expect(vector).toBeCloseToVector(new Vector4(11 * 55, 22 * 66, 33 * 77, 44 * 88));
			});
		});

		describe('applyPre', function () {
			it('can transform four-dimensional vectors (y = (x*M)^T)', function () {
				var vector = new Vector4(1, 2, 3, 4);
				var matrix = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

				expect(vector.applyPre(matrix)).toBeCloseToVector(new Vector4(30, 70, 110, 150));
			});
		});

		describe('applyPost', function () {
			it('can transform four-dimensional vectors (y = M*x)', function () {
				var vector = new Vector4(1, 2, 3, 4);
				var matrix = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

				expect(vector.applyPost(matrix)).toBeCloseToVector(new Vector4(90, 100, 110, 120));
			});
		});

		describe('fromArray', function () {
			it('creates a Vector4 from an array', function () {
				expect(Vector4.fromArray([11, 22, 33, 44]))
					.toBeCloseToVector(new Vector4(11, 22, 33, 44));
			});
		});

		describe('fromAny', function () {
			it('creates a Vector4 from 4 numbers', function () {
				expect(Vector4.fromAny(11, 22, 33, 44))
					.toBeCloseToVector(new Vector4(11, 22, 33, 44));
			});

			it('creates a Vector4 from an array of 4 numbers', function () {
				expect(Vector4.fromAny([11, 22, 33, 44]))
					.toBeCloseToVector(new Vector4(11, 22, 33, 44));
			});

			it('creates a Vector4 from an { x, y, z } object', function () {
				expect(Vector4.fromAny({ x: 11, y: 22, z: 33, w: 44 }))
					.toBeCloseToVector(new Vector4(11, 22, 33, 44));
			});

			it('clones a Vector4', function () {
				var original = new Vector4(11, 22, 33, 44);
				var clone = Vector4.fromAny(original);

				expect(clone).toBeCloseToVector(original);
				expect(clone).not.toBe(original);
			});
		});

		describe('toArray', function () {
			it('converts to array', function () {
				expect(Vector4.fromArray([1, 2, 3, 4]).toArray()).toEqual([1, 2, 3, 4]);
			});
		});

		describe('deprecated shim added 2015-10-07 (v1.0)', function () {
			describe('.data', function () {
				it('has working getters', function () {
					var v = new Vector4(1, 2, 3, 4);
					expect(v.data[0]).toEqual(1);
					expect(v.data[1]).toEqual(2);
					expect(v.data[2]).toEqual(3);
					expect(v.data[3]).toEqual(4);
				});

				it('has working setters', function () {
					var v = new Vector4();
					v.data[0] = 1;
					v.data[1] = 2;
					v.data[2] = 3;
					v.data[3] = 4;
					expect(v.x).toEqual(1);
					expect(v.y).toEqual(2);
					expect(v.z).toEqual(3);
					expect(v.w).toEqual(4);
				});

				it('distinguishes vectors', function () {
					var u = new Vector4(1, 2, 3, 4);
					var v = new Vector4(5, 6, 7, 8);
					expect(u.data[0]).toEqual(1);
					expect(v.data[0]).toEqual(5);
				});
			});

			describe('add', function () {
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
			});

			describe('sub', function () {
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
			});

			describe('mul', function () {
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
			});

			describe('scale', function () {
				it('scales a vector', function () {
					var vector = new Vector4(1, 2, 3, 4);
					vector.scale(123);
					expect(vector).toBeCloseToVector(new Vector4(1 * 123, 2 * 123, 3 * 123, 4 * 123));
				});
			});

			describe('div', function () {
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

			describe('setDirect', function () {
				it('can set a vector', function () {
					var vector = new Vector4(11, 22, 33, 44);
					vector.setDirect(55, 66, 77, 88);
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

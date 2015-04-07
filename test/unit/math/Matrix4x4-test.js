define([
	'goo/math/Matrix4x4', 
	'goo/math/Vector3', 
	'goo/math/Vector4', 
	'goo/math/Quaternion',
	'test/CustomMatchers'
], function (
	Matrix4x4, 
	Vector3, 
	Vector4, 
	Quaternion,
	CustomMatchers
	) {
	'use strict';

	describe('Matrix4x4', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		describe('constructor', function () {
			it('creates an identity matrix when given no parameters', function () {
				expect(new Matrix4x4()).toBeCloseToMatrix(Matrix4x4.IDENTITY);
			});

			it('creates a matrix when given 9 parameters', function () {
				var matrix = new Matrix4x4(11, 22, 33, 44, 55, 66, 77, 88, 99, 110, 121, 132, 143, 154, 165, 176);
				var expected = new Matrix4x4();

				for (var i = 0; i < 16; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(matrix).toBeCloseToMatrix(expected);
			});

			it('creates a matrix when given an array', function () {
				var matrix = new Matrix4x4([11, 22, 33, 44, 55, 66, 77, 88, 99, 110, 121, 132, 143, 154, 165, 176]);
				var expected = new Matrix4x4();

				for (var i = 0; i < 16; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(matrix).toBeCloseToMatrix(expected);
			});

			it('creates a matrix when given a matrix', function () {
				var original = new Matrix4x4();
				for (var i = 0; i < 16; i++) {
					original.data[i] = (i + 1) * 11;
				}

				var matrix = new Matrix4x4(original);

				var expected = new Matrix4x4();

				for (var i = 0; i < 16; i++) {
					expected.data[i] = (i + 1) * 11;
				}

				expect(matrix).toBeCloseToMatrix(expected);
			});
		});

		// bad idea to use the same data in both matrices
		xit('can combine multiple matrices into a single matrix', function () {
			var a = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
			var b = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			a.combine(a);

			expect(a).toBeCloseToMatrix(new Matrix4x4(90, 100, 110, 120, 202, 228, 254, 280, 314, 356, 398, 440, 426, 484, 542, 600));
		});

		it('can be transposed', function () {
			var a = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			a.transpose();

			expect(a).toBeCloseToMatrix(new Matrix4x4(1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16));
		});

		it('can be inverted', function () {
			var a = new Matrix4x4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
			var c = new Matrix4x4(0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);

			a.invert();

			expect(a).toBeCloseToMatrix(new Matrix4x4(-0.5, 1, -1.5, -0.5, 0, 0.5, -0.5, -0.5, 0.5, 0, 0.5, 0.5, 0.5, 0, -0.5, 0.5));
			expect(c.invert()).toBeCloseToMatrix(c);
		});

		it('can determine orthogonality', function () {
			var a = new Matrix4x4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
			var b = new Matrix4x4(0, -1, 0, 0, 1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

			expect(a.isOrthogonal()).toBeFalsy();
			expect(b.isOrthogonal()).toBeTruthy();
		});

		it('can determine normality', function () {
			var a = new Matrix4x4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
			var b = new Matrix4x4(0, -1, 0, 0, 1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

			expect(a.isNormal()).toBeFalsy();
			expect(b.isNormal()).toBeTruthy();
		});

		it('can determine orthonormality', function () {
			var a = new Matrix4x4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
			var b = new Matrix4x4(0, -1, 0, 0, 1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

			expect(a.isOrthonormal()).toBeFalsy();
			expect(b.isOrthonormal()).toBeTruthy();
		});

		it('can compute determinants', function () {
			var a = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(a.determinant()).toEqual(0);
		});

		it('can be set to identity', function () {
			var a = new Matrix4x4();
			var b = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			b.setIdentity();

			expect(a).toBeCloseToMatrix(Matrix4x4.IDENTITY);
			expect(b).toBeCloseToMatrix(Matrix4x4.IDENTITY);
		});

		it('can be set from a vector of angles', function () {
			var a = 1.0 / Math.sqrt(2.0);

			expect(new Matrix4x4().setRotationFromVector(new Vector3(0, Math.PI/4, 0))).toBeCloseToMatrix(new Matrix4x4(a, 0, -a, 0, 0, 1, 0, 0, a, 0, a, 0, 0, 0, 0, 1));
		});

		it('can be set from a quaternion', function () {
			var a = 1.0 / Math.sqrt(2.0);

			expect(new Matrix4x4().setRotationFromQuaternion(new Quaternion(0.0, Math.sin(Math.PI/8), 0.0, Math.cos(Math.PI/8)))).toBeCloseToMatrix(new Matrix4x4(a, 0, -a, 0, 0, 1, 0, 0, a, 0, a, 0, 0, 0, 0, 1));
		});

		it('can set the translation part', function () {
			expect(new Matrix4x4().setTranslation(new Vector3(1, 2, 3))).toBeCloseToMatrix(new Matrix4x4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1));
		});

		it('can set the scale part', function () {
			expect(new Matrix4x4().setScale(new Vector3(1, 2, 3))).toBeCloseToMatrix(new Matrix4x4(1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1));
		});

		it('can transform four-dimensional vectors (y = (x*M)^T)', function () {
			var a = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(a.applyPre(new Vector4(1, 2, 3, 4))).toBeCloseToVector(new Vector4(30, 70, 110, 150));
		});

		it('can transform four-dimensional vectors (y = M*x)', function () {
			var a = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(a.applyPost(new Vector4(1, 2, 3, 4))).toBeCloseToVector(new Vector4(90, 100, 110, 120));
		});

		it('can transform three-dimensional vectors', function () {
			var a = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(a.applyPostPoint(new Vector3(1, 2, 3))).toBeCloseToVector(new Vector3(51, 58, 65));
		});

		it('can transform three-dimensional normals', function () {
			var a = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(a.applyPostVector(new Vector3(1, 2, 3))).toBeCloseToVector(new Vector3(38, 44, 50));
		});

		describe('add', function () {
			it('can add two matrices component-wise', function () {
				var a = new Matrix4x4(
					1, 2, 3, 4,
					5, 6, 7, 8,
					9, 10, 11, 12,
					13, 14, 15, 16
				);

				var b = new Matrix4x4(
					2, 3, 5, 7,
					11, 13, 17, 19,
					23, 29, 31, 37,
					41, 43, 47, 53
				);

				expect(a.add(b)).toBeCloseToMatrix(new Matrix4x4(
					1 + 2,
					2 + 3,
					3 + 5,
					4 + 7,
					5 + 11,
					6 + 13,
					7 + 17,
					8 + 19,
					9 + 23,
					10 + 29,
					11 + 31,
					12 + 37,
					13 + 41,
					14 + 43,
					15 + 47,
					16 + 53
				));
			});
		});

		describe('sub', function () {
			it('can subtract two matrices component-wise', function () {
				var a = new Matrix4x4(
					1, 2, 3, 4,
					5, 6, 7, 8,
					9, 10, 11, 12,
					13, 14, 15, 16
				);

				var b = new Matrix4x4(
					2, 3, 5, 7,
					11, 13, 17, 19,
					23, 29, 31, 37,
					41, 43, 47, 53
				);

				expect(b.sub(a)).toBeCloseToMatrix(new Matrix4x4(
					2 - 1,
					3 - 2,
					5 - 3,
					7 - 4,
					11 - 5,
					13 - 6,
					17 - 7,
					19 - 8,
					23 - 9,
					29 - 10,
					31 - 11,
					37 - 12,
					41 - 13,
					43 - 14,
					47 - 15,
					53 - 16
				));
			});
		});

		describe('equals', function () {
			it('can be tested for approximate equaltiy', function () {
				var a = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
				var b = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
				var c = new Matrix4x4(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14);

				expect(a.equals(b)).toBe(true);
				expect(a.equals(c)).toBe(false);
			});

			it('preserves behaviour of comparing with NaN', function () {
				// 1 === NaN // false in JS, so (1, 2) === (1, NaN) should return the same
				var m1 = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
				var m2 = new Matrix4x4(1, 2, 3, NaN, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);

				expect(m1.equals(m2)).toBe(false);
			});
		});

		describe('copy', function () {
			it('can copy from another matrix', function () {
				var original = new Matrix4x4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160);
				var copy = new Matrix4x4(100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600);
				copy.copy(original);
				expect(copy).toBeCloseToMatrix(new Matrix4x4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160));
			});
		});

		describe('clone', function () {
			it('clones a matrix', function () {
				var original = new Matrix4x4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160);
				var clone = original.clone();

				expect(clone).toBeCloseToMatrix(new Matrix4x4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160));
				expect(clone).not.toBe(original);
			});
		});
	});
});

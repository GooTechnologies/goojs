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
		
		it('can combine multiple matrices into a single matrix', function () {
			var a = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
			var b = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			a.combine(a);

			expect(a).toBeCloseToMatrix(new Matrix4x4(90, 100, 110, 120, 202, 228, 254, 280, 314, 356, 398, 440, 426, 484, 542, 600));
			expect(Matrix4x4.combine(b, b)).toBeCloseToMatrix(new Matrix4x4(90, 100, 110, 120, 202, 228, 254, 280, 314, 356, 398, 440, 426, 484, 542, 600));
		});

		it('can be transposed', function () {
			var a = new Matrix4x4(0, -1, 0, 0, 1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);
			var b = new Matrix4x4(0, -1, 0, 0, 1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

			a.transpose();

			expect(a).toBeCloseToMatrix(new Matrix4x4(0, 1, 0, 0, -1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1));
			expect(Matrix4x4.transpose(b)).toBeCloseToMatrix(new Matrix4x4(0, 1, 0, 0, -1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1));
		});

		it('can be inverted', function () {
			var a = new Matrix4x4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
			var b = new Matrix4x4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
			var c = new Matrix4x4(0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);

			a.invert();

			expect(a).toBeCloseToMatrix(new Matrix4x4(-0.5, 1, -1.5, -0.5, 0, 0.5, -0.5, -0.5, 0.5, 0, 0.5, 0.5, 0.5, 0, -0.5, 0.5));
			expect(Matrix4x4.invert(b)).toBeCloseToMatrix(new Matrix4x4(-0.5, 1, -1.5, -0.5, 0, 0.5, -0.5, -0.5, 0.5, 0, 0.5, 0.5, 0.5, 0, -0.5, 0.5));
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
			var a = 1.0/Math.sqrt(2.0);

			expect(new Matrix4x4().setRotationFromVector(new Vector3(0, Math.PI/4, 0))).toBeCloseToMatrix(new Matrix4x4(a, 0, -a, 0, 0, 1, 0, 0, a, 0, a, 0, 0, 0, 0, 1));
		});

		it('can be set from a quaternion', function () {
			var a = 1.0/Math.sqrt(2.0);

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

		it('can add two matrices component-wise', function () {
			var a = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(Matrix4x4.add(a, a)).toBeCloseToMatrix(Matrix4x4.mul(a, 2));
		});

		it('can add a scalar to all components of a matrix', function () {
			var a = new Matrix4x4(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);

			expect(Matrix4x4.add(a, 1)).toBeCloseToMatrix(Matrix4x4.mul(a, 2));
		});

		it('can subtract two matrices component-wise', function () {
			var a = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(Matrix4x4.sub(a, a)).toBeCloseToMatrix(Matrix4x4.mul(a, 0));
		});

		it('can subtract a scalar to all components of a matrix', function () {
			var a = new Matrix4x4(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);

			expect(Matrix4x4.sub(a, 1)).toBeCloseToMatrix(Matrix4x4.mul(a, 0));
		});

		it('can multiply two matrices component-wise', function () {
			var a = new Matrix4x4(2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2);

			expect(Matrix4x4.mul(a, a)).toBeCloseToMatrix(Matrix4x4.mul(a, 2));
		});

		it('can divide two matrices component-wise', function () {
			var a = new Matrix4x4(2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2);

			expect(Matrix4x4.div(a, a)).toBeCloseToMatrix(Matrix4x4.div(a, 2));
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
			it('can clone to another matrix', function () {
				var original = new Matrix4x4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160);
				var clone = original.clone();

				expect(clone).not.toBe(original);
				expect(clone).toBeCloseToMatrix(new Matrix4x4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160));
			});
		});
	});
});

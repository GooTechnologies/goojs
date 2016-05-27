var Quaternion = require('../../../src/goo/math/Quaternion');
var Matrix3 = require('../../../src/goo/math/Matrix3');
var Matrix4 = require('../../../src/goo/math/Matrix4');
var Vector3 = require('../../../src/goo/math/Vector3');
var Vector4 = require('../../../src/goo/math/Vector4');
var CustomMatchers = require('../../../test/unit/CustomMatchers');

describe('Matrix4', function () {
	beforeEach(function () {
		jasmine.addMatchers(CustomMatchers);
	});

	describe('constructor', function () {
		it('creates an identity matrix when given no parameters', function () {
			expect(new Matrix4()).toBeCloseToMatrix(Matrix4.IDENTITY);
		});

		it('creates a matrix when given 9 parameters', function () {
			var matrix = new Matrix4(11, 22, 33, 44, 55, 66, 77, 88, 99, 110, 121, 132, 143, 154, 165, 176);
			var expected = new Matrix4();

			for (var i = 0; i < 16; i++) {
				expected.data[i] = (i + 1) * 11;
			}

			expect(matrix).toBeCloseToMatrix(expected);
		});

		it('creates a matrix when given an array', function () {
			var matrix = new Matrix4([11, 22, 33, 44, 55, 66, 77, 88, 99, 110, 121, 132, 143, 154, 165, 176]);
			var expected = new Matrix4();

			for (var i = 0; i < 16; i++) {
				expected.data[i] = (i + 1) * 11;
			}

			expect(matrix).toBeCloseToMatrix(expected);
		});

		it('creates a matrix when given another matrix', function () {
			var expected = new Matrix4(11, 22, 33, 44, 55, 66, 77, 88, 99, 110, 121, 132, 143, 154, 165, 176);
			var matrix = new Matrix4(expected);

			expect(matrix).toBeCloseToMatrix(expected);
		});
	});


	it('can combine multiple matrices into a single matrix', function () {
		var a = new Matrix4(
			1, 2, 3, 4,
			5, 6, 7, 8,
			9, 10, 11, 12,
			13, 14, 15, 16
		);

		var b = new Matrix4(
			2, 3, 5, 7,
			11, 13, 17, 19,
			23, 29, 31, 37,
			41, 43, 47, 53
		);

		a.mul(b);

		expect(a).toBeCloseToMatrix(new Matrix4(
			153, 170, 187, 204,
			476, 536, 596, 656,
			928, 1048, 1168, 1288,
			1368, 1552, 1736, 1920
		));
	});

	it('can be transposed', function () {
		var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

		a.transpose();

		expect(a).toBeCloseToMatrix(new Matrix4(1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16));
	});

	it('can be inverted', function () {
		var a = new Matrix4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
		var c = new Matrix4(0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);

		a.invert();

		expect(a).toBeCloseToMatrix(new Matrix4(-0.5, 1, -1.5, -0.5, 0, 0.5, -0.5, -0.5, 0.5, 0, 0.5, 0.5, 0.5, 0, -0.5, 0.5));
		expect(c.invert()).toBeCloseToMatrix(c);
	});

	it('can determine orthogonality', function () {
		var a = new Matrix4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
		var b = new Matrix4(0, -1, 0, 0, 1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

		expect(a.isOrthogonal()).toBeFalsy();
		expect(b.isOrthogonal()).toBeTruthy();
	});

	it('can determine normality', function () {
		var a = new Matrix4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
		var b = new Matrix4(0, -1, 0, 0, 1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

		expect(a.isNormal()).toBeFalsy();
		expect(b.isNormal()).toBeTruthy();
	});

	it('can determine orthonormality', function () {
		var a = new Matrix4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
		var b = new Matrix4(0, -1, 0, 0, 1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

		expect(a.isOrthonormal()).toBeFalsy();
		expect(b.isOrthonormal()).toBeTruthy();
	});

	it('can compute determinants', function () {
		var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

		expect(a.determinant()).toEqual(0);
	});

	it('can be set to identity', function () {
		var a = new Matrix4();
		var b = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

		b.setIdentity();

		expect(a).toBeCloseToMatrix(Matrix4.IDENTITY);
		expect(b).toBeCloseToMatrix(Matrix4.IDENTITY);
	});

	it('can be set from a vector of angles', function () {
		var a = 1.0 / Math.sqrt(2.0);

		expect(new Matrix4().setRotationFromVector(new Vector3(0, Math.PI / 4, 0))).toBeCloseToMatrix(new Matrix4(a, 0, -a, 0, 0, 1, 0, 0, a, 0, a, 0, 0, 0, 0, 1));
	});

	it('can be set from a quaternion', function () {
		var a = 1.0 / Math.sqrt(2.0);

		expect(new Matrix4().setRotationFromQuaternion(new Quaternion(0.0, Math.sin(Math.PI / 8), 0.0, Math.cos(Math.PI / 8)))).toBeCloseToMatrix(new Matrix4(a, 0, -a, 0, 0, 1, 0, 0, a, 0, a, 0, 0, 0, 0, 1));
	});

	it('can set the translation part', function () {
		expect(new Matrix4().setTranslation(new Vector3(1, 2, 3))).toBeCloseToMatrix(new Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1));
	});

	it('can set the scale part', function () {
		expect(new Matrix4().setScale(new Vector3(1, 2, 3))).toBeCloseToMatrix(new Matrix4(1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1));
	});

	it('can set scale the matrix', function () {
		expect(new Matrix4().setScale(new Vector3(1, 2, 3)).scale(new Vector3(1, 2, 3))).toBeCloseToMatrix(new Matrix4(1, 0, 0, 0, 0, 4, 0, 0, 0, 0, 9, 0, 0, 0, 0, 1));
	});

	it('can get rotational part', function () {
		var original = new Matrix4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160);
		var rotation = new Matrix3();
		original.getRotation(rotation);
		expect(rotation).toBeCloseToMatrix(new Matrix3(10, 20, 30, 50, 60, 70, 90, 100, 110));
	});

	describe('decompose', function () {
		it('can decompose with translation', function () {
			var matrix = new Matrix4();
			matrix.setTranslation(new Vector3(1, 2, 3));

			var position = new Vector3();
			var rotation = new Matrix3();
			var scale = new Vector3();
			matrix.decompose(position, rotation, scale);

			expect(position).toBeCloseToVector(new Vector3(1, 2, 3));
			expect(rotation).toBeCloseToMatrix(new Matrix3());
			expect(scale).toBeCloseToVector(new Vector3(1, 1, 1));
		});

		it('can decompose with rotation', function () {
			var matrix = new Matrix4();
			matrix.setRotationFromVector(new Vector3(0, Math.PI / 4, 0));

			var position = new Vector3();
			var rotation = new Matrix3();
			var scale = new Vector3();
			matrix.decompose(position, rotation, scale);

			expect(position).toBeCloseToVector(new Vector3(0, 0, 0));
			var a = 1.0 / Math.sqrt(2.0);
			expect(rotation).toBeCloseToMatrix(new Matrix3(a, 0, -a, 0, 1, 0, a, 0, a));
			expect(scale).toBeCloseToVector(new Vector3(1, 1, 1));
		});

		it('can decompose with scale', function () {
			var matrix = new Matrix4();
			matrix.setScale(new Vector3(1, 2, 3));

			var position = new Vector3();
			var rotation = new Matrix3();
			var scale = new Vector3();
			matrix.decompose(position, rotation, scale);

			expect(position).toBeCloseToVector(new Vector3(0, 0, 0));
			expect(rotation).toBeCloseToMatrix(new Matrix3());
			expect(scale).toBeCloseToVector(new Vector3(1, 2, 3));
		});

		it('can decompose with rotation and translation', function () {
			var matrix = new Matrix4();
			matrix.setRotationFromVector(new Vector3(0, Math.PI / 4, 0));
			matrix.setTranslation(new Vector3(1, 2, 3));

			var position = new Vector3();
			var rotation = new Matrix3();
			var scale = new Vector3();
			matrix.decompose(position, rotation, scale);

			expect(position).toBeCloseToVector(new Vector3(1, 2, 3));
			var a = 1.0 / Math.sqrt(2.0);
			expect(rotation).toBeCloseToMatrix(new Matrix3(a, 0, -a, 0, 1, 0, a, 0, a));
			expect(scale).toBeCloseToVector(new Vector3(1, 1, 1));
		});
	});

	describe('add', function () {
		it('can add two matrices component-wise', function () {
			var a = new Matrix4(
				1, 2, 3, 4,
				5, 6, 7, 8,
				9, 10, 11, 12,
				13, 14, 15, 16
			);

			var b = new Matrix4(
				2, 3, 5, 7,
				11, 13, 17, 19,
				23, 29, 31, 37,
				41, 43, 47, 53
			);

			expect(a.add(b)).toBeCloseToMatrix(new Matrix4(
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
			var a = new Matrix4(
				1, 2, 3, 4,
				5, 6, 7, 8,
				9, 10, 11, 12,
				13, 14, 15, 16
			);

			var b = new Matrix4(
				2, 3, 5, 7,
				11, 13, 17, 19,
				23, 29, 31, 37,
				41, 43, 47, 53
			);

			expect(b.sub(a)).toBeCloseToMatrix(new Matrix4(
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
		it('can be tested for approximate equality', function () {
			var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
			var b = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
			var c = new Matrix4(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);

			expect(a.equals(b)).toBe(true);
			expect(a.equals(c)).toBe(false);
		});

		it('can be tested for equality', function () {
			var a = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
			var b = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
			var c = new Matrix4(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);

			expect(a.equals(b, 0)).toBe(true);
			expect(a.equals(c, 0)).toBe(false);
		});

		it('preserves behaviour of comparing with NaN', function () {
			// 1 === NaN // false in JS, so (1, 2) === (1, NaN) should return the same
			var m1 = new Matrix4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
			var m2 = new Matrix4(1, 2, 3, NaN, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

			expect(m1.equals(m2)).toBe(false);
		});
	});

	describe('copy', function () {
		it('can copy from another matrix', function () {
			var original = new Matrix4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160);
			var copy = new Matrix4(100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600);
			copy.copy(original);
			expect(copy).toBeCloseToMatrix(new Matrix4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160));
		});
	});

	describe('clone', function () {
		it('clones a matrix', function () {
			var original = new Matrix4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160);
			var clone = original.clone();

			expect(clone).toBeCloseToMatrix(new Matrix4(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160));
			expect(clone).not.toBe(original);
		});
	});
});
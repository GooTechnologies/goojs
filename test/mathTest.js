define(
[
	"goo/math/Vector",
	"goo/math/Vector2",
	"goo/math/Vector3",
	"goo/math/Vector4",
	"goo/math/Matrix",
	"goo/math/Matrix2x2",
	"goo/math/Matrix3x3",
	"goo/math/Matrix4x4"
], function(
	Vector,
	Vector2,
	Vector3,
	Vector4,
	Matrix,
	Matrix2x2,
	Matrix3x3,
	Matrix4x4
) {
	"use strict";

	describe("Vector", function() {
		var a = new Vector(2).set(2, 4);
		var b = new Vector(2).set(-3, -4);

		it("Vector.copy", function() {
			expect(Vector.copy(a)).toEqual(new Vector(2).set(2, 4));
		});

		it("Vector.add", function() {
			expect(Vector.add(a, a)).toEqual(new Vector(2).set(4, 8));
		});

		it("Vector.add", function() {
			expect(Vector.add(a, [1, 2])).toEqual(new Vector(2).set(3, 6));
		});

		it("Vector.sub", function() {
			expect(Vector.sub(a, a)).toEqual(new Vector(2).set(0, 0));
		});

		it("Vector.mul", function() {
			expect(Vector.mul(a, a)).toEqual(new Vector(2).set(4, 16));
		});

		it("Vector.div", function() {
			expect(Vector.div(a, a)).toEqual(new Vector(2).set(1, 1));
		});

		it("Vector.scalarAdd", function() {
			expect(Vector.scalarAdd(a, 2)).toEqual(new Vector(2).set(4, 6));
		});

		it("Vector.scalarSub", function() {
			expect(Vector.scalarSub(a, 2)).toEqual(new Vector(2).set(0, 2));
		});

		it("Vector.scalarMul", function() {
			expect(Vector.scalarMul(a, 2)).toEqual(new Vector(2).set(4, 8));
		});

		it("Vector.scalarDiv", function() {
			expect(Vector.scalarDiv(a, 2)).toEqual(new Vector(2).set(1, 2));
		});

		it("Vector.prototype.invert", function() {
			expect(b.invert()).toEqual(new Vector(2).set(3, 4));
		});

		it("Vector.prototype.length", function() {
			expect(b.length()).toEqual(5);
		});

		it("Vector.prototype.squareLength", function() {
			expect(b.squareLength()).toEqual(25);
		});

		it("Vector.prototype.normalize", function() {
			expect(b.normalize()).toEqual(new Vector(2).set(0.6, 0.8));
		});
	});

	describe("Vector2", function() {
		var a = new Vector2();

		it("Array access", function() {
			a[0] = 1;
			a[1] = 2;

			expect(a).toEqual(new Vector2(1, 2));
			expect(a[0]).toEqual(1);
			expect(a[1]).toEqual(2);
		});

		it("Component access", function() {
			a.x = 1;
			a.y = 2;

			expect(a).toEqual(new Vector2(1, 2));
			expect(a.x).toEqual(1);
			expect(a.y).toEqual(2);

			a.u = 2;
			a.v = 3;

			expect(a).toEqual(new Vector2(2, 3));
			expect(a.u).toEqual(2);
			expect(a.v).toEqual(3);

			a.s = 3;
			a.t = 4;

			expect(a).toEqual(new Vector2(3, 4));
			expect(a.s).toEqual(3);
			expect(a.t).toEqual(4);
		});
	});

	describe("Vector3", function() {
		var a = new Vector3(3, 2, 1);
		var b = new Vector3(1, 2, 3);

		it("Vector3.cross", function() {
			expect(Vector3.cross(a, b)).toEqual(new Vector3(4, -8, 4));
		});

		it("Array access", function() {
			a[0] = 1;
			a[1] = 2;
			a[2] = 3;

			expect(a).toEqual(new Vector3(1, 2, 3));
			expect(a[0]).toEqual(1);
			expect(a[1]).toEqual(2);
			expect(a[2]).toEqual(3);
		});

		it("Component access", function() {
			a.x = 1;
			a.y = 2;
			a.z = 3;

			expect(a).toEqual(new Vector3(1, 2, 3));
			expect(a.x).toEqual(1);
			expect(a.y).toEqual(2);
			expect(a.z).toEqual(3);

			a.r = 2;
			a.g = 3;
			a.b = 4;

			expect(a).toEqual(new Vector3(2, 3, 4));
			expect(a.r).toEqual(2);
			expect(a.g).toEqual(3);
			expect(a.b).toEqual(4);
		});

	});

	describe("Vector4", function() {
		var a = new Vector4();

		it("Array access", function() {
			a[0] = 1;
			a[1] = 2;
			a[2] = 3;
			a[3] = 4;

			expect(a).toEqual(new Vector4(1, 2, 3, 4));
			expect(a[0]).toEqual(1);
			expect(a[1]).toEqual(2);
			expect(a[2]).toEqual(3);
			expect(a[3]).toEqual(4);
		});

		it("Component access", function() {
			a.x = 1;
			a.y = 2;
			a.z = 3;
			a.w = 4;

			expect(a).toEqual(new Vector4(1, 2, 3, 4));
			expect(a.x).toEqual(1);
			expect(a.y).toEqual(2);
			expect(a.z).toEqual(3);
			expect(a.w).toEqual(4);

			a.r = 2;
			a.g = 3;
			a.b = 4;
			a.a = 5;

			expect(a).toEqual(new Vector4(2, 3, 4, 5));
			expect(a.r).toEqual(2);
			expect(a.g).toEqual(3);
			expect(a.b).toEqual(4);
			expect(a.a).toEqual(5);
		});
	});

	describe("Matrix", function() {
		var a = new Matrix(2, 2).set(2, 4, 6, 8);
		var b = new Matrix(2, 2).set(0, 1, -1, 0);

		it("Matrix.combine", function() {
			expect(Matrix.combine(a, a)).toEqual(new Matrix(2, 2).set(28, 40, 60, 88));
		});

		it("Matrix.copy", function() {
			expect(Matrix.copy(a)).toEqual(new Matrix(2, 2).set(2, 4, 6, 8));
		});

		it("Matrix.add", function() {
			expect(Matrix.add(a, a)).toEqual(new Matrix(2, 2).set(4, 8, 12, 16));
		});

		it("Matrix.sub", function() {
			expect(Matrix.sub(a, a)).toEqual(new Matrix(2, 2).set(0, 0, 0, 0));
		});

		it("Matrix.mul", function() {
			expect(Matrix.mul(a, a)).toEqual(new Matrix(2, 2).set(4, 16, 36, 64));
		});

		it("Matrix.div", function() {
			expect(Matrix.div(a, a)).toEqual(new Matrix(2, 2).set(1, 1, 1, 1));
		});

		it("Matrix.scalarAdd", function() {
			expect(Matrix.scalarAdd(a, 2)).toEqual(new Matrix(2, 2).set(4, 6, 8, 10));
		});

		it("Matrix.scalarSub", function() {
			expect(Matrix.scalarSub(a, 2)).toEqual(new Matrix(2, 2).set(0, 2, 4, 6));
		});

		it("Matrix.scalarMul", function() {
			expect(Matrix.scalarMul(a, 2)).toEqual(new Matrix(2, 2).set(4, 8, 12, 16));
		});

		it("Matrix.scalarDiv", function() {
			expect(Matrix.scalarDiv(a, 2)).toEqual(new Matrix(2, 2).set(1, 2, 3, 4));
		});

		it("Matrix.prototype.isOrthogonal", function() {
			expect(a.isOrthogonal()).toEqual(false);
			expect(b.isOrthogonal()).toEqual(true);
		});

		it("Matrix.prototype.isNormal", function() {
			expect(a.isNormal()).toEqual(false);
			expect(b.isNormal()).toEqual(true);
		});

		it("Matrix.prototype.isOrthonormal", function() {
			expect(a.isOrthonormal()).toEqual(false);
			expect(b.isOrthonormal()).toEqual(true);
		});

		it("Matrix.prototype.transpose", function() {
			expect(b.transpose()).toEqual(new Matrix(2, 2).set(0, -1, 1, 0));
		});

		it("Matrix.prototype.applyTo", function() {
			expect(a.applyTo(new Vector(1).set(2), 1)).toEqual(new Vector(1).set(10));
		});
	});

	describe("Matrix2x2", function() {
		var a = new Matrix2x2(1, 2, 3, 4);
		var b = new Matrix2x2(0, 1, -1, 0);

		it("Matrix2x2.combine", function() {
			expect(Matrix2x2.combine(a, a)).toEqual(new Matrix2x2(7, 10, 15, 22));
		});

		it("Matrix2x2.invert", function() {
			expect(Matrix2x2.invert(a)).toEqual(new Matrix2x2(-2, 1, 1.5, -0.5));
		});

		it("Matrix2x2.prototype.isOrthogonal", function() {
			expect(a.isOrthogonal()).toEqual(false);
			expect(b.isOrthogonal()).toEqual(true);
		});

		it("Matrix2x2.prototype.isNormal", function() {
			expect(a.isNormal()).toEqual(false);
			expect(b.isNormal()).toEqual(true);
		});

		it("Matrix2x2.prototype.isOrthonormal", function() {
			expect(a.isOrthonormal()).toEqual(false);
			expect(b.isOrthonormal()).toEqual(true);
		});

		it("Matrix2x2.prototype.transpose", function() {
			expect(b.transpose()).toEqual(new Matrix2x2(0, -1, 1, 0));
		});
	});

	describe("Matrix3x3", function() {
		var a = new Matrix3x3(1, 2, 3, 4, 5, 6, 7, 8, 9);
		var b = new Matrix3x3(0, 0, 1, -1, 2, 0, 0, 1, -2);
		var c = new Matrix3x3(0, -1, 0, 1, 0, 0, 0, 0, -1);

		it("Matrix3x3.combine", function() {
			expect(Matrix3x3.combine(a, a)).toEqual(new Matrix3x3(30, 36, 42, 66, 81, 96, 102, 126, 150));
		});

		it("Matrix3x3.invert", function() {
			expect(Matrix3x3.invert(b)).toEqual(new Matrix3x3(4, -1, 2, 2, 0, 1, 1, 0, 0));
		});

		it("Matrix3x3.prototype.isOrthogonal", function() {
			expect(b.isOrthogonal()).toEqual(false);
			expect(c.isOrthogonal()).toEqual(true);
		});

		it("Matrix3x3.prototype.isNormal", function() {
			expect(b.isNormal()).toEqual(false);
			expect(c.isNormal()).toEqual(true);
		});

		it("Matrix3x3.prototype.isOrthonormal", function() {
			expect(b.isOrthonormal()).toEqual(false);
			expect(c.isOrthonormal()).toEqual(true);
		});

		it("Matrix3x3.prototype.transpose", function() {
			expect(c.transpose()).toEqual(new Matrix3x3(0, 1, 0, -1, 0, 0, 0, 0, -1));
		});
	});

	describe("Matrix4x4", function() {
		var a = new Matrix4x4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
		var b = new Matrix4x4(-1, 2, 0, 1, 1, 0, 2, -1, 0, 0, 1, -1, 1, -2, 1, 0);
		var c = new Matrix4x4(0, -1, 0, 0, 1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

		it("Matrix4x4.combine", function() {
			expect(Matrix4x4.combine(a, a)).toEqual(new Matrix4x4(90, 100, 110, 120, 202, 228, 254, 280, 314, 356, 398, 440, 426, 484, 542, 600));
		});

		it("Matrix4x4.invert", function() {
			expect(Matrix4x4.invert(b)).toEqual(new Matrix4x4(-0.5, 1, -1.5, -0.5, 0, 0.5, -0.5, -0.5, 0.5, 0, 0.5, 0.5, 0.5, 0, -0.5, 0.5));
		});

		it("Matrix4x4.prototype.isOrthogonal", function() {
			expect(b.isOrthogonal()).toEqual(false);
			expect(c.isOrthogonal()).toEqual(true);
		});

		it("Matrix4x4.prototype.isNormal", function() {
			expect(b.isNormal()).toEqual(false);
			expect(c.isNormal()).toEqual(true);
		});

		it("Matrix4x4.prototype.isOrthonormal", function() {
			expect(b.isOrthonormal()).toEqual(false);
			expect(c.isOrthonormal()).toEqual(true);
		});

		it("Matrix4x4.prototype.transpose", function() {
			expect(c.transpose()).toEqual(new Matrix4x4(0, 1, 0, 0, -1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1));
		});
	});
/*
	(function() {
		var env = jasmine.getEnv();

		env.addReporter(new jasmine.HtmlReporter());
		env.execute();
	})();
*/
});

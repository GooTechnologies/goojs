define(["goo/math/Matrix3x3", "goo/math/Vector3", "goo/math/Quaternion"], function(Matrix3x3, Vector3, Quaternion) {
	"use strict";

	describe("Matrix3x3", function() {
		it("can combine multiple matrices into a single matrix", function() {
			var a = new Matrix3x3(1, 2, 3, 4, 5, 6, 7, 8, 9);
			var b = new Matrix3x3(1, 2, 3, 4, 5, 6, 7, 8, 9);

			a.combine(a);

			expect(a).toEqual(new Matrix3x3(30, 36, 42, 66, 81, 96, 102, 126, 150));
			expect(Matrix3x3.combine(b, b)).toEqual(new Matrix3x3(30, 36, 42, 66, 81, 96, 102, 126, 150));
		});

		it("can be transposed", function() {
			var a = new Matrix3x3(0, -1, 0, 1, 0, 0, 0, 0, -1);
			var b = new Matrix3x3(0, -1, 0, 1, 0, 0, 0, 0, -1);

			a.transpose();

			expect(a).toEqual(new Matrix3x3(0, 1, 0, -1, 0, 0, 0, 0, -1));
			expect(Matrix3x3.transpose(b)).toEqual(new Matrix3x3(0, 1, 0, -1, 0, 0, 0, 0, -1));
		});

		it("can be inverted", function() {
			var a = new Matrix3x3(0, 0, 1, -1, 2, 0, 0, 1, -2);
			var b = new Matrix3x3(0, 0, 1, -1, 2, 0, 0, 1, -2);
			var c = new Matrix3x3(0, 0, 0, 1, 2, 3, 4, 5, 6);

			a.invert();

			expect(a).toEqual(new Matrix3x3(4, -1, 2, 2, 0, 1, 1, 0, 0));
			expect(Matrix3x3.invert(b)).toEqual(new Matrix3x3(4, -1, 2, 2, 0, 1, 1, 0, 0));
			expect(function() { c.invert(); }).toThrow();
		});

		it("can determine orthogonality", function() {
			var a = new Matrix3x3(0, 0, 1, -1, 2, 0, 0, 1, -2);
			var b = new Matrix3x3(0, -1, 0, 1, 0, 0, 0, 0, -1);

			expect(a.isOrthogonal()).toEqual(false);
			expect(b.isOrthogonal()).toEqual(true);
		});

		it("can determine normality", function() {
			var a = new Matrix3x3(0, 0, 1, -1, 2, 0, 0, 1, -2);
			var b = new Matrix3x3(0, -1, 0, 1, 0, 0, 0, 0, -1);

			expect(a.isNormal()).toEqual(false);
			expect(b.isNormal()).toEqual(true);
		});

		it("can determine orthonormality", function() {
			var a = new Matrix3x3(0, 0, 1, -1, 2, 0, 0, 1, -2);
			var b = new Matrix3x3(0, -1, 0, 1, 0, 0, 0, 0, -1);

			expect(a.isOrthonormal()).toEqual(false);
			expect(b.isOrthonormal()).toEqual(true);
		});

		it("can compute determinants", function() {
			var a = new Matrix3x3(1, 2, 3, 4, 5, 6, 7, 8, 9);

			expect(a.determinant()).toEqual(0);
		});

		it("can be set to identity", function() {
			var a = new Matrix3x3();
			var b = new Matrix3x3(1, 2, 3, 4, 5, 6, 7, 8, 9);

			b.setIdentity();

			expect(a).toEqual(Matrix3x3.IDENTITY);
			expect(b).toEqual(Matrix3x3.IDENTITY);
		});

		it("can transform three-dimensional vectors", function() {
			var a = new Matrix3x3(1, 2, 3, 4, 5, 6, 7, 8, 9);

			expect(a.applyPost(new Vector3(1, 2, 3))).toEqual(new Vector3(30, 36, 42));
		});

		it("can set the scale part", function() {
			var a = new Matrix3x3();
			var b = new Matrix3x3();

			a.multiplyDiagonalPost(new Vector3(1, 2, 3), b);

			expect(b).toEqual(new Matrix3x3(1, 0, 0, 0, 2, 0, 0, 0, 3));
		});

		it("can be set from a vector of angles", function() {
			var a = 1.0/Math.sqrt(2.0);

			expect(new Matrix3x3().fromAngles(0, Math.PI/4, 0)).toEqual(new Matrix3x3(a, 0, -a, 0, 1, 0,  a, 0, a));
		});

		it("can be set from an axis and angle", function() {
			var a = 1.0/Math.sqrt(2.0);

			expect(new Matrix3x3().fromAngleNormalAxis(Math.PI/4, 0, 1, 0)).toEqual(new Matrix3x3(a, 0, -a, 0, 1, 0,  a, 0, a));
		});

		it("can be set to look in a specific direction", function() {
			var a = new Matrix3x3().lookAt(new Vector3(0.0, 0.0, 1.0), new Vector3(0.0, 1.0, 0.0));

			expect(a).toEqual(new Matrix3x3(1, 0, 0, 0, 1, 0, 0, 0, 1));
		});

		it("can be set from a quaternion", function() {
			var a = 1.0/Math.sqrt(2.0);

			expect(new Matrix3x3().copyQuaternion(new Quaternion(0.0, Math.sin(Math.PI/8), 0.0, Math.cos(Math.PI/8)))).toEqual(new Matrix3x3(a, 0, -a, 0, 1, 0, a, 0, a));
		});
	});
});

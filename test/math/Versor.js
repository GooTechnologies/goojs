define(["goo/math/Matrix", "goo/math/Matrix3x3", "goo/math/Matrix4x4", "goo/math/Vector", "goo/math/Vector3", "goo/math/Versor"], function(Matrix, Matrix3x3, Matrix4x4, Vector, Vector3, Versor) {
	"use strict";

	describe("Versor", function() {
		it("can be constructed from an axis and an angle", function() {
			var a = new Versor().fromAxisAngle(new Vector3(0, 2, 0), Math.PI*0.5);
			var b = Versor.fromAxisAngle(new Vector3(0, 2, 0), Math.PI*0.5);
			var c = new Versor().fromNormalizedAxisAngle(new Vector3(0, 1, 0), Math.PI*0.5);
			var d = Versor.fromNormalizedAxisAngle(new Vector3(0, 1, 0), Math.PI*0.5);

			expect(a).toEqual(new Versor(0, 1/Math.sqrt(2), 0, 1/Math.sqrt(2)));
			expect(b).toEqual(new Versor(0, 1/Math.sqrt(2), 0, 1/Math.sqrt(2)));
			expect(c).toEqual(new Versor(0, 1/Math.sqrt(2), 0, 1/Math.sqrt(2)));
			expect(d).toEqual(new Versor(0, 1/Math.sqrt(2), 0, 1/Math.sqrt(2)));
		});

		it("can be inverted", function() {
			var a = Versor.fromNormalizedAxisAngle(new Vector3(0, 1, 0), Math.PI*0.5);
			var b = Versor.fromNormalizedAxisAngle(new Vector3(0, 1, 0), Math.PI*0.5);

			a.invert();

			expect(a).toEqual(new Versor(0, 0 - 1/Math.sqrt(2), 0, 1/Math.sqrt(2)));
			expect(Versor.invert(b)).toEqual(new Versor(0, 0 - 1/Math.sqrt(2), 0, 1/Math.sqrt(2)));
		});

		it("can be combined with another versor", function() {
			var a = Versor.fromNormalizedAxisAngle(new Vector3(0, 1, 0), Math.PI*0.5);
			var b = Versor.fromNormalizedAxisAngle(new Vector3(0, 1, 0), Math.PI*0.5);

			expect(Vector.equals(Versor.combine(a, b), new Versor(0, 1, 0, 0))).toEqual(true);
		});

		it("can be converted to matrices", function() {
			var a = Versor.fromNormalizedAxisAngle(new Vector3(0, 1, 0), Math.PI*0.5);

			expect(Matrix.equals(Versor.toMatrix3x3(a), new Matrix3x3(0, 0, -1, 0, 1, 0, 1, 0, 0))).toEqual(true);
			expect(Matrix.equals(Versor.toMatrix4x4(a), new Matrix4x4(0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1))).toEqual(true);
		});
	});
});

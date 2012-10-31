define(["goo/math/Matrix"], function(Matrix) {
	"use strict";

	Matrix3x3.prototype = Object.create(Matrix.prototype);

	function Matrix3x3() {
		Matrix.call(this, 3, 3);
		this.set(arguments);
	}

	Matrix3x3.add = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		// target.e00 = lhs.e00 + rhs.e00;
		// target.e01 = lhs.e01 + rhs.e01;
		// target.e02 = lhs.e02 + rhs.e02;
		// target.e03 = lhs.e03 + rhs.e03;
		// target.e10 = lhs.e10 + rhs.e10;
		// target.e11 = lhs.e11 + rhs.e11;
		// target.e12 = lhs.e12 + rhs.e12;
		// target.e13 = lhs.e13 + rhs.e13;
		// target.e20 = lhs.e20 + rhs.e20;
		// target.e21 = lhs.e21 + rhs.e21;
		// target.e22 = lhs.e22 + rhs.e22;
		// target.e23 = lhs.e23 + rhs.e23;
		// target.e30 = lhs.e30 + rhs.e30;
		// target.e31 = lhs.e31 + rhs.e31;
		// target.e32 = lhs.e32 + rhs.e32;
		// target.e33 = lhs.e33 + rhs.e33;

		return target;
	};

	return Matrix3x3;
});

define(["goo/math/Matrix"], function(Matrix) {
	"use strict";

	Matrix3x3.prototype = Object.create(Matrix.prototype);
	Matrix3x3.prototype.setupAliases([['e00'], ['e10'], ['e20'], ['e01'], ['e11'], ['e21'], ['e02'], ['e12'], ['e22']]);

	function Matrix3x3() {
		Matrix.call(this, 3, 3);
		this.set(arguments);
	}

	Matrix3x3.add = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		target.e00 = lhs.e00 + rhs.e00;
		target.e10 = lhs.e10 + rhs.e10;
		target.e20 = lhs.e20 + rhs.e20;
		target.e01 = lhs.e01 + rhs.e01;
		target.e11 = lhs.e11 + rhs.e11;
		target.e21 = lhs.e21 + rhs.e21;
		target.e02 = lhs.e02 + rhs.e02;
		target.e12 = lhs.e12 + rhs.e12;
		target.e22 = lhs.e22 + rhs.e22;

		return target;
	};

	Matrix3x3.sub = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		target.e00 = lhs.e00 - rhs.e00;
		target.e10 = lhs.e10 - rhs.e10;
		target.e20 = lhs.e20 - rhs.e20;
		target.e01 = lhs.e01 - rhs.e01;
		target.e11 = lhs.e11 - rhs.e11;
		target.e21 = lhs.e21 - rhs.e21;
		target.e02 = lhs.e02 - rhs.e02;
		target.e12 = lhs.e12 - rhs.e12;
		target.e22 = lhs.e22 - rhs.e22;

		return target;
	};

	Matrix3x3.mul = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		target.e00 = lhs.e00 * rhs.e00;
		target.e10 = lhs.e10 * rhs.e10;
		target.e20 = lhs.e20 * rhs.e20;
		target.e01 = lhs.e01 * rhs.e01;
		target.e11 = lhs.e11 * rhs.e11;
		target.e21 = lhs.e21 * rhs.e21;
		target.e02 = lhs.e02 * rhs.e02;
		target.e12 = lhs.e12 * rhs.e12;
		target.e22 = lhs.e22 * rhs.e22;

		return target;
	};

	Matrix3x3.div = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		target.e00 = rhs.e00 < 0.0 || rhs.e00 > 0.0 ? lhs.e00 / rhs.e00 : lhs.e00;
		target.e10 = rhs.e10 < 0.0 || rhs.e10 > 0.0 ? lhs.e10 / rhs.e10 : lhs.e10;
		target.e20 = rhs.e20 < 0.0 || rhs.e20 > 0.0 ? lhs.e20 / rhs.e20 : lhs.e20;
		target.e01 = rhs.e01 < 0.0 || rhs.e01 > 0.0 ? lhs.e01 / rhs.e01 : lhs.e01;
		target.e11 = rhs.e11 < 0.0 || rhs.e11 > 0.0 ? lhs.e11 / rhs.e11 : lhs.e11;
		target.e21 = rhs.e21 < 0.0 || rhs.e21 > 0.0 ? lhs.e21 / rhs.e21 : lhs.e21;
		target.e02 = rhs.e02 < 0.0 || rhs.e02 > 0.0 ? lhs.e02 / rhs.e02 : lhs.e02;
		target.e12 = rhs.e12 < 0.0 || rhs.e12 > 0.0 ? lhs.e12 / rhs.e12 : lhs.e12;
		target.e22 = rhs.e22 < 0.0 || rhs.e22 > 0.0 ? lhs.e22 / rhs.e22 : lhs.e22;

		return target;
	};

	Matrix3x3.scalarAdd = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		target.e00 = lhs.e00 + rhs;
		target.e10 = lhs.e10 + rhs;
		target.e20 = lhs.e20 + rhs;
		target.e01 = lhs.e01 + rhs;
		target.e11 = lhs.e11 + rhs;
		target.e21 = lhs.e21 + rhs;
		target.e02 = lhs.e02 + rhs;
		target.e12 = lhs.e12 + rhs;
		target.e22 = lhs.e22 + rhs;

		return target;
	};

	Matrix3x3.scalarSub = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		target.e00 = lhs.e00 - rhs;
		target.e10 = lhs.e10 - rhs;
		target.e20 = lhs.e20 - rhs;
		target.e01 = lhs.e01 - rhs;
		target.e11 = lhs.e11 - rhs;
		target.e21 = lhs.e21 - rhs;
		target.e02 = lhs.e02 - rhs;
		target.e12 = lhs.e12 - rhs;
		target.e22 = lhs.e22 - rhs;

		return target;
	};

	Matrix3x3.scalarMul = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		target.e00 = lhs.e00 * rhs;
		target.e10 = lhs.e10 * rhs;
		target.e20 = lhs.e20 * rhs;
		target.e01 = lhs.e01 * rhs;
		target.e11 = lhs.e11 * rhs;
		target.e21 = lhs.e21 * rhs;
		target.e02 = lhs.e02 * rhs;
		target.e12 = lhs.e12 * rhs;
		target.e22 = lhs.e22 * rhs;

		return target;
	};

	Matrix3x3.scalarDiv = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		if (rhs < 0.0 || rhs > 0.0) {
			rhs = 1.0 / rhs;

			target.e00 = lhs.e00 * rhs;
			target.e10 = lhs.e10 * rhs;
			target.e20 = lhs.e20 * rhs;
			target.e01 = lhs.e01 * rhs;
			target.e11 = lhs.e11 * rhs;
			target.e21 = lhs.e21 * rhs;
			target.e02 = lhs.e02 * rhs;
			target.e12 = lhs.e12 * rhs;
			target.e22 = lhs.e22 * rhs;
		} else {
			console.warn("[Matrix3x3.scalarDiv] Attempted to divide by zero!");
		}

		return target;
	};

	Matrix3x3.combine = function(lhs, rhs, target) {
		if (!target || target === lhs || target === rhs) {
			target = new Matrix3x3();
		}

		target.e00 = lhs.e00 * rhs.e00 + lhs.e01 * rhs.e10 + lhs.e02 * rhs.e20;
		target.e10 = lhs.e10 * rhs.e00 + lhs.e11 * rhs.e10 + lhs.e12 * rhs.e20;
		target.e20 = lhs.e20 * rhs.e00 + lhs.e21 * rhs.e10 + lhs.e22 * rhs.e20;
		target.e01 = lhs.e00 * rhs.e01 + lhs.e01 * rhs.e11 + lhs.e02 * rhs.e21;
		target.e11 = lhs.e10 * rhs.e01 + lhs.e11 * rhs.e11 + lhs.e12 * rhs.e21;
		target.e21 = lhs.e20 * rhs.e01 + lhs.e21 * rhs.e11 + lhs.e22 * rhs.e21;
		target.e02 = lhs.e00 * rhs.e02 + lhs.e01 * rhs.e12 + lhs.e02 * rhs.e22;
		target.e12 = lhs.e10 * rhs.e02 + lhs.e11 * rhs.e12 + lhs.e12 * rhs.e22;
		target.e22 = lhs.e20 * rhs.e02 + lhs.e21 * rhs.e12 + lhs.e22 * rhs.e22;
		console.log("mat3x3comb");
		return target;
	};

	return Matrix3x3;
});

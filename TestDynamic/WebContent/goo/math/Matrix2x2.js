define(["goo/math/Matrix"], function(Matrix) {
	"use strict";

	Matrix2x2.prototype = Object.create(Matrix.prototype);
	Matrix2x2.prototype.setupAliases([['e00'], ['e10'], ['e01'], ['e11']]);

	function Matrix2x2() {
		Matrix.call(this, 2, 2);
		this.set(arguments);
	}

	Matrix2x2.add = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		target.e00 = lhs.e00 + rhs.e00;
		target.e10 = lhs.e10 + rhs.e10;
		target.e01 = lhs.e01 + rhs.e01;
		target.e11 = lhs.e11 + rhs.e11;

		return target;
	};

	Matrix2x2.sub = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		target.e00 = lhs.e00 - rhs.e00;
		target.e10 = lhs.e10 - rhs.e10;
		target.e01 = lhs.e01 - rhs.e01;
		target.e11 = lhs.e11 - rhs.e11;

		return target;
	};

	Matrix2x2.mul = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		target.e00 = lhs.e00 * rhs.e00;
		target.e10 = lhs.e10 * rhs.e10;
		target.e01 = lhs.e01 * rhs.e01;
		target.e11 = lhs.e11 * rhs.e11;

		return target;
	};

	Matrix2x2.div = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		target.e00 = rhs.e00 < 0.0 || rhs.e00 > 0.0 ? lhs.e00 / rhs.e00 : lhs.e00;
		target.e10 = rhs.e10 < 0.0 || rhs.e10 > 0.0 ? lhs.e10 / rhs.e10 : lhs.e10;
		target.e01 = rhs.e01 < 0.0 || rhs.e01 > 0.0 ? lhs.e01 / rhs.e01 : lhs.e01;
		target.e11 = rhs.e11 < 0.0 || rhs.e11 > 0.0 ? lhs.e11 / rhs.e11 : lhs.e11;

		return target;
	};

	Matrix2x2.scalarAdd = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		target.e00 = lhs.e00 + rhs;
		target.e10 = lhs.e10 + rhs;
		target.e01 = lhs.e01 + rhs;
		target.e11 = lhs.e11 + rhs;

		return target;
	};

	Matrix2x2.scalarSub = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		target.e00 = lhs.e00 - rhs;
		target.e10 = lhs.e10 - rhs;
		target.e01 = lhs.e01 - rhs;
		target.e11 = lhs.e11 - rhs;

		return target;
	};

	Matrix2x2.scalarMul = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		target.e00 = lhs.e00 * rhs;
		target.e10 = lhs.e10 * rhs;
		target.e01 = lhs.e01 * rhs;
		target.e11 = lhs.e11 * rhs;

		return target;
	};

	Matrix2x2.scalarDiv = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		if (rhs < 0.0 || rhs > 0.0) {
			rhs = 1.0 / rhs;

			target.e00 = lhs.e00 * rhs;
			target.e10 = lhs.e10 * rhs;
			target.e01 = lhs.e01 * rhs;
			target.e11 = lhs.e11 * rhs;
		} else {
			console.warn("[Matrix2x2.scalarDiv] Attempted to divide by zero!");
		}

		return target;
	};

	Matrix2x2.combine = function(lhs, rhs, target) {
		if (!target || target === lhs || target === rhs) {
			target = new Matrix2x2();
		}

		target.e00 = lhs.e00 * rhs.e00 + lhs.e01 * rhs.e10;
		target.e10 = lhs.e10 * rhs.e00 + lhs.e11 * rhs.e10;
		target.e01 = lhs.e00 * rhs.e01 + lhs.e01 * rhs.e11;
		target.e11 = lhs.e10 * rhs.e01 + lhs.e11 * rhs.e11;

		return target;
	};

	Matrix2x2.prototype.add = function(rhs) {
		return Matrix2x2.add(this, rhs, this);
	};

	Matrix2x2.prototype.sub = function(rhs) {
		return Matrix2x2.sub(this, rhs, this);
	};

	Matrix2x2.prototype.mul = function(rhs) {
		return Matrix2x2.add(this, rhs, this);
	};

	Matrix2x2.prototype.div = function(rhs) {
		return Matrix2x2.div(this, rhs, this);
	};

	Matrix2x2.prototype.scalarAdd = function(rhs) {
		return Matrix2x2.scalarAdd(this, rhs, this);
	};

	Matrix2x2.prototype.scalarSub = function(rhs) {
		return Matrix2x2.scalarSub(this, rhs, this);
	};

	Matrix2x2.prototype.scalarMul = function(rhs) {
		return Matrix2x2.scalarMul(this, rhs, this);
	};

	Matrix2x2.prototype.scalarDiv = function(rhs) {
		return Matrix2x2.scalarDiv(this, rhs, this);
	};

	Matrix2x2.prototype.combine = function(rhs) {
		return Matrix2x2.combine(this, rhs, this);
	};

	return Matrix2x2;
});

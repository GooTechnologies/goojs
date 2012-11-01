define(["goo/math/Matrix"], function(Matrix) {
	"use strict";

	Matrix4x4.prototype = Object.create(Matrix.prototype);
	Matrix4x4.prototype.setupAliases([['e00'], ['e10'], ['e20'], ['e30'], ['e01'], ['e11'], ['e21'], ['e31'], ['e02'], ['e12'], ['e22'], ['e32'],
			['e03'], ['e13'], ['e23'], ['e33']]);

	function Matrix4x4() {
		Matrix.call(this, 4, 4);
		this.set(arguments);
	}

	Matrix4x4.add = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		target.e00 = lhs.e00 + rhs.e00;
		target.e10 = lhs.e10 + rhs.e10;
		target.e20 = lhs.e20 + rhs.e20;
		target.e30 = lhs.e30 + rhs.e30;
		target.e01 = lhs.e01 + rhs.e01;
		target.e11 = lhs.e11 + rhs.e11;
		target.e21 = lhs.e21 + rhs.e21;
		target.e31 = lhs.e31 + rhs.e31;
		target.e02 = lhs.e02 + rhs.e02;
		target.e12 = lhs.e12 + rhs.e12;
		target.e22 = lhs.e22 + rhs.e22;
		target.e32 = lhs.e32 + rhs.e32;
		target.e03 = lhs.e03 + rhs.e03;
		target.e13 = lhs.e13 + rhs.e13;
		target.e23 = lhs.e23 + rhs.e23;
		target.e33 = lhs.e33 + rhs.e33;

		return target;
	};

	Matrix4x4.sub = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		target.e00 = lhs.e00 - rhs.e00;
		target.e10 = lhs.e10 - rhs.e10;
		target.e20 = lhs.e20 - rhs.e20;
		target.e30 = lhs.e30 - rhs.e30;
		target.e01 = lhs.e01 - rhs.e01;
		target.e11 = lhs.e11 - rhs.e11;
		target.e21 = lhs.e21 - rhs.e21;
		target.e31 = lhs.e31 - rhs.e31;
		target.e02 = lhs.e02 - rhs.e02;
		target.e12 = lhs.e12 - rhs.e12;
		target.e22 = lhs.e22 - rhs.e22;
		target.e32 = lhs.e32 - rhs.e32;
		target.e03 = lhs.e03 - rhs.e03;
		target.e13 = lhs.e13 - rhs.e13;
		target.e23 = lhs.e23 - rhs.e23;
		target.e33 = lhs.e33 - rhs.e33;

		return target;
	};

	Matrix4x4.mul = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		target.e00 = lhs.e00 * rhs.e00;
		target.e10 = lhs.e10 * rhs.e10;
		target.e20 = lhs.e20 * rhs.e20;
		target.e30 = lhs.e30 * rhs.e30;
		target.e01 = lhs.e01 * rhs.e01;
		target.e11 = lhs.e11 * rhs.e11;
		target.e21 = lhs.e21 * rhs.e21;
		target.e31 = lhs.e31 * rhs.e31;
		target.e02 = lhs.e02 * rhs.e02;
		target.e12 = lhs.e12 * rhs.e12;
		target.e22 = lhs.e22 * rhs.e22;
		target.e32 = lhs.e32 * rhs.e32;
		target.e03 = lhs.e03 * rhs.e03;
		target.e13 = lhs.e13 * rhs.e13;
		target.e23 = lhs.e23 * rhs.e23;
		target.e33 = lhs.e33 * rhs.e33;

		return target;
	};

	Matrix4x4.div = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		target.e00 = rhs.e00 < 0.0 || rhs.e00 > 0.0 ? lhs.e00 / rhs.e00 : lhs.e00;
		target.e10 = rhs.e10 < 0.0 || rhs.e10 > 0.0 ? lhs.e10 / rhs.e10 : lhs.e10;
		target.e20 = rhs.e20 < 0.0 || rhs.e20 > 0.0 ? lhs.e20 / rhs.e20 : lhs.e20;
		target.e30 = rhs.e30 < 0.0 || rhs.e30 > 0.0 ? lhs.e30 / rhs.e30 : lhs.e30;
		target.e01 = rhs.e01 < 0.0 || rhs.e01 > 0.0 ? lhs.e01 / rhs.e01 : lhs.e01;
		target.e11 = rhs.e11 < 0.0 || rhs.e11 > 0.0 ? lhs.e11 / rhs.e11 : lhs.e11;
		target.e21 = rhs.e21 < 0.0 || rhs.e21 > 0.0 ? lhs.e21 / rhs.e21 : lhs.e21;
		target.e31 = rhs.e31 < 0.0 || rhs.e31 > 0.0 ? lhs.e31 / rhs.e31 : lhs.e31;
		target.e02 = rhs.e02 < 0.0 || rhs.e02 > 0.0 ? lhs.e02 / rhs.e02 : lhs.e02;
		target.e12 = rhs.e12 < 0.0 || rhs.e12 > 0.0 ? lhs.e12 / rhs.e12 : lhs.e12;
		target.e22 = rhs.e22 < 0.0 || rhs.e22 > 0.0 ? lhs.e22 / rhs.e22 : lhs.e22;
		target.e32 = rhs.e32 < 0.0 || rhs.e32 > 0.0 ? lhs.e32 / rhs.e32 : lhs.e32;
		target.e03 = rhs.e03 < 0.0 || rhs.e03 > 0.0 ? lhs.e03 / rhs.e03 : lhs.e03;
		target.e13 = rhs.e13 < 0.0 || rhs.e13 > 0.0 ? lhs.e13 / rhs.e13 : lhs.e13;
		target.e23 = rhs.e23 < 0.0 || rhs.e23 > 0.0 ? lhs.e23 / rhs.e23 : lhs.e23;
		target.e33 = rhs.e33 < 0.0 || rhs.e33 > 0.0 ? lhs.e33 / rhs.e33 : lhs.e33;

		return target;
	};

	Matrix4x4.scalarAdd = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		target.e00 = lhs.e00 + rhs;
		target.e10 = lhs.e10 + rhs;
		target.e20 = lhs.e20 + rhs;
		target.e30 = lhs.e30 + rhs;
		target.e01 = lhs.e01 + rhs;
		target.e11 = lhs.e11 + rhs;
		target.e21 = lhs.e21 + rhs;
		target.e31 = lhs.e31 + rhs;
		target.e02 = lhs.e02 + rhs;
		target.e12 = lhs.e12 + rhs;
		target.e22 = lhs.e22 + rhs;
		target.e32 = lhs.e32 + rhs;
		target.e03 = lhs.e03 + rhs;
		target.e13 = lhs.e13 + rhs;
		target.e23 = lhs.e23 + rhs;
		target.e33 = lhs.e33 + rhs;

		return target;
	};

	Matrix4x4.scalarSub = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		target.e00 = lhs.e00 - rhs;
		target.e10 = lhs.e10 - rhs;
		target.e20 = lhs.e20 - rhs;
		target.e30 = lhs.e30 - rhs;
		target.e01 = lhs.e01 - rhs;
		target.e11 = lhs.e11 - rhs;
		target.e21 = lhs.e21 - rhs;
		target.e31 = lhs.e31 - rhs;
		target.e02 = lhs.e02 - rhs;
		target.e12 = lhs.e12 - rhs;
		target.e22 = lhs.e22 - rhs;
		target.e32 = lhs.e32 - rhs;
		target.e03 = lhs.e03 - rhs;
		target.e13 = lhs.e13 - rhs;
		target.e23 = lhs.e23 - rhs;
		target.e33 = lhs.e33 - rhs;

		return target;
	};

	Matrix4x4.scalarMul = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		target.e00 = lhs.e00 * rhs;
		target.e10 = lhs.e10 * rhs;
		target.e20 = lhs.e20 * rhs;
		target.e30 = lhs.e30 * rhs;
		target.e01 = lhs.e01 * rhs;
		target.e11 = lhs.e11 * rhs;
		target.e21 = lhs.e21 * rhs;
		target.e31 = lhs.e31 * rhs;
		target.e02 = lhs.e02 * rhs;
		target.e12 = lhs.e12 * rhs;
		target.e22 = lhs.e22 * rhs;
		target.e32 = lhs.e32 * rhs;
		target.e03 = lhs.e03 * rhs;
		target.e13 = lhs.e13 * rhs;
		target.e23 = lhs.e23 * rhs;
		target.e33 = lhs.e33 * rhs;

		return target;
	};

	Matrix4x4.scalarDiv = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		if (rhs < 0.0 || rhs > 0.0) {
			rhs = 1.0 / rhs;

			target.e00 = lhs.e00 * rhs;
			target.e10 = lhs.e10 * rhs;
			target.e20 = lhs.e20 * rhs;
			target.e30 = lhs.e30 * rhs;
			target.e01 = lhs.e01 * rhs;
			target.e11 = lhs.e11 * rhs;
			target.e21 = lhs.e21 * rhs;
			target.e31 = lhs.e31 * rhs;
			target.e02 = lhs.e02 * rhs;
			target.e12 = lhs.e12 * rhs;
			target.e22 = lhs.e22 * rhs;
			target.e32 = lhs.e32 * rhs;
			target.e03 = lhs.e03 * rhs;
			target.e13 = lhs.e13 * rhs;
			target.e23 = lhs.e23 * rhs;
			target.e33 = lhs.e33 * rhs;
		} else {
			console.warn("[Matrix4x4.scalarDiv] Attempted to divide by zero!");
		}

		return target;
	};

	Matrix4x4.combine = function(lhs, rhs, target) {
		if (!target || target === lhs || target === rhs) {
			target = new Matrix4x4();
		}

		target.e00 = lhs.e00 * rhs.e00 + lhs.e01 * rhs.e10 + lhs.e02 * rhs.e20 + lhs.e03 * rhs.e30;
		target.e10 = lhs.e10 * rhs.e00 + lhs.e11 * rhs.e10 + lhs.e12 * rhs.e20 + lhs.e13 * rhs.e30;
		target.e20 = lhs.e20 * rhs.e00 + lhs.e21 * rhs.e10 + lhs.e22 * rhs.e20 + lhs.e23 * rhs.e30;
		target.e30 = lhs.e30 * rhs.e00 + lhs.e31 * rhs.e10 + lhs.e32 * rhs.e20 + lhs.e33 * rhs.e30;
		target.e01 = lhs.e00 * rhs.e01 + lhs.e01 * rhs.e11 + lhs.e02 * rhs.e21 + lhs.e03 * rhs.e31;
		target.e11 = lhs.e10 * rhs.e01 + lhs.e11 * rhs.e11 + lhs.e12 * rhs.e21 + lhs.e03 * rhs.e31;
		target.e21 = lhs.e20 * rhs.e01 + lhs.e21 * rhs.e11 + lhs.e22 * rhs.e21 + lhs.e03 * rhs.e31;
		target.e31 = lhs.e30 * rhs.e01 + lhs.e31 * rhs.e11 + lhs.e32 * rhs.e21 + lhs.e03 * rhs.e31;
		target.e02 = lhs.e00 * rhs.e02 + lhs.e01 * rhs.e12 + lhs.e02 * rhs.e22 + lhs.e03 * rhs.e32;
		target.e12 = lhs.e10 * rhs.e02 + lhs.e11 * rhs.e12 + lhs.e12 * rhs.e22 + lhs.e03 * rhs.e32;
		target.e22 = lhs.e20 * rhs.e02 + lhs.e21 * rhs.e12 + lhs.e22 * rhs.e22 + lhs.e03 * rhs.e32;
		target.e32 = lhs.e30 * rhs.e02 + lhs.e31 * rhs.e12 + lhs.e32 * rhs.e22 + lhs.e03 * rhs.e32;
		target.e03 = lhs.e00 * rhs.e03 + lhs.e01 * rhs.e13 + lhs.e02 * rhs.e23 + lhs.e03 * rhs.e33;
		target.e13 = lhs.e10 * rhs.e03 + lhs.e11 * rhs.e13 + lhs.e12 * rhs.e23 + lhs.e03 * rhs.e33;
		target.e23 = lhs.e20 * rhs.e03 + lhs.e21 * rhs.e13 + lhs.e22 * rhs.e23 + lhs.e03 * rhs.e33;
		target.e33 = lhs.e30 * rhs.e03 + lhs.e31 * rhs.e13 + lhs.e32 * rhs.e23 + lhs.e03 * rhs.e33;

		return target;
	};

	Matrix4x4.prototype.add = function(rhs) {
		return Matrix4x4.add(this, rhs, this);
	};

	Matrix4x4.prototype.sub = function(rhs) {
		return Matrix4x4.sub(this, rhs, this);
	};

	Matrix4x4.prototype.mul = function(rhs) {
		return Matrix4x4.add(this, rhs, this);
	};

	Matrix4x4.prototype.div = function(rhs) {
		return Matrix4x4.div(this, rhs, this);
	};

	Matrix4x4.prototype.scalarAdd = function(rhs) {
		return Matrix4x4.scalarAdd(this, rhs, this);
	};

	Matrix4x4.prototype.scalarSub = function(rhs) {
		return Matrix4x4.scalarSub(this, rhs, this);
	};

	Matrix4x4.prototype.scalarMul = function(rhs) {
		return Matrix4x4.scalarMul(this, rhs, this);
	};

	Matrix4x4.prototype.scalarDiv = function(rhs) {
		return Matrix4x4.scalarDiv(this, rhs, this);
	};

	Matrix4x4.prototype.combine = function(rhs) {
		return Matrix4x4.combine(this, rhs, this);
	};

	return Matrix4x4;
});

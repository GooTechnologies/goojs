define(["goo/math/Matrix"], function(Matrix) {
	"use strict";

	Matrix3x3.prototype = Object.create(Matrix.prototype);
	Matrix3x3.prototype.setupAliases([['e00'], ['e10'], ['e20'], ['e01'], ['e11'], ['e21'], ['e02'], ['e12'], ['e22']]);

	/**
	 * @name Matrix3x3
	 * @class Matrix with 3x3 components.
	 * @extends Matrix
	 * @constructor
	 * @description Creates a new matrix.
	 * @param {Float...} arguments Initial values for the components.
	 */

	function Matrix3x3() {
		Matrix.call(this, 3, 3);
		this.set(arguments);
	}

	/**
	 * @static
	 * @description Performs a component-wise addition between two matrices and stores the result in a separate matrix.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Matrix3x3} rhs Matrix on the right-hand side.
	 * @param {Matrix3x3} target Target matrix for storage. (optional)
	 * @returns {Matrix3x3} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise subtraction between two matrices and stores the result in a separate matrix.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Matrix3x3} rhs Matrix on the right-hand side.
	 * @param {Matrix3x3} target Target matrix for storage. (optional)
	 * @returns {Matrix3x3} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise multiplication between two matrices and stores the result in a separate matrix.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Matrix3x3} rhs Matrix on the right-hand side.
	 * @param {Matrix3x3} target Target matrix for storage. (optional)
	 * @returns {Matrix3x3} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise division between two matrices and stores the result in a separate matrix.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Matrix3x3} rhs Matrix on the right-hand side.
	 * @param {Matrix3x3} target Target matrix for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Matrix3x3} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix3x3.div = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		var clean = true;

		target.e00 = (clean &= (rhs.e00 < 0.0 || rhs.e00 > 0.0)) ? lhs.e00 / rhs.e00 : 0.0;
		target.e10 = (clean &= (rhs.e10 < 0.0 || rhs.e10 > 0.0)) ? lhs.e10 / rhs.e10 : 0.0;
		target.e20 = (clean &= (rhs.e20 < 0.0 || rhs.e20 > 0.0)) ? lhs.e20 / rhs.e20 : 0.0;
		target.e01 = (clean &= (rhs.e01 < 0.0 || rhs.e01 > 0.0)) ? lhs.e01 / rhs.e01 : 0.0;
		target.e11 = (clean &= (rhs.e11 < 0.0 || rhs.e11 > 0.0)) ? lhs.e11 / rhs.e11 : 0.0;
		target.e21 = (clean &= (rhs.e21 < 0.0 || rhs.e21 > 0.0)) ? lhs.e21 / rhs.e21 : 0.0;
		target.e02 = (clean &= (rhs.e02 < 0.0 || rhs.e02 > 0.0)) ? lhs.e02 / rhs.e02 : 0.0;
		target.e12 = (clean &= (rhs.e12 < 0.0 || rhs.e12 > 0.0)) ? lhs.e12 / rhs.e12 : 0.0;
		target.e22 = (clean &= (rhs.e22 < 0.0 || rhs.e22 > 0.0)) ? lhs.e22 / rhs.e22 : 0.0;

		if (clean == false) {
			console.warn("[Matrix3x3.div] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise addition between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix3x3} target Target matrix for storage. (optional)
	 * @returns {Matrix3x3} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise subtraction between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix3x3} target Target matrix for storage. (optional)
	 * @returns {Matrix3x3} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise multiplication between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix3x3} target Target matrix for storage. (optional)
	 * @returns {Matrix3x3} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise division between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix3x3} target Target matrix for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Matrix3x3} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix3x3.scalarDiv = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		var clean = true;

		rhs = (clean &= (rhs < 0.0 || rhs > 0.0)) ? 1.0 / rhs : 0.0;

		target.e00 = lhs.e00 * rhs;
		target.e10 = lhs.e10 * rhs;
		target.e20 = lhs.e20 * rhs;
		target.e01 = lhs.e01 * rhs;
		target.e11 = lhs.e11 * rhs;
		target.e21 = lhs.e21 * rhs;
		target.e02 = lhs.e02 * rhs;
		target.e12 = lhs.e12 * rhs;
		target.e22 = lhs.e22 * rhs;

		if (clean == false) {
			console.warn("[Matrix3x3.scalarDiv] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @static
	 * @description Combines two matrices (matrix multiplication) and stores the result in a separate matrix.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Matrix3x3} rhs Matrix on the right-hand side.
	 * @param {Matrix3x3} target Target matrix for storage. (optional)
	 * @returns {Matrix3x3} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

		return target;
	};

	/**
	 * @static
	 * @description Transposes a matrix (exchanges rows and columns).
	 * @param {Matrix3x3} source Source matrix.
	 * @param {Matrix3x3} target Target matrix. (optional)
	 * @returns {Matrix3x3} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix3x3.transpose = function(source, target) {
		if (!target || target === source) {
			target = new Matrix3x3();
		}

		target.e00 = source.e00;
		target.e10 = source.e01;
		target.e20 = source.e02;
		target.e01 = source.e10;
		target.e11 = source.e11;
		target.e21 = source.e12;
		target.e02 = source.e20;
		target.e12 = source.e21;
		target.e22 = source.e22;

		return target;
	};

	/**
	 * @description Computes the analytical inverse and stores the result in a separate matrix.
	 * @param {Matrix3x3} source Source matrix.
	 * @param {Matrix3x3} target Target matrix. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Matrix3x3} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix3x3.invert = function(source, target) {
		if (!target || target === source) {
			target = new Matrix3x3();
		}

		var det = source.determinant();

		if (det < 0.0 || det > 0.0) {
			det = 1.0 / det;

			target.e00 = (source.e11 * source.e22 - source.e12 * source.e21) * det;
			target.e10 = (source.e12 * source.e20 - source.e10 * source.e22) * det;
			target.e20 = (source.e10 * source.e21 - source.e11 * source.e20) * det;
			target.e01 = (source.e02 * source.e21 - source.e01 * source.e22) * det;
			target.e11 = (source.e00 * source.e22 - source.e02 * source.e20) * det;
			target.e21 = (source.e01 * source.e20 - source.e00 * source.e21) * det;
			target.e02 = (source.e01 * source.e12 - source.e02 * source.e11) * det;
			target.e12 = (source.e02 * source.e10 - source.e00 * source.e12) * det;
			target.e22 = (source.e00 * source.e11 - source.e01 * source.e10) * det;
		} else {
			console.warn("[Matrix3x3.invert] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @description Performs a component-wise addition between two matrices and stores the result locally.
	 * @param {Matrix3x3} rhs Matrix on the right-hand side.
	 * @returns {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.add = function(rhs) {
		return Matrix3x3.add(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between two matrices and stores the result locally.
	 * @param {Matrix3x3} rhs Matrix on the right-hand side.
	 * @returns {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.sub = function(rhs) {
		return Matrix3x3.sub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between two matrices and stores the result locally.
	 * @param {Matrix3x3} rhs Matrix on the right-hand side.
	 * @returns {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.mul = function(rhs) {
		return Matrix3x3.add(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between two matrices and stores the result locally.
	 * @param {Matrix3x3} rhs Matrix on the right-hand side.
	 * @returns {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.div = function(rhs) {
		return Matrix3x3.div(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise addition between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.scalarAdd = function(rhs) {
		return Matrix3x3.scalarAdd(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.scalarSub = function(rhs) {
		return Matrix3x3.scalarSub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.scalarMul = function(rhs) {
		return Matrix3x3.scalarMul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.scalarDiv = function(rhs) {
		return Matrix3x3.scalarDiv(this, rhs, this);
	};

	/**
	 * @description Combines two matrices (matrix multiplication) and stores the result locally.
	 * @param {Matrix3x3} rhs Matrix on the right-hand side.
	 * @returns {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.combine = function(rhs) {
		return Matrix3x3.combine(this, rhs, this);
	};

	/**
	 * @description Transposes the matrix (exchanges rows and columns).
	 * @returns {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.transpose = function() {
		return Matrix3x3.transpose(this, this);
	};

	/**
	 * @description Computes the determinant of the matrix.
	 * @returns {Float} Determinant of matrix.
	 */

	Matrix3x3.prototype.determinant = function() {
		return this.e00 * (this.e11 * this.e22 - this.e12 * this.e21) - this.e01 * (this.e10 * this.e22 - this.e12 * this.e20) + this.e02
			* (this.e10 * this.e21 - this.e11 * this.e20);
	};

	/**
	 * @description Computes the analytical inverse and stores the result locally.
	 * @returns {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.invert = function() {
		return Matrix3x3.invert(this, this);
	};

	/**
	 * @description Tests if the matrix is orthogonal.
	 * @returns {Boolean} True if orthogonal.
	 */

	Matrix3x3.prototype.isOrthogonal = function() {
		var dot;

		dot = this.e00 * this.e01 + this.e10 * this.e11 + this.e20 * this.e21;

		if (dot < 0.0 || dot > 0.0) {
			return false;
		}

		dot = this.e00 * this.e02 + this.e10 * this.e12 + this.e20 * this.e22;

		if (dot < 0.0 || dot > 0.0) {
			return false;
		}

		dot = this.e01 * this.e02 + this.e11 * this.e12 + this.e21 * this.e22;

		if (dot < 0.0 || dot > 0.0) {
			return false;
		}

		return true;
	};

	/**
	 * @description Tests if the matrix is normal.
	 * @returns {Boolean} True if normal.
	 */

	Matrix3x3.prototype.isNormal = function() {
		var l;

		l = this.e00 * this.e00 + this.e10 * this.e10 + this.e20 * this.e20;

		if (l < 1.0 || l > 1.0) {
			return false;
		}

		l = this.e01 * this.e01 + this.e11 * this.e11 + this.e21 * this.e21;

		if (l < 1.0 || l > 1.0) {
			return false;
		}

		l = this.e02 * this.e02 + this.e12 * this.e12 + this.e22 * this.e22;

		if (l < 1.0 || l > 1.0) {
			return false;
		}

		return true;
	};

	// TODO: incorporate these better and possibly to the base class
	Matrix3x3.prototype.applyPost = function(vec) {
		var x = vec.x;
		var y = vec.y;
		var z = vec.z;

		var d = this;
		vec.x = d.e00 * x + d.e10 * y + d.e20 * z;
		vec.y = d.e01 * x + d.e11 * y + d.e21 * z;
		vec.z = d.e02 * x + d.e12 * y + d.e22 * z;

		return vec;
	};

	Matrix3x3.prototype.multiplyDiagonalPost = function(vec, result) {
		var x = vec.x;
		var y = vec.y;
		var z = vec.z;

		var d = this.data;
		var rd = result.data;
		rd[0] = x * d[0];
		rd[1] = y * d[1];
		rd[2] = z * d[2];
		rd[3] = x * d[3];
		rd[4] = y * d[4];
		rd[5] = z * d[5];
		rd[6] = x * d[6];
		rd[7] = y * d[7];
		rd[8] = z * d[8];

		return vec;
	};

	Matrix3x3.prototype.clone = function() {
		return new Matrix3x3(this.data);
	};

	return Matrix3x3;
});

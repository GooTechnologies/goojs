define(["goo/math/Matrix"], function(Matrix) {
	"use strict";

	Matrix2x2.prototype = Object.create(Matrix.prototype);
	Matrix2x2.prototype.setupAliases([['e00'], ['e10'], ['e01'], ['e11']]);

	/**
	 * @name Matrix2x2
	 * @class Matrix with 2x2 components.
	 * @extends Matrix
	 * @constructor
	 * @description Creates a new matrix.
	 * @param {Float...} arguments Initial values for the components.
	 */

	function Matrix2x2() {
		Matrix.call(this, 2, 2);
		this.set(arguments);
	}

	/**
	 * @static
	 * @description Performs a component-wise addition between two matrices and stores the result in a separate matrix.
	 * @param {Matrix2x2} lhs Matrix on the left-hand side.
	 * @param {Matrix2x2} rhs Matrix on the right-hand side.
	 * @param {Matrix2x2} target Target matrix for storage. (optional)
	 * @returns {Matrix2x2} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise subtraction between two matrices and stores the result in a separate matrix.
	 * @param {Matrix2x2} lhs Matrix on the left-hand side.
	 * @param {Matrix2x2} rhs Matrix on the right-hand side.
	 * @param {Matrix2x2} target Target matrix for storage. (optional)
	 * @returns {Matrix2x2} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise multiplication between two matrices and stores the result in a separate matrix.
	 * @param {Matrix2x2} lhs Matrix on the left-hand side.
	 * @param {Matrix2x2} rhs Matrix on the right-hand side.
	 * @param {Matrix2x2} target Target matrix for storage. (optional)
	 * @returns {Matrix2x2} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise division between two matrices and stores the result in a separate matrix.
	 * @param {Matrix2x2} lhs Matrix on the left-hand side.
	 * @param {Matrix2x2} rhs Matrix on the right-hand side.
	 * @param {Matrix2x2} target Target matrix for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Matrix2x2} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix2x2.div = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		var clean = true;

		target.e00 = (clean &= (rhs.e00 < 0.0 || rhs.e00 > 0.0)) ? lhs.e00 / rhs.e00 : 0.0;
		target.e10 = (clean &= (rhs.e10 < 0.0 || rhs.e10 > 0.0)) ? lhs.e10 / rhs.e10 : 0.0;
		target.e01 = (clean &= (rhs.e01 < 0.0 || rhs.e01 > 0.0)) ? lhs.e01 / rhs.e01 : 0.0;
		target.e11 = (clean &= (rhs.e11 < 0.0 || rhs.e11 > 0.0)) ? lhs.e11 / rhs.e11 : 0.0;

		if (clean == false) {
			console.warn("[Matrix2x2.div] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise addition between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix2x2} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix2x2} target Target matrix for storage. (optional)
	 * @returns {Matrix2x2} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise subtraction between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix2x2} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix2x2} target Target matrix for storage. (optional)
	 * @returns {Matrix2x2} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise multiplication between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix2x2} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix2x2} target Target matrix for storage. (optional)
	 * @returns {Matrix2x2} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise division between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix2x2} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix2x2} target Target matrix for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Matrix2x2} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix2x2.scalarDiv = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		var clean = true;

		rhs = (clean &= (rhs < 0.0 || rhs > 0.0)) ? 1.0 / rhs : 0.0;

		target.e00 = lhs.e00 * rhs;
		target.e10 = lhs.e10 * rhs;
		target.e01 = lhs.e01 * rhs;
		target.e11 = lhs.e11 * rhs;

		if (clean == false) {
			console.warn("[Matrix2x2.scalarDiv] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @static
	 * @description Combines two matrices (matrix multiplication) and stores the result in a separate matrix.
	 * @param {Matrix2x2} lhs Matrix on the left-hand side.
	 * @param {Matrix2x2} rhs Matrix on the right-hand side.
	 * @param {Matrix2x2} target Target matrix for storage. (optional)
	 * @returns {Matrix2x2} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @description Computes the analytical inverse and stores the result in a separate matrix.
	 * @param {Matrix2x2} source Source matrix.
	 * @param {Matrix2x2} target Target matrix. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Matrix2x2} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix2x2.invert = function(source, target) {
		if (!target || target === source) {
			target = new Matrix2x2();
		}

		var det = source.determinant();

		if (det < 0.0 || det > 0.0) {
			det = 1.0 / det;

			target.e00 = source.e11 * det;
			target.e10 = 0.0 - source.e10 * det;
			target.e01 = 0.0 - source.e01 * det;
			target.e11 = source.e00 * det;
		} else {
			console.warn("[Matrix2x2.invert] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @description Performs a component-wise addition between two matrices and stores the result locally.
	 * @param {Matrix2x2} rhs Matrix on the right-hand side.
	 * @returns {Matrix2x2} Self for chaining.
	 */

	Matrix2x2.prototype.add = function(rhs) {
		return Matrix2x2.add(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between two matrices and stores the result locally.
	 * @param {Matrix2x2} rhs Matrix on the right-hand side.
	 * @returns {Matrix2x2} Self for chaining.
	 */

	Matrix2x2.prototype.sub = function(rhs) {
		return Matrix2x2.sub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between two matrices and stores the result locally.
	 * @param {Matrix2x2} rhs Matrix on the right-hand side.
	 * @returns {Matrix2x2} Self for chaining.
	 */

	Matrix2x2.prototype.mul = function(rhs) {
		return Matrix2x2.add(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between two matrices and stores the result locally.
	 * @param {Matrix2x2} rhs Matrix on the right-hand side.
	 * @returns {Matrix2x2} Self for chaining.
	 */

	Matrix2x2.prototype.div = function(rhs) {
		return Matrix2x2.div(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise addition between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix2x2} Self for chaining.
	 */

	Matrix2x2.prototype.scalarAdd = function(rhs) {
		return Matrix2x2.scalarAdd(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix2x2} Self for chaining.
	 */

	Matrix2x2.prototype.scalarSub = function(rhs) {
		return Matrix2x2.scalarSub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix2x2} Self for chaining.
	 */

	Matrix2x2.prototype.scalarMul = function(rhs) {
		return Matrix2x2.scalarMul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix2x2} Self for chaining.
	 */

	Matrix2x2.prototype.scalarDiv = function(rhs) {
		return Matrix2x2.scalarDiv(this, rhs, this);
	};

	/**
	 * @description Combines two matrices (matrix multiplication) and stores the result locally.
	 * @param {Matrix2x2} rhs Matrix on the right-hand side.
	 * @returns {Matrix2x2} Self for chaining.
	 */

	Matrix2x2.prototype.combine = function(rhs) {
		return Matrix2x2.combine(this, rhs, this);
	};

	/**
	 * @description Computes the determinant of the matrix.
	 * @returns {Float} Determinant of matrix.
	 */

	Matrix2x2.prototype.determinant = function() {
		return this.e00 * this.e11 - this.e01 * this.e10;
	};

	/**
	 * @description Computes the analytical inverse and stores the result locally.
	 * @returns {Matrix2x2} Self for chaining.
	 */

	Matrix2x2.prototype.invert = function() {
		return Matrix2x2.invert(this, this);
	};

	/**
	 * @description Tests if the matrix is orthogonal.
	 * @returns {Boolean} True if orthogonal.
	 */

	Matrix2x2.prototype.isOrthogonal = function() {
		var dot;

		dot = this.e00 * this.e01 + this.e10 * this.e11;

		if (dot < 0.0 || dot > 0.0) {
			return false;
		}

		return true;
	};

	/**
	 * @description Tests if the matrix is normal.
	 * @returns {Boolean} True if normal.
	 */

	Matrix2x2.prototype.isNormal = function() {
		var l;

		l = this.e00 * this.e00 + this.e10 * this.e10;

		if (l < 1.0 || l > 1.0) {
			return false;
		}

		l = this.e01 * this.e01 + this.e11 * this.e11;

		if (l < 1.0 || l > 1.0) {
			return false;
		}

		return true;
	};

	return Matrix2x2;
});

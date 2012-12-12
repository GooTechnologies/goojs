define(["goo/math/Matrix"], function(Matrix) {
	"use strict";

	Matrix4x4.prototype = Object.create(Matrix.prototype);
	Matrix4x4.prototype.setupAliases([['e00'], ['e10'], ['e20'], ['e30'], ['e01'], ['e11'], ['e21'], ['e31'], ['e02'], ['e12'], ['e22'], ['e32'],
			['e03'], ['e13'], ['e23'], ['e33']]);

	/**
	 * @name Matrix4x4
	 * @class Matrix with 4x4 components.
	 * @extends Matrix
	 * @constructor
	 * @description Creates a new matrix.
	 * @param {Float...} arguments Initial values for the components.
	 */

	function Matrix4x4() {
		Matrix.call(this, 4, 4);
		if (arguments.length === 0) {
			this.setIdentity();
		} else {
			if (arguments.length === 1 && typeof (arguments[0]) === "object") {
				this.set(arguments[0]);
			} else {
				this.set(arguments);
			}
		}
	}

	/**
	 * @static
	 * @description Performs a component-wise addition between two matrices and stores the result in a separate matrix.
	 * @param {Matrix4x4} lhs Matrix on the left-hand side.
	 * @param {Matrix4x4} rhs Matrix on the right-hand side.
	 * @param {Matrix4x4} target Target matrix for storage. (optional)
	 * @returns {Matrix4x4} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise subtraction between two matrices and stores the result in a separate matrix.
	 * @param {Matrix4x4} lhs Matrix on the left-hand side.
	 * @param {Matrix4x4} rhs Matrix on the right-hand side.
	 * @param {Matrix4x4} target Target matrix for storage. (optional)
	 * @returns {Matrix4x4} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise multiplication between two matrices and stores the result in a separate matrix.
	 * @param {Matrix4x4} lhs Matrix on the left-hand side.
	 * @param {Matrix4x4} rhs Matrix on the right-hand side.
	 * @param {Matrix4x4} target Target matrix for storage. (optional)
	 * @returns {Matrix4x4} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise division between two matrices and stores the result in a separate matrix.
	 * @param {Matrix4x4} lhs Matrix on the left-hand side.
	 * @param {Matrix4x4} rhs Matrix on the right-hand side.
	 * @param {Matrix4x4} target Target matrix for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Matrix4x4} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix4x4.div = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		var clean = true;

		target.e00 = (clean &= (rhs.e00 < 0.0 || rhs.e00 > 0.0)) ? lhs.e00 / rhs.e00 : 0.0;
		target.e10 = (clean &= (rhs.e10 < 0.0 || rhs.e10 > 0.0)) ? lhs.e10 / rhs.e10 : 0.0;
		target.e20 = (clean &= (rhs.e20 < 0.0 || rhs.e20 > 0.0)) ? lhs.e20 / rhs.e20 : 0.0;
		target.e30 = (clean &= (rhs.e30 < 0.0 || rhs.e30 > 0.0)) ? lhs.e30 / rhs.e30 : 0.0;
		target.e01 = (clean &= (rhs.e01 < 0.0 || rhs.e01 > 0.0)) ? lhs.e01 / rhs.e01 : 0.0;
		target.e11 = (clean &= (rhs.e11 < 0.0 || rhs.e11 > 0.0)) ? lhs.e11 / rhs.e11 : 0.0;
		target.e21 = (clean &= (rhs.e21 < 0.0 || rhs.e21 > 0.0)) ? lhs.e21 / rhs.e21 : 0.0;
		target.e31 = (clean &= (rhs.e31 < 0.0 || rhs.e31 > 0.0)) ? lhs.e31 / rhs.e31 : 0.0;
		target.e02 = (clean &= (rhs.e02 < 0.0 || rhs.e02 > 0.0)) ? lhs.e02 / rhs.e02 : 0.0;
		target.e12 = (clean &= (rhs.e12 < 0.0 || rhs.e12 > 0.0)) ? lhs.e12 / rhs.e12 : 0.0;
		target.e22 = (clean &= (rhs.e22 < 0.0 || rhs.e22 > 0.0)) ? lhs.e22 / rhs.e22 : 0.0;
		target.e32 = (clean &= (rhs.e32 < 0.0 || rhs.e32 > 0.0)) ? lhs.e32 / rhs.e32 : 0.0;
		target.e03 = (clean &= (rhs.e03 < 0.0 || rhs.e03 > 0.0)) ? lhs.e03 / rhs.e03 : 0.0;
		target.e13 = (clean &= (rhs.e13 < 0.0 || rhs.e13 > 0.0)) ? lhs.e13 / rhs.e13 : 0.0;
		target.e23 = (clean &= (rhs.e23 < 0.0 || rhs.e23 > 0.0)) ? lhs.e23 / rhs.e23 : 0.0;
		target.e33 = (clean &= (rhs.e33 < 0.0 || rhs.e33 > 0.0)) ? lhs.e33 / rhs.e33 : 0.0;

		if (clean === false) {
			console.warn("[Matrix4x4.div] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise addition between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix4x4} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix4x4} target Target matrix for storage. (optional)
	 * @returns {Matrix4x4} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise subtraction between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix4x4} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix4x4} target Target matrix for storage. (optional)
	 * @returns {Matrix4x4} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise multiplication between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix4x4} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix4x4} target Target matrix for storage. (optional)
	 * @returns {Matrix4x4} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

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

	/**
	 * @static
	 * @description Performs a component-wise division between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix4x4} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix4x4} target Target matrix for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Matrix4x4} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix4x4.scalarDiv = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		var clean = true;

		rhs = (clean &= (rhs < 0.0 || rhs > 0.0)) ? 1.0 / rhs : 0.0;

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

		if (clean === false) {
			console.warn("[Matrix4x4.scalarDiv] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @static
	 * @description Combines two matrices (matrix multiplication) and stores the result in a separate matrix.
	 * @param {Matrix4x4} lhs Matrix on the left-hand side.
	 * @param {Matrix4x4} rhs Matrix on the right-hand side.
	 * @param {Matrix4x4} target Target matrix for storage. (optional)
	 * @returns {Matrix4x4} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix4x4.combine = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		tempMatrix.e00 = lhs.e00 * rhs.e00 + lhs.e01 * rhs.e10 + lhs.e02 * rhs.e20 + lhs.e03 * rhs.e30;
		tempMatrix.e10 = lhs.e10 * rhs.e00 + lhs.e11 * rhs.e10 + lhs.e12 * rhs.e20 + lhs.e13 * rhs.e30;
		tempMatrix.e20 = lhs.e20 * rhs.e00 + lhs.e21 * rhs.e10 + lhs.e22 * rhs.e20 + lhs.e23 * rhs.e30;
		tempMatrix.e30 = lhs.e30 * rhs.e00 + lhs.e31 * rhs.e10 + lhs.e32 * rhs.e20 + lhs.e33 * rhs.e30;
		tempMatrix.e01 = lhs.e00 * rhs.e01 + lhs.e01 * rhs.e11 + lhs.e02 * rhs.e21 + lhs.e03 * rhs.e31;
		tempMatrix.e11 = lhs.e10 * rhs.e01 + lhs.e11 * rhs.e11 + lhs.e12 * rhs.e21 + lhs.e13 * rhs.e31;
		tempMatrix.e21 = lhs.e20 * rhs.e01 + lhs.e21 * rhs.e11 + lhs.e22 * rhs.e21 + lhs.e23 * rhs.e31;
		tempMatrix.e31 = lhs.e30 * rhs.e01 + lhs.e31 * rhs.e11 + lhs.e32 * rhs.e21 + lhs.e33 * rhs.e31;
		tempMatrix.e02 = lhs.e00 * rhs.e02 + lhs.e01 * rhs.e12 + lhs.e02 * rhs.e22 + lhs.e03 * rhs.e32;
		tempMatrix.e12 = lhs.e10 * rhs.e02 + lhs.e11 * rhs.e12 + lhs.e12 * rhs.e22 + lhs.e13 * rhs.e32;
		tempMatrix.e22 = lhs.e20 * rhs.e02 + lhs.e21 * rhs.e12 + lhs.e22 * rhs.e22 + lhs.e23 * rhs.e32;
		tempMatrix.e32 = lhs.e30 * rhs.e02 + lhs.e31 * rhs.e12 + lhs.e32 * rhs.e22 + lhs.e33 * rhs.e32;
		tempMatrix.e03 = lhs.e00 * rhs.e03 + lhs.e01 * rhs.e13 + lhs.e02 * rhs.e23 + lhs.e03 * rhs.e33;
		tempMatrix.e13 = lhs.e10 * rhs.e03 + lhs.e11 * rhs.e13 + lhs.e12 * rhs.e23 + lhs.e13 * rhs.e33;
		tempMatrix.e23 = lhs.e20 * rhs.e03 + lhs.e21 * rhs.e13 + lhs.e22 * rhs.e23 + lhs.e23 * rhs.e33;
		tempMatrix.e33 = lhs.e30 * rhs.e03 + lhs.e31 * rhs.e13 + lhs.e32 * rhs.e23 + lhs.e33 * rhs.e33;

		target.copy(tempMatrix);

		return target;
	};

	/**
	 * @static
	 * @description Transposes a matrix (exchanges rows and columns).
	 * @param {Matrix4x4} source Source matrix.
	 * @param {Matrix4x4} target Target matrix. (optional)
	 * @returns {Matrix4x4} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix4x4.transpose = function(source, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		tempMatrix.e00 = source.e00;
		tempMatrix.e10 = source.e01;
		tempMatrix.e20 = source.e02;
		tempMatrix.e30 = source.e03;
		tempMatrix.e01 = source.e10;
		tempMatrix.e11 = source.e11;
		tempMatrix.e21 = source.e12;
		tempMatrix.e31 = source.e13;
		tempMatrix.e02 = source.e20;
		tempMatrix.e12 = source.e21;
		tempMatrix.e22 = source.e22;
		tempMatrix.e32 = source.e23;
		tempMatrix.e03 = source.e30;
		tempMatrix.e13 = source.e31;
		tempMatrix.e23 = source.e32;
		tempMatrix.e33 = source.e33;

		target.copy(tempMatrix);

		return target;
	};

	/**
	 * @description Transposes the matrix (exchanges rows and columns).
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.transpose = function() {
		return Matrix4x4.transpose(this, this);
	};

	/**
	 * @description Computes the analytical inverse and stores the result in a separate matrix.
	 * @param {Matrix4x4} source Source matrix.
	 * @param {Matrix4x4} target Target matrix. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Matrix4x4} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix4x4.invert = function(source, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		var det = source.determinant();

		if (det < 0.0 || det > 0.0) {
			det = 1.0 / det;

			tempMatrix.e00 = (source.e11 * (source.e22 * source.e33 - source.e23 * source.e32) - source.e12
				* (source.e21 * source.e33 - source.e23 * source.e31) + source.e13 * (source.e21 * source.e32 - source.e22 * source.e31))
				* det;
			tempMatrix.e10 = (source.e10 * (source.e23 * source.e32 - source.e22 * source.e33) - source.e12
				* (source.e23 * source.e30 - source.e20 * source.e33) + source.e13 * (source.e22 * source.e30 - source.e20 * source.e32))
				* det;
			tempMatrix.e20 = (source.e10 * (source.e21 * source.e33 - source.e23 * source.e31) - source.e11
				* (source.e20 * source.e33 - source.e23 * source.e30) + source.e13 * (source.e20 * source.e31 - source.e21 * source.e30))
				* det;
			tempMatrix.e30 = (source.e10 * (source.e22 * source.e31 - source.e21 * source.e32) - source.e11
				* (source.e22 * source.e30 - source.e20 * source.e32) + source.e12 * (source.e21 * source.e30 - source.e20 * source.e31))
				* det;
			tempMatrix.e01 = (source.e01 * (source.e23 * source.e32 - source.e22 * source.e33) - source.e02
				* (source.e23 * source.e31 - source.e21 * source.e33) + source.e03 * (source.e22 * source.e31 - source.e21 * source.e32))
				* det;
			tempMatrix.e11 = (source.e00 * (source.e22 * source.e33 - source.e23 * source.e32) - source.e02
				* (source.e20 * source.e33 - source.e23 * source.e30) + source.e03 * (source.e20 * source.e32 - source.e22 * source.e30))
				* det;
			tempMatrix.e21 = (source.e00 * (source.e23 * source.e31 - source.e21 * source.e33) - source.e01
				* (source.e23 * source.e30 - source.e20 * source.e33) + source.e03 * (source.e21 * source.e30 - source.e20 * source.e31))
				* det;
			tempMatrix.e31 = (source.e00 * (source.e21 * source.e32 - source.e22 * source.e31) - source.e01
				* (source.e20 * source.e32 - source.e22 * source.e30) + source.e02 * (source.e20 * source.e31 - source.e21 * source.e30))
				* det;
			tempMatrix.e02 = (source.e01 * (source.e12 * source.e33 - source.e13 * source.e32) - source.e02
				* (source.e11 * source.e33 - source.e13 * source.e31) + source.e03 * (source.e11 * source.e32 - source.e12 * source.e31))
				* det;
			tempMatrix.e12 = (source.e00 * (source.e13 * source.e32 - source.e12 * source.e33) - source.e02
				* (source.e13 * source.e30 - source.e10 * source.e33) + source.e03 * (source.e12 * source.e30 - source.e10 * source.e32))
				* det;
			tempMatrix.e22 = (source.e00 * (source.e11 * source.e33 - source.e13 * source.e31) - source.e01
				* (source.e10 * source.e33 - source.e13 * source.e30) + source.e03 * (source.e10 * source.e31 - source.e11 * source.e30))
				* det;
			tempMatrix.e32 = (source.e00 * (source.e12 * source.e31 - source.e11 * source.e32) - source.e01
				* (source.e12 * source.e30 - source.e10 * source.e32) + source.e02 * (source.e11 * source.e30 - source.e10 * source.e31))
				* det;
			tempMatrix.e03 = (source.e01 * (source.e13 * source.e22 - source.e12 * source.e23) - source.e02
				* (source.e13 * source.e21 - source.e11 * source.e23) + source.e03 * (source.e12 * source.e21 - source.e11 * source.e22))
				* det;
			tempMatrix.e13 = (source.e00 * (source.e12 * source.e23 - source.e13 * source.e22) - source.e02
				* (source.e10 * source.e23 - source.e13 * source.e20) + source.e03 * (source.e10 * source.e22 - source.e12 * source.e20))
				* det;
			tempMatrix.e23 = (source.e00 * (source.e13 * source.e21 - source.e11 * source.e23) - source.e01
				* (source.e13 * source.e20 - source.e10 * source.e23) + source.e03 * (source.e11 * source.e20 - source.e10 * source.e21))
				* det;
			tempMatrix.e33 = (source.e00 * (source.e11 * source.e22 - source.e12 * source.e21) - source.e01
				* (source.e10 * source.e22 - source.e12 * source.e20) + source.e02 * (source.e10 * source.e21 - source.e11 * source.e20))
				* det;

			target.copy(tempMatrix);
		} else {
			console.warn("[Matrix4x4.invert] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @description Performs a component-wise addition between two matrices and stores the result locally.
	 * @param {Matrix4x4} rhs Matrix on the right-hand side.
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.add = function(rhs) {
		return Matrix4x4.add(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between two matrices and stores the result locally.
	 * @param {Matrix4x4} rhs Matrix on the right-hand side.
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.sub = function(rhs) {
		return Matrix4x4.sub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between two matrices and stores the result locally.
	 * @param {Matrix4x4} rhs Matrix on the right-hand side.
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.mul = function(rhs) {
		return Matrix4x4.add(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between two matrices and stores the result locally.
	 * @param {Matrix4x4} rhs Matrix on the right-hand side.
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.div = function(rhs) {
		return Matrix4x4.div(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise addition between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.scalarAdd = function(rhs) {
		return Matrix4x4.scalarAdd(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.scalarSub = function(rhs) {
		return Matrix4x4.scalarSub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.scalarMul = function(rhs) {
		return Matrix4x4.scalarMul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.scalarDiv = function(rhs) {
		return Matrix4x4.scalarDiv(this, rhs, this);
	};

	/**
	 * @description Combines two matrices (matrix multiplication) and stores the result locally.
	 * @param {Matrix4x4} rhs Matrix on the right-hand side.
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.combine = function(rhs) {
		return Matrix4x4.combine(this, rhs, this);
	};

	/**
	 * @description Computes the determinant of the matrix.
	 * @returns {Float} Determinant of matrix.
	 */

	Matrix4x4.prototype.determinant = function() {
		var sum = 0.0;

		sum += this.e00
			* (this.e11 * (this.e22 * this.e33 - this.e23 * this.e32) - this.e12 * (this.e21 * this.e33 - this.e23 * this.e31) + this.e13
				* (this.e21 * this.e32 - this.e22 * this.e31));
		sum -= this.e01
			* (this.e10 * (this.e22 * this.e33 - this.e23 * this.e32) - this.e12 * (this.e20 * this.e33 - this.e23 * this.e30) + this.e13
				* (this.e20 * this.e32 - this.e22 * this.e30));
		sum += this.e02
			* (this.e10 * (this.e21 * this.e33 - this.e23 * this.e31) - this.e11 * (this.e20 * this.e33 - this.e23 * this.e30) + this.e13
				* (this.e20 * this.e31 - this.e21 * this.e30));
		sum -= this.e03
			* (this.e10 * (this.e21 * this.e32 - this.e22 * this.e31) - this.e11 * (this.e20 * this.e32 - this.e22 * this.e30) + this.e12
				* (this.e20 * this.e31 - this.e21 * this.e30));

		return sum;
	};

	/**
	 * @description Computes the analytical inverse and stores the result locally.
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.invert = function() {
		return Matrix4x4.invert(this, this);
	};

	/**
	 * @description Tests if the matrix is orthogonal.
	 * @returns {Boolean} True if orthogonal.
	 */

	Matrix4x4.prototype.isOrthogonal = function() {
		var dot;

		dot = this.e00 * this.e01 + this.e10 * this.e11 + this.e20 * this.e21 + this.e30 * this.e31;

		if (dot < 0.0 || dot > 0.0) {
			return false;
		}

		dot = this.e00 * this.e02 + this.e10 * this.e12 + this.e20 * this.e22 + this.e30 * this.e32;

		if (dot < 0.0 || dot > 0.0) {
			return false;
		}

		dot = this.e00 * this.e03 + this.e10 * this.e13 + this.e20 * this.e23 + this.e30 * this.e33;

		if (dot < 0.0 || dot > 0.0) {
			return false;
		}

		dot = this.e01 * this.e02 + this.e11 * this.e12 + this.e21 * this.e22 + this.e31 * this.e32;

		if (dot < 0.0 || dot > 0.0) {
			return false;
		}

		dot = this.e01 * this.e03 + this.e11 * this.e13 + this.e21 * this.e23 + this.e31 * this.e33;

		if (dot < 0.0 || dot > 0.0) {
			return false;
		}

		dot = this.e02 * this.e03 + this.e12 * this.e13 + this.e22 * this.e23 + this.e32 * this.e33;

		if (dot < 0.0 || dot > 0.0) {
			return false;
		}

		return true;
	};

	/**
	 * @description Tests if the matrix is normal.
	 * @returns {Boolean} True if normal.
	 */

	Matrix4x4.prototype.isNormal = function() {
		var l;

		l = this.e00 * this.e00 + this.e10 * this.e10 + this.e20 * this.e20 + this.e30 * this.e30;

		if (l < 1.0 || l > 1.0) {
			return false;
		}

		l = this.e01 * this.e01 + this.e11 * this.e11 + this.e21 * this.e21 + this.e31 * this.e31;

		if (l < 1.0 || l > 1.0) {
			return false;
		}

		l = this.e02 * this.e02 + this.e12 * this.e12 + this.e22 * this.e22 + this.e32 * this.e32;

		if (l < 1.0 || l > 1.0) {
			return false;
		}

		l = this.e03 * this.e03 + this.e13 * this.e13 + this.e23 * this.e23 + this.e33 * this.e33;

		if (l < 1.0 || l > 1.0) {
			return false;
		}

		return true;
	};

	/**
	 * @description Tests if the matrix is orthonormal.
	 * @returns {Boolean} True if orthonormal.
	 */

	Matrix4x4.prototype.isOrthonormal = function() {
		return this.isOrthogonal() && this.isNormal();
	};

	/**
	 * @description Sets the rotational part of the matrix from rotational angles. Order convention is x followed by y followed by z.
	 * @param {Vector3} angles Rotational angles.
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.setRotationFromAngles = function(angles) {
		var sx = Math.sin(angles.x);
		var cx = Math.cos(angles.x);
		var sy = Math.sin(angles.y);
		var cy = Math.cos(angles.y);
		var sz = Math.sin(angles.z);
		var cz = Math.cos(angles.z);

		this.e00 = cz * cy;
		this.e10 = sz * cy;
		this.e20 = 0.0 - sy;
		this.e01 = cz * sy * sx - sz * cx;
		this.e11 = sz * sy * sx + cz * cx;
		this.e21 = cy * sx;
		this.e02 = cz * sy * cx + sz * sx;
		this.e12 = sz * sy * cx - cz * sx;
		this.e22 = cy * cx;

		return this;
	};

	/**
	 * @description Sets the rotational part of the matrix from a quaternion.
	 * @param {Vector4} quaternion Rotational quaternion.
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.setRotationFromQuaternion = function(quaternion) {
		var l = quaternion.lengthSquared();

		l = (l > 0.0) ? 2.0 / l : 0.0;

		var a = quaternion.x * l;
		var b = quaternion.y * l;
		var c = quaternion.z * l;

		var wa = quaternion.w * a;
		var wb = quaternion.w * b;
		var wc = quaternion.w * c;
		var xa = quaternion.x * a;
		var xb = quaternion.x * b;
		var xc = quaternion.x * c;
		var yb = quaternion.y * b;
		var yc = quaternion.y * c;
		var zc = quaternion.z * c;

		this.e00 = 1.0 - yb - zc;
		this.e10 = xb + wc;
		this.e20 = xc - wb;
		this.e01 = xb - wc;
		this.e11 = 1.0 - xa - zc;
		this.e21 = yc + wa;
		this.e02 = xc + wb;
		this.e12 = yc - wa;
		this.e22 = 1.0 - xa - yb;

		return this;
	};

	/**
	 * @description Sets the translational part of the matrix.
	 * @param {Vector3} translation Translation vector.
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.setTranslation = function(translation) {
		this.e03 = translation.x;
		this.e13 = translation.y;
		this.e23 = translation.z;

		return this;
	};

	/**
	 * @description Sets the scale of the matrix.
	 * @param {Vector3} scale Scale vector.
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.setScale = function(scale) {
		this.e00 *= scale.x;
		this.e10 *= scale.y;
		this.e20 *= scale.z;
		this.e01 *= scale.x;
		this.e11 *= scale.y;
		this.e21 *= scale.z;
		this.e02 *= scale.x;
		this.e12 *= scale.y;
		this.e22 *= scale.z;

		return this;
	};

	/**
	 * @description Applies the matrix (rotation, scale, translation, projection) to a four-dimensional vector. (x = (x*M)^T)
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @returns {Vector4} Transformed right-hand side vector.
	 */

	// REVIEW: The name of this method is not 100% intuitive as the method is called through matrix.applyPre(vector) and the matrix is applied after the vector.
	Matrix4x4.prototype.applyPre = function(rhs) {
		var x = rhs.x;
		var y = rhs.y;
		var z = rhs.z;
		var w = rhs.w;

		rhs.x = this.e00 * x + this.e10 * y + this.e20 * z + this.e30 * w;
		rhs.y = this.e01 * x + this.e11 * y + this.e21 * z + this.e31 * w;
		rhs.z = this.e02 * x + this.e12 * y + this.e22 * z + this.e32 * w;
		rhs.w = this.e03 * x + this.e13 * y + this.e23 * z + this.e33 * w;

		return rhs;
	};

	/**
	 * @description Applies the matrix (rotation, scale, translation, projection) to a four-dimensional vector. (x = M*x)
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @returns {Vector4} Transformed right-hand side vector.
	 */

	Matrix4x4.prototype.applyPost = function(rhs) {
		var x = rhs.x;
		var y = rhs.y;
		var z = rhs.z;
		var w = rhs.w;

		rhs.x = this.e00 * x + this.e01 * y + this.e02 * z + this.e03 * w;
		rhs.y = this.e10 * x + this.e11 * y + this.e12 * z + this.e13 * w;
		rhs.z = this.e20 * x + this.e21 * y + this.e22 * z + this.e23 * w;
		rhs.w = this.e30 * x + this.e31 * y + this.e32 * z + this.e33 * w;

		return rhs;
	};

	/**
	 * @description Applies the matrix (rotation, scale, translation) to a three-dimensional vector.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @returns {Vector3} Transformed right-hand side vector.
	 */

	Matrix4x4.prototype.applyPostPoint = function(rhs) {
		var x = rhs.x;
		var y = rhs.y;
		var z = rhs.z;

		rhs.x = this.e00 * x + this.e01 * y + this.e02 * z + this.e03;
		rhs.y = this.e10 * x + this.e11 * y + this.e12 * z + this.e13;
		rhs.z = this.e20 * x + this.e21 * y + this.e22 * z + this.e23;

		return rhs;
	};

	/**
	 * @description Applies the matrix (rotation, scale) to a three-dimensional vector.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @returns {Vector3} Transformed right-hand side vector.
	 */

	Matrix4x4.prototype.applyPostVector = function(rhs) {
		var x = rhs.x;
		var y = rhs.y;
		var z = rhs.z;

		rhs.x = this.e00 * x + this.e01 * y + this.e02 * z;
		rhs.y = this.e10 * x + this.e11 * y + this.e12 * z;
		rhs.z = this.e20 * x + this.e21 * y + this.e22 * z;

		return rhs;
	};

	/**
	 * @description Constructs a clone of the matrix.
	 * @returns {Matrix4x4} Cloned matrix.
	 */

	Matrix4x4.prototype.clone = function() {
		return new Matrix4x4(this.data);
	};

	/**
	 * @description Sets the matrix to identity.
	 * @returns {Matrix4x4} Self for chaining.
	 */

	Matrix4x4.prototype.setIdentity = function() {
		return this.set(Matrix4x4.IDENTITY);
	};

	/**
	 * @description Compares two matrices with an absolute tolerance of 0.0001.
	 * @param {Matrix4x4} rhs Matrix on the right-hand side.
	 * @returns {Boolean} True if equal.
	 */

	Matrix4x4.prototype.equals = function(rhs) {
		for ( var i = 0; i < 16; i++) {
			if (Math.abs(this.data[i] - rhs.data[i]) > 0.0001) {
				return false;
			}
		}
		return true;
	};

	Matrix4x4.IDENTITY = new Matrix4x4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

	var tempMatrix = new Matrix4x4();

	return Matrix4x4;
});

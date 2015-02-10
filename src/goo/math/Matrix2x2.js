define([
	'goo/math/MathUtils',
	'goo/math/Matrix'
], function (
	MathUtils,
	Matrix
) {
	'use strict';

	/**
	 * Matrix with 2x2 components.
	 * @extends Matrix
	 * @param {Matrix2x2|number[]|...number} arguments Initial values for the components.
	 */
	function Matrix2x2() {
		Matrix.call(this, 2, 2);

		if (arguments.length === 0) {
			this.data[0] = 1;
			this.data[3] = 1;
		} else {
			Matrix.prototype.set.apply(this, arguments);
		}

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	Matrix2x2.prototype = Object.create(Matrix.prototype);
	Matrix2x2.prototype.constructor = Matrix2x2;

	Matrix.setupAliases(Matrix2x2.prototype,[['e00'], ['e10'], ['e01'], ['e11']]);

	/* @type {Matrix2x2} */
	Matrix2x2.IDENTITY = new Matrix2x2(1, 0, 0, 1);

	/**
	 * Performs a component-wise addition.
	 * @param {Matrix2x2} lhs Matrix on the left-hand side.
	 * @param {Matrix2x2|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix2x2} [target] Target matrix for storage.
	 * @returns {Matrix2x2} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix2x2.add = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		if (rhs instanceof Matrix2x2) {
			target.e00 = lhs.e00 + rhs.e00;
			target.e10 = lhs.e10 + rhs.e10;
			target.e01 = lhs.e01 + rhs.e01;
			target.e11 = lhs.e11 + rhs.e11;
		} else {
			target.e00 = lhs.e00 + rhs;
			target.e10 = lhs.e10 + rhs;
			target.e01 = lhs.e01 + rhs;
			target.e11 = lhs.e11 + rhs;
		}

		return target;
	};

	/**
	 * Performs a component-wise addition.
	 * @param {Matrix2x2|number} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix2x2} Self for chaining.
	 */
	Matrix2x2.prototype.add = function (rhs) {
		return Matrix2x2.add(this, rhs, this);
	};

	/**
	 * Performs a component-wise subtraction.
	 * @param {Matrix2x2} lhs Matrix on the left-hand side.
	 * @param {Matrix2x2|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix2x2} [target] Target matrix for storage.
	 * @returns {Matrix2x2} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix2x2.sub = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		if (rhs instanceof Matrix2x2) {
			target.e00 = lhs.e00 - rhs.e00;
			target.e10 = lhs.e10 - rhs.e10;
			target.e01 = lhs.e01 - rhs.e01;
			target.e11 = lhs.e11 - rhs.e11;
		} else {
			target.e00 = lhs.e00 - rhs;
			target.e10 = lhs.e10 - rhs;
			target.e01 = lhs.e01 - rhs;
			target.e11 = lhs.e11 - rhs;
		}

		return target;
	};

	/**
	 * Performs a component-wise subtraction.
	 * @param {Matrix2x2|number} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix2x2} Self for chaining.
	 */
	Matrix2x2.prototype.sub = function (rhs) {
		return Matrix2x2.sub(this, rhs, this);
	};

	/**
	 * Performs a component-wise multiplication.
	 * @param {Matrix2x2} lhs Matrix on the left-hand side.
	 * @param {Matrix2x2|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix2x2} [target] Target matrix for storage.
	 * @returns {Matrix2x2} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix2x2.mul = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		if (rhs instanceof Matrix2x2) {
			target.e00 = lhs.e00 * rhs.e00;
			target.e10 = lhs.e10 * rhs.e10;
			target.e01 = lhs.e01 * rhs.e01;
			target.e11 = lhs.e11 * rhs.e11;
		} else {
			target.e00 = lhs.e00 * rhs;
			target.e10 = lhs.e10 * rhs;
			target.e01 = lhs.e01 * rhs;
			target.e11 = lhs.e11 * rhs;
		}

		return target;
	};

	/**
	 * Performs a component-wise multiplication.
	 * @param {Matrix2x2|number} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix2x2} Self for chaining.
	 */
	Matrix2x2.prototype.mul = function (rhs) {
		return Matrix2x2.mul(this, rhs, this);
	};

	/**
	 * Performs a component-wise division.
	 * @param {Matrix2x2} lhs Matrix on the left-hand side.
	 * @param {Matrix2x2|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix2x2} [target] Target matrix for storage.
	 * @returns {Matrix2x2} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix2x2.div = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		if (rhs instanceof Matrix2x2) {
			target.e00 = lhs.e00 / rhs.e00;
			target.e10 = lhs.e10 / rhs.e10;
			target.e01 = lhs.e01 / rhs.e01;
			target.e11 = lhs.e11 / rhs.e11;
		} else {
			rhs = 1.0 / rhs;

			target.e00 = lhs.e00 * rhs;
			target.e10 = lhs.e10 * rhs;
			target.e01 = lhs.e01 * rhs;
			target.e11 = lhs.e11 * rhs;
		}

		return target;
	};

	/**
	 * Performs a component-wise division.
	 * @param {Matrix2x2|number} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix2x2} Self for chaining.
	 */
	Matrix2x2.prototype.div = function (rhs) {
		return Matrix2x2.div(this, rhs, this);
	};

	/**
	 * Combines two matrices (matrix multiplication) and stores the result in a separate matrix.
	 * @param {Matrix2x2} lhs Matrix on the left-hand side.
	 * @param {Matrix2x2} rhs Matrix on the right-hand side.
	 * @param {Matrix2x2} [target] Target matrix for storage.
	 * @returns {Matrix2x2} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix2x2.combine = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		if (target === lhs || target === rhs) {
			return Matrix.copy(Matrix2x2.combine(lhs, rhs), target);
		}

		target.e00 = lhs.e00 * rhs.e00 + lhs.e01 * rhs.e10;
		target.e10 = lhs.e10 * rhs.e00 + lhs.e11 * rhs.e10;
		target.e01 = lhs.e00 * rhs.e01 + lhs.e01 * rhs.e11;
		target.e11 = lhs.e10 * rhs.e01 + lhs.e11 * rhs.e11;

		return target;
	};

	/**
	 * Combines two matrices (matrix multiplication) and stores the result locally.
	 * @param {Matrix2x2} rhs Matrix on the right-hand side.
	 * @returns {Matrix2x2} Self for chaining.
	 */
	Matrix2x2.prototype.combine = function (rhs) {
		return Matrix2x2.combine(this, rhs, this);
	};

	/**
	 * Transposes a matrix (exchanges rows and columns) and stores the result in a separate matrix.
	 * @param {Matrix2x2} source Source matrix.
	 * @param {Matrix2x2} [target] Target matrix.
	 * @returns {Matrix2x2} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix2x2.transpose = function (source, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		if (target === source) {
			return Matrix.copy(Matrix2x2.transpose(source), target);
		}

		target.e00 = source.e00;
		target.e10 = source.e01;
		target.e01 = source.e10;
		target.e11 = source.e11;

		return target;
	};

	/**
	 * Transposes the matrix (exchanges rows and columns) and stores the result locally.
	 * @returns {Matrix2x2} Self for chaining.
	 */
	Matrix2x2.prototype.transpose = function () {
		return Matrix2x2.transpose(this, this);
	};

	/**
	 * Computes the analytical inverse and stores the result in a separate matrix.
	 * @param {Matrix2x2} source Source matrix.
	 * @param {Matrix2x2} [target] Target matrix.
	 * @returns {Matrix2x2} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix2x2.invert = function (source, target) {
		if (!target) {
			target = new Matrix2x2();
		}

		if (target === source) {
			return Matrix.copy(Matrix2x2.invert(source), target);
		}

		var det = source.determinant();

		if (Math.abs(det) < MathUtils.EPSILON) {
			return target;
		}

		det = 1.0 / det;

		target.e00 = source.e11 * det;
		target.e10 = 0.0 - source.e10 * det;
		target.e01 = 0.0 - source.e01 * det;
		target.e11 = source.e00 * det;

		return target;
	};

	/**
	 * Computes the analytical inverse and stores the result locally.
	 * @returns {Matrix2x2} Self for chaining.
	 */
	Matrix2x2.prototype.invert = function () {
		return Matrix2x2.invert(this, this);
	};

	/**
	 * Tests if the matrix is orthogonal.
	 * @returns {Boolean} True if orthogonal.
	 */
	Matrix2x2.prototype.isOrthogonal = function () {
		var dot;

		dot = this.e00 * this.e01 + this.e10 * this.e11;

		if (Math.abs(dot) > MathUtils.EPSILON) {
			return false;
		}

		return true;
	};

	/**
	 * Tests if the matrix is normal.
	 * @returns {boolean} True if normal.
	 */
	Matrix2x2.prototype.isNormal = function () {
		var l;

		l = this.e00 * this.e00 + this.e10 * this.e10;

		if (Math.abs(l - 1.0) > MathUtils.EPSILON) {
			return false;
		}

		l = this.e01 * this.e01 + this.e11 * this.e11;

		//! AT: why wrap the condition in an if?!
		if (Math.abs(l - 1.0) > MathUtils.EPSILON) {
			return false;
		}

		return true;
	};

	/**
	 * Tests if the matrix is orthonormal.
	 * @returns {boolean} True if orthonormal.
	 */
	Matrix2x2.prototype.isOrthonormal = function () {
		return this.isOrthogonal() && this.isNormal();
	};

	/**
	 * Computes the determinant of the matrix.
	 * @returns {number} Determinant of matrix.
	 */
	Matrix2x2.prototype.determinant = function () {
		return this.e00 * this.e11 - this.e01 * this.e10;
	};

	/**
	 * Sets the matrix to identity.
	 * @returns {Matrix2x2} Self for chaining.
	 */
	Matrix2x2.prototype.setIdentity = function () {
		this.set(Matrix2x2.IDENTITY);
		return this;
	};


	/**
	 * Copies component values and stores them locally.
	 * @param {Matrix2x2} source Source matrix.
	 * @returns {Matrix2x2} Self for chaining.
	 */
	Matrix2x2.prototype.copy = function (source) {
		var t = this.data;
		var s = source.data;

		t[0] = s[0];
		t[1] = s[1];
		t[2] = s[2];
		t[3] = s[3];

		return this;
	};

	/**
	 * Returns a new matrix with the same values as the existing one.
	 * @returns {Matrix2x2} The new matrix.
	 */
	Matrix2x2.prototype.clone = function () {
		return new Matrix2x2().copy(this);
	};

	// #ifdef DEBUG
	Matrix.addPostChecks(Matrix2x2.prototype, [
		'add', 'sub', 'mul', 'div', 'combine', 'transpose', 'invert',
		'isOrthogonal', 'determinant',
		'copy'
	]);
	// #endif

	return Matrix2x2;
});

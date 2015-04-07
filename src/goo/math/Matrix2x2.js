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
	 * @param {Matrix2x2|number...} arguments Initial values for the matrix components.
	 */
	function Matrix2x2(
		e00, e10,
		e01, e11
	) {
		Matrix.call(this, 2, 2);

		if (arguments.length === 0) {
			this.data[0] = 1;
			this.data[3] = 1;
		} else {
			this.data[0] = e00;
			this.data[1] = e10;

			this.data[2] = e01;
			this.data[3] = e11;
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
	 * @param {Matrix2x2} that Matrix or scalar on the right-hand side.
	 * @returns {Matrix2x2} Self to allow chaining
	 */
	Matrix2x2.prototype.add = function (that) {
		var thisData = this.data;
		var thatData = that.data;

		thisData[0] += thatData[0];
		thisData[1] += thatData[1];
		thisData[2] += thatData[2];
		thisData[3] += thatData[3];

		return this;
	};

	/**
	 * Performs a component-wise subtraction.
	 * @param {Matrix2x2} that Matrix or scalar on the right-hand side.
	 * @returns {Matrix2x2} Self to allow chaining
	 */
	Matrix2x2.prototype.sub = function (that) {
		var thisData = this.data;
		var thatData = that.data;

		thisData[0] -= thatData[0];
		thisData[1] -= thatData[1];
		thisData[2] -= thatData[2];
		thisData[3] -= thatData[3];

		return this;
	};

	/**
	 * Multiplies this matrix with a scalar
	 * @param {number} scalar
	 * @returns {Matrix2x2} Self to allow chaining
	 */
	Matrix2x2.prototype.scale = function (scalar) {
		var data = this.data;

		data[0] *= scalar;
		data[1] *= scalar;
		data[2] *= scalar;
		data[3] *= scalar;

		return this;
	};

	/**
	 * Multiplies this matrix with another matrix
	 * @param {Matrix2x2} that Matrix on the left-hand side
	 * @returns {Matrix2x2} Self to allow chaining
	 */
	Matrix2x2.prototype.mulPre = function (that) {
		var s1d = that.data;
		var m00 = s1d[0], m01 = s1d[2],
			m10 = s1d[1], m11 = s1d[3];

		var s2d = this.data;
		var n00 = s2d[0], n01 = s2d[2],
			n10 = s2d[1], n11 = s2d[3];

		var rd = this.data;

		rd[0] = m00 * n00 + m01 * n10;
		rd[2] = m00 * n10 + m01 * n11;

		rd[1] = m10 * n00 + m11 * n10;
		rd[3] = m10 * n01 + m11 * n11;

		return this;
	};

	/**
	 * Multiplies two matrices and stores the result in this matrix
	 * @param {Matrix2x2} lhs Matrix on the left-hand side
	 * @param {Matrix2x2} rhs Matrix on the right-hand side
	 * @returns {Matrix2x2} Self to allow chaining
	 */
	Matrix2x2.prototype.mul2 = function (lhs, rhs) {
		var s1d = lhs.data;
		var m00 = s1d[0], m01 = s1d[2],
			m10 = s1d[1], m11 = s1d[3];

		var s2d = rhs.data;
		var n00 = s2d[0], n01 = s2d[2],
			n10 = s2d[1], n11 = s2d[3];

		var rd = this.data;

		rd[0] = m00 * n00 + m01 * n10;
		rd[2] = m00 * n10 + m01 * n11;

		rd[1] = m10 * n00 + m11 * n10;
		rd[3] = m10 * n01 + m11 * n11;

		return this;
	};

	/**
	 * Transposes a matrix (exchanges rows and columns).
	 * @returns {Matrix2x2} Self to allow chaining
	 */
	Matrix2x2.prototype.transpose = function () {
		var data = this.data;

		var e10 = data[1];
		data[1] = data[2];
		data[2] = e10;

		return this;
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
			return target.copy(Matrix2x2.invert(source));
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
	 * @returns {boolean} True if orthogonal.
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
	 * Compares two matrices for approximate equality
	 * @param {Matrix2x2} that The matrix to compare against
	 * @returns {boolean}
	 */
	Matrix2x2.prototype.equals = function (that) {
		var thisData = this.data;
		var thatData = that.data;

		return (Math.abs(thisData[0] - thatData[0]) <= MathUtils.EPSILON) &&
			(Math.abs(thisData[1] - thatData[1]) <= MathUtils.EPSILON) &&
			(Math.abs(thisData[2] - thatData[2]) <= MathUtils.EPSILON) &&
			(Math.abs(thisData[3] - thatData[3]) <= MathUtils.EPSILON);
	};

	/**
	 * Copies component values from another matrix to this matrix
	 * @param {Matrix2x2} that Source matrix
	 * @returns {Matrix2x2} Self to allow chaining
	 */
	Matrix2x2.prototype.copy = function (that) {
		var thisData = this.data;
		var thatData = that.data;

		thisData[0] = thatData[0];
		thisData[1] = thatData[1];
		thisData[2] = thatData[2];
		thisData[3] = thatData[3];

		return this;
	};

	/**
	 * Sets the matrix's values from another matrix's values; an alias for .copy
	 * @param {Matrix2x2} that Source matrix
	 * @returns {Matrix2x2} Self to allow chaining
	 */
	Matrix2x2.prototype.set = Matrix2x2.prototype.copy;

	/**
	 * Returns a new matrix with the same values as the existing one
	 * @returns {Matrix2x2} The new matrix
	 */
	Matrix2x2.prototype.clone = function () {
		return new Matrix2x2().copy(this);
	};

	// #ifdef DEBUG
	Matrix.addPostChecks(Matrix2x2.prototype, [
		'add', 'sub', 'scale', 'transpose', 'invert',
		'isOrthogonal', 'determinant',
		'copy'
	]);
	// #endif

	return Matrix2x2;
});

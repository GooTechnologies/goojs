define([
	'goo/math/MathUtils',
	'goo/math/Matrix'
], function (
	MathUtils,
	Matrix
) {
	'use strict';

	/**
	 * Matrix with 4x4 components.
	 * @extends Matrix
	 * @param {Matrix4x4|number[]|...number} arguments Initial values for the components.
	 */
	function Matrix4x4() {
		Matrix.call(this, 4, 4);

		if (arguments.length === 0) {
			this.data[0] = 1;
			this.data[5] = 1;
			this.data[10] = 1;
			this.data[15] = 1;
		} else {
			Matrix.prototype.set.apply(this, arguments);
		}

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	Matrix4x4.prototype = Object.create(Matrix.prototype);
	Matrix4x4.prototype.constructor = Matrix4x4;

	Matrix.setupAliases(Matrix4x4.prototype, [['e00'], ['e10'], ['e20'], ['e30'], ['e01'], ['e11'], ['e21'], ['e31'], ['e02'], ['e12'], ['e22'], ['e32'], ['e03'], ['e13'], ['e23'], ['e33']]);

	Matrix4x4.IDENTITY = new Matrix4x4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

	/**
	 * Performs a component-wise addition.
	 * @param {Matrix4x4} lhs Matrix on the left-hand side.
	 * @param {Matrix4x4|Float} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix4x4} [target] Target matrix for storage.
	 * @returns {Matrix4x4} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix4x4.add = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		if (rhs instanceof Matrix4x4) {
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
		} else {
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
		}

		return target;
	};

	/**
	 * Performs a component-wise addition.
	 * @param {Matrix4x4|Float} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.add = function (rhs) {
		return Matrix4x4.add(this, rhs, this);
	};

	/**
	 * Performs a component-wise subtraction.
	 * @param {Matrix4x4} lhs Matrix on the left-hand side.
	 * @param {Matrix4x4|Float} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix4x4} [target] Target matrix for storage.
	 * @returns {Matrix4x4} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix4x4.sub = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		if (rhs instanceof Matrix4x4) {
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
		} else {
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
		}

		return target;
	};

	/**
	 * Performs a component-wise subtraction.
	 * @param {Matrix4x4|Float} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.sub = function (rhs) {
		return Matrix4x4.sub(this, rhs, this);
	};

	/**
	 * Performs a component-wise multiplication.
	 * @param {Matrix4x4} lhs Matrix on the left-hand side.
	 * @param {Matrix4x4|Float} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix4x4} [target] Target matrix for storage.
	 * @returns {Matrix4x4} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix4x4.mul = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		if (rhs instanceof Matrix4x4) {
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
		} else {
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
		}

		return target;
	};

	/**
	 * Performs a component-wise multiplication.
	 * @param {Matrix4x4|Float} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.mul = function (rhs) {
		return Matrix4x4.mul(this, rhs, this);
	};

	Matrix4x4.prototype.scale = function (scalar) {
		var data = this.data;

		data[0] *= scalar;
		data[1] *= scalar;
		data[2] *= scalar;
		data[3] *= scalar;
		data[4] *= scalar;
		data[5] *= scalar;
		data[6] *= scalar;
		data[7] *= scalar;
		data[8] *= scalar;
		data[9] *= scalar;
		data[10] *= scalar;
		data[11] *= scalar;
		data[12] *= scalar;
		data[13] *= scalar;
		data[14] *= scalar;
		data[15] *= scalar;

		return this;
	};

	/**
	 * Performs a component-wise division.
	 * @param {Matrix4x4} lhs Matrix on the left-hand side.
	 * @param {Matrix4x4|Float} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix4x4} [target] Target matrix for storage.
	 * @returns {Matrix4x4} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix4x4.div = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		if (rhs instanceof Matrix4x4) {
			target.e00 = lhs.e00 / rhs.e00;
			target.e10 = lhs.e10 / rhs.e10;
			target.e20 = lhs.e20 / rhs.e20;
			target.e30 = lhs.e30 / rhs.e30;
			target.e01 = lhs.e01 / rhs.e01;
			target.e11 = lhs.e11 / rhs.e11;
			target.e21 = lhs.e21 / rhs.e21;
			target.e31 = lhs.e31 / rhs.e31;
			target.e02 = lhs.e02 / rhs.e02;
			target.e12 = lhs.e12 / rhs.e12;
			target.e22 = lhs.e22 / rhs.e22;
			target.e32 = lhs.e32 / rhs.e32;
			target.e03 = lhs.e03 / rhs.e03;
			target.e13 = lhs.e13 / rhs.e13;
			target.e23 = lhs.e23 / rhs.e23;
			target.e33 = lhs.e33 / rhs.e33;
		} else {
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

		}

		return target;
	};

	/**
	 * Performs a component-wise division.
	 * @param {Matrix4x4|Float} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.div = function (rhs) {
		return Matrix4x4.div(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Combines two matrices (matrix multiplication) and stores the result in a separate matrix.
	 * @param {Matrix4x4} lhs Matrix on the left-hand side.
	 * @param {Matrix4x4} rhs Matrix on the right-hand side.
	 * @param {Matrix4x4} [target] Target matrix for storage.
	 * @returns {Matrix4x4} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix4x4.combine = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		var s1d = lhs.data;
		var m00 = s1d[0], m01 = s1d[4], m02 = s1d[8], m03 = s1d[12],
			m10 = s1d[1], m11 = s1d[5], m12 = s1d[9], m13 = s1d[13],
			m20 = s1d[2], m21 = s1d[6], m22 = s1d[10], m23 = s1d[14],
			m30 = s1d[3], m31 = s1d[7], m32 = s1d[11], m33 = s1d[15];
		var s2d = rhs.data;
		var n00 = s2d[0], n01 = s2d[4], n02 = s2d[8], n03 = s2d[12],
			n10 = s2d[1], n11 = s2d[5], n12 = s2d[9], n13 = s2d[13],
			n20 = s2d[2], n21 = s2d[6], n22 = s2d[10], n23 = s2d[14],
			n30 = s2d[3], n31 = s2d[7], n32 = s2d[11], n33 = s2d[15];

		var rd = target.data;
		rd[0] = m00 * n00 + m01 * n10 + m02 * n20 + m03 * n30;
		rd[4] = m00 * n01 + m01 * n11 + m02 * n21 + m03 * n31;
		rd[8] = m00 * n02 + m01 * n12 + m02 * n22 + m03 * n32;
		rd[12] = m00 * n03 + m01 * n13 + m02 * n23 + m03 * n33;

		rd[1] = m10 * n00 + m11 * n10 + m12 * n20 + m13 * n30;
		rd[5] = m10 * n01 + m11 * n11 + m12 * n21 + m13 * n31;
		rd[9] = m10 * n02 + m11 * n12 + m12 * n22 + m13 * n32;
		rd[13] = m10 * n03 + m11 * n13 + m12 * n23 + m13 * n33;

		rd[2] = m20 * n00 + m21 * n10 + m22 * n20 + m23 * n30;
		rd[6] = m20 * n01 + m21 * n11 + m22 * n21 + m23 * n31;
		rd[10] = m20 * n02 + m21 * n12 + m22 * n22 + m23 * n32;
		rd[14] = m20 * n03 + m21 * n13 + m22 * n23 + m23 * n33;

		rd[3] = m30 * n00 + m31 * n10 + m32 * n20 + m33 * n30;
		rd[7] = m30 * n01 + m31 * n11 + m32 * n21 + m33 * n31;
		rd[11] = m30 * n02 + m31 * n12 + m32 * n22 + m33 * n32;
		rd[15] = m30 * n03 + m31 * n13 + m32 * n23 + m33 * n33;

		return target;
	};

	/**
	 * Combines two matrices (matrix multiplication) and stores the result locally.
	 * @param {Matrix4x4} rhs Matrix on the right-hand side.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.combine = function (rhs) {
		return Matrix4x4.combine(this, rhs, this);
	};

	/**
	 * Transposes a matrix (exchanges rows and columns) and stores the result in a separate matrix.
	 * @param {Matrix4x4} source Source matrix.
	 * @param {Matrix4x4} [target] Target matrix.
	 * @returns {Matrix4x4} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix4x4.transpose = function (source, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		var s = source.data;
		var t = target.data;

		if (target === source) {
			var e01 = s[4];
			var e02 = s[8];
			var e03 = s[12];
			var e12 = s[9];
			var e13 = s[13];
			var e23 = s[14];

			t[4] = s[1];
			t[8] = s[2];
			t[12] = s[3];
			t[9] = s[6];
			t[13] = s[7];
			t[14] = s[11];

			t[1] = e01;
			t[2] = e02;
			t[3] = e03;
			t[6] = e12;
			t[7] = e13;
			t[11] = e23;

			return target;
		}

		t[0] = s[0];
		t[1] = s[4];
		t[2] = s[8];
		t[3] = s[12];
		t[4] = s[1];
		t[5] = s[5];
		t[6] = s[9];
		t[7] = s[13];
		t[8] = s[2];
		t[9] = s[6];
		t[10] = s[10];
		t[11] = s[14];
		t[12] = s[3];
		t[13] = s[7];
		t[14] = s[11];
		t[15] = s[15];

		return target;
	};

	/**
	 * Transposes the matrix (exchanges rows and columns) and stores the result locally.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.transpose = function () {
		return Matrix4x4.transpose(this, this);
	};

	/**
	 * Computes the analytical inverse and stores the result in a separate matrix.
	 * @param {Matrix4x4} source Source matrix.
	 * @param {Matrix4x4} [target] Target matrix.
	 * @returns {Matrix4x4} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix4x4.invert = function (source, target) {
		if (!target) {
			target = new Matrix4x4();
		}

		if (target === source) {
			return Matrix.copy(Matrix4x4.invert(source), target);
		}

		var det = source.determinant();

		if (!det) { //! AT: why not Math.abs(det) < MathUtils.EPSILON ? (I don't dare change it)
			return target;
		}

		var s = source.data;
		var t = target.data;

		det = 1.0 / det;

		t[0] = (s[5] * (s[10] * s[15] - s[14] * s[11]) - s[9] * (s[6] * s[15] - s[14] * s[7]) + s[13] * (s[6] * s[11] - s[10] * s[7])) * det;
		t[1] = (s[1] * (s[14] * s[11] - s[10] * s[15]) - s[9] * (s[14] * s[3] - s[2] * s[15]) + s[13] * (s[10] * s[3] - s[2] * s[11])) * det;
		t[2] = (s[1] * (s[6] * s[15] - s[14] * s[7]) - s[5] * (s[2] * s[15] - s[14] * s[3]) + s[13] * (s[2] * s[7] - s[6] * s[3])) * det;
		t[3] = (s[1] * (s[10] * s[7] - s[6] * s[11]) - s[5] * (s[10] * s[3] - s[2] * s[11]) + s[9] * (s[6] * s[3] - s[2] * s[7])) * det;
		t[4] = (s[4] * (s[14] * s[11] - s[10] * s[15]) - s[8] * (s[14] * s[7] - s[6] * s[15]) + s[12] * (s[10] * s[7] - s[6] * s[11])) * det;
		t[5] = (s[0] * (s[10] * s[15] - s[14] * s[11]) - s[8] * (s[2] * s[15] - s[14] * s[3]) + s[12] * (s[2] * s[11] - s[10] * s[3])) * det;
		t[6] = (s[0] * (s[14] * s[7] - s[6] * s[15]) - s[4] * (s[14] * s[3] - s[2] * s[15]) + s[12] * (s[6] * s[3] - s[2] * s[7])) * det;
		t[7] = (s[0] * (s[6] * s[11] - s[10] * s[7]) - s[4] * (s[2] * s[11] - s[10] * s[3]) + s[8] * (s[2] * s[7] - s[6] * s[3])) * det;
		t[8] = (s[4] * (s[9] * s[15] - s[13] * s[11]) - s[8] * (s[5] * s[15] - s[13] * s[7]) + s[12] * (s[5] * s[11] - s[9] * s[7])) * det;
		t[9] = (s[0] * (s[13] * s[11] - s[9] * s[15]) - s[8] * (s[13] * s[3] - s[1] * s[15]) + s[12] * (s[9] * s[3] - s[1] * s[11])) * det;
		t[10] = (s[0] * (s[5] * s[15] - s[13] * s[7]) - s[4] * (s[1] * s[15] - s[13] * s[3]) + s[12] * (s[1] * s[7] - s[5] * s[3])) * det;
		t[11] = (s[0] * (s[9] * s[7] - s[5] * s[11]) - s[4] * (s[9] * s[3] - s[1] * s[11]) + s[8] * (s[5] * s[3] - s[1] * s[7])) * det;
		t[12] = (s[4] * (s[13] * s[10] - s[9] * s[14]) - s[8] * (s[13] * s[6] - s[5] * s[14]) + s[12] * (s[9] * s[6] - s[5] * s[10])) * det;
		t[13] = (s[0] * (s[9] * s[14] - s[13] * s[10]) - s[8] * (s[1] * s[14] - s[13] * s[2]) + s[12] * (s[1] * s[10] - s[9] * s[2])) * det;
		t[14] = (s[0] * (s[13] * s[6] - s[5] * s[14]) - s[4] * (s[13] * s[2] - s[1] * s[14]) + s[12] * (s[5] * s[2] - s[1] * s[6])) * det;
		t[15] = (s[0] * (s[5] * s[10] - s[9] * s[6]) - s[4] * (s[1] * s[10] - s[9] * s[2]) + s[8] * (s[1] * s[6] - s[5] * s[2])) * det;

		return target;
	};

	/**
	 * Computes the analytical inverse and stores the result locally.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.invert = function () {
		return Matrix4x4.invert(this, this);
	};

	/**
	 * Tests if the matrix is orthogonal.
	 * @returns {Boolean} True if orthogonal.
	 */
	Matrix4x4.prototype.isOrthogonal = function () {
		var dot;

		dot = this.e00 * this.e01 + this.e10 * this.e11 + this.e20 * this.e21 + this.e30 * this.e31;

		if (Math.abs(dot) > MathUtils.EPSILON) {
			return false;
		}

		dot = this.e00 * this.e02 + this.e10 * this.e12 + this.e20 * this.e22 + this.e30 * this.e32;

		if (Math.abs(dot) > MathUtils.EPSILON) {
			return false;
		}

		dot = this.e00 * this.e03 + this.e10 * this.e13 + this.e20 * this.e23 + this.e30 * this.e33;

		if (Math.abs(dot) > MathUtils.EPSILON) {
			return false;
		}

		dot = this.e01 * this.e02 + this.e11 * this.e12 + this.e21 * this.e22 + this.e31 * this.e32;

		if (Math.abs(dot) > MathUtils.EPSILON) {
			return false;
		}

		dot = this.e01 * this.e03 + this.e11 * this.e13 + this.e21 * this.e23 + this.e31 * this.e33;

		if (Math.abs(dot) > MathUtils.EPSILON) {
			return false;
		}

		dot = this.e02 * this.e03 + this.e12 * this.e13 + this.e22 * this.e23 + this.e32 * this.e33;

		//! AT: why wrap in an if?!?!
		if (Math.abs(dot) > MathUtils.EPSILON) {
			return false;
		}

		return true;
	};

	/**
	 * Tests if the matrix is normal.
	 * @returns {Boolean} True if normal.
	 */
	Matrix4x4.prototype.isNormal = function () {
		var l;

		l = this.e00 * this.e00 + this.e10 * this.e10 + this.e20 * this.e20 + this.e30 * this.e30;

		if (Math.abs(l - 1.0) > MathUtils.EPSILON) {
			return false;
		}

		l = this.e01 * this.e01 + this.e11 * this.e11 + this.e21 * this.e21 + this.e31 * this.e31;

		if (Math.abs(l - 1.0) > MathUtils.EPSILON) {
			return false;
		}

		l = this.e02 * this.e02 + this.e12 * this.e12 + this.e22 * this.e22 + this.e32 * this.e32;

		if (Math.abs(l - 1.0) > MathUtils.EPSILON) {
			return false;
		}

		l = this.e03 * this.e03 + this.e13 * this.e13 + this.e23 * this.e23 + this.e33 * this.e33;

		//! AT: why wrap in an if?!?!
		if (Math.abs(l - 1.0) > MathUtils.EPSILON) {
			return false;
		}

		return true;
	};

	/**
	 * Tests if the matrix is orthonormal.
	 * @returns {Boolean} True if orthonormal.
	 */
	Matrix4x4.prototype.isOrthonormal = function () {
		return this.isOrthogonal() && this.isNormal();
	};

	/**
	 * Computes the determinant of the matrix.
	 * @returns {Float} Determinant of matrix.
	 */
	Matrix4x4.prototype.determinant = function () {
		var d = this.data;

		var val1 = d[5] * d[10] * d[15] +
			d[9] * d[14] * d[7] +
			d[13] * d[6] * d[11] -
			d[13] * d[10] * d[7] -
			d[9] * d[6] * d[15] -
			d[5] * d[14] * d[11];
		var val2 = d[1] * d[10] * d[15] +
			d[9] * d[14] * d[3] +
			d[13] * d[2] * d[11] -
			d[13] * d[10] * d[3] -
			d[9] * d[2] * d[15] -
			d[1] * d[14] * d[11];
		var val3 = d[1] * d[6] * d[15] +
			d[5] * d[14] * d[3] +
			d[13] * d[2] * d[7] -
			d[13] * d[6] * d[3] -
			d[5] * d[2] * d[15] -
			d[1] * d[14] * d[7];
		var val4 = d[1] * d[6] * d[11] +
			d[5] * d[10] * d[3] +
			d[9] * d[2] * d[7] -
			d[9] * d[6] * d[3] -
			d[5] * d[2] * d[11] -
			d[1] * d[10] * d[7];

		return d[0] * val1 -
			d[4] * val2 +
			d[8] * val3 -
			d[12] * val4;
	};

	/**
	 * Sets the matrix to identity.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.setIdentity = function () {
		var d = this.data;

		d[0] = 1;
		d[1] = 0;
		d[2] = 0;
		d[3] = 0;
		d[4] = 0;
		d[5] = 1;
		d[6] = 0;
		d[7] = 0;
		d[8] = 0;
		d[9] = 0;
		d[10] = 1;
		d[11] = 0;
		d[12] = 0;
		d[13] = 0;
		d[14] = 0;
		d[15] = 1;

		return this;
	};

	/**
	 * Sets the rotational part of the matrix from a vector of angles. Order convention is x followed by y followed by z.
	 * @param {Vector3} angles Rotational angles in radians.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.setRotationFromVector = function (angles) {
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
	 * Sets the rotational part of the matrix from a quaternion.
	 * @param {Vector4} quaternion Rotational quaternion.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.setRotationFromQuaternion = function (quaternion) {
		var l = quaternion.lengthSquared();

		l = (l > 0.0) ? 2.0 / l : 0.0; //! AT: epsilon?

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
	 * Sets the translational part of the matrix.
	 * @param {Vector3} translation Translation vector.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.setTranslation = function (translation) {
		this.e03 = translation.x;
		this.e13 = translation.y;
		this.e23 = translation.z;

		return this;
	};

	/**
	 * Gets the translational part of the matrix.
	 * @param {Vector3} store Translation vector to store result in.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.getTranslation = function (store) {
		store.x = this.data[12];
		store.y = this.data[13];
		store.z = this.data[14];

		return this;
	};

	/**
	 * Gets the rotational part of the matrix (the upper left 3x3 matrix).
	 * @param {Matrix3x3} store Rotation matrix to store in.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.getRotation = function (store) {
		var d = this.data;
		store.set(
			d[0], d[1], d[2],
			d[4], d[5], d[6],
			d[8], d[9], d[10]
		);
		return this;
	};

	/**
	 * Gets the scaling part of the matrix.
	 * @param {Vector3} store Scaling vector to store result in.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.getScale = function (store) {
		//! AT: length?
		var sx = Math.sqrt(store.setDirect(this.data[0], this.data[4], this.data[8]).lengthSquared());
		var sy = Math.sqrt(store.setDirect(this.data[1], this.data[5], this.data[9]).lengthSquared());
		var sz = Math.sqrt(store.setDirect(this.data[2], this.data[6], this.data[10]).lengthSquared());

		store.x = sx;
		store.y = sy;
		store.z = sz;

		return this;
	};

	/**
	 * Sets the scale of the matrix.
	 * @param {Vector3} scale Scale vector.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.setScale = function (scale) {
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
	 * Applies the matrix (rotation, scale, translation, projection) to a four-dimensional vector. (x = (x*M)^T)
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @returns {Vector4} Transformed right-hand side vector.
	 */

	// REVIEW rherlitz: The name of this method is not 100% intuitive as the method is called through matrix.applyPre(vector)
	// and the matrix is applied after the vector.
	Matrix4x4.prototype.applyPre = function (rhs) {
		// throw '';
		return rhs.applyPre(this);
	};

	/**
	 * Applies the matrix (rotation, scale, translation, projection) to a four-dimensional vector. (x = M*x)
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @returns {Vector4} Transformed right-hand side vector.
	 */
	Matrix4x4.prototype.applyPost = function (rhs) {
		// throw '';
		return rhs.applyPost(this);
	};

	/**
	 * Applies the matrix (rotation, scale, translation) to a three-dimensional vector.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @returns {Vector3} Transformed right-hand side vector.
	 */
	Matrix4x4.prototype.applyPostPoint = function (rhs) {
		// throw '';
		return rhs.applyPostPoint(this);
	};

	/**
	 * Applies the matrix (rotation, scale) to a three-dimensional vector.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @returns {Vector3} Transformed right-hand side vector.
	 */
	Matrix4x4.prototype.applyPostVector = function (rhs) {
		// throw '';
		return rhs.applyPostVector(this);
	};

	/**
	 * Copies component values and stores them locally.
	 * @param {Matrix4x4} source Source matrix.
	 * @returns {Matrix4x4} Self for chaining.
	 */
	Matrix4x4.prototype.copy = function (source) {
		var t = this.data;
		var s = source.data;

		t[0] = s[0];
		t[1] = s[1];
		t[2] = s[2];
		t[3] = s[3];
		t[4] = s[4];
		t[5] = s[5];
		t[6] = s[6];
		t[7] = s[7];
		t[8] = s[8];
		t[9] = s[9];
		t[10] = s[10];
		t[11] = s[11];
		t[12] = s[12];
		t[13] = s[13];
		t[14] = s[14];
		t[15] = s[15];

		return this;
	};

	/**
	 * Returns a new matrix with the same values as the existing one.
	 * @returns {Matrix4x4} The new matrix.
	 */
	Matrix4x4.prototype.clone = function () {
		return new Matrix4x4().copy(this);
	};

	// #ifdef DEBUG
	Matrix.addPostChecks(Matrix4x4.prototype, [
		'add', 'sub', 'mul', 'div', 'combine', 'transpose', 'invert',
		'isOrthogonal', 'determinant', 'applyPre',
		'copy'
	]);
	// #endif

	return Matrix4x4;
});

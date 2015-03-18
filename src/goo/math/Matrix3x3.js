define([
	'goo/math/MathUtils',
	'goo/math/Matrix',
	'goo/math/Vector3'
], function (
	MathUtils,
	Matrix,
	Vector3
) {
	'use strict';

	/**
	 * Matrix with 3x3 components. Used to store 3D rotations. It also contains common 3D Rotation operations.
	 * Creates a new Matrix3x3 by passing in either a current Matrix3x3, number Array, or a set of 9 numbers.
	 * @extends Matrix
	 * @param {Matrix3x3|number[]|...number} arguments Initial values for the components.
	 * @example
	 * // Passing in no arguments
	 * var m1 = new Matrix3x3(); // m1 == (1, 0, 0, 0, 1, 0, 0, 0, 1)
	 *
	 * // Passing in a number Array
	 * var m2 = new Matrix3x3([1, 0, 0, 0, 1, 0, 0, 0, 1]);
	 *		
	 * // Passing in numbers
	 * var m3 = new Matrix3x3(1, 0, 0, 0, 1, 0, 0, 0, 1);
	 *
	 * // Passing in an existing Matrix3x3
	 * var m4 = new Matrix3x3(m1); // m4 == (1, 0, 0, 0, 1, 0, 0, 0, 1)
	 */
	function Matrix3x3() {
		Matrix.call(this, 3, 3);

		if (arguments.length === 0) {
			this.data[0] = 1;
			this.data[4] = 1;
			this.data[8] = 1;
		} else {
			Matrix.prototype.set.apply(this, arguments);
		}

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	Matrix3x3._tempX = new Vector3();
	Matrix3x3._tempY = new Vector3();
	Matrix3x3._tempZ = new Vector3();

	Matrix3x3.prototype = Object.create(Matrix.prototype);
	Matrix3x3.prototype.constructor = Matrix3x3;

	Matrix.setupAliases(Matrix3x3.prototype, [['e00'], ['e10'], ['e20'], ['e01'], ['e11'], ['e21'], ['e02'], ['e12'], ['e22']]);

	/** @type {Matrix3x3} */
	Matrix3x3.IDENTITY = new Matrix3x3(1, 0, 0, 0, 1, 0, 0, 0, 1);

	/**
	 * Adds 'lhs' and 'rhs' and stores the result in 'target'.  If target is not supplied, a new Matrix3x3 object is created and returned.
	 * @param {Matrix3x3} lhs Matrix3x3 on the left-hand side.
	 * @param {Matrix3x3|number} rhs Matrix3x3 or number on the right-hand side.
	 * @param {Matrix3x3} [target] Matrix3x3 to store the result.  If one is not supplied, a new Matrix3x3 object is created.
	 * @returns {Matrix3x3} The target Matrix3x3 passed in, or a new Matrix3x3 object.
	 * @example
	 * // Adds two Matrix3x3 with no target, returns a new Matrix3x3 object as the result
	 * var m1 = new Matrix3x3(); // m1 == (1, 0, 0, 0, 1, 0, 0, 0, 1)
	 * var m2 = new Matrix3x3(0, 1, 0, 1, 0, 0, 1, 0, 0);
	 * var r1 = Matrix3x3.add(m1, m2); // r1 == (1, 1, 0, 1, 1, 0, 1, 0, 1)
	 * 
	 * // Adds a number to a Matrix3x3, using the original Matrix3x3 to store the result
	 * var m1 = new Matrix3x3(); // m1 == (1, 0, 0, 0, 1, 0, 0, 0, 1)
	 * m1.add(1); // m1 == (2, 1, 1, 1, 2, 1, 1, 1, 2)
	 */
	Matrix3x3.add = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		var td = target.data, ld = lhs.data;
		if (rhs instanceof Matrix3x3) {
			var rd = rhs.data;
			td[0] = ld[0] + rd[0];
			td[1] = ld[1] + rd[1];
			td[2] = ld[2] + rd[2];
			td[3] = ld[3] + rd[3];
			td[4] = ld[4] + rd[4];
			td[5] = ld[5] + rd[5];
			td[6] = ld[6] + rd[6];
			td[7] = ld[7] + rd[7];
			td[8] = ld[8] + rd[8];
		} else {
			td[0] = ld[0] + rhs;
			td[1] = ld[1] + rhs;
			td[2] = ld[2] + rhs;
			td[3] = ld[3] + rhs;
			td[4] = ld[4] + rhs;
			td[5] = ld[5] + rhs;
			td[6] = ld[6] + rhs;
			td[7] = ld[7] + rhs;
			td[8] = ld[8] + rhs;
		}

		return target;
	};

	/**
	 * Adds 'rhs' to the current Matrix3x3.
	 * @param {Matrix3x3|number} rhs Matrix3x3 or number on the right-hand side.
	 * @returns {Matrix3x3} Self for chaining.
	 * @example
	 * // Adds a Matrix3x3 to the current Matrix3x3
	 * var m1 = new Matrix3x3(); // m1 == (1, 0, 0, 0, 1, 0, 0, 0, 1)
	 * var m2 = new Matrix3x3(0, 1, 1, 1, 0, 1, 1, 1, 0);
	 * m1.add(m2); // m1 == (1, 1, 1, 1, 1, 1, 1, 1, 1)
	 * // Adds a number to the current Matrix3x3
	 * var m1 = new Matrix3x3(); // m1 == (1, 0, 0, 0, 1, 0, 0, 0, 1)
	 * m1.add(1); // m1 == (2, 1, 1, 1, 2, 1, 1, 1, 2)
	 */
	Matrix3x3.prototype.add = function (rhs) {
		return Matrix3x3.add(this, rhs, this);
	};

	/**
	 * Subtracts 'rhs' from 'lhs', and stores the reseult in 'target'.  If target is not supplied, a new Matrix3x3 object is created and returned.
	 * @param {Matrix3x3} lhs Matrix3x3 on the left-hand side.
	 * @param {Matrix3x3|number} rhs Matrix3x3 or number on the right-hand side.
	 * @param {Matrix3x3} [target] Matrix3x3 to store the result.  If one is not supplied, a new Matrix3x3 object is created.
	 * @returns {Matrix3x3} The target Matrix3x3 passed in, or a new Matrix3x3 object.
	 * @example
	 * // Subtracts 'right' from 'left' with no target, returns a new Matrix3x3 object as the result
	 * var left = new Matrix3x3(); // m1 == (1, 0, 0, 0, 1, 0, 0, 0, 1)
	 * var right = new Matrix3x3(0, 1, 0, 1, 0, 0, 1, 0, 0);
	 * var result = Matrix3x3.sub(left, right); // result == (1, -1, 0, -1, 1, 0, -1, 0, 1)
	 * 
	 * // Subtracts a number from a Matrix3x3, using the original Matrix3x3 to store the result
	 * var m1 = new Matrix3x3(); // m1 == (1, 0, 0, 0, 1, 0, 0, 0, 1)
	 * m1.sub(1); // m1 == (0, -1, -1, -1, 0, -1, -1, -1, 0)
	 */
	Matrix3x3.sub = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		var td = target.data, ld = lhs.data;
		if (rhs instanceof Matrix3x3) {
			var rd = rhs.data;
			td[0] = ld[0] - rd[0];
			td[1] = ld[1] - rd[1];
			td[2] = ld[2] - rd[2];
			td[3] = ld[3] - rd[3];
			td[4] = ld[4] - rd[4];
			td[5] = ld[5] - rd[5];
			td[6] = ld[6] - rd[6];
			td[7] = ld[7] - rd[7];
			td[8] = ld[8] - rd[8];
		} else {
			td[0] = ld[0] - rhs;
			td[1] = ld[1] - rhs;
			td[2] = ld[2] - rhs;
			td[3] = ld[3] - rhs;
			td[4] = ld[4] - rhs;
			td[5] = ld[5] - rhs;
			td[6] = ld[6] - rhs;
			td[7] = ld[7] - rhs;
			td[8] = ld[8] - rhs;
		}

		return target;
	};

	/**
	 * Subtracts 'rhs' from the current Matrix3x3.
	 * @param {Matrix3x3|number} rhs Matrix3x3 or number on the right-hand side.
	 * @returns {Matrix3x3} Self for chaining.
	 * @example
	 * // Subtracts a Matrix3x3 from the current Matrix3x3
	 * var m1 = new Matrix3x3(); // m1 == (1, 0, 0, 0, 1, 0, 0, 0, 1)
	 * var m2 = new Matrix3x3(0, 1, 1, 1, 0, 1, 1, 1, 0);
	 * m1.sub(m2); // m1 == (1, -1, -1, -1, 1, -1, -1, -1, 0)
	 *
	 * // Subtracts a number from the current Matrix3x3
	 * var m1 = new Matrix3x3(); // m1 == (1, 0, 0, 0, 1, 0, 0, 0, 1)
	 * m1.sub(1); // m1 == (0, -1, -1, -1, 0, -1, -1, -1, 0)
	 */
	Matrix3x3.prototype.sub = function (rhs) {
		return Matrix3x3.sub(this, rhs, this);
	};

	/**
	 * Performs a component-wise multiplication.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Matrix3x3|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix3x3} [target] Target matrix for storage.
	 * @returns {Matrix3x3} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix3x3.mul = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		var td = target.data, ld = lhs.data;
		if (rhs instanceof Matrix3x3) {
			var rd = rhs.data;
			td[0] = ld[0] * rd[0];
			td[1] = ld[1] * rd[1];
			td[2] = ld[2] * rd[2];
			td[3] = ld[3] * rd[3];
			td[4] = ld[4] * rd[4];
			td[5] = ld[5] * rd[5];
			td[6] = ld[6] * rd[6];
			td[7] = ld[7] * rd[7];
			td[8] = ld[8] * rd[8];
		} else {
			td[0] = ld[0] * rhs;
			td[1] = ld[1] * rhs;
			td[2] = ld[2] * rhs;
			td[3] = ld[3] * rhs;
			td[4] = ld[4] * rhs;
			td[5] = ld[5] * rhs;
			td[6] = ld[6] * rhs;
			td[7] = ld[7] * rhs;
			td[8] = ld[8] * rhs;
		}

		return target;
	};

	/**
	 * Performs a component-wise multiplication.
	 * @param {Matrix3x3|number} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix3x3} Self for chaining.
	 */
	Matrix3x3.prototype.mul = function (rhs) {
		return Matrix3x3.mul(this, rhs, this);
	};

	Matrix3x3.prototype.scale = function (scalar) {
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

		return this;
	};

	/**
	 * Performs a component-wise division.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Matrix3x3|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix3x3} [target] Target matrix for storage.
	 * @returns {Matrix3x3} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix3x3.div = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		var td = target.data, ld = lhs.data;
		if (rhs instanceof Matrix3x3) {
			var rd = rhs.data;
			td[0] = ld[0] / rd[0];
			td[1] = ld[1] / rd[1];
			td[2] = ld[2] / rd[2];
			td[3] = ld[3] / rd[3];
			td[4] = ld[4] / rd[4];
			td[5] = ld[5] / rd[5];
			td[6] = ld[6] / rd[6];
			td[7] = ld[7] / rd[7];
			td[8] = ld[8] / rd[8];
		} else {
			td[0] = ld[0] / rhs;
			td[1] = ld[1] / rhs;
			td[2] = ld[2] / rhs;
			td[3] = ld[3] / rhs;
			td[4] = ld[4] / rhs;
			td[5] = ld[5] / rhs;
			td[6] = ld[6] / rhs;
			td[7] = ld[7] / rhs;
			td[8] = ld[8] / rhs;
		}

		return target;
	};

	/**
	 * Performs a component-wise division.
	 * @param {Matrix3x3|number} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix3x3} Self for chaining.
	 */
	Matrix3x3.prototype.div = function (rhs) {
		return Matrix3x3.div(this, rhs, this);
	};

	/**
	 * Combines two matrices (matrix multiplication) and stores the result in a separate matrix.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Matrix3x3} rhs Matrix on the right-hand side.
	 * @param {Matrix3x3} [target] Target matrix for storage.
	 * @returns {Matrix3x3} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix3x3.combine = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		var s1d = lhs.data;
		var m00 = s1d[0], m01 = s1d[3], m02 = s1d[6],
			m10 = s1d[1], m11 = s1d[4], m12 = s1d[7],
			m20 = s1d[2], m21 = s1d[5], m22 = s1d[8];
		var s2d = rhs.data;
		var n00 = s2d[0], n01 = s2d[3], n02 = s2d[6],
			n10 = s2d[1], n11 = s2d[4], n12 = s2d[7],
			n20 = s2d[2], n21 = s2d[5], n22 = s2d[8];

		var rd = target.data;
		rd[0] = m00 * n00 + m01 * n10 + m02 * n20;
		rd[3] = m00 * n01 + m01 * n11 + m02 * n21;
		rd[6] = m00 * n02 + m01 * n12 + m02 * n22;

		rd[1] = m10 * n00 + m11 * n10 + m12 * n20;
		rd[4] = m10 * n01 + m11 * n11 + m12 * n21;
		rd[7] = m10 * n02 + m11 * n12 + m12 * n22;

		rd[2] = m20 * n00 + m21 * n10 + m22 * n20;
		rd[5] = m20 * n01 + m21 * n11 + m22 * n21;
		rd[8] = m20 * n02 + m21 * n12 + m22 * n22;

		return target;
	};

	/**
	 * Combines two matrices (matrix multiplication) and stores the result locally.
	 * @param {Matrix3x3} rhs Matrix on the right-hand side.
	 * @returns {Matrix3x3} Self for chaining.
	 */
	Matrix3x3.prototype.combine = function (rhs) {
		return Matrix3x3.combine(this, rhs, this);
	};

	/**
	 * Transposes a matrix (exchanges rows and columns) and stores the result in a separate matrix.
	 * @param {Matrix3x3} source Source matrix.
	 * @param {Matrix3x3} [target] Target matrix.
	 * @returns {Matrix3x3} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix3x3.transpose = function (source, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		var s = source.data;
		var t = target.data;

		if (target === source) {
			var e01 = s[3];
			var e02 = s[6];
			var e12 = s[7];

			t[3] = s[1];
			t[6] = s[2];
			t[7] = s[5];

			t[1] = e01;
			t[2] = e02;
			t[5] = e12;

			return target;
		}

		t[0] = s[0];
		t[1] = s[3];
		t[2] = s[6];
		t[3] = s[1];
		t[4] = s[4];
		t[5] = s[7];
		t[6] = s[2];
		t[7] = s[5];
		t[8] = s[8];

		return target;
	};

	/**
	 * Transposes the matrix (exchanges rows and columns) and stores the result locally.
	 * @returns {Matrix3x3} Self for chaining.
	 */
	Matrix3x3.prototype.transpose = function () {
		return Matrix3x3.transpose(this, this);
	};

	/**
	 * Computes the analytical inverse and stores the result in a separate matrix.
	 * @param {Matrix3x3} source Source matrix.
	 * @param {Matrix3x3} [target] Target matrix.
	 * @returns {Matrix3x3} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix3x3.invert = function (source, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		if (target === source) {
			return Matrix.copy(Matrix3x3.invert(source), target);
		}

		var det = source.determinant();

		if (Math.abs(det) < MathUtils.EPSILON) {
			return target;
		}

		det = 1.0 / det;
		var td = target.data, sd = source.data;

		td[0] = (sd[4] * sd[8] - sd[7] * sd[5]) * det;
		td[1] = (sd[7] * sd[2] - sd[1] * sd[8]) * det;
		td[2] = (sd[1] * sd[5] - sd[4] * sd[2]) * det;

		td[3] = (sd[6] * sd[5] - sd[3] * sd[8]) * det;
		td[4] = (sd[0] * sd[8] - sd[6] * sd[2]) * det;
		td[5] = (sd[3] * sd[2] - sd[0] * sd[5]) * det;

		td[6] = (sd[3] * sd[7] - sd[6] * sd[4]) * det;
		td[7] = (sd[6] * sd[1] - sd[0] * sd[7]) * det;
		td[8] = (sd[0] * sd[4] - sd[3] * sd[1]) * det;

		return target;
	};

	/**
	 * Computes the analytical inverse and stores the result locally.
	 * @returns {Matrix3x3} Self for chaining.
	 */
	Matrix3x3.prototype.invert = function () {
		return Matrix3x3.invert(this, this);
	};

	/**
	 * Tests if the matrix is orthogonal.
	 * @returns {Boolean} True if orthogonal.
	 */
	Matrix3x3.prototype.isOrthogonal = function () {
		var d = this.data;

		var dot = d[0] * d[3] + d[1] * d[4] + d[2] * d[5];

		if (Math.abs(dot) > MathUtils.EPSILON) {
			return false;
		}

		dot = d[0] * d[6] + d[1] * d[7] + d[2] * d[8];

		if (Math.abs(dot) > MathUtils.EPSILON) {
			return false;
		}

		dot = d[3] * d[6] + d[4] * d[7] + d[5] * d[8];

		if (Math.abs(dot) > MathUtils.EPSILON) {
			return false;
		}

		return true;
	};

	/**
	 * Tests if the matrix is normal.
	 * @returns {boolean} True if normal.
	 */
	Matrix3x3.prototype.isNormal = function () {
		var d = this.data;

		var l = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];

		if (Math.abs(l - 1.0) > MathUtils.EPSILON) {
			return false;
		}

		l = d[3] * d[3] + d[4] * d[4] + d[5] * d[5];

		if (Math.abs(l - 1.0) > MathUtils.EPSILON) {
			return false;
		}

		l = d[6] * d[6] + d[7] * d[7] + d[8] * d[8];

		if (Math.abs(l - 1.0) > MathUtils.EPSILON) {
			return false;
		}

		return true;
	};

	/**
	 * Tests if the matrix is orthonormal.
	 * @returns {boolean} True if orthonormal.
	 */
	Matrix3x3.prototype.isOrthonormal = function () {
		return this.isOrthogonal() && this.isNormal();
	};

	/**
	 * Computes the determinant of the matrix.
	 * @returns {number} Determinant of matrix.
	 */
	Matrix3x3.prototype.determinant = function () {
		var d = this.data;
		return d[0] * (d[4] * d[8] - d[7] * d[5]) -
					d[3] * (d[1] * d[8] - d[7] * d[2]) +
					d[6] * (d[1] * d[5] - d[4] * d[2]);
	};

	/**
	 * Sets the matrix to identity: (1, 0, 0, 0, 1, 0, 0, 0, 1).
	 * @returns {Matrix3x3} Self for chaining.
	 */
	Matrix3x3.prototype.setIdentity = function () {
		var d = this.data;

		d[0] = 1;
		d[1] = 0;
		d[2] = 0;

		d[3] = 0;
		d[4] = 1;
		d[5] = 0;

		d[6] = 0;
		d[7] = 0;
		d[8] = 1;

		return this;
	};

	/**
	 * Applies the matrix (rotation, scale) to a three-dimensional vector.
	 * @param {Vector3} rhs Vector3 on the right-hand side.  The Vector3 passed in IS modified.
	 * @returns {Vector3} Transformed right-hand side Vector3.
	 * @example
	 * var forward = new Vector3(0, 0, -1);
	 * entity.applyPost(forward); // now 'forward' is in local space
	 */
	Matrix3x3.prototype.applyPost = function (rhs) {
		// throw '';
		return rhs.applyPost(this);
	};

	/**
	 * Applies the matrix (rotation, scale) to a three-dimensional vector.
	 * @param {Vector3} rhs Vector on the left-hand side.
	 * @returns {Vector3} Transformed left-hand side vector.
	 */
	Matrix3x3.prototype.applyPre = function (rhs) {
		// throw '';
		return rhs.applyPre(this);
	};

	// unused
	/**
	 * Post-multiplies the matrix ("before") with a scaling vector.
	 * @param {Vector3} vec Vector on the right-hand side.
	 * @param {Matrix3x3} result Storage matrix.
	 * @returns {Matrix3x3} Storage matrix.
	 */
	Matrix3x3.prototype.multiplyDiagonalPost = function (vec, result) {
		var x = vec.x;
		var y = vec.y;
		var z = vec.z;

		var d = this.data;
		var r = result.data;
		r[0] = x * d[0];
		r[1] = x * d[1];
		r[2] = x * d[2];
		r[3] = y * d[3];
		r[4] = y * d[4];
		r[5] = y * d[5];
		r[6] = z * d[6];
		r[7] = z * d[7];
		r[8] = z * d[8];

		return result;
	};

	/**
	 * Sets the Matrix3x3 from rotational angles in radians.
	 * @param {number} pitch Pitch (X axis) angle in radians.
	 * @param {number} yaw Yaw (Y axis) angle in radians.
	 * @param {number} roll Roll (Z axis) angle in radians.
	 * @returns {Matrix3x3} Self for chaining.
	 * @example
	 * // sets the rotation to Math.PI (180 degrees) on the Y axis
	 * entity.transformComponent.transform.rotation.fromAngles(0, Math.PI, 0);
	 */
	Matrix3x3.prototype.fromAngles = function (pitch, yaw, roll) {
		var cy = Math.cos(pitch);
		var sy = Math.sin(pitch);
		var ch = Math.cos(yaw);
		var sh = Math.sin(yaw);
		var cp = Math.cos(roll);
		var sp = Math.sin(roll);

		var d = this.data;
		d[0] = ch * cp;
		d[3] = sh * sy - ch * sp * cy;
		d[6] = ch * sp * sy + sh * cy;
		d[1] = sp;
		d[4] = cp * cy;
		d[7] = -cp * sy;
		d[2] = -sh * cp;
		d[5] = sh * sp * cy + ch * sy;
		d[8] = -sh * sp * sy + ch * cy;

		return this;
	};

	/**
	 * Rotates a Matrix3x3 by the given angle in radians, around the X axis.
	 *
	 * @param {number} rad the angle in radians to rotate the Matrix3x3 by.
	 * @param {Matrix3x3} [store] the target Matrix3x3 to store the result or 'this', if undefined.
	 * @returns {Matrix3x3} store
	 * @example
	 * // rotates the entity on the X axis, by the amount of time per frame (tpf)
	 * entity.transformComponent.transform.rotation.rotateX(goo.world.tpf);
	 */
	Matrix3x3.prototype.rotateX = function (rad, store) {
		store = store || this;
		var a = this.data;
		var out = store.data;

		var s = Math.sin(rad),
			c = Math.cos(rad),
			a10 = a[3],
			a11 = a[4],
			a12 = a[5],
			a20 = a[6],
			a21 = a[7],
			a22 = a[8];

		if (a !== out) { // If the source and destination differ, copy the unchanged rows
			out[0] = a[0];
			out[1] = a[1];
			out[2] = a[2];
		}

		// Perform axis-specific matrix multiplication
		out[3] = a10 * c + a20 * s;
		out[4] = a11 * c + a21 * s;
		out[5] = a12 * c + a22 * s;
		out[6] = a20 * c - a10 * s;
		out[7] = a21 * c - a11 * s;
		out[8] = a22 * c - a12 * s;

		return store;
	};

	/**
	 * Rotates a Matrix3x3 by the given angle in radians, around the Y axis.
	 *
	 * @param {number} rad the angle in radians to rotate the Matrix3x3 by.
	 * @param {Matrix3x3} [store] the target Matrix3x3 to store the result or 'this', if undefined.
	 * @returns {Matrix3x3} store
	 * @example
	 * // rotates the entity on the Y axis, by Math.PI*0.5 (90 degrees)
	 * entity.transformComponent.transform.rotation.rotateY(Math.PI*0.5);
	 */
	Matrix3x3.prototype.rotateY = function (rad, store) {
		store = store || this;
		var a = this.data;
		var out = store.data;

		var s = Math.sin(rad),
			c = Math.cos(rad),
			a00 = a[0],
			a01 = a[1],
			a02 = a[2],
			a20 = a[6],
			a21 = a[7],
			a22 = a[8];

		if (a !== out) { // If the source and destination differ, copy the unchanged rows
			out[3] = a[3];
			out[4] = a[4];
			out[5] = a[5];
		}

		// Perform axis-specific matrix multiplication
		out[0] = a00 * c - a20 * s;
		out[1] = a01 * c - a21 * s;
		out[2] = a02 * c - a22 * s;
		out[6] = a00 * s + a20 * c;
		out[7] = a01 * s + a21 * c;
		out[8] = a02 * s + a22 * c;

		return store;
	};

	/**
	 * Rotates a Matrix3x3 by the given angle in radians, around the Z axis.
	 *
	 * @param {number} rad the angle in radians to rotate the Matrix3x3 by.
	 * @param {Matrix3x3} [store] the target Matrix3x3 to store the result or 'this', if undefined.
	 * @returns {Matrix3x3} store
	 * @example
	 * // rotates the entity on the Z axis, by 3.14 (180 degrees)
	 * entity.transformComponent.transform.rotation.rotateZ(3.14);
	 */
	Matrix3x3.prototype.rotateZ = function (rad, store) {
		store = store || this;
		var a = this.data;
		var out = store.data;

		var s = Math.sin(rad),
			c = Math.cos(rad),
			a00 = a[0],
			a01 = a[1],
			a02 = a[2],
			a10 = a[3],
			a11 = a[4],
			a12 = a[5];

		if (a !== out) { // If the source and destination differ, copy the unchanged last row
			out[6] = a[6];
			out[7] = a[7];
			out[8] = a[8];
		}

		// Perform axis-specific matrix multiplication
		out[0] = a00 * c + a10 * s;
		out[1] = a01 * c + a11 * s;
		out[2] = a02 * c + a12 * s;
		out[3] = a10 * c - a00 * s;
		out[4] = a11 * c - a01 * s;
		out[5] = a12 * c - a02 * s;

		return store;
	};

	/**
	 * Converts the current Matrix3x3 to Euler rotation angles in radians: (X axis, Y axis, Z axis)
	 * @param {Vector3} Vector3 to store the computed angles in (or undefined to create a new one).
	 * @returns {Vector3} Result
	 * @example
	 * // Not passing in a Vector3 to store the result, one is created and returned
	 * var rot = entity.transformComponent.transform.rotation.toAngles();
	 *
	 * // Passing in an existing Vector3 to store the result
	 * var angles = new Vector3();
	 * entity.transformComponent.transform.rotation.toAngles(angles);
	 */
	Matrix3x3.prototype.toAngles = function (store) {
		var result = store;
		if (!result) {
			result = new Vector3();
		}

		var d = this.data;
		if (d[3] > 1 - MathUtils.EPSILON) { // singularity at north pole
			result.y = Math.atan2(d[2], d[8]);
			result.z = Math.PI / 2;
			result.x = 0;
		} else if (d[3] < -1 + MathUtils.EPSILON) { // singularity at south pole
			result.y = Math.atan2(d[2], d[8]);
			result.z = -Math.PI / 2;
			result.x = 0;
		} else {
			result.y = Math.atan2(-d[2], d[0]);
			result.x = Math.atan2(-d[7], d[4]);
			result.z = Math.asin(d[1]);
		}

		return result;
	};

	/**
	 * Sets this matrix to the rotation indicated by the given angle and a unit-length axis of rotation.
	 * @param {number} angle the angle to rotate (in radians).
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Matrix3x3} this for chaining
	 */
	Matrix3x3.prototype.fromAngleNormalAxis = function (angle, x, y, z) {
		var fCos = Math.cos(angle);
		var fSin = Math.sin(angle);
		var fOneMinusCos = 1.0 - fCos;
		var fX2 = x * x;
		var fY2 = y * y;
		var fZ2 = z * z;
		var fXYM = x * y * fOneMinusCos;
		var fXZM = x * z * fOneMinusCos;
		var fYZM = y * z * fOneMinusCos;
		var fXSin = x * fSin;
		var fYSin = y * fSin;
		var fZSin = z * fSin;

		var d = this.data;
		d[0] = fX2 * fOneMinusCos + fCos;
		d[3] = fXYM - fZSin;
		d[6] = fXZM + fYSin;
		d[1] = fXYM + fZSin;
		d[4] = fY2 * fOneMinusCos + fCos;
		d[7] = fYZM - fXSin;
		d[2] = fXZM - fYSin;
		d[5] = fYZM + fXSin;
		d[8] = fZ2 * fOneMinusCos + fCos;

		return this;
	};

	/**
	 * Sets the Matrix3x3 to look in a specific direction.
	 * @param {Vector3} direction Direction vector.
	 * @param {Vector3} up Up vector.
	 * @returns {Matrix3x3} Self for chaining.
	 * @example
	 * // get the direction from the current entity to the 'other' entity
	 * var direction = Vector3.sub(other.transformComponent.transform.translation, entity.transformComponent.transform.translation);
	 * // pass in the direction, and use Vector3.UNIT_Y as 'up'
	 * entity.lookAt(direction, Vector3.UNIT_Y);
	 * // update the transform component with the new rotation
	 * entity.transformComponent.setUpdated();
	 */
	Matrix3x3.prototype.lookAt = function (direction, up) {
		var x = Matrix3x3._tempX, y = Matrix3x3._tempY, z = Matrix3x3._tempZ;

		z.set(direction).normalize().scale(-1);

		x.set(up).cross(z).normalize();

		if (x.equals(Vector3.ZERO)) {
			if (z.x !== 0.0) {
				x.setDirect(z.y, -z.x, 0);
			} else {
				x.setDirect(0, z.z, -z.y);
			}
		}

		y.set(z).cross(x);

		var d = this.data;
		d[0] = x.x;
		d[1] = x.y;
		d[2] = x.z;
		d[3] = y.x;
		d[4] = y.y;
		d[5] = y.z;
		d[6] = z.x;
		d[7] = z.y;
		d[8] = z.z;

		return this;
	};

	/**
	 * Sets the matrix from a quaternion.
	 * @param {Quaternion} quaternion Rotational quaternion.
	 * @returns {Matrix3x3} Self for chaining.
	 */
	Matrix3x3.prototype.copyQuaternion = function (quaternion) {
		return quaternion.toRotationMatrix(this);
	};

	/**
	 * Copies component values and stores them locally.
	 * @param {Matrix3x3} source Source matrix.
	 * @returns {Matrix3x3} Self for chaining.
	 */
	Matrix3x3.prototype.copy = function (source) {
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

		return this;
	};

	/**
	 * Returns a new matrix with the same values as the existing one.
	 * @returns {Matrix3x3} The new matrix.
	 */
	Matrix3x3.prototype.clone = function () {
		return new Matrix3x3().copy(this);
	};

	// #ifdef DEBUG
	Matrix.addPostChecks(Matrix3x3.prototype, [
		'add', 'sub', 'mul', 'div', 'combine', 'transpose', 'invert',
		'isOrthogonal', 'determinant', 'applyPost', 'applyPre',
		'fromAngles', 'rotateX', 'rotateY', 'rotateZ', 'fromAngleNormalAxis', 'lookAt',
		'copyQuaternion', 'copy'
	]);
	// #endif

	return Matrix3x3;
});

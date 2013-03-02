define(["goo/math/MathUtils", "goo/math/Matrix", "goo/math/Vector3"],
/** @lends Matrix3x3 */
function (MathUtils, Matrix, Vector3) {
	"use strict";

	/* ====================================================================== */

	/**
	 * @class Matrix with 3x3 components.
	 * @extends Matrix
	 * @constructor
	 * @description Creates a new matrix.
	 * @param {Matrix3x3|Float[]|Float...} arguments Initial values for the components.
	 */

	function Matrix3x3 () {
		Matrix.call(this, 3, 3);

		if (arguments.length === 0) {
			this.setIdentity();
		} else {
			this.set(arguments);
		}
	}

	Matrix3x3.prototype = Object.create(Matrix.prototype);
	Matrix3x3.prototype.setupAliases([['e00'], ['e10'], ['e20'], ['e01'], ['e11'], ['e21'], ['e02'], ['e12'], ['e22']]);

	/* ====================================================================== */

	Matrix3x3.IDENTITY = new Matrix3x3(1, 0, 0, 0, 1, 0, 0, 0, 1);

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise addition.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Matrix3x3|Float} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix3x3} [target] Target matrix for storage.
	 * @return {Matrix3x3} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix3x3.add = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		if (rhs instanceof Matrix3x3) {
			target.e00 = lhs.e00 + rhs.e00;
			target.e10 = lhs.e10 + rhs.e10;
			target.e20 = lhs.e20 + rhs.e20;
			target.e01 = lhs.e01 + rhs.e01;
			target.e11 = lhs.e11 + rhs.e11;
			target.e21 = lhs.e21 + rhs.e21;
			target.e02 = lhs.e02 + rhs.e02;
			target.e12 = lhs.e12 + rhs.e12;
			target.e22 = lhs.e22 + rhs.e22;
		} else {
			target.e00 = lhs.e00 + rhs;
			target.e10 = lhs.e10 + rhs;
			target.e20 = lhs.e20 + rhs;
			target.e01 = lhs.e01 + rhs;
			target.e11 = lhs.e11 + rhs;
			target.e21 = lhs.e21 + rhs;
			target.e02 = lhs.e02 + rhs;
			target.e12 = lhs.e12 + rhs;
			target.e22 = lhs.e22 + rhs;
		}

		return target;
	};

	/**
	 * @description Performs a component-wise addition.
	 * @param {Matrix3x3|Float} rhs Matrix or scalar on the right-hand side.
	 * @return {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.add = function (rhs) {
		return Matrix3x3.add(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise subtraction.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Matrix3x3|Float} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix3x3} [target] Target matrix for storage.
	 * @return {Matrix3x3} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix3x3.sub = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		if (rhs instanceof Matrix3x3) {
			target.e00 = lhs.e00 - rhs.e00;
			target.e10 = lhs.e10 - rhs.e10;
			target.e20 = lhs.e20 - rhs.e20;
			target.e01 = lhs.e01 - rhs.e01;
			target.e11 = lhs.e11 - rhs.e11;
			target.e21 = lhs.e21 - rhs.e21;
			target.e02 = lhs.e02 - rhs.e02;
			target.e12 = lhs.e12 - rhs.e12;
			target.e22 = lhs.e22 - rhs.e22;
		} else {
			target.e00 = lhs.e00 - rhs;
			target.e10 = lhs.e10 - rhs;
			target.e20 = lhs.e20 - rhs;
			target.e01 = lhs.e01 - rhs;
			target.e11 = lhs.e11 - rhs;
			target.e21 = lhs.e21 - rhs;
			target.e02 = lhs.e02 - rhs;
			target.e12 = lhs.e12 - rhs;
			target.e22 = lhs.e22 - rhs;
		}

		return target;
	};

	/**
	 * @description Performs a component-wise subtraction.
	 * @param {Matrix3x3|Float} rhs Matrix or scalar on the right-hand side.
	 * @return {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.sub = function (rhs) {
		return Matrix3x3.sub(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise multiplication.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Matrix3x3|Float} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix3x3} [target] Target matrix for storage.
	 * @return {Matrix3x3} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix3x3.mul = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		if (rhs instanceof Matrix3x3) {
			target.e00 = lhs.e00 * rhs.e00;
			target.e10 = lhs.e10 * rhs.e10;
			target.e20 = lhs.e20 * rhs.e20;
			target.e01 = lhs.e01 * rhs.e01;
			target.e11 = lhs.e11 * rhs.e11;
			target.e21 = lhs.e21 * rhs.e21;
			target.e02 = lhs.e02 * rhs.e02;
			target.e12 = lhs.e12 * rhs.e12;
			target.e22 = lhs.e22 * rhs.e22;
		} else {
			target.e00 = lhs.e00 * rhs;
			target.e10 = lhs.e10 * rhs;
			target.e20 = lhs.e20 * rhs;
			target.e01 = lhs.e01 * rhs;
			target.e11 = lhs.e11 * rhs;
			target.e21 = lhs.e21 * rhs;
			target.e02 = lhs.e02 * rhs;
			target.e12 = lhs.e12 * rhs;
			target.e22 = lhs.e22 * rhs;
		}

		return target;
	};

	/**
	 * @description Performs a component-wise multiplication.
	 * @param {Matrix3x3|Float} rhs Matrix or scalar on the right-hand side.
	 * @return {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.mul = function (rhs) {
		return Matrix3x3.mul(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise division.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Matrix3x3|Float} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix3x3} [target] Target matrix for storage.
	 * @return {Matrix3x3} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix3x3.div = function (lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		if (rhs instanceof Matrix3x3) {
			target.e00 = lhs.e00 / rhs.e00;
			target.e10 = lhs.e10 / rhs.e10;
			target.e20 = lhs.e20 / rhs.e20;
			target.e01 = lhs.e01 / rhs.e01;
			target.e11 = lhs.e11 / rhs.e11;
			target.e21 = lhs.e21 / rhs.e21;
			target.e02 = lhs.e02 / rhs.e02;
			target.e12 = lhs.e12 / rhs.e12;
			target.e22 = lhs.e22 / rhs.e22;
		} else {
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
		}

		return target;
	};

	/**
	 * @description Performs a component-wise division.
	 * @param {Matrix3x3|Float} rhs Matrix or scalar on the right-hand side.
	 * @return {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.div = function (rhs) {
		return Matrix3x3.div(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Combines two matrices (matrix multiplication) and stores the result in a separate matrix.
	 * @param {Matrix3x3} lhs Matrix on the left-hand side.
	 * @param {Matrix3x3} rhs Matrix on the right-hand side.
	 * @param {Matrix3x3} [target] Target matrix for storage.
	 * @return {Matrix3x3} A new matrix if the target matrix is omitted, else the target matrix.
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
	 * @description Combines two matrices (matrix multiplication) and stores the result locally.
	 * @param {Matrix3x3} rhs Matrix on the right-hand side.
	 * @return {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.combine = function (rhs) {
		return Matrix3x3.combine(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Transposes a matrix (exchanges rows and columns) and stores the result in a separate matrix.
	 * @param {Matrix3x3} source Source matrix.
	 * @param {Matrix3x3} [target] Target matrix.
	 * @return {Matrix3x3} A new matrix if the target matrix is omitted, else the target matrix.
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
	 * @description Transposes the matrix (exchanges rows and columns) and stores the result locally.
	 * @return {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.transpose = function () {
		return Matrix3x3.transpose(this, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Computes the analytical inverse and stores the result in a separate matrix.
	 * @param {Matrix3x3} source Source matrix.
	 * @param {Matrix3x3} [target] Target matrix.
	 * @throws {Singular Matrix} If the matrix is singular and cannot be inverted.
	 * @return {Matrix3x3} A new matrix if the target matrix is omitted, else the target matrix.
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
			throw {
				name : "Singular Matrix",
				message : "The matrix is singular and cannot be inverted."
			};
		}

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

		return target;
	};

	/**
	 * @description Computes the analytical inverse and stores the result locally.
	 * @return {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.invert = function () {
		return Matrix3x3.invert(this, this);
	};

	/* ====================================================================== */

	/**
	 * @description Tests if the matrix is orthogonal.
	 * @return {Boolean} True if orthogonal.
	 */

	Matrix3x3.prototype.isOrthogonal = function () {
		var dot;

		dot = this.e00 * this.e01 + this.e10 * this.e11 + this.e20 * this.e21;

		if (Math.abs(dot) > MathUtils.EPSILON) {
			return false;
		}

		dot = this.e00 * this.e02 + this.e10 * this.e12 + this.e20 * this.e22;

		if (Math.abs(dot) > MathUtils.EPSILON) {
			return false;
		}

		dot = this.e01 * this.e02 + this.e11 * this.e12 + this.e21 * this.e22;

		if (Math.abs(dot) > MathUtils.EPSILON) {
			return false;
		}

		return true;
	};

	/* ====================================================================== */

	/**
	 * @description Tests if the matrix is normal.
	 * @return {Boolean} True if normal.
	 */

	Matrix3x3.prototype.isNormal = function () {
		var l;

		l = this.e00 * this.e00 + this.e10 * this.e10 + this.e20 * this.e20;

		if (Math.abs(l - 1.0) > MathUtils.EPSILON) {
			return false;
		}

		l = this.e01 * this.e01 + this.e11 * this.e11 + this.e21 * this.e21;

		if (Math.abs(l - 1.0) > MathUtils.EPSILON) {
			return false;
		}

		l = this.e02 * this.e02 + this.e12 * this.e12 + this.e22 * this.e22;

		if (Math.abs(l - 1.0) > MathUtils.EPSILON) {
			return false;
		}

		return true;
	};

	/* ====================================================================== */

	/**
	 * @description Tests if the matrix is orthonormal.
	 * @return {Boolean} True if orthonormal.
	 */

	Matrix3x3.prototype.isOrthonormal = function () {
		return this.isOrthogonal() && this.isNormal();
	};

	/* ====================================================================== */

	/**
	 * @description Computes the determinant of the matrix.
	 * @return {Float} Determinant of matrix.
	 */

	Matrix3x3.prototype.determinant = function () {
		return this.e00 * (this.e11 * this.e22 - this.e12 * this.e21) - this.e01 * (this.e10 * this.e22 - this.e12 * this.e20) + this.e02
			* (this.e10 * this.e21 - this.e11 * this.e20);
	};

	/* ====================================================================== */

	/**
	 * @description Sets the matrix to identity.
	 * @return {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.setIdentity = function () {
		this.data.set(Matrix3x3.IDENTITY.data);
	};

	/* ====================================================================== */

	/**
	 * @description Applies the matrix (rotation, scale) to a three-dimensional vector.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @returns {Vector3} Transformed right-hand side vector.
	 */

	Matrix3x3.prototype.applyPost = function (rhs) {
		var target = rhs.data;
		var source = this.data;

		var x = target[0];
		var y = target[1];
		var z = target[2];

		target[0] = source[0] * x + source[3] * y + source[6] * z;
		target[1] = source[1] * x + source[4] * y + source[7] * z;
		target[2] = source[2] * x + source[5] * y + source[8] * z;

		return rhs;
	};

	/* ====================================================================== */

	/**
	 * @description Applies the matrix (rotation, scale) to a three-dimensional vector.
	 * @param {Vector3} rhs Vector on the left-hand side.
	 * @returns {Vector3} Transformed left-hand side vector.
	 */

	Matrix3x3.prototype.applyPre = function (rhs) {
		var x = rhs.x;
		var y = rhs.y;
		var z = rhs.z;

		rhs.x = this.e00 * x + this.e10 * y + this.e20 * z;
		rhs.y = this.e01 * x + this.e11 * y + this.e21 * z;
		rhs.z = this.e02 * x + this.e12 * y + this.e22 * z;

		return rhs;
	};

	/* ====================================================================== */

	/**
	 * @description Post-multiplies the matrix ("before") with a scaling vector.
	 * @param {Vector3} vec Vector on the right-hand side.
	 * @result {Matrix3x3} result Storage matrix.
	 * @returns {Matrix3x3} Storage matrix.
	 */

	Matrix3x3.prototype.multiplyDiagonalPost = function (vec, result) {
		var x = vec.data[0];
		var y = vec.data[1];
		var z = vec.data[2];

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

	/* ====================================================================== */

	/**
	 * @description Sets the matrix from rotational angles.
	 * @param {Float} yaw Yaw angle in radians.
	 * @param {Float} roll Roll angle in radians.
	 * @param {Float} pitch Pitch angle in radians.
	 * @returns {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.fromAngles = function (yaw, roll, pitch) {
		var cy = Math.cos(yaw);
		var sy = Math.sin(yaw);
		var ch = Math.cos(roll);
		var sh = Math.sin(roll);
		var cp = Math.cos(pitch);
		var sp = Math.sin(pitch);

		this.e00 = ch * cp;
		this.e01 = sh * sy - ch * sp * cy;
		this.e02 = ch * sp * sy + sh * cy;
		this.e10 = sp;
		this.e11 = cp * cy;
		this.e12 = -cp * sy;
		this.e20 = -sh * cp;
		this.e21 = sh * sp * cy + ch * sy;
		this.e22 = -sh * sp * sy + ch * cy;

		return this;
	};

	/**
	 * Rotates a matrix by the given angle around the X axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
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
	        out[0]  = a[0];
	        out[1]  = a[1];
	        out[2]  = a[2];
	    }

	    // Perform axis-specific matrix multiplication
	    out[3] = a10 * c + a20 * s;
	    out[4] = a11 * c + a21 * s;
	    out[5] = a12 * c + a22 * s;
	    out[6] = a20 * c - a10 * s;
	    out[7] = a21 * c - a11 * s;
	    out[8] = a22 * c - a12 * s;
	  
	    return out;
	};

	/**
	 * Rotates a matrix by the given angle around the Y axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
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
	        out[3]  = a[3];
	        out[4]  = a[4];
	        out[5]  = a[5];
	    }

	    // Perform axis-specific matrix multiplication
	    out[0] = a00 * c - a20 * s;
	    out[1] = a01 * c - a21 * s;
	    out[2] = a02 * c - a22 * s;
	    out[6] = a00 * s + a20 * c;
	    out[7] = a01 * s + a21 * c;
	    out[8] = a02 * s + a22 * c;
	   
	    return out;
	};

	/**
	 * Rotates a matrix by the given angle around the Z axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
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
	        out[6]  = a[6];
	        out[7]  = a[7];
	        out[8] = a[8];
	    }

	    // Perform axis-specific matrix multiplication
	    out[0] = a00 * c + a10 * s;
	    out[1] = a01 * c + a11 * s;
	    out[2] = a02 * c + a12 * s;
	    out[3] = a10 * c - a00 * s;
	    out[4] = a11 * c - a01 * s;
	    out[5] = a12 * c - a02 * s;
	  
	    return out;
	};
	
	/**
	 * @description Converts this matrix to Euler rotation angles (yaw, roll, pitch
	 * @param {Vector3} Vector to store the computed angles in (or undefined to create a new one).
	 * @returns {Vector3} Result
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

	/* ====================================================================== */

	/**
	 * @description Sets this matrix to the rotation indicated by the given angle and a unit-length axis of rotation.
	 * @param angle the angle to rotate (in radians).
	 * @param x
	 * @param y
	 * @param z
	 * @return this matrix for chaining
	 * @throws NullPointerException if axis is null.
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

		this.e00 = fX2 * fOneMinusCos + fCos;
		this.e01 = fXYM - fZSin;
		this.e02 = fXZM + fYSin;
		this.e10 = fXYM + fZSin;
		this.e11 = fY2 * fOneMinusCos + fCos;
		this.e12 = fYZM - fXSin;
		this.e20 = fXZM - fYSin;
		this.e21 = fYZM + fXSin;
		this.e22 = fZ2 * fOneMinusCos + fCos;

		return this;
	};

	/* ====================================================================== */

	/**
	 * @description Sets the matrix to look in a specific direction.
	 * @param {Vector3} direction Direction vector.
	 * @param {Vector3} up Up vector.
	 * @returns {Matrix3x3} Self for chaining.
	 */
	Matrix3x3.prototype.lookAt = function (direction, up) {
		var xAxis = new Vector3();
		var yAxis = new Vector3();
		var zAxis = new Vector3();

		zAxis.copy(direction).normalize();
		xAxis.copy(up).normalize().cross(zAxis).normalize();
		if (xAxis.equals(Vector3.ZERO)) {
			if (zAxis.x !== 0.0) {
				xAxis.set(zAxis.y, -zAxis.x, 0);
			} else {
				xAxis.set(0, zAxis.z, -zAxis.y);
			}
		}
		yAxis.copy(zAxis).cross(xAxis).normalize();

		this.e00 = xAxis.x;
		this.e10 = xAxis.y;
		this.e20 = xAxis.z;

		this.e01 = yAxis.x;
		this.e11 = yAxis.y;
		this.e21 = yAxis.z;

		this.e02 = zAxis.x;
		this.e12 = zAxis.y;
		this.e22 = zAxis.z;

		return this;
	};

	/* ====================================================================== */

	/**
	 * @description Sets the matrix from a quaternion.
	 * @param {Quaternion} quaternion Rotational quaternion.
	 * @returns {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.copyQuaternion = function (quaternion) {
		return quaternion.toRotationMatrix(this);
	};

	/**
	 * @description Copies component values and stores them locally.
	 * @param {Matrix4x4} source Source matrix.
	 * @return {Matrix4x4} Self for chaining.
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

	
	Matrix3x3.prototype.clone = function () {
		var d = this.data;
		return new Matrix4x4(
			d[0], d[1], d[2],
			d[3], d[4], d[5],
			d[4], d[5], d[6]
			);
	};

	/* ====================================================================== */

	return Matrix3x3;
});

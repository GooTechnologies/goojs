define(["goo/math/MathUtils", "goo/math/Matrix", "goo/math/Vector3"], function(MathUtils, Matrix, Vector3) {
	"use strict";

	Matrix3x3.prototype = Object.create(Matrix.prototype);
	Matrix3x3.prototype.setupAliases([['e00'], ['e10'], ['e20'], ['e01'], ['e11'], ['e21'], ['e02'], ['e12'], ['e22']]);

	/* ====================================================================== */

	/**
	 * @name Matrix3x3
	 * @class Matrix with 3x3 components.
	 * @extends Matrix
	 * @constructor
	 * @description Creates a new matrix.
	 * @param {Matrix3x3|Float[]|Float...} arguments Initial values for the components.
	 */

	function Matrix3x3() {
		Matrix.call(this, 3, 3);

		if (arguments.length === 0) {
			this.setIdentity();
		} else {
			this.set(arguments);
		}
	}

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

	Matrix3x3.add = function(lhs, rhs, target) {
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

	Matrix3x3.prototype.add = function(rhs) {
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

	Matrix3x3.sub = function(lhs, rhs, target) {
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

	Matrix3x3.prototype.sub = function(rhs) {
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

	Matrix3x3.mul = function(lhs, rhs, target) {
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

	Matrix3x3.prototype.mul = function(rhs) {
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

	Matrix3x3.div = function(lhs, rhs, target) {
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

	Matrix3x3.prototype.div = function(rhs) {
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

	Matrix3x3.combine = function(lhs, rhs, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		if (target === lhs || target === rhs) {
			return Matrix.copy(Matrix3x3.combine(lhs, rhs), target);
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
	 * @description Combines two matrices (matrix multiplication) and stores the result locally.
	 * @param {Matrix3x3} rhs Matrix on the right-hand side.
	 * @return {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.combine = function(rhs) {
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

	Matrix3x3.transpose = function(source, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		if (target === source) {
			return Matrix.copy(Matrix3x3.transpose(source), target);
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
	 * @description Transposes the matrix (exchanges rows and columns) and stores the result locally.
	 * @return {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.transpose = function() {
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

	Matrix3x3.invert = function(source, target) {
		if (!target) {
			target = new Matrix3x3();
		}

		if (target === source) {
			return Matrix.copy(Matrix3x3.invert(source), target);
		}

		var det = source.determinant();

		if (Math.abs(det) < MathUtils.EPSILON) {
			throw { name : "Singular Matrix", message : "The matrix is singular and cannot be inverted." };
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

	Matrix3x3.prototype.invert = function() {
		return Matrix3x3.invert(this, this);
	};

	/* ====================================================================== */

	/**
	 * @description Tests if the matrix is orthogonal.
	 * @return {Boolean} True if orthogonal.
	 */

	Matrix3x3.prototype.isOrthogonal = function() {
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

	Matrix3x3.prototype.isNormal = function() {
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

	Matrix3x3.prototype.isOrthonormal = function() {
		return this.isOrthogonal() && this.isNormal();
	};

	/* ====================================================================== */

	/**
	 * @description Computes the determinant of the matrix.
	 * @return {Float} Determinant of matrix.
	 */

	Matrix3x3.prototype.determinant = function() {
		return this.e00 * (this.e11 * this.e22 - this.e12 * this.e21) - this.e01 * (this.e10 * this.e22 - this.e12 * this.e20) + this.e02 * (this.e10 * this.e21 - this.e11 * this.e20);
	};

	/* ====================================================================== */

	/**
	 * @description Sets the matrix to identity.
	 * @return {Matrix3x3} Self for chaining.
	 */

	Matrix3x3.prototype.setIdentity = function() {
		this.set(Matrix3x3.IDENTITY);
	};

	/* ====================================================================== */

	/**
	 * @description Applies the matrix (rotation, scale) to a three-dimensional vector.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @returns {Vector3} Transformed right-hand side vector.
	 */

	Matrix3x3.prototype.applyPost = function(rhs) {
		var x = rhs.x;
		var y = rhs.y;
		var z = rhs.z;

		rhs.x = this.e00 * x + this.e01 * y + this.e02 * z;
		rhs.y = this.e10 * x + this.e11 * y + this.e12 * z;
		rhs.z = this.e20 * x + this.e21 * y + this.e22 * z;

		return rhs;
	};

	/* ====================================================================== */

	/**
	 * @description Post-multiplies the matrix ("before") with a scaling vector.
	 * @param {Vector3} vec Vector on the right-hand side.
	 * @result {Matrix3x3} result Storage matrix.
	 * @returns {Matrix3x3} Storage matrix.
	 */

	Matrix3x3.prototype.multiplyDiagonalPost = function(vec, result) {
		var x = vec.x;
		var y = vec.y;
		var z = vec.z;

		var d = this;
		var r = result;
		r.e00 = x * d.e00;
		r.e01 = y * d.e01;
		r.e02 = z * d.e02;
		r.e10 = x * d.e10;
		r.e11 = y * d.e11;
		r.e12 = z * d.e12;
		r.e20 = x * d.e20;
		r.e21 = y * d.e21;
		r.e22 = z * d.e22;

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

	Matrix3x3.prototype.fromAngles = function(yaw, roll, pitch) {
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

	Matrix3x3.prototype.fromAngleNormalAxis = function(angle, x, y, z) {
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

	Matrix3x3.prototype.lookAt = function(direction, up) {
		var xAxis = new Vector3();
		var yAxis = new Vector3();
		var zAxis = new Vector3();

		zAxis.copy(direction).normalize();
		xAxis.copy(up).normalize().cross(zAxis).normalize();
		yAxis.copy(zAxis).cross(xAxis);

		this.e00 = xAxis.x;
		this.e10 = xAxis.y;
		this.e20 = xAxis.z;

		this.e01 = yAxis.x;
		this.e11 = yAxis.y;
		this.e20 = yAxis.z;

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

	Matrix3x3.prototype.copyQuaternion = function(quaternion) {
		return quaternion.toRotationMatrix(this);
	};

	/* ====================================================================== */

	return Matrix3x3;
});

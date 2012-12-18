define(["goo/math/Vector"], function (Vector) {
	"use strict";

	Quaternion.prototype = Object.create(Vector.prototype);
	Quaternion.prototype.setupAliases([['x'], ['y'], ['z'], ['w']]);

	/**
	 * @name Quaternion
	 * @class Quaternion represents a 4 value math object used in Ardor3D to describe rotations. It has the advantage of being able to avoid lock by
	 *        adding a 4th dimension to rotation.
	 * @extends Vector
	 * @constructor
	 * @description Creates a new quaternion.
	 * @param {Float...} arguments Initial values for the components.
	 */

	function Quaternion() {
		Vector.call(this, 4);
		var init = arguments.length !== 0 ? arguments : [0, 0, 0, 1];
		this.set(init);
	}

	Quaternion.IDENTITY = new Quaternion(0, 0, 0, 1);
	Quaternion.ALLOWED_DEVIANCE = 0.00000001;

	/**
	 * @static
	 * @description Performs a component-wise addition between two vectors and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.add = function (lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.data[0] = lhs.data[0] + rhs.data[0];
		target.data[1] = lhs.data[1] + rhs.data[1];
		target.data[2] = lhs.data[2] + rhs.data[2];
		target.data[3] = lhs.data[3] + rhs.data[3];

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise subtraction between two vectors and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.sub = function (lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.data[0] = lhs.data[0] - rhs.data[0];
		target.data[1] = lhs.data[1] - rhs.data[1];
		target.data[2] = lhs.data[2] - rhs.data[2];
		target.data[3] = lhs.data[3] - rhs.data[3];

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise multiplication between two vectors and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.mul = function (lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.data[0] = lhs.data[0] * rhs.data[0];
		target.data[1] = lhs.data[1] * rhs.data[1];
		target.data[2] = lhs.data[2] * rhs.data[2];
		target.data[3] = lhs.data[3] * rhs.data[3];

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise division between two vectors and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.div = function (lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		var clean = true;

		target.data[0] = (clean &= (rhs.data[0] < 0.0 || rhs.data[0] > 0.0)) ? lhs.data[0] / rhs.data[0] : 0.0;
		target.data[1] = (clean &= (rhs.data[1] < 0.0 || rhs.data[1] > 0.0)) ? lhs.data[1] / rhs.data[1] : 0.0;
		target.data[2] = (clean &= (rhs.data[2] < 0.0 || rhs.data[2] > 0.0)) ? lhs.data[2] / rhs.data[2] : 0.0;
		target.data[3] = (clean &= (rhs.data[3] < 0.0 || rhs.data[3] > 0.0)) ? lhs.data[3] / rhs.data[3] : 0.0;

		if (clean === false) {
			console.warn("[Quaternion.div] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise addition between a vector and a scalar and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.scalarAdd = function (lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.data[0] = lhs.data[0] + rhs;
		target.data[1] = lhs.data[1] + rhs;
		target.data[2] = lhs.data[2] + rhs;
		target.data[3] = lhs.data[3] + rhs;

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise subtraction between a vector and a scalar and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.scalarSub = function (lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.data[0] = lhs.data[0] - rhs;
		target.data[1] = lhs.data[1] - rhs;
		target.data[2] = lhs.data[2] - rhs;
		target.data[3] = lhs.data[3] - rhs;

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise multiplication between a vector and a scalar and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.scalarMul = function (lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.data[0] = lhs.data[0] * rhs;
		target.data[1] = lhs.data[1] * rhs;
		target.data[2] = lhs.data[2] * rhs;
		target.data[3] = lhs.data[3] * rhs;

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise division between a vector and a scalar and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.scalarDiv = function (lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		var clean = true;

		rhs = (clean &= (rhs < 0.0 || rhs > 0.0)) ? 1.0 / rhs : 0.0;

		target.data[0] = lhs.data[0] * rhs;
		target.data[1] = lhs.data[1] * rhs;
		target.data[2] = lhs.data[2] * rhs;
		target.data[3] = lhs.data[3] * rhs;

		if (clean === false) {
			console.warn("[Quaternion.scalarDiv] Attempted to divide by zero!");
		}

		return target;
	};

	Quaternion.slerp = function (startQuat, endQuat, changeAmnt, workQuat) {
		// check for weighting at either extreme
		if (changeAmnt === 0.0) {
			return workQuat.set(startQuat);
		} else if (changeAmnt === 1.0) {
			return workQuat.set(endQuat);
		}

		// Check for equality and skip operation.
		if (startQuat.equals(endQuat)) {
			return copy(startQuat);
		}

		var result = startQuat.dot(endQuat);
		workQuat.copy(endQuat);

		if (result < 0.0) {
			// Negate the second quaternion and the result of the dot product
			workQuat.negate();
			result = -result;
		}

		// Set the first and second scale for the interpolation
		var scale0 = 1 - changeAmnt;
		var scale1 = changeAmnt;

		// Check if the angle between the 2 quaternions was big enough to
		// warrant such calculations
		if (1 - result > 0.1) {// Get the angle between the 2 quaternions,
			// and then store the sin() of that angle
			var theta = Math.acos(result);
			var invSinTheta = 1 / Math.sin(theta);

			// Calculate the scale for q1 and q2, according to the angle and
			// it's sine value
			scale0 = Math.sin((1 - changeAmnt) * theta) * invSinTheta;
			scale1 = Math.sin(changeAmnt * theta) * invSinTheta;
		}

		// Calculate the x, y, z and w values for the quaternion by using a
		// special form of linear interpolation for quaternions.
		var x = scale0 * startQuat.x + scale1 * workQuat.x;
		var y = scale0 * startQuat.y + scale1 * workQuat.y;
		var z = scale0 * startQuat.z + scale1 * workQuat.z;
		var w = scale0 * startQuat.w + scale1 * workQuat.w;

		workQuat.set(x, y, z, w);

		// Return the interpolated quaternion
		return workQuat;
	};

	/**
	 * @description multiplies this quaterion's values by -1.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.negate = function() {
		this.x *= -1;
		this.y *= -1;
		this.z *= -1;
		this.w *= -1;
		return this;
	};

	/**
	 * @description Performs a component-wise addition between two vectors and stores the result locally.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.add = function (rhs) {
		return Quaternion.add(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between two vectors and stores the result locally.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.sub = function (rhs) {
		return Quaternion.sub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between two vectors and stores the result locally.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.mul = function (rhs) {
		return Quaternion.mul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between two vectors and stores the result locally.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.div = function (rhs) {
		return Quaternion.div(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise addition between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.scalarAdd = function (rhs) {
		return Quaternion.scalarAdd(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.scalarSub = function (rhs) {
		return Quaternion.scalarSub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.scalarMul = function (rhs) {
		return Quaternion.scalarMul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.scalarDiv = function (rhs) {
		return Quaternion.scalarDiv(this, rhs, this);
	};

	Quaternion.prototype.slerp = function (endQuat, changeAmnt) {
		var end = new Quaternion().copy(endQuat);
		Quaternion.slerp(this, endQuat, changeAmnt, end);
		this.copy(end);
		return this;
	};

	/**
	 * Sets the value of this quaternion to the rotation described by the given matrix values.
	 *
	 * @return this quaternion for chaining
	 */
	Quaternion.prototype.fromRotationMatrix = function (matrix) {
		// Uses the Graphics Gems code, from
		// ftp://ftp.cis.upenn.edu/pub/graphics/shoemake/quatut.ps.Z
		// *NOT* the "Matrix and Quaternions FAQ", which has errors!

		// the trace is the sum of the diagonal elements; see
		// http://mathworld.wolfram.com/MatrixTrace.html
		var t = matrix.e00 + matrix.e11 + matrix.e22;

		// we protect the division by s by ensuring that s>=1
		var x, y, z, w;
		if (t >= 0) { // |w| >= .5
			var s = Math.sqrt(t + 1); // |s|>=1 ...
			w = 0.5 * s;
			s = 0.5 / s; // so this division isn't bad
			x = (matrix.e21 - matrix.e12) * s;
			y = (matrix.e02 - matrix.e20) * s;
			z = (matrix.e10 - matrix.e01) * s;
		} else if (matrix.e00 > matrix.e11 && matrix.e00 > matrix.e22) {
			var s = Math.sqrt(1.0 + matrix.e00 - matrix.e11 - matrix.e22); // |s|>=1
			x = s * 0.5; // |x| >= .5
			s = 0.5 / s;
			y = (matrix.e10 + matrix.e01) * s;
			z = (matrix.e02 + matrix.e20) * s;
			w = (matrix.e21 - matrix.e12) * s;
		} else if (matrix.e11 > matrix.e22) {
			var s = Math.sqrt(1.0 + matrix.e11 - matrix.e00 - matrix.e22); // |s|>=1
			y = s * 0.5; // |y| >= .5
			s = 0.5 / s;
			x = (matrix.e10 + matrix.e01) * s;
			z = (matrix.e21 + matrix.e12) * s;
			w = (matrix.e02 - matrix.e20) * s;
		} else {
			var s = Math.sqrt(1.0 + matrix.e22 - matrix.e00 - matrix.e11); // |s|>=1
			z = s * 0.5; // |z| >= .5
			s = 0.5 / s;
			x = (matrix.e02 + matrix.e20) * s;
			y = (matrix.e21 + matrix.e12) * s;
			w = (matrix.e10 - matrix.e01) * s;
		}

		return this.set(x, y, z, w);
	};

	/**
	 * @param store the matrix to store our result in. If null, a new matrix is created.
	 * @return the rotation matrix representation of this quaternion (normalized) if store is not null and is read only.
	 */
	Quaternion.prototype.toRotationMatrix = function (store) {
		var result = store;
		if (!result) {
			result = new Matrix3x3();
		}

		var norm = this.magnitudeSquared();
		var s = norm > 0.0 ? 2.0 / norm : 0.0;

		// compute xs/ys/zs first to save 6 multiplications, since xs/ys/zs
		// will be used 2-4 times each.
		var xs = this.x * s;
		var ys = this.y * s;
		var zs = this.z * s;
		var xx = this.x * xs;
		var xy = this.x * ys;
		var xz = this.x * zs;
		var xw = this.w * xs;
		var yy = this.y * ys;
		var yz = this.y * zs;
		var yw = this.w * ys;
		var zz = this.z * zs;
		var zw = this.w * zs;

		// using s=2/norm (instead of 1/norm) saves 9 multiplications by 2 here
		var d = store;

		d.e00 = 1.0 - (yy + zz);
		d.e01 = xy - zw;
		d.e02 = xz + yw;
		d.e10 = xy + zw;
		d.e11 = 1.0 - (xx + zz);
		d.e12 = yz - xw;
		d.e20 = xz - yw;
		d.e21 = yz + xw;
		d.e22 = 1.0 - (xx + yy);

		return result;
	};

	/**
	 * @return this quaternion, modified to be unit length, for chaining.
	 */
	Quaternion.prototype.normalize = function () {
		var n = 1.0 / this.magnitude();
		var xx = this.x * n;
		var yy = this.y * n;
		var zz = this.z * n;
		var ww = this.w * n;
		return this.set(xx, yy, zz, ww);
	};

	/**
	 * @return the magnitude of this quaternion.
	 */
	Quaternion.prototype.magnitude = function () {
		var magnitudeSQ = this.magnitudeSquared();
		if (magnitudeSQ === 1.0) {
			return 1.0;
		}

		return Math.sqrt(magnitudeSQ);
	};

	/**
	 * @return the squared magnitude of this quaternion.
	 */
	Quaternion.prototype.magnitudeSquared = function () {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
	};

	Quaternion.prototype.equals = function (o) {
		if (this === o) {
			return true;
		}
		if (!(o instanceof Quaternion)) {
			return false;
		}
		return Math.abs(this.x - o.x) < Quaternion.ALLOWED_DEVIANCE && Math.abs(this.y - o.y) < Quaternion.ALLOWED_DEVIANCE
			&& Math.abs(this.z - o.z) < Quaternion.ALLOWED_DEVIANCE && Math.abs(this.w - o.w) < Quaternion.ALLOWED_DEVIANCE;
	};

	return Quaternion;
});

/*jshint bitwise: false*/
define(["goo/math/Vector", "goo/math/Vector3", "goo/math/Matrix3x3", "goo/math/MathUtils"],
/** @lends */
function (Vector, Vector3, Matrix3x3, MathUtils) {
	"use strict";

	/**
	 * @class Quaternions provide a convenient mathematical notation for representing orientations and rotations of objects in three dimensions.
	 * Compared to Euler angles they are simpler to compose and avoid the problem of gimbal lock.
	 * Compared to rotation matrices they are more numerically stable and the representation (4 numbers) is more compact.
	 * The main usage is probably the slerp function allowing smooth transitions between two rotations.
	 * @extends Vector
	 * @constructor
	 * @param {...Float} arguments Initial values for the components.
	 */

	function Quaternion () {
		Vector.call(this, 4);

		if (arguments.length !== 0) {
			this.set(arguments);
		} else {
			this.setd(0,0,0,1);
		}
	}

	Quaternion.prototype = Object.create(Vector.prototype);
	Quaternion.prototype.setupAliases([['x'], ['y'], ['z'], ['w']]);

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

	Quaternion.mul2 = function(a, b, out) {
		var ax = a.data[0], ay = a.data[1], az = a.data[2], aw = a.data[3],
			bx = b.data[0], by = b.data[1], bz = b.data[2], bw = b.data[3];

		out.data[0] = ax * bw + aw * bx + ay * bz - az * by;
		out.data[1] = ay * bw + aw * by + az * bx - ax * bz;
		out.data[2] = az * bw + aw * bz + ax * by - ay * bx;
		out.data[3] = aw * bw - ax * bx - ay * by - az * bz;
		return out;
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

		target.data[0] = (clean &= rhs.data[0] < 0.0 || rhs.data[0] > 0.0) ? lhs.data[0] / rhs.data[0] : 0.0;
		target.data[1] = (clean &= rhs.data[1] < 0.0 || rhs.data[1] > 0.0) ? lhs.data[1] / rhs.data[1] : 0.0;
		target.data[2] = (clean &= rhs.data[2] < 0.0 || rhs.data[2] > 0.0) ? lhs.data[2] / rhs.data[2] : 0.0;
		target.data[3] = (clean &= rhs.data[3] < 0.0 || rhs.data[3] > 0.0) ? lhs.data[3] / rhs.data[3] : 0.0;

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

		rhs = (clean &= rhs < 0.0 || rhs > 0.0) ? 1.0 / rhs : 0.0;

		target.data[0] = lhs.data[0] * rhs;
		target.data[1] = lhs.data[1] * rhs;
		target.data[2] = lhs.data[2] * rhs;
		target.data[3] = lhs.data[3] * rhs;

		if (clean === false) {
			console.warn("[Quaternion.scalarDiv] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * Computes the spherical linear interpolation between startQuat and endQuat.
	 * @param {Quaternion} startQuat start Quaternion.
	 * @param {Quaternion} endQuat end Quaternion.
	 * @param {number} changeAmnt Interpolation factor between 0.0 and 1.0.
	 * @param {Quaternion} workQuat work Quaternion.
	 * @return {Quaternion} workQuat the interpolated work Quaternion.
	 */
	Quaternion.slerp = function (startQuat, endQuat, changeAmnt, workQuat) {
		// check for weighting at either extreme
		if (changeAmnt === 0.0) {
			return workQuat.setv(startQuat);
		} else if (changeAmnt === 1.0) {
			return workQuat.setv(endQuat);
		}

		// Check for equality and skip operation.
		if (startQuat.equals(endQuat)) {
			return workQuat.setv(startQuat);
		}

		var result = startQuat.dot(endQuat);
		workQuat.setv(endQuat);

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
		var x = scale0 * startQuat.data[0] + scale1 * workQuat.data[0];
		var y = scale0 * startQuat.data[1] + scale1 * workQuat.data[1];
		var z = scale0 * startQuat.data[2] + scale1 * workQuat.data[2];
		var w = scale0 * startQuat.data[3] + scale1 * workQuat.data[3];

		workQuat.setd(x, y, z, w);

		// Return the interpolated quaternion
		return workQuat;
	};

	/**
	 * @description multiplies this quaterion's values by -1.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.negate = function () {
		this.data[0] *= -1;
		this.data[1] *= -1;
		this.data[2] *= -1;
		this.data[3] *= -1;
		return this;
	};

	Quaternion.prototype.dot = function (rhs) {
		var ldata = this.data;
		var rdata = rhs.data || rhs;

		var sum = 0.0;

		sum += ldata[0] * rdata[0];
		sum += ldata[1] * rdata[1];
		sum += ldata[2] * rdata[2];
		sum += ldata[3] * rdata[3];

		return sum;
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

	 var slerp_work_quat;
	/**
	 * Computes the spherical linear interpolation towards endQuat.
	 * @param {Quaternion} endQuat end Quaternion.
	 * @param {number} changeAmnt Interpolation factor between 0.0 and 1.0.
	 * @returns {Quaternion} Self for chaining.
	 */
	Quaternion.prototype.slerp = function (endQuat, changeAmnt) {
		if(!slerp_work_quat) {
			slerp_work_quat = new Quaternion();
		}
		slerp_work_quat.copy(endQuat);
		Quaternion.slerp(this, endQuat, changeAmnt, slerp_work_quat);
		this.copy(slerp_work_quat);
		return this;
	};

	/**
	 * @description Sets the value of this quaternion to the rotation described by the given matrix values.
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
		var d = this.data;
		var xs = d[0] * s;
		var ys = d[1] * s;
		var zs = d[2] * s;
		var xx = d[0] * xs;
		var xy = d[0] * ys;
		var xz = d[0] * zs;
		var xw = d[3] * xs;
		var yy = d[1] * ys;
		var yz = d[1] * zs;
		var yw = d[3] * ys;
		var zz = d[2] * zs;
		var zw = d[3] * zs;

		// using s=2/norm (instead of 1/norm) saves 9 multiplications by 2 here
		var t = result.data;
		t[0] = 1.0 - (yy + zz);
		t[1] = xy + zw;
		t[2] = xz - yw;
		t[3] = xy - zw;
		t[4] = 1.0 - (xx + zz);
		t[5] = yz + xw;
		t[6] = xz + yw;
		t[7] = yz - xw;
		t[8] = 1.0 - (xx + yy);

		return result;
	};

	/**
	 * @description Sets this quaternion to that which will rotate vector3 "from" into vector3 "to". from and to do not have to be the same length.
	 * @param from the source vector3 to rotate
	 * @param to the destination vector3 into which to rotate the source vector
	 * @return this quaternion for chaining
	 */
	Quaternion.prototype.fromVectorToVector = function (from, to) {
		var a = from;
		var b = to;
		var factor = a.length() * b.length();
		if (Math.abs(factor) > MathUtils.EPSILON) {
			// Vectors have length > 0
			var pivotVector = new Vector3();
			var dot = a.dot(b) / factor;
			var theta = Math.acos(Math.max(-1.0, Math.min(dot, 1.0)));
			a.cross(b, pivotVector);
			if (dot < 0.0 && pivotVector.length() < MathUtils.EPSILON) {
				// Vectors parallel and opposite direction, therefore a rotation of 180 degrees about any vector
				// perpendicular to this vector will rotate vector a onto vector b.

				// The following guarantees the dot-product will be 0.0.
				var dominantIndex;
				if (Math.abs(a.x) > Math.abs(a.y)) {
					if (Math.abs(a.x) > Math.abs(a.z)) {
						dominantIndex = 0;
					} else {
						dominantIndex = 2;
					}
				} else {
					if (Math.abs(a.y) > Math.abs(a.z)) {
						dominantIndex = 1;
					} else {
						dominantIndex = 2;
					}
				}
				pivotVector.setValue(dominantIndex, -a[((dominantIndex + 1) % 3)]);
				pivotVector.setValue((dominantIndex + 1) % 3, a[dominantIndex]);
				pivotVector.setValue((dominantIndex + 2) % 3, 0.0);
			}
			return this.fromAngleAxis(theta, pivotVector);
		} else {
			return this.set(Quaternion.IDENTITY);
		}
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
		var magnitudeSQ = this.data[0] * this.data[0] + this.data[1] * this.data[1] + this.data[2] * this.data[2] + this.data[3] * this.data[3];
		if (magnitudeSQ === 1.0) {
			return 1.0;
		}

		return Math.sqrt(magnitudeSQ);
	};

	/**
	 * @return the squared magnitude of this quaternion.
	 */
	Quaternion.prototype.magnitudeSquared = function () {
		return this.data[0] * this.data[0] + this.data[1] * this.data[1] + this.data[2] * this.data[2] + this.data[3] * this.data[3];
	};

	/**
	 * @description Sets the values of this quaternion to the values represented by a given angle and axis of rotation. Note that this method creates
	 *              an object, so use fromAngleNormalAxis if your axis is already normalized. If axis == 0,0,0 the quaternion is set to identity.
	 * @param angle the angle to rotate (in radians).
	 * @param axis the axis of rotation.
	 * @return this quaternion for chaining
	 * @throws NullPointerException if axis is null
	 */
	Quaternion.prototype.fromAngleAxis = function (angle, axis) {
		var temp = new Vector3(axis).normalize();
		return this.fromAngleNormalAxis(angle, temp);
	};

	/**
	 * @description Sets the values of this quaternion to the values represented by a given angle and unit length axis of rotation. If axis == 0,0,0
	 *              the quaternion is set to identity.
	 * @param angle the angle to rotate (in radians).
	 * @param axis the axis of rotation (already normalized - unit length).
	 * @throws NullPointerException if axis is null
	 */
	Quaternion.prototype.fromAngleNormalAxis = function (angle, axis) {
		if (axis.equals(Vector3.ZERO)) {
			return this.set(Quaternion.IDENTITY);
		}

		var halfAngle = 0.5 * angle;
		var sin = Math.sin(halfAngle);
		var w = Math.cos(halfAngle);
		var x = sin * axis.x;
		var y = sin * axis.y;
		var z = sin * axis.z;
		return this.set(x, y, z, w);
	};

	/**
	 * @description Returns the rotation angle represented by this quaternion. If a non-null vector is provided, the axis of rotation is stored in
	 *              that vector as well.
	 * @param axisStore the object we'll store the computed axis in. If null, no computations are done to determine axis.
	 * @return the angle of rotation in radians.
	 */
	Quaternion.prototype.toAngleAxis = function (axisStore) {
		var sqrLength = this.x * this.x + this.y * this.y + this.z * this.z;
		var angle;
		if (Math.abs(sqrLength) <= Quaternion.ALLOWED_DEVIANCE) { // length is ~0
			angle = 0.0;
			if (axisStore !== null) {
				axisStore.x = 1.0;
				axisStore.y = 0.0;
				axisStore.z = 0.0;
			}
		} else {
			angle = 2.0 * Math.acos(this.w);
			if (axisStore !== null) {
				var invLength = 1.0 / Math.sqrt(sqrLength);
				axisStore.x = this.x * invLength;
				axisStore.y = this.y * invLength;
				axisStore.z = this.z * invLength;
			}
		}

		return angle;
	};

	Quaternion.prototype.equals = function (o) {
		if (this === o) {
			return true;
		}
		if (!(o instanceof Quaternion)) {
			return false;
		}
		return Math.abs(this.data[0] - o.data[0]) < Quaternion.ALLOWED_DEVIANCE && Math.abs(this.data[1] - o.data[1]) < Quaternion.ALLOWED_DEVIANCE
			&& Math.abs(this.data[2] - o.data[2]) < Quaternion.ALLOWED_DEVIANCE && Math.abs(this.data[3] - o.data[3]) < Quaternion.ALLOWED_DEVIANCE;
	};

	// Performance methods
	Quaternion.prototype.setd = function (x, y, z, w) {
		this.data[0] = x;
		this.data[1] = y;
		this.data[2] = z;
		this.data[3] = w;

		return this;
	};
	Quaternion.prototype.seta = function (array) {
		this.data[0] = array[0];
		this.data[1] = array[1];
		this.data[2] = array[2];
		this.data[3] = array[3];

		return this;
	};
	Quaternion.prototype.setv = function (quat) {
		this.data[0] = quat.data[0];
		this.data[1] = quat.data[1];
		this.data[2] = quat.data[2];
		this.data[3] = quat.data[3];

		return this;
	};

	return Quaternion;
});

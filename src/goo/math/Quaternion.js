/*jshint bitwise: false*/
define([
	'goo/math/Vector',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/math/Matrix3x3',
	'goo/math/MathUtils'
], function (
	Vector,
	Vector3,
	Vector4,
	Matrix3x3,
	MathUtils
) {
	'use strict';

	/**
	 * Quaternions provide a convenient mathematical notation for
	 * representing orientations and rotations of objects in three dimensions.
	 * Compared to Euler angles, Quaternions are simpler to compose and can help avoid the problem of gimbal lock.
	 * Compared to rotation matrices, Quaternions are more numerically stable and the representation (4 numbers) is more compact.
	 * Quaternions are non-commutative and provide a convenient way to interpolate between rotations (using the <i>slerp</i> function).
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @param {number} w
	 */
	function Quaternion(x, y, z, w) {
		// #ifdef DEBUG
		this._x = 0;
		this._y = 0;
		this._z = 0;
		this._w = 1;
		// #endif

		if (arguments.length === 0) {
			this.x = 0;
			this.y = 0;
			this.z = 0;
			this.w = 1;
		} else {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
		}

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	Vector.setupAliases(Quaternion.prototype, [['x'], ['y'], ['z'], ['w']]);

	Quaternion.prototype.set = Vector4.prototype.set;
	Quaternion.prototype.equals = Vector4.prototype.equals;
	Quaternion.prototype.copy = Vector4.prototype.copy;
	Quaternion.prototype.dot = Vector4.prototype.dot;
	Quaternion.prototype.length = Vector4.prototype.length;
	Quaternion.prototype.lengthSquared = Vector4.prototype.lengthSquared;
	Quaternion.prototype.set = Vector4.prototype.set;
	Quaternion.prototype.setDirect = Vector4.prototype.setDirect;

	Quaternion.IDENTITY = new Quaternion(0, 0, 0, 1);
	//! AT: what is this?! isn't EPSILON enough?
	Quaternion.ALLOWED_DEVIANCE = 0.00000001;

	/**
	 * Performs a component-wise addition between two quaternions and stores the result in a separate quaternion.
	 * @param {Quaternion} lhs Quaternion on the left-hand side.
	 * @param {Quaternion} rhs Quaternion on the right-hand side.
	 * @param {Quaternion} [target] Target quaternion for storage.
	 * @returns {Quaternion} A new quaternion if the target quaternion cannot be used for storage, else the target quaternion.
	 */
	Quaternion.add = function (lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.x = lhs.x + rhs.x;
		target.y = lhs.y + rhs.y;
		target.z = lhs.z + rhs.z;
		target.w = lhs.w + rhs.w;

		return target;
	};

	/**
	 * Performs a component-wise subtraction between two quaternions and stores the result in a separate quaternion.
	 * @param {Quaternion} lhs Quaternion on the left-hand side.
	 * @param {Quaternion} rhs Quaternion on the right-hand side.
	 * @param {Quaternion} [target] Target quaternion for storage.
	 * @returns {Quaternion} A new quaternion if the target quaternion cannot be used for storage, else the target quaternion.
	 */
	Quaternion.sub = function (lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.x = lhs.x - rhs.x;
		target.y = lhs.y - rhs.y;
		target.z = lhs.z - rhs.z;
		target.w = lhs.w - rhs.w;

		return target;
	};

	/**
	 * Performs a multiplication between two quaternions and stores the result in a separate quaternion.
	 * The result is a <b>quaternion product</b>.
	 * @param {Quaternion} lhs Quaternion on the left-hand side.
	 * @param {Quaternion} rhs Quaternion on the right-hand side.
	 * @param {Quaternion} [target] Target quaternion for storage.
	 * @returns {Quaternion} A new quaternion if the target quaternion cannot be used for storage, else the target quaternion.
	 */
	Quaternion.mul = function(a, b, out) {
		var ax = a.x, ay = a.y, az = a.z, aw = a.w,
			bx = b.x, by = b.y, bz = b.z, bw = b.w;

		out.x = ax * bw + aw * bx + ay * bz - az * by;
		out.y = ay * bw + aw * by + az * bx - ax * bz;
		out.z = az * bw + aw * bz + ax * by - ay * bx;
		out.w = aw * bw - ax * bx - ay * by - az * bz;
		return out;
	};

	/**
	 * Performs a component-wise division between two quaternions and stores the result in a separate quaternion.
	 * @deprecated Deprecated since 0.11.x and scheduled for removal in 0.13.0
	 * @param {Quaternion} lhs Quaternion on the left-hand side.
	 * @param {Quaternion} rhs Quaternion on the right-hand side.
	 * @param {Quaternion} [target] Target quaternion for storage.
	 * @returns {Quaternion} A new quaternion if the target quaternion cannot be used for storage, else the target quaternion.
	 */
	Quaternion.div = function (lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		var clean = true;

		target.x = (clean &= rhs.x < 0.0 || rhs.x > 0.0) ? lhs.x / rhs.x : 0.0;
		target.y = (clean &= rhs.y < 0.0 || rhs.y > 0.0) ? lhs.y / rhs.y : 0.0;
		target.z = (clean &= rhs.z < 0.0 || rhs.z > 0.0) ? lhs.z / rhs.z : 0.0;
		target.w = (clean &= rhs.w < 0.0 || rhs.w > 0.0) ? lhs.w / rhs.w : 0.0;

		return target;
	};

	/**
	 * Performs a component-wise addition between a quaternion and a scalar and stores the result in a separate quaternion.
	 * @deprecated Deprecated since 0.11.x and scheduled for removal in 0.13.0
	 * @param {Quaternion} lhs Quaternion on the left-hand side.
	 * @param {number} rhs Scalar on the right-hand side.
	 * @param {Quaternion} [target] Target quaternion for storage.
	 * @returns {Quaternion} A new quaternion if the target quaternion cannot be used for storage, else the target quaternion.
	 */
	Quaternion.scalarAdd = function (lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.x = lhs.x + rhs;
		target.y = lhs.y + rhs;
		target.z = lhs.z + rhs;
		target.w = lhs.w + rhs;

		return target;
	};

	/**
	 * Performs a component-wise subtraction between a quaternion and a scalar and stores the result in a separate quaternion.
	 * @deprecated Deprecated since 0.11.x and scheduled for removal in 0.13.0
	 * @param {Quaternion} lhs Quaternion on the left-hand side.
	 * @param {number} rhs Scalar on the right-hand side.
	 * @param {Quaternion} [target] Quaternion vector for storage.
	 * @returns {Quaternion} A new quaternion if the target vector cannot be used for storage, else the target vector.
	 */
	Quaternion.scalarSub = function (lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.x = lhs.x - rhs;
		target.y = lhs.y - rhs;
		target.z = lhs.z - rhs;
		target.w = lhs.w - rhs;

		return target;
	};

	/**
	 * Performs a component-wise multiplication between a quaternion and a scalar and stores the result in a separate quaternion.
	 * @param {Quaternion} lhs Quaternion on the left-hand side.
	 * @param {number} rhs Scalar on the right-hand side.
	 * @param {Quaternion} [target] Target quaternion for storage.
	 * @returns {Quaternion} A new quaternion if the target quaternion cannot be used for storage, else the target quaternion.
	 */
	Quaternion.scalarMul = function (lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.x = lhs.x * rhs;
		target.y = lhs.y * rhs;
		target.z = lhs.z * rhs;
		target.w = lhs.w * rhs;

		return target;
	};

	/**
	 * Performs a component-wise division between a quaternion and a scalar and stores the result in a separate quaternion.
	 * @deprecated Deprecated since 0.11.x and scheduled for removal in 0.13.0
	 * @param {Quaternion} lhs Quaternion on the left-hand side.
	 * @param {number} rhs Scalar on the right-hand side.
	 * @param {Quaternion} [target] Target quaternion for storage.
	 * @returns {Quaternion} A new quaternion if the target quaternion cannot be used for storage, else the target quaternion.
	 */
	Quaternion.scalarDiv = function (lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		var clean = true;

		rhs = (clean &= rhs < 0.0 || rhs > 0.0) ? 1.0 / rhs : 0.0;

		target.x = lhs.x * rhs;
		target.y = lhs.y * rhs;
		target.z = lhs.z * rhs;
		target.w = lhs.w * rhs;

		return target;
	};

	/**
	 * Computes the spherical linear interpolation between startQuat and endQuat.
	 * @param {Quaternion} startQuat Start quaternion.
	 * @param {Quaternion} endQuat End quaternion.
	 * @param {number} changeAmnt Interpolation factor between 0.0 and 1.0.
	 * @param {Quaternion} workQuat Work quaternion.
	 * @returns {Quaternion} workQuat The interpolated work quaternion.
	 */
	Quaternion.slerp = function (startQuat, endQuat, changeAmnt, workQuat) {
		// check for weighting at either extreme
		if (changeAmnt === 0.0) {
			return workQuat.set(startQuat);
		} else if (changeAmnt === 1.0) {
			return workQuat.set(endQuat);
		}

		// Check for equality and skip operation.
		if (startQuat.equals(endQuat)) {
			return workQuat.set(startQuat);
		}

		var result = startQuat.dot(endQuat);
		workQuat.set(endQuat);

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

		workQuat.setDirect(x, y, z, w);

		// Return the interpolated quaternion
		return workQuat;
	};

	/**
	 * Multiplies this quaterion's values by -1.
	 * @returns {Quaternion} Self for chaining.
	 */
	Quaternion.prototype.negate = function () {
		this.x *= -1;
		this.y *= -1;
		this.z *= -1;
		this.w *= -1;
		return this;
	};

	/**
	 * Conjugates this quaternion
	 * @returns {Quaternion} Self for chaining.
	 */
	Quaternion.prototype.conjugate = function () {
		this.x *= -1;
		this.y *= -1;
		this.z *= -1;
		return this;
	};

	/**
	 * Inverts this quaternion
	 * @returns {Quaternion} Self for chaining.
	 */
	Quaternion.prototype.invert = function () {
		return this.conjugate().normalize();
	};

	/**
	* Calculates the dot product between the current quaternion and another quaternion.
	* @param rhs Quaternion on the right-hand side.
	* @returns {number} The dot product.
	*/
	//Quaternion.prototype.dot = function (rhs) {
	//	//var ldata = this.data;
	//	//var rdata = rhs.data || rhs;
	//
	//	var sum = 0.0;
	//
	//	sum += this.x * rhs.x;
	//	sum += this.x * rhs.y;
	//	sum += this.x * rhs.z;
	//	sum += lw * rw;
	//
	//	return sum;
	//};

	/**
	 * Performs a component-wise addition between the current quaternion and another and stores the result locally.
	 * @param {Quaternion} rhs Quaternion on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */
	Quaternion.prototype.add = function (rhs) {
		return Quaternion.add(this, rhs, this);
	};

	/**
	 * Performs a component-wise subtraction between the current quaternion and another and stores the result locally.
	 * @param {Quaternion} rhs Quaternion on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */
	Quaternion.prototype.sub = function (rhs) {
		return Quaternion.sub(this, rhs, this);
	};

	/**
	 * Performs a multiplication between the current quaternion and another and stores the result locally.
	 * The result is a <b>quaternion product</b>.
	 * @param {Quaternion} rhs Quaternion on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */
	Quaternion.prototype.mul = function (rhs) {
		return Quaternion.mul(this, rhs, this);
	};

	/**
	 * Performs a component-wise division between the current quaternion and another and stores the result locally.
	 * @deprecated Deprecated since 0.11.x and scheduled for removal in 0.13.0
	 * @param {Quaternion} rhs Quaternion on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */
	Quaternion.prototype.div = function (rhs) {
		return Quaternion.div(this, rhs, this);
	};

	/**
	 * Performs a component-wise multiplication between the current quaternion and a scalar and stores the result locally.
	 * @param {number} rhs Scalar on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */
	Quaternion.prototype.scalarMul = function (rhs) {
		return Quaternion.scalarMul(this, rhs, this);
	};

	var slerp_work_quat;
	/**
	 * Computes the spherical linear interpolation from the current quaternion towards endQuat.
	 * @param {Quaternion} endQuat End quaternion.
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
	 * Sets the value of this quaternion to the rotation described by the given matrix values.
	 * @param {Matrix3x3} matrix Rotation matrix.
	 * @returns {Quaternion} Self for chaining.
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

		return this.setDirect(x, y, z, w);
	};

	/**
	 * Return a rotation matrix representing the current quaternion.
	 * @param {Matrix3x3} [store] The matrix to store our result in. If null, a new matrix is created.
	 * @returns {Matrix3x3} The normalized rotation matrix representation of this quaternion.
	 */
	Quaternion.prototype.toRotationMatrix = function (store) {
		var result = store;
		//if (!result) {
		//	result = new Matrix3x3();
		//}

		var norm = this.magnitudeSquared();
		var s = norm > 0.0 ? 2.0 / norm : 0.0;

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

	(function () {
		var pivotVector = new Vector3();

		/**
		 * Sets this quaternion to the one that will rotate vector "from" into vector "to". Vectors do not have to be the same length.
		 * @param {Vector3} from The source vector.
		 * @param {Vector3} to The destination vector into which to rotate the source vector.
		 * @returns {Quaternion} Self for chaining.
		 */
		Quaternion.prototype.fromVectorToVector = function (from, to) {
			var a = from; //! AT: why this aliasing?
			var b = to;

			var factor = a.length() * b.length();
			if (Math.abs(factor) > MathUtils.EPSILON) {
				// Vectors have length > 0
				var dot = a.dot(b) / factor;
				var theta = Math.acos(Math.max(-1.0, Math.min(dot, 1.0)));
				pivotVector.copy(a).cross(b);
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
	})();

	/**
	 * Normalize the current quaternion.
	 * @returns {Quaternion} Self, modified to be unit length, for chaining.
	 */
	Quaternion.prototype.normalize = function () {
		var n = 1.0 / this.magnitude();
		var xx = this.x * n;
		var yy = this.y * n;
		var zz = this.z * n;
		var ww = this.w * n;
		return this.setDirect(xx, yy, zz, ww);
	};

	/**
	 * Calculate the magnitude of the current quaternion.
	 * @returns {number} The magnitude of the quaternion.
	 */
	Quaternion.prototype.magnitude = function () {
		var magnitudeSQ = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
		if (magnitudeSQ === 1.0) {
			return 1.0;
		}

		return Math.sqrt(magnitudeSQ);
	};

	/**
	 * Calculate the squared magnitude of the current quaternion.
	 * @returns {number} The squared magnitude of the quaternion.
	 */
	Quaternion.prototype.magnitudeSquared = function () {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
	};

	/**
	 * Sets the values of this quaternion to the values represented by a given angle and axis of rotation. Note that this method creates
	 *              an object, so use fromAngleNormalAxis if your axis is already normalized. If axis == 0,0,0 the quaternion is set to identity.
	 * @param {number} angle The angle to rotate (in radians).
	 * @param {Vector3} axis The axis of rotation.
	 * @returns {Quaternion} Self for chaining.
	 */
	Quaternion.prototype.fromAngleAxis = function (angle, axis) {
		var temp = axis.clone().normalize();
		return this.fromAngleNormalAxis(angle, temp);
	};

	/**
	 * Sets the values of this quaternion to the values represented by a given angle and unit length axis of rotation. If axis == 0,0,0
	 *              the quaternion is set to identity.
	 * @param {number} angle The angle to rotate (in radians).
	 * @param {Vector3} axis The axis of rotation (already normalized - unit length).
	 * @returns {Quaternion} Self for chaining.
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
		return this.setDirect(x, y, z, w);
	};

	/**
	 * Returns the rotation angle represented by this quaternion. If a non-null vector is provided, the axis of rotation is stored in
	 *              that vector as well.
	 * @param {Vector3} axisStore The object to store the computed axis in. If null, no computations are done to determine axis.
	 * @returns {number} The angle of rotation in radians.
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

	/**
	 * Clones the quaternion
	 * @returns {Quaternion} Clone of self
	 */
	Quaternion.prototype.clone = function () {
		return new Quaternion(this.x, this.y, this.z, this.w);
	};

	// #ifdef DEBUG
	Vector.addReturnChecks(Quaternion.prototype, [
		'dot', 'dotDirect',
		'length', 'lengthSquared',
		'magnitude', 'magnitudeSquared',
		'distance', 'distanceSquared'
	]);
	// #endif

	return Quaternion;
});

define([
	'goo/math/MathUtils',
	'goo/math/Vector'
], function (
	MathUtils,
	Vector
) {
	'use strict';

	/**
	 * Vector with 3 components
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @example
	 * var v1 = new Vector3(); // v1 == (0, 0, 0)
	 * var v2 = new Vector3(1, 2, 3); // v2 == (1, 2, 3)
	 */
	function Vector3(x, y, z) {
		// #ifdef DEBUG
		this._x = 0;
		this._y = 0;
		this._z = 0;
		// #endif

		if (arguments.length === 0) {
			this.x = 0;
			this.y = 0;
			this.z = 0;
		} else {
			this.x = x;
			this.y = y;
			this.z = z;
		}

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	// #ifdef DEBUG
	Vector.setupAliases(Vector3.prototype, [['x'], ['y'], ['z']]);
	Vector.setupIndices(Vector3.prototype, 3);
	// #endif

	Vector.setupAliases(Vector3.prototype, [['u', 'r'], ['v', 'g'], ['w', 'b']]);

	/**
	 * Zero-vector (0, 0, 0)
	 * @type {Vector3}
	 */
	Vector3.ZERO = new Vector3(0, 0, 0);

	/**
	 * One-vector (1, 1, 1)
	 * @type {Vector3}
	 */
	Vector3.ONE = new Vector3(1, 1, 1);

	/**
	 * Unit-X (1, 0, 0)
	 * @type {Vector3}
	 */
	Vector3.UNIT_X = new Vector3(1, 0, 0);

	/**
	 * Unit-Y (0, 1, 0)
	 * @type {Vector3}
	 */
	Vector3.UNIT_Y = new Vector3(0, 1, 0);

	/**
	 * Unit-Z (0, 0, 1)
	 * @type {Vector3}
	 */
	Vector3.UNIT_Z = new Vector3(0, 0, 1);

	/**
	 * Returns the vector component associated with the given index.
	 * Vector components are numbered from 0 to 2 in this order: x, y, z.
	 * @param {number} index
	 * @returns {number}
	 */
	Vector3.prototype.getComponent = function (index) {
		switch (index) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
		}
	};

	/**
	 * Sets the vector component associated with the given index to a given value.
	 * Vector components are numbered from 0 to 2 in this order: x, y, z.
	 * @param {number} index
	 * @param {number} value
	 * @returns {Vector3} Self to allow chaining
	 */
	Vector3.prototype.setComponent = function (index, value) {
		switch (index) {
			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
		}
		return this;
	};

	/**
	 * Adds a vector to the current vector
	 * @param that {Vector3}
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v1 = new Vector3(1, 2, 3);
	 * var v2 = new Vector3(4, 5, 6);
	 * v1.add(v2); // v1 == (5, 7, 9)
	 */
	Vector3.prototype.add = function (that) {
		this.x += that.x;
		this.y += that.y;
		this.z += that.z;

		return this;
	};

	/**
	 * Adds numbers 'x', 'y', 'z' to the current Vector3 values
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(1, 2, 3);
	 * v.addDirect(2, 4, 6); // v == (3, 6, 9)
	 */
	Vector3.prototype.addDirect = function (x, y, z) {
		this.x += x;
		this.y += y;
		this.z += z;

		return this;
	};

	/**
	 * Adds a vector from the current vector
	 * @param that {Vector3}
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v1 = new Vector3(4, 5, 6);
	 * var v2 = new Vector3(1, 2, 3);
	 * v1.sub(v2); // v1 == (3, 3, 3)
	 */
	Vector3.prototype.sub = function (that) {
		this.x -= that.x;
		this.y -= that.y;
		this.z -= that.z;

		return this;
	};

	/**
	 * Subtracts numbers 'x', 'y', 'z' from the current Vector3
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(); // v == (0, 0, 0)
	 * v.subDirect(1, 2, 3); // v == (-1, -2, -3)
	 */
	Vector3.prototype.subDirect = function (x, y, z) {
		this.x -= x;
		this.y -= y;
		this.z -= z;

		return this;
	};

	/**
	 * Performs component-wise negation of the vector
	 * @returns {Vector3} Self to allow chaining
	 */
	Vector3.prototype.invert = function () {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;

		return this;
	};

	/**
	 * Multiplies the current vector by another vector
	 * @param that {Vector3}
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v1 = new Vector3(4, 5, 6);
	 * var v2 = new Vector3(1, 2, 3);
	 * v1.mul(v2); // v1 == (4, 10, 18)
	 */
	Vector3.prototype.mul = function (that) {
		this.x *= that.x;
		this.y *= that.y;
		this.z *= that.z;

		return this;
	};

	/**
	 * Multiplies the current Vector3 by numbers 'x', 'y', 'z' as inputs
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(1, 2, 3);
	 * v.mulDirect(2, 4, 6); // v == (2, 8, 18)
	 */
	Vector3.prototype.mulDirect = function (x, y, z) {
		this.x *= x;
		this.y *= y;
		this.z *= z;

		return this;
	};

	/**
	 * Scales the vector by a factor
	 * @param {number} factor
	 * @returns {Vector3} Self to allow chaining
	 */
	Vector3.prototype.scale = function (factor) {
		this.x *= factor;
		this.y *= factor;
		this.z *= factor;

		return this;
	};

	/**
	 * Divides the current Vector3 by another vector
	 * @param {Vector3} that
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(2, 4, 6);
	 * v.div(1, 2, 3); // v == (2, 2, 2)
	 */
	Vector3.prototype.div = function (that) {
		this.x /= that.x;
		this.y /= that.y;
		this.z /= that.z;

		return this;
	};

	/**
	 * Divides the current Vector3 by numbers 'x', 'y', 'z' as inputs
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(2, 4, 6);
	 * v.divDirect(1, 2, 3); // v == (2, 2, 2)
	 */
	Vector3.prototype.divDirect = function (x, y, z) {
		this.x /= x;
		this.y /= y;
		this.z /= z;

		return this;
	};

	/**
	 * Computes the dot product between the current vector and another vector
	 * @param {Vector3} that
	 * @returns {number}
	 */
	Vector3.prototype.dot = function (that) {
		return this.x * that.x +
			this.y * that.y +
			this.z * that.z;
	};

	/**
	 * Computes the dot product between the current vector and another vector given as 3 values
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {number}
	 */
	Vector3.prototype.dotDirect = function (x, y, z) {
		return this.x * x +
			this.y * y +
			this.z * z;
	};

	/**
	 * Returns whether this vector is aproximately equal to a given vector
	 * @param that
	 * @returns {boolean}
	 */
	Vector3.prototype.equals = function (that) {
		return (Math.abs(this.x - that.x) <= MathUtils.EPSILON) &&
			(Math.abs(this.y - that.y) <= MathUtils.EPSILON) &&
			(Math.abs(this.z - that.z) <= MathUtils.EPSILON);
	};

	/**
	 * Returns whether this vector is approximately equal to a given vector given as 3 values
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {boolean}
	 */
	Vector3.prototype.equalsDirect = function (x, y, z) {
		return (Math.abs(this.x - x) <= MathUtils.EPSILON) &&
			(Math.abs(this.y - y) <= MathUtils.EPSILON) &&
			(Math.abs(this.z - z) <= MathUtils.EPSILON);
	};

	/**
	 * Computes the cross product between the current Vector3 and another vector
	 * @param {Vector3} that
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v1 = new Vector3(0, 1, 0);
	 * var v2 = new Vector3(0, 0, -1);
	 * v1.cross(v2); // v1 == (-1, 0, 0)
	 */
	Vector3.prototype.cross = function (that) {
		var x = this.x;
		var y = this.y;
		var z = this.z;

		this.x = that.z * y - that.y * z;
		this.y = that.x * z - that.z * x;
		this.z = that.y * x - that.x * y;

		return this;
	};

	/**
	 * Computes the cross product between the current Vector3 and another vector given as 3 values
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v1 = new Vector3(0, 1, 0);
	 * var v2 = new Vector3(0, 0, -1);
	 * v1.cross(v2); // v1 == (-1, 0, 0)
	 */
	Vector3.prototype.crossDirect = function (x, y, z) {
		var thisX = this.x;
		var thisY = this.y;
		var thisZ = this.z;

		this.x = z * thisY - y * thisZ;
		this.y = x * thisZ - z * thisX;
		this.z = y * thisX - x * thisY;

		return this;
	};

	/**
	 * Linearly interpolates between the current Vector3 and an 'end' Vector3
	 * @param {Vector3} end End Vector3
	 * @param {number} factor Interpolation factor between 0.0 and 1.0
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var from = new Vector3(1, 2, 3);
	 * var to = new Vector3(3, 4, 5);
	 * var midway = from.clone().lerp(to, 0.5); // midway == (2, 3, 4)
	 */
	Vector3.prototype.lerp = function (end, factor) {
		this.x += (end.x - this.x) * factor;
		this.y += (end.y - this.y) * factor;
		this.z += (end.z - this.z) * factor;

		return this;
	};

	(function () {
		var tmpVec = new Vector3();

		/**
		 * Reflects a vector relative to the plane obtained from the normal parameter.
		 * @param {Vector3} normal Defines the plane that reflects the vector. Assumed to be of unit length.
		 * @returns {Vector3} Self to allow chaining
		 */
		Vector3.prototype.reflect = function (normal) {
			tmpVec.copy(normal);
			tmpVec.scale(2 * this.dot(normal));
			this.sub(tmpVec);
			return this;
		};
	})();

	/**
	 * Sets the vector's values from another vector's values
	 * @param {Vector3} that
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(); // v == (0, 0, 0)
	 * v.set(new Vector3(2, 4, 6)); // v == (2, 4, 6)
	 */
	Vector3.prototype.set = function (that) {
		this.x = that.x;
		this.y = that.y;
		this.z = that.z;

		return this;
	};

	/**
	 * Sets the vector's values from 3 numeric arguments
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(); // v == (0, 0, 0)
	 * v.setDirect(2, 4, 6); // v == (2, 4, 6)
	 */
	Vector3.prototype.setDirect = function (x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;

		return this;
	};

	/**
	 * Calculates the squared length/magnitude of the current Vector3.
	 * Note: When comparing the relative distances between two points it is usually sufficient
	 * to compare the squared distances, thus avoiding an expensive square root operation.
	 * @returns {number} squared length
	 * @example
	 * var v = new Vector3(0, 9, 0);
	 * v.lengthSquared(); // 81
	 */
	Vector3.prototype.lengthSquared = function () {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	};

	/**
	 * Calculates length squared of vector
	 * @returns {number} length squared
	 */
	Vector3.prototype.length = function () {
		return Math.sqrt(this.lengthSquared());
	};

	/**
	 * Normalizes the current vector
	 * @returns {Vector3} Self to allow chaining
	 */
	Vector3.prototype.normalize = function () {
		var length = this.length();

		if (length < MathUtils.EPSILON) {
			this.x = 0;
			this.y = 0;
			this.z = 0;
		} else {
			this.x /= length;
			this.y /= length;
			this.z /= length;
		}

		return this;
	};

	/**
	 * Normalizes the current vector; this method does not perform special checks for zero length vectors
	 * @returns {Vector3} Self to allow chaining
	 */
	Vector3.prototype.unsafeNormalize = function () {
		var length = this.length();

		this.x /= length;
		this.y /= length;
		this.z /= length;

		return this;
	};

	/**
	 * Computes the squared distance between the current Vector3 and another Vector3.
	 * Note: When comparing the relative distances between two points it is usually sufficient
	 * to compare the squared distances, thus avoiding an expensive square root operation.
	 * @param {Vector3} that Vector3
	 * @returns {number} distance squared
	 * @example
	 * var v1 = new Vector3(); // v1 == (0, 0, 0)
	 * var v2 = new Vector3(0, 9, 0);
	 * v1.distanceSquared(v2); // 81
	 */
	Vector3.prototype.distanceSquared = function (that) {
		var deltaX = this.x - that.x;
		var deltaY = this.y - that.y;
		var deltaZ = this.z - that.z;

		return deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
	};

	/**
	 * Computes the distance between the current Vector3 and another Vector3.
	 * Note: When comparing the relative distances between two points it is usually sufficient
	 * to compare the squared distances, thus avoiding an expensive square root operation.
	 * @param {Vector3} that Vector3
	 * @returns {number} distance
	 * @example
	 * var v1 = new Vector3(); // v1 == (0, 0, 0)
	 * var v2 = new Vector3(0, 9, 0);
	 * v1.distance(v2); // 9
	 */
	Vector3.prototype.distance = function (that) {
		return Math.sqrt(this.distanceSquared(that));
	};

	/**
	 * Multiplies this vector with a Matrix3
	 * @param {Matrix3} matrix
	 * @returns {Vector3} Self to allow chaining
	 */
	Vector3.prototype.applyPre = function (matrix) {
		var source = matrix.data;

		var x = this.x;
		var y = this.y;
		var z = this.z;

		this.x = source[0] * x + source[1] * y + source[2] * z;
		this.y = source[3] * x + source[4] * y + source[5] * z;
		this.z = source[6] * x + source[7] * y + source[8] * z;

		return this;
	};

	/**
	 * Multiplies a Matrix3 with this vector
	 * @param {Matrix3} matrix
	 * @returns {Vector3} Self to allow chaining
	 */
	Vector3.prototype.applyPost = function (matrix) {
		var source = matrix.data;

		var x = this.x;
		var y = this.y;
		var z = this.z;

		this.x = source[0] * x + source[3] * y + source[6] * z;
		this.y = source[1] * x + source[4] * y + source[7] * z;
		this.z = source[2] * x + source[5] * y + source[8] * z;

		return this;
	};

	/**
	 * Applies a Matrix4 (rotation, scale, translation) to this vector
	 * @param {Matrix4} matrix
	 * @returns {Vector3} Self to allow chaining
	 */
	Vector3.prototype.applyPostPoint = function (matrix) {
		var source = matrix.data;

		var x = this.x;
		var y = this.y;
		var z = this.z;

		this.x = source[0] * x + source[4] * y + source[ 8] * z + source[12];
		this.y = source[1] * x + source[5] * y + source[ 9] * z + source[13];
		this.z = source[2] * x + source[6] * y + source[10] * z + source[14];

		return this;
	};

	/**
	 * Applies a Matrix4 (rotation, scale) to this vector
	 * @param {Matrix4} matrix
	 * @returns {Vector3} Self to allow chaining
	 */
	Vector3.prototype.applyPostVector = function (matrix) {
		var source = matrix.data;

		var x = this.x;
		var y = this.y;
		var z = this.z;

		this.x = source[0] * x + source[4] * y + source[8] * z;
		this.y = source[1] * x + source[5] * y + source[9] * z;
		this.z = source[2] * x + source[6] * y + source[10] * z;

		return this;
	};

	/**
	 * Clones the vector
	 * @returns {Vector3} Clone of self
	 */
	Vector3.prototype.clone = function () {
		return new Vector3(this.x, this.y, this.z);
	};

	/**
	 * Copies the values of another vector to this vector; an alias for .setVector
	 * @param {Vector3} Source vector
	 * @returns {Vector3} Self to allow chaining
	 */
	Vector3.prototype.copy = Vector3.prototype.set;

	// can't just use destination.copy(source) when destination has more components than source
	// it would get infested with undefined and NaNs
	Vector3.prototype.copyTo = function (destination) {
		destination.x = this.x;
		destination.y = this.y;
		destination.z = this.z;

		return this;
	};

	Vector3.fromArray = function (array) {
		return new Vector3(array[0], array[1], array[2]);
	};

	// #ifdef DEBUG
	Vector.addReturnChecks(Vector3.prototype, [
		'dot', 'dotDirect',
		'length', 'lengthSquared',
		'distance', 'distanceSquared'
	]);
	// #endif

	return Vector3;
});

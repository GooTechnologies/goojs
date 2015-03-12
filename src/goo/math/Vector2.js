define([
	'goo/math/MathUtils',
	'goo/math/Vector'
], function (
	MathUtils,
	Vector
) {
	'use strict';

	/**
	 * Vector with 2 components
	 * @param {number} x
	 * @param {number} y
	 * @example
	 * var v1 = new Vector2(); // v1 == (0, 0)
	 * var v2 = new Vector2(1, 2); // v2 == (1, 2)
	 */
	function Vector2(x, y) {
		// #ifdef DEBUG
		this._x = 0;
		this._y = 0;
		// #endif

		if (arguments.length === 0) {
			this.x = 0;
			this.y = 0;
		} else {
			this.x = x;
			this.y = y;
		}

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	// #ifdef DEBUG
	Vector.setupAliases(Vector2.prototype,[['x', 'u'], ['y', 'v']]);
	// #endif

	/**
	 * Zero-vector (0, 0)
	 * @type {Vector2}
	 */
	Vector2.ZERO = new Vector2(0, 0);

	/**
	 * One-vector (1, 1)
	 * @type {Vector2}
	 */
	Vector2.ONE = new Vector2(1, 1);

	/**
	 * Unit-X (1, 0)
	 * @type {Vector2}
	 */
	Vector2.UNIT_X = new Vector2(1, 0);

	/**
	 * Unit-Y (0, 1)
	 * @type {Vector2}
	 */
	Vector2.UNIT_Y = new Vector2(0, 1);

	/**
	 * Adds a vector to the current vector
	 * @param that {Vector2}
	 * @returns {Vector2} Self to allow chaining
	 * @example
	 * var v1 = new Vector2(1, 2);
	 * var v2 = new Vector2(4, 5);
	 * v1.add(v2); // v1 == (5, 7)
	 */
	Vector2.prototype.add = function (that) {
		this.x += that.x;
		this.y += that.y;

		return this;
	};

	/**
	 * Adds numbers 'x', 'y' to the current Vector2 values
	 * @param {number} x
	 * @param {number} y
	 * @returns {Vector2} Self to allow chaining
	 * @example
	 * var v = new Vector2(1, 2);
	 * v.addDirect(2, 4); // v == (3, 6)
	 */
	Vector2.prototype.addDirect = function (x, y) {
		this.x += x;
		this.y += y;

		return this;
	};

	/**
	 * Adds a vector from the current vector
	 * @param that {Vector2}
	 * @returns {Vector2} Self to allow chaining
	 * @example
	 * var v1 = new Vector2(4, 5);
	 * var v2 = new Vector2(1, 2);
	 * v1.sub(v2); // v1 == (3, 3)
	 */
	Vector2.prototype.sub = function (that) {
		this.x -= that.x;
		this.y -= that.y;

		return this;
	};

	/**
	 * Subtracts numbers 'x', 'y' from the current Vector2
	 * @param {number} x
	 * @param {number} y
	 * @returns {Vector2} Self to allow chaining
	 * @example
	 * var v = new Vector2(); // v == (0, 0)
	 * v.subDirect(1, 2); // v == (-1, -2)
	 */
	Vector2.prototype.subDirect = function (x, y) {
		this.x -= x;
		this.y -= y;

		return this;
	};

	/**
	 * Performs component-wise negation of the vector
	 * @returns {Vector2} Self to allow chaining
	 */
	Vector2.prototype.invert = function () {
		this.x = -this.x;
		this.y = -this.y;

		return this;
	};

	/**
	 * Multiplies the current vector by another vector
	 * @param that {Vector2}
	 * @returns {Vector2} Self to allow chaining
	 * @example
	 * var v1 = new Vector2(4, 5);
	 * var v2 = new Vector2(1, 2);
	 * v1.mul(v2); // v1 == (4, 10)
	 */
	Vector2.prototype.mul = function (that) {
		this.x *= that.x;
		this.y *= that.y;

		return this;
	};

	/**
	 * Multiplies the current Vector2 by numbers 'x', 'y' as inputs
	 * @param {number} x
	 * @param {number} y
	 * @returns {Vector2} Self to allow chaining
	 * @example
	 * var v = new Vector2(1, 2);
	 * v.mulDirect(2, 4); // v == (2, 8)
	 */
	Vector2.prototype.mulDirect = function (x, y) {
		this.x *= x;
		this.y *= y;

		return this;
	};

	/**
	 * Scales the vector by a factor
	 * @param {number} factor
	 * @returns {Vector2} Self to allow chaining
	 */
	Vector2.prototype.scale = function (factor) {
		this.x *= factor;
		this.y *= factor;

		return this;
	};

	/**
	 * Divides the current Vector2 by another vector
	 * @param {Vector2} that
	 * @returns {Vector2} Self to allow chaining
	 * @example
	 * var v = new Vector2(4, 16);
	 * v.div(2, 4); // v == (2, 16)
	 */
	Vector2.prototype.div = function (that) {
		this.x /= that.x;
		this.y /= that.y;

		return this;
	};

	/**
	 * Divides the current Vector2 by numbers 'x', 'y' as inputs
	 * @param {number} x
	 * @param {number} y
	 * @returns {Vector2} Self to allow chaining
	 * @example
	 * var v = new Vector2(4, 9);
	 * v.divDirect(2, 3); // v == (2, 3)
	 */
	Vector2.prototype.divDirect = function (x, y) {
		this.x /= x;
		this.y /= y;

		return this;
	};

	/**
	 * Computes the dot product between the current vector and another vector
	 * @param {Vector2} that
	 * @returns {number}
	 */
	Vector2.prototype.dot = function (that) {
		return this.x * that.x +
			this.y * that.y;
	};

	/**
	 * Computes the dot product between the current vector and another vector given as 2 numeric values
	 * @param {number} x
	 * @param {number} y
	 * @returns {number}
	 */
	Vector2.prototype.dotDirect = function (x, y) {
		return this.x * x +
			this.y * y;
	};

	/**
	 * Returns whether this vector is aproximately equal to a given vector
	 * @param that
	 * @returns {boolean}
	 */
	Vector2.prototype.equals = function (that) {
		return (Math.abs(this.x - that.x) <= MathUtils.EPSILON) &&
			(Math.abs(this.y - that.y) <= MathUtils.EPSILON);
	};

	/**
	 * Returns whether this vector is approximately equal to a given vector given as 2 numeric values
	 * @param {number} x
	 * @param {number} y
	 * @returns {boolean}
	 */
	Vector2.prototype.equalsDirect = function (x, y) {
		return (Math.abs(this.x - x) <= MathUtils.EPSILON) &&
			(Math.abs(this.y - y) <= MathUtils.EPSILON);
	};

	/**
	 * Linearly interpolates between the current Vector2 and an 'end' Vector2
	 * @param {Vector2} end End Vector2
	 * @param {number} factor Interpolation factor between 0.0 and 1.0
	 * @returns {Vector2} Self to allow chaining
	 * @example
	 * var from = new Vector2(1, 2);
	 * var to = new Vector2(3, 4);
	 * var midway = from.clone().lerp(to, 0.5); // midway == (2, 3)
	 */
	Vector2.prototype.lerp = function (end, factor) {
		this.x += (end.x - this.x) * factor;
		this.y += (end.y - this.y) * factor;

		return this;
	};

	(function () {
		var tmpVec = new Vector2();

		/**
		 * Reflects a vector relative to the plane obtained from the normal parameter.
		 * @param {Vector2} normal Defines the plane that reflects the vector. Assumed to be of unit length.
		 * @returns {Vector2} Self to allow chaining
		 */
		Vector2.prototype.reflect = function (normal) {
			tmpVec.copy(normal);
			tmpVec.scale(2 * this.dot(normal));
			this.sub(tmpVec);
			return this;
		};
	})();

	/**
	 * Sets the vector's values from another vector's values
	 * @param {Vector2} that
	 * @returns {Vector2} Self to allow chaining
	 * @example
	 * var v = new Vector2(); // v == (0, 0)
	 * v.set(new Vector2(2, 4)); // v == (2, 4)
	 */
	Vector2.prototype.set = function (that) {
		this.x = that.x;
		this.y = that.y;

		return this;
	};

	/**
	 * Sets the vector's values from 2 numeric arguments
	 * @param {number} x
	 * @param {number} y
	 * @returns {Vector2} Self to allow chaining
	 * @example
	 * var v = new Vector2(); // v == (0, 0)
	 * v.setDirect(2, 4); // v == (2, 4)
	 */
	Vector2.prototype.setDirect = function (x, y) {
		this.x = x;
		this.y = y;

		return this;
	};

	/**
	 * Calculates the squared length/magnitude of the current Vector2.
	 * Note: When comparing the relative distances between two points it is usually sufficient
	 * to compare the squared distances, thus avoiding an expensive square root operation.
	 * @returns {number} squared length
	 * @example
	 * var v = new Vector2(0, 9);
	 * v.lengthSquared(); // 81
	 */
	Vector2.prototype.lengthSquared = function () {
		return this.x * this.x + this.y * this.y;
	};

	/**
	 * Calculates length squared of vector
	 * @returns {number} length squared
	 */
	Vector2.prototype.length = function () {
		return Math.sqrt(this.lengthSquared());
	};

	/**
	 * Normalizes the current vector
	 * @returns {Vector2} Self to allow chaining
	 */
	Vector2.prototype.normalize = function () {
		var length = this.length();

		if (length < MathUtils.EPSILON) {
			this.x = 0;
			this.y = 0;
		} else {
			this.x /= length;
			this.y /= length;
		}

		return this;
	};

	/**
	 * Normalizes the current vector; this method does not perform special checks for zero length vectors
	 * @returns {Vector2} Self to allow chaining
	 */
	Vector2.prototype.unsafeNormalize = function () {
		var length = this.length();

		this.x /= length;
		this.y /= length;

		return this;
	};

	/**
	 * Computes the squared distance between the current Vector2 and another Vector2.
	 * Note: When comparing the relative distances between two points it is usually sufficient
	 * to compare the squared distances, thus avoiding an expensive square root operation.
	 * @param {Vector2} that Vector2
	 * @returns {number} distance squared
	 * @example
	 * var v1 = new Vector2(); // v1 == (0, 0)
	 * var v2 = new Vector2(0, 9);
	 * v1.distanceSquared(v2); // 81
	 */
	Vector2.prototype.distanceSquared = function (that) {
		var deltaX = this.x - that.x;
		var deltaY = this.y - that.y;

		return deltaX * deltaX + deltaY * deltaY;
	};

	/**
	 * Computes the distance between the current Vector2 and another Vector2.
	 * Note: When comparing the relative distances between two points it is usually sufficient
	 * to compare the squared distances, thus avoiding an expensive square root operation.
	 * @param {Vector2} that Vector2
	 * @returns {number} distance
	 * @example
	 * var v1 = new Vector2(); // v1 == (0, 0)
	 * var v2 = new Vector2(0, 9);
	 * v1.distance(v2); // 9
	 */
	Vector2.prototype.distance = function (that) {
		return Math.sqrt(this.distanceSquared(that));
	};

	/**
	 * Multiplies this vector with a Matrix2
	 * @param {Matrix2} matrix
	 * @returns {Vector2} Self to allow chaining
	 */
	Vector2.prototype.applyPre = function (matrix) {
		var source = matrix.data;

		var x = this.x;
		var y = this.y;

		this.x = source[0] * x + source[1] * y;
		this.y = source[2] * x + source[3] * y;

		return this;
	};

	/**
	 * Multiplies a Matrix2 with this vector
	 * @param {Matrix2} matrix
	 * @returns {Vector2} Self to allow chaining
	 */
	Vector2.prototype.applyPost = function (matrix) {
		var source = matrix.data;

		var x = this.x;
		var y = this.y;

		this.x = source[0] * x + source[2] * y;
		this.y = source[1] * x + source[3] * y;

		return this;
	};

	/**
	 * Clones the vector
	 * @returns {Vector2} Clone of self
	 */
	Vector2.prototype.clone = function () {
		return new Vector2(this.x, this.y);
	};

	/**
	 * Copies the values of another vector to this vector; an alias for .setVector
	 * @param {Vector2} Source vector
	 * @returns {Vector2} Self to allow chaining
	 */
	Vector2.prototype.copy = Vector2.prototype.set;

	// can't just use destination.copy(source) when destination has more components than source
	// it would get infested with undefined and NaNs
	Vector2.prototype.copyTo = function (destination) {
		destination.x = this.x;
		destination.y = this.y;

		return this;
	};

	Vector2.fromArray = function (array) {
		return new Vector2(array[0], array[1]);
	};

	// #ifdef DEBUG
	Vector.addReturnChecks(Vector2.prototype, [
		'dot', 'dotDirect',
		'length', 'lengthSquared',
		'distance', 'distanceSquared'
	]);
	// #endif

	return Vector2;
});

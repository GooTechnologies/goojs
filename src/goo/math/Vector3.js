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
	 * @extends Vector
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
			// Nothing given
			this.x = 0;
			this.y = 0;
			this.z = 0;
		} else if (arguments.length === 1 && typeof arguments[0] === 'object') {
			if (arguments[0] instanceof Vector3) {
				// Vector3
				this.copy(arguments[0]);
			} else {
				// Array
				this.x = arguments[0][0];
				this.y = arguments[0][1];
				this.z = arguments[0][2];
			}
		} else {
			// Numbers
			this.x = x;
			this.y = y;
			this.z = z;
		}

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	Vector3.prototype = Object.create(Vector.prototype);
	Vector3.prototype.constructor = Vector3;

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
	 * @param rhs {Vector3}
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v1 = new Vector3(1, 2, 3);
	 * var v2 = new Vector3(4, 5, 6);
	 * v1.add(v2); // v1 == (5, 7, 9)
	 */
	Vector3.prototype.add = function (rhs) {
		if(rhs instanceof Vector3){
			this.x += rhs.x;
			this.y += rhs.y;
			this.z += rhs.z;
		} else if(typeof(rhs) === 'object' && rhs.length) {
			console.warn('Passing arrays to Vector3.prototype.add is deprecated - use Vector3.prototype.addDirect instead.');
			this.x += rhs[0];
			this.y += rhs[1];
			this.z += rhs[2];
		} else if(typeof(rhs) === 'number') {
			console.warn('Passing numbers to Vector3.prototype.add is deprecated - use Vector3.prototype.addDirect instead.');
			this.x += rhs;
			this.y += rhs;
			this.z += rhs;
		} else {
			console.warn('Vector3.prototype.add only supports vector arguments now.');
		}

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
	 * @param rhs {Vector3}
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v1 = new Vector3(4, 5, 6);
	 * var v2 = new Vector3(1, 2, 3);
	 * v1.sub(v2); // v1 == (3, 3, 3)
	 */
	Vector3.prototype.sub = function (rhs) {
		this.x -= rhs.x;
		this.y -= rhs.y;
		this.z -= rhs.z;

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
	Vector3.prototype.negate = function () {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;

		return this;
	};

	/**
	 * Multiplies the current vector by another vector
	 * @param rhs {Vector3}
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v1 = new Vector3(4, 5, 6);
	 * var v2 = new Vector3(1, 2, 3);
	 * v1.mul(v2); // v1 == (4, 10, 18)
	 */
	Vector3.prototype.mul = function (rhs) {
		if(typeof(rhs) === 'number'){
			console.warn('Vector3.prototype.mul only accepts vector arguments now. Please use Vector3.prototype.scale instead.');
			this.x *= rhs;
			this.y *= rhs;
			this.z *= rhs;
		} else {
			this.x *= rhs.x;
			this.y *= rhs.y;
			this.z *= rhs.z;
		}

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
	 * @param {Vector3} rhs
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(2, 4, 6);
	 * v.div(1, 2, 3); // v == (2, 2, 2)
	 */
	Vector3.prototype.div = function (rhs) {
		this.x /= rhs.x;
		this.y /= rhs.y;
		this.z /= rhs.z;

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
	 * @param {Vector3} rhs
	 * @returns {number}
	 */
	Vector3.prototype.dot = function (rhs) {
		return this.x * rhs.x +
			this.y * rhs.y +
			this.z * rhs.z;
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
	 * @param rhs
	 * @returns {boolean}
	 */
	Vector3.prototype.equals = function (rhs) {
		return (Math.abs(this.x - rhs.x) <= MathUtils.EPSILON) &&
			(Math.abs(this.y - rhs.y) <= MathUtils.EPSILON) &&
			(Math.abs(this.z - rhs.z) <= MathUtils.EPSILON);
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
	 * @param {Vector3} rhs
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v1 = new Vector3(0, 1, 0);
	 * var v2 = new Vector3(0, 0, -1);
	 * v1.cross(v2); // v1 == (-1, 0, 0)
	 */
	Vector3.prototype.cross = function (rhs) {
		var x = this.x;
		var y = this.y;
		var z = this.z;

		this.x = rhs.z * y - rhs.y * z;
		this.y = rhs.x * z - rhs.z * x;
		this.z = rhs.y * x - rhs.x * y;

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
	 * @param {Vector3} rhs
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(); // v == (0, 0, 0)
	 * v.set(new Vector3(2, 4, 6)); // v == (2, 4, 6)
	 */
	Vector3.prototype.set = function (rhs) {
		if(rhs instanceof Vector3){
			this.x = rhs.x;
			this.y = rhs.y;
			this.z = rhs.z;
		} else {
			this.x = arguments[0];
			this.y = arguments[1];
			this.z = arguments[2];
		}

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
	 * @param {Vector3} rhs Vector3
	 * @returns {number} distance squared
	 * @example
	 * var v1 = new Vector3(); // v1 == (0, 0, 0)
	 * var v2 = new Vector3(0, 9, 0);
	 * v1.distanceSquared(v2); // 81
	 */
	Vector3.prototype.distanceSquared = function (rhs) {
		var deltaX = this.x - rhs.x;
		var deltaY = this.y - rhs.y;
		var deltaZ = this.z - rhs.z;

		return deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
	};

	/**
	 * Computes the distance between the current Vector3 and another Vector3.
	 * Note: When comparing the relative distances between two points it is usually sufficient
	 * to compare the squared distances, thus avoiding an expensive square root operation.
	 * @param {Vector3} rhs Vector3
	 * @returns {number} distance
	 * @example
	 * var v1 = new Vector3(); // v1 == (0, 0, 0)
	 * var v2 = new Vector3(0, 9, 0);
	 * v1.distance(v2); // 9
	 */
	Vector3.prototype.distance = function (rhs) {
		return Math.sqrt(this.distanceSquared(rhs));
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

	/**
	 * Copies this vector over another. Not equivalent to `target.copy(this)` when
	 * the target vector has more components than the source vector
	 * @param {Vector} target
	 * @returns {Vector3} Self to allow chaining
	 */
	Vector3.prototype.copyTo = function (target) {
		target.x = this.x;
		target.y = this.y;
		target.z = this.z;

		return this;
	};

	/**
	 * Returns the components of the vector in array form
	 * @returns {Array<number>}
	 */
	Vector3.prototype.toArray = function () {
		return [this.x, this.y, this.z];
	};

	/**
	 * Creates a Vector3 given an array
	 * @param {number[3]} array
	 * @returns {Vector3}
	 */
	Vector3.fromArray = function (array) {
		return new Vector3(array[0], array[1], array[2]);
	};

	/**
	 * Creates a Vector3 given 3 numbers, an array, an {x, y, z} object or another Vector3
	 * @returns {Vector3}
	 */
	Vector3.fromAny = function () {
		if (arguments.length === 3) {
			return Vector3.fromArray(arguments);
		} else if (arguments[0] instanceof Array) {
			return Vector3.fromArray(arguments[0]);
		} else {
			var vectorLike = arguments[0];
			return new Vector3(vectorLike.x, vectorLike.y, vectorLike.z);
		}
	};

	// SHIM START
	Object.defineProperty(Vector3.prototype, 'data', {
		get: function () {
			var data = [];
			var that = this;
			console.warn('The .data property of Vector3 was removed. Please use the .x, .y and .z properties instead.');
			Object.defineProperties(data, {
				'0': {
					get: function () {
						return that.x;
					},
					set: function (value) {
						that.x = value;
					}
				},
				'1': {
					get: function () {
						return that.y;
					},
					set: function (value) {
						that.y = value;
					}
				},
				'2': {
					get: function () {
						return that.z;
					},
					set: function (value) {
						that.z = value;
					}
				}
			});
			return data;
		}
	});

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector3.prototype.setVector = function (rhs) {
		console.warn('The setVector method of Vector3 is deprecated. Please use the set method instead.');
		return this.set(rhs);
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector3.add = function (lhs, rhs, target) {
		console.warn('Vector3.add is deprecated. Use Vector3.prototype.add instead.');
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector3();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		target.data[0] = ldata[0] + rdata[0];
		target.data[1] = ldata[1] + rdata[1];
		target.data[2] = ldata[2] + rdata[2];

		return target;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector3.cross = function (lhs, rhs, target) {
		console.warn('Vector3.cross is deprecated. Use Vector3.prototype.cross instead.');
		if (!target) {
			target = new Vector3();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		var x = rdata[2] * ldata[1] - rdata[1] * ldata[2];
		var y = rdata[0] * ldata[2] - rdata[2] * ldata[0];
		var z = rdata[1] * ldata[0] - rdata[0] * ldata[1];

		target.data[0] = x;
		target.data[1] = y;
		target.data[2] = z;

		return target;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector3.distance = function (lhs, rhs) {
		console.warn('Vector3.distance is deprecated. Use Vector3.prototype.distance instead.');
		return Math.sqrt(Vector3.distanceSquared(lhs, rhs));
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector3.distanceSquared = function (lhs, rhs) {
		console.warn('Vector3.distanceSquared is deprecated. Use Vector3.prototype.distanceSquared instead.');
		var x = lhs.x - rhs.x,
			y = lhs.y - rhs.y,
			z = lhs.z - rhs.z;
		return x * x + y * y + z * z;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector3.div = function (lhs, rhs, target) {
		console.warn('Vector3.div is deprecated. Use Vector3.prototype.div instead.');
		if (!target) {
			target = new Vector3();
		}

		if (typeof lhs === 'number') {
			var rdata = rhs.data || rhs;

			target.data[0] = lhs / rdata[0];
			target.data[1] = lhs / rdata[1];
			target.data[2] = lhs / rdata[2];
		} else if (typeof rhs === 'number') {
			var irhs = 1 / rhs;
			var ldata = lhs.data || lhs;

			target.data[0] = ldata[0] * irhs;
			target.data[1] = ldata[1] * irhs;
			target.data[2] = ldata[2] * irhs;
		} else {
			var ldata = lhs.data || lhs;
			var rdata = rhs.data || rhs;

			target.data[0] = ldata[0] / rdata[0];
			target.data[1] = ldata[1] / rdata[1];
			target.data[2] = ldata[2] / rdata[2];
		}

		return target;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector3.dot = function (lhs, rhs) {
		console.warn('Vector3.dot is deprecated. Use Vector3.prototype.dot instead.');
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs, rhs];
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		return ldata[0] * rdata[0] +
			ldata[1] * rdata[1] +
			ldata[2] * rdata[2];
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector3.mul = function (lhs, rhs, target) {
		console.warn('Vector3.mul is deprecated. Use Vector3.prototype.mul instead.');
		if (!target) {
			target = new Vector3();
		}

		if (typeof lhs === 'number') {
			var rdata = rhs.data || rhs;

			target.data[0] = lhs * rdata[0];
			target.data[1] = lhs * rdata[1];
			target.data[2] = lhs * rdata[2];
		} else if (typeof rhs === 'number') {
			var ldata = lhs.data || lhs;

			target.data[0] = ldata[0] * rhs;
			target.data[1] = ldata[1] * rhs;
			target.data[2] = ldata[2] * rhs;
		} else {
			var ldata = lhs.data || lhs;
			var rdata = rhs.data || rhs;

			target.data[0] = ldata[0] * rdata[0];
			target.data[1] = ldata[1] * rdata[1];
			target.data[2] = ldata[2] * rdata[2];
		}

		return target;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector3.prototype.addVector = function (vector) {
		console.warn('Vector3.prototype.addVector is deprecated. Use Vector3.prototype.add instead.');
		this.data[0] += vector.data[0];
		this.data[1] += vector.data[1];
		this.data[2] += vector.data[2];

		return this;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector3.prototype.mulVector = function (vec3) {
		console.warn('Vector3.prototype.mulVector is deprecated. Use .mul instead.');
		this.data[0] *= vec3.data[0];
		this.data[1] *= vec3.data[1];
		this.data[2] *= vec3.data[2];

		return this;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector3.prototype.dotVector = function (rhs) {
		console.warn('Vector3.prototype.dotVector is deprecated. Use .dot instead.');
		var ldata = this.data;
		var rdata = rhs.data;

		return ldata[0] * rdata[0] +
			ldata[1] * rdata[1] +
			ldata[2] * rdata[2];
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector3.prototype.invert = function () {
		console.warn('Vector3.prototype.invert is deprecated.');
		this.data[0] = 0.0 - this.data[0];
		this.data[1] = 0.0 - this.data[1];
		this.data[2] = 0.0 - this.data[2];
		return this;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector3.prototype.setArray = function (array) {
		console.warn('Vector3.prototype.setArray is deprecated.');
		this.data[0] = array[0];
		this.data[1] = array[1];
		this.data[2] = array[2];

		return this;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector3.prototype.subVector = function (vector) {
		console.warn('Vector3.prototype.subVector is deprecated. Use .sub instead.');
		this.data[0] -= vector.data[0];
		this.data[1] -= vector.data[1];
		this.data[2] -= vector.data[2];

		return this;
	};

	/**
	 * @hidden
	 * @deprecated
	 */
	Vector3.sub = function (lhs, rhs, target) {
		console.warn('Vector3.sub is deprecated. Use Vector3.prototype.sub instead.');
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector3();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		target.data[0] = ldata[0] - rdata[0];
		target.data[1] = ldata[1] - rdata[1];
		target.data[2] = ldata[2] - rdata[2];

		return target;
	};
	// SHIM END

	// #ifdef DEBUG
	Vector.addReturnChecks(Vector3.prototype, [
		'dot', 'dotDirect',
		'length', 'lengthSquared',
		'distance', 'distanceSquared'
	]);
	// #endif

	return Vector3;
});

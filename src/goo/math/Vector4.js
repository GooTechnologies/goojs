define([
	'goo/math/Vector'
], function (
	Vector
) {
	'use strict';

	/**
	 * Vector with 4 components.
	 * @extends Vector
	 * @param {Vector4|number[]|...number} arguments Initial values for the components.
	 */
	function Vector4() {
		Vector.call(this, 4);

		if (arguments.length !== 0) {
			Vector.prototype.set.apply(this, arguments);
		}

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	Vector4.prototype = Object.create(Vector.prototype);
	Vector4.prototype.constructor = Vector4;

	Vector.setupAliases(Vector4.prototype,[['x', 'r'], ['y', 'g'], ['z', 'b'], ['w', 'a']]);

	Vector4.ZERO = new Vector4(0, 0, 0, 0);
	Vector4.ONE = new Vector4(1, 1, 1, 1);
	Vector4.UNIT_X = new Vector4(1, 0, 0, 0);
	Vector4.UNIT_Y = new Vector4(0, 1, 0, 0);
	Vector4.UNIT_Z = new Vector4(0, 0, 1, 0);
	Vector4.UNIT_W = new Vector4(0, 0, 0, 1);

	/**
	 * Performs a component-wise addition and stores the result in a separate vector. Equivalent of 'return (target = lhs + rhs);'.
	 * @param {Vector4|number[]|number} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4} [target] Target vector for storage.
	 * @returns {Vector4} A new vector if the target vector is omitted, else the target vector.
	 */
	Vector4.add = function (lhs, rhs, target) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs, lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector4();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		target.data[0] = ldata[0] + rdata[0];
		target.data[1] = ldata[1] + rdata[1];
		target.data[2] = ldata[2] + rdata[2];
		target.data[3] = ldata[3] + rdata[3];

		return target;
	};

	/**
	 * Performs a component-wise addition and stores the result locally. Equivalent of 'return (this = this + rhs);'.
	 * @param {Vector4|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @returns {Vector4} Self for chaining.
	 */
	Vector4.prototype.add = function (rhs) {
		return Vector4.add(this, rhs, this);
	};

	/**
	 * Performs a component-wise subtraction and stores the result in a separate vector. Equivalent of 'return (target = lhs - rhs);'.
	 * @param {Vector4|number[]|number} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4} [target] Target vector for storage.
	 * @returns {Vector4} A new vector if the target vector is omitted, else the target vector.
	 */
	Vector4.sub = function (lhs, rhs, target) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs, lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector4();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		target.data[0] = ldata[0] - rdata[0];
		target.data[1] = ldata[1] - rdata[1];
		target.data[2] = ldata[2] - rdata[2];
		target.data[3] = ldata[3] - rdata[3];

		return target;
	};

	/**
	 * Performs a component-wise subtraction and stores the result locally. Equivalent of 'return (this = this - rhs);'.
	 * @param {Vector4|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @returns {Vector4} Self for chaining.
	 */

	Vector4.prototype.sub = function (rhs) {
		return Vector4.sub(this, rhs, this);
	};

	/**
	 * Performs a component-wise multiplication and stores the result in a separate vector. Equivalent of 'return (target = lhs * rhs);'.
	 * @param {Vector4|number[]|number} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4} [target] Target vector for storage.
	 * @returns {Vector4} A new vector if the target vector is omitted, else the target vector.
	 */
	Vector4.mul = function (lhs, rhs, target) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs, lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector4();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		target.data[0] = ldata[0] * rdata[0];
		target.data[1] = ldata[1] * rdata[1];
		target.data[2] = ldata[2] * rdata[2];
		target.data[3] = ldata[3] * rdata[3];

		return target;
	};

	/**
	 * Performs a component-wise multiplication and stores the result locally. Equivalent of 'return (this = this * rhs);'.
	 * @param {Vector4|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @returns {Vector4} Self for chaining.
	 */
	Vector4.prototype.mul = function (rhs) {
		return Vector4.mul(this, rhs, this);
	};

	/**
	 * Performs a component-wise division and stores the result in a separate vector. Equivalent of 'return (target = lhs / rhs);'.
	 * @param {Vector4|number[]|number} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4} [target] Target vector for storage.
	 * @returns {Vector4} A new vector if the target vector is omitted, else the target vector.
	 */
	Vector4.div = function (lhs, rhs, target) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs, lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector4();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		target.data[0] = ldata[0] / rdata[0];
		target.data[1] = ldata[1] / rdata[1];
		target.data[2] = ldata[2] / rdata[2];
		target.data[3] = ldata[3] / rdata[3];

		return target;
	};

	/**
	 * Performs a component-wise division and stores the result locally. Equivalent of 'return (this = this / rhs);'.
	 * @param {Vector4|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @returns {Vector4} Self for chaining.
	 */

	Vector4.prototype.div = function (rhs) {
		return Vector4.div(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Computes the dot product between two vectors. Equivalent of 'return lhs•rhs;'.
	 * @param {Vector4|number[]|number} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4|number[]|number} rhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @returns {number} Dot product.
	 */

	Vector4.dot = function (lhs, rhs) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs, lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs, rhs, rhs];
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		return ldata[0] * rdata[0] +
			ldata[1] * rdata[1] +
			ldata[2] * rdata[2] +
			ldata[3] * rdata[3];
	};

	/**
	 * Computes the dot product between two vectors. Equivalent of 'return this•rhs;'.
	 * @param {Vector4|number[]|number} rhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @returns {number} Dot product.
	 */
	Vector4.prototype.dot = function (rhs) {
		return Vector4.dot(this, rhs);
	};

	/**
	 * Computes the dot product between the current vector and 'rhs'.
	 * @param {Vector4} rhs
	 * @returns {number}
	 */
	Vector4.prototype.dotVector = function (rhs) {
		var ldata = this.data;
		var rdata = rhs.data;

		return ldata[0] * rdata[0] +
			ldata[1] * rdata[1] +
			ldata[2] * rdata[2] +
			ldata[3] * rdata[3];
	};

	/* ====================================================================== */

	/**
	 * Linearly interpolates between two vectors and stores the result locally.
	 * @param {Vector3} end End vector.
	 * @param {number} factor Interpolation factor between zero and one.
	 * @returns {Vector3} Self for chaining.
	 */
	Vector4.prototype.lerp = function (end, factor) {
		this.x = (1.0 - factor) * this.x + factor * end.x;
		this.y = (1.0 - factor) * this.y + factor * end.y;
		this.z = (1.0 - factor) * this.z + factor * end.z;
		this.w = (1.0 - factor) * this.w + factor * end.w;

		return this;
	};

	/* ====================================================================== */

	// Performance methods
	/**
	 * Sets the vector's values from 4 numeric arguments
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @param {number} w
	 * @returns {Vector4} Self to allow chaining
	 * @example
	 * var v1 = new Vector4(); // v1 == (0, 0, 0, 0)
	 * v1.setDirect(2, 4, 6, 8); // v1 == (2, 4, 6, 8)
	 */
	Vector4.prototype.setDirect = function (x, y, z, w) {
		this.data[0] = x;
		this.data[1] = y;
		this.data[2] = z;
		this.data[3] = w;

		return this;
	};

	/**
	 * Sets the vector's values from an array
	 * @param {number[]} array
	 * @returns {Vector4} Self to allow chaining
	 * @example
	 * var v1 = new Vector4(); // v1 == (0, 0, 0, 0)
	 * v1.setArray([2, 4, 6, 8]); // v1 == (2, 4, 6, 8)
	 */
	Vector4.prototype.setArray = function (array) {
		this.data[0] = array[0];
		this.data[1] = array[1];
		this.data[2] = array[2];
		this.data[3] = array[3];

		return this;
	};

	/**
	 * Sets the vector's values from another vector
	 * @param {Vector4} vector
	 * @returns {Vector4} Self to allow chaining
	 * @example
	 * var v1 = new Vector4(); // v1 == (0, 0, 0, 0)
	 * v1.setVector(new Vector4(2, 4, 6, 8)); // v1 == (2, 4, 6, 8)
	 */
	Vector4.prototype.setVector = function (vector) {
		this.data[0] = vector.data[0];
		this.data[1] = vector.data[1];
		this.data[2] = vector.data[2];
		this.data[3] = vector.data[3];

		return this;
	};

	/**
	 * Adds arguments 'x', 'y', 'z', 'w' to the current vector
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @param {number} w
	 * @returns {Vector4} this for chaining
	 * @example
	 * var v1 = new Vector4(1, 2); // v1 == (1, 2, 3, 4)
	 * v1.addDirect(2, 4, 6, 8); // v1 == (3, 6, 9, 12)
	 */
	Vector4.prototype.addDirect = function (x, y, z, w) {
		this.data[0] += x;
		this.data[1] += y;
		this.data[2] += z;
		this.data[3] += w;

		return this;
	};

	/**
	 * Adds the vector argument to the current vector
	 * @param {Vector4} vector
	 * @returns {Vector4} this for chaining
	 * @example
	 * var v1 = new Vector4(1, 2); // v1 == (1, 2)
	 * v1.addVector(new Vector4(2, 4)); // v1 == (3, 6)
	 */
	Vector4.prototype.addVector = function (vector) {
		this.data[0] += vector.data[0];
		this.data[1] += vector.data[1];
		this.data[2] += vector.data[2];
		this.data[3] += vector.data[3];

		return this;
	};


	/**
	 * Multiplies the vector by arguments 'x', 'y', 'z', 'w'
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @param {number} t
	 * @returns {Vector4} this for chaining
	 * @example
	 * var v1 = new Vector4(1, 2, 3, 4); // v1 == (1, 2, 3, 4)
	 * v1.mulDirect(2, 4, 6, 8); // v1 == (2, 8, 18, 32)
	 */
	Vector4.prototype.mulDirect = function (x, y, z, w) {
		this.data[0] *= x;
		this.data[1] *= y;
		this.data[2] *= z;
		this.data[3] *= w;

		return this;
	};

	/**
	 * Multiplies the vector by the argument
	 * @param {Vector4} vector
	 * @returns {Vector4} this for chaining
	 * @example
	 * var v1 = new Vector4(1, 2, 3, 4); // v1 == (1, 2, 3, 4)
	 * v1.mulVector(new Vector4(2, 4, 6, 8)); // v1 == (2, 8, 18, 32)
	 */
	Vector4.prototype.mulVector = function (vector) {
		this.data[0] *= vector.data[0];
		this.data[1] *= vector.data[1];
		this.data[2] *= vector.data[2];
		this.data[3] *= vector.data[3];

		return this;
	};


	/**
	 * Subtracts arguments 'x', 'y', 'z', 'w' form the current vector
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @param {number} w
	 * @returns {Vector4} this for chaining
	 * @example
	 * var v1 = new Vector4(1, 2, 3, 4); // v1 == (1, 2, 3, 4)
	 * v1.subDirect(2, 4, 6, 8); // v1 == (-1, -2, -3, -4)
	 */
	Vector4.prototype.subDirect = function (x, y, z, w) {
		this.data[0] -= x;
		this.data[1] -= y;
		this.data[2] -= z;
		this.data[3] -= w;

		return this;
	};

	/**
	 * Subtracts the vector argument from the current vector
	 * @param {Vector2} vector
	 * @returns {Vector2} this for chaining
	 * @example
	 * var v1 = new Vector2(1, 2, 3, 4); // v1 == (1, 2, 3, 4)
	 * v1.addVector(new Vector2(2, 4, 6, 8)); // v1 == (-1, -2, -3, -4)
	 */
	Vector4.prototype.subVector = function (vector) {
		this.data[0] -= vector.data[0];
		this.data[1] -= vector.data[1];
		this.data[2] -= vector.data[2];
		this.data[3] -= vector.data[3];

		return this;
	};


	/**
	 * Scales the vector by a factor
	 * @param {number} factor
	 * @returns {Vector4} Self for chaining
	 */
	Vector4.prototype.scale = function (factor) {
		this.data[0] *= factor;
		this.data[1] *= factor;
		this.data[2] *= factor;
		this.data[3] *= factor;
		return this;
	};

	/**
	 * Clones the vector.
	 * @returns {Vector4} Clone of self.
	 */
	Vector4.prototype.clone = function () {
		return new Vector4().copy(this);
	};

	/**
	 * Copies the values of another vector to this vector; an alias for .setVector
	 * @param {Vector4} Source vector
	 */
	Vector4.prototype.copy = Vector4.prototype.setVector;

	Vector4.prototype.copyTo = function (destination) {
		destination.data[0] = this.data[0];
		destination.data[1] = this.data[1];
		destination.data[2] = this.data[2];
		destination.data[3] = this.data[3];
		return this;
	};

	// #ifdef DEBUG
	Vector.addPostChecks(Vector4.prototype, [
		'add', 'sub', 'mul', 'div', 'dot', 'dotVector',
		'lerp',
		'setDirect', 'setArray', 'setVector',
		'addDirect', 'addVector',
		'subDirect', 'subVector',
		'mulDirect', 'mulVector',
		'scale'
	]);
	// #endif

	return Vector4;
});

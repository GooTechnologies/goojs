define(["goo/math/Vector"], function(Vector) {
	"use strict";

	Vector3.prototype = Object.create(Vector.prototype);
	Vector3.prototype.setupComponents([['x', 'r'], ['y', 'g'], ['z', 'b']]);

	/**
	 * @class Three-dimensional vector.
	 * @name Vector3
	 * @constructor
	 * @description Creates a new three-dimensional vector.
	 * @param {Float} x First component of vector.
	 * @param {Float} y Second component of vector.
	 * @param {Float} z Third component of vector.
	 */

	function Vector3(x, y, z) {
		Vector.call(this, 3);

		this.x = x || 0.0;
		this.y = y || 0.0;
		this.z = z || 0.0;
	}

	/**
	 * @static
	 * @description Adds two three-dimensional vectors and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} Resulting vector.
	 */

	Vector3.add = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		target.x = lhs.x + rhs.x;
		target.y = lhs.y + rhs.y;
		target.z = lhs.z + rhs.z;

		return target;
	};

	/**
	 * @static
	 * @description Subtracts two three-dimensional vectors and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} Resulting vector.
	 */

	Vector3.sub = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		target.x = lhs.x - rhs.x;
		target.y = lhs.y - rhs.y;
		target.z = lhs.z - rhs.z;

		return target;
	};

	/**
	 * @static
	 * @description Multiplies two three-dimensional vectors and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} Resulting vector.
	 */

	Vector3.mul = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		target.x = lhs.x * rhs.x;
		target.y = lhs.y * rhs.y;
		target.z = lhs.z * rhs.z;

		return target;
	};

	/**
	 * @static
	 * @description Divides two three-dimensional vectors and stores the result in a separate vector. For all components in the right-hand vector
	 *              equal to zero, the corresponding component in the resulting vector will be equal to that of the left-hand vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} Resulting vector.
	 */

	// REVIEW: Throw an exception when trying to divide by zero?
	Vector3.div = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		target.x = rhs.x < 0.0 || rhs.x > 0.0 ? lhs.x / rhs.x : lhs.x;
		target.y = rhs.y < 0.0 || rhs.y > 0.0 ? lhs.y / rhs.y : lhs.y;
		target.z = rhs.z < 0.0 || rhs.z > 0.0 ? lhs.z / rhs.z : lhs.z;

		return target;
	};

	/**
	 * @static
	 * @description Scales a three-dimensional vector with a scalar and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} Resulting vector.
	 */

	Vector3.scale = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		target.x = lhs.x * rhs;
		target.y = lhs.y * rhs;
		target.z = lhs.z * rhs;

		return target;
	};

	return Vector3;
});

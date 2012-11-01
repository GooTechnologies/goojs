define(["goo/math/Vector"], function(Vector) {
	"use strict";

	Vector3.prototype = Object.create(Vector.prototype);
	Vector3.prototype.setupAliases([['x', 'r'], ['y', 'g'], ['z', 'b']]);

	/**
	 * @name Vector3
	 * @class Three-dimensional vector.
	 * @extends Vector
	 * @constructor
	 * @description Creates a new three-dimensional vector.
	 * @param {Float} x First component of vector.
	 * @param {Float} y Second component of vector.
	 * @param {Float} z Third component of vector.
	 */

	function Vector3() {
		Vector.call(this, 3);
		this.set(arguments);
	}

	/**
	 * @static
	 * @description Adds two three-dimensional vectors component-wise and stores the result in a separate vector.
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
	 * @description Subtracts two three-dimensional vectors component-wise and stores the result in a separate vector.
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
	 * @description Multiplies two three-dimensional vectors component-wise and stores the result in a separate vector.
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
	 * @description Divides two three-dimensional vectors component-wise and stores the result in a separate vector. For all components in the
	 *              right-hand vector equal to zero, the corresponding component in the resulting vector will be equal to that of the left-hand
	 *              vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} Resulting vector.
	 */

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
	 * @description Adds a three-dimensional vector with a scalar and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} Resulting vector.
	 */

	Vector3.scalarAdd = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		target.x = lhs.x + rhs;
		target.y = lhs.y + rhs;
		target.z = lhs.z + rhs;

		return target;
	};

	/**
	 * @static
	 * @description Subtracts a three-dimensional vector with a scalar and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} Resulting vector.
	 */

	Vector3.scalarSub = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		target.x = lhs.x - rhs;
		target.y = lhs.y - rhs;
		target.z = lhs.z - rhs;

		return target;
	};

	/**
	 * @static
	 * @description Multiplies a three-dimensional vector with a scalar and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} Resulting vector.
	 */

	Vector3.scalarMul = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		target.x = lhs.x * rhs;
		target.y = lhs.y * rhs;
		target.z = lhs.z * rhs;

		return target;
	};

	/**
	 * @static
	 * @description Divides a three-dimensional vector with a scalar and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} Resulting vector.
	 */

	Vector3.scalarDiv = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		if (rhs < 0.0 || rhs > 0.0) {
			rhs = 1.0 / rhs;

			target.x = lhs.x * rhs;
			target.y = lhs.y * rhs;
			target.z = lhs.z * rhs;
		} else {
			target.x = lhs.x;
			target.y = lhs.y;
			target.z = lhs.z;
		}

		return target;
	};

	/**
	 * @static
	 * @description Computes the cross product of two vectors and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} Resulting vector.
	 */

	Vector3.cross = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		target.x = rhs.z * lhs.y - rhs.y * lhs.z;
		target.y = rhs.x * lhs.z - rhs.z * lhs.x;
		target.z = rhs.y * lhs.x - rhs.x * lhs.y;

		return target;
	};

	/**
	 * @description Computes the cross product and stores the result locally.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @returns {Vector3} Self for chaining.
	 */

	Vector3.prototype.cross = function(vector) {
		return Vector3.cross(this, vector, this);
	};

	return Vector3;
});

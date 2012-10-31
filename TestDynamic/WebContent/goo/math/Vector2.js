define(["goo/math/Vector"], function(Vector) {
	"use strict";

	Vector2.prototype = Object.create(Vector.prototype);
	Vector2.prototype.setupComponents([['x', 'u', 's'], ['y', 'v', 't']]);

	/**
	 * @class Two-dimensional vector.
	 * @name Vector2
	 * @constructor
	 * @description Creates a new two-dimensional vector.
	 * @param {Float} x First component of vector.
	 * @param {Float} y Second component of vector.
	 */

	function Vector2(x, y) {
		Vector.call(this, 2);

		this.x = x || 0.0;
		this.y = y || 0.0;
	}

	/**
	 * @static
	 * @description Adds two two-dimensional vectors and stores the result in a separate vector.
	 * @param {Vector2} lhs Vector on the left-hand side.
	 * @param {Vector2} rhs Vector on the right-hand side.
	 * @param {Vector2} target Target vector for storage. (optional)
	 * @returns {Vector2} Resulting vector.
	 */

	Vector2.add = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector2();
		}

		target.x = lhs.x + rhs.x;
		target.y = lhs.y + rhs.y;

		return target;
	};

	/**
	 * @static
	 * @description Subtracts two two-dimensional vectors and stores the result in a separate vector.
	 * @param {Vector2} lhs Vector on the left-hand side.
	 * @param {Vector2} rhs Vector on the right-hand side.
	 * @param {Vector2} target Target vector for storage. (optional)
	 * @returns {Vector2} Resulting vector.
	 */

	Vector2.sub = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector2();
		}

		target.x = lhs.x - rhs.x;
		target.y = lhs.y - rhs.y;

		return target;
	};

	/**
	 * @static
	 * @description Multiplies two two-dimensional vectors and stores the result in a separate vector.
	 * @param {Vector2} lhs Vector on the left-hand side.
	 * @param {Vector2} rhs Vector on the right-hand side.
	 * @param {Vector2} target Target vector for storage. (optional)
	 * @returns {Vector2} Resulting vector.
	 */

	Vector2.mul = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector2();
		}

		target.x = lhs.x * rhs.x;
		target.y = lhs.y * rhs.y;

		return target;
	};

	/**
	 * @static
	 * @description Divides two two-dimensional vectors and stores the result in a separate vector. For all components in the right-hand vector equal
	 *              to zero, the corresponding component in the resulting vector will be equal to that of the left-hand vector.
	 * @param {Vector2} lhs Vector on the left-hand side.
	 * @param {Vector2} rhs Vector on the right-hand side.
	 * @param {Vector2} target Target vector for storage. (optional)
	 * @returns {Vector2} Resulting vector.
	 */

	// REVIEW: Throw an exception when trying to divide by zero?
	Vector2.div = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector2();
		}

		target.x = rhs.x < 0.0 || rhs.x > 0.0 ? lhs.x / rhs.x : lhs.x;
		target.y = rhs.y < 0.0 || rhs.y > 0.0 ? lhs.y / rhs.y : lhs.y;

		return target;
	};

	/**
	 * @static
	 * @description Scales a two-dimensional vector with a scalar and stores the result in a separate vector.
	 * @param {Vector2} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector2} target Target vector for storage. (optional)
	 * @returns {Vector2} Resulting vector.
	 */

	Vector2.scale = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector2();
		}

		target.x = lhs.x * rhs;
		target.y = lhs.y * rhs;

		return target;
	};

	return Vector2;
});

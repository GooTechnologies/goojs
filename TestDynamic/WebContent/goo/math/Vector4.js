define(["goo/math/Vector"], function(Vector) {
	"use strict";

	Vector4.prototype = Object.create(Vector.prototype);

	Vector4.components = [["x"], ["y"], ["z"], ["w"]];

	(function() {
		for ( var i = 0; i < Vector4.components.length; i++) {
			for ( var j = 0; j < Vector4.components[i].length; j++) {
				Object.defineProperty(Vector4.prototype, Vector4.components[i][j], {
					get : new Function("return this.data[" + i + "];"),
					set : new Function("value", "this.data[" + i + "] = value;"),
				});
			}
		}
	})();

	/**
	 * @class Four-dimensional vector.
	 * @name Vector4
	 * @constructor
	 * @description Creates a new four-dimensional vector.
	 * @param {Float} x X-component of vector.
	 * @param {Float} y Y-component of vector.
	 * @param {Float} z Z-component of vector.
	 * @param {Float} w W-component of vector.
	 */

	function Vector4(x, y, z, w) {
		Vector.call(this, 4);

		this.x = x || 0.0;
		this.y = y || 0.0;
		this.z = z || 0.0;
		this.w = w || 0.0;
	}

	/**
	 * @static
	 * @description Adds two four-dimensional vectors and stores the result in a separate vector.
	 * @param {Vector4} lhs Vector on the left-hand side.
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @param {Vector4} target Target vector for storage. (optional)
	 * @returns {Vector4} Resulting vector.
	 */

	Vector4.add = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector4();
		}

		target.x = lhs.x + rhs.x;
		target.y = lhs.y + rhs.y;
		target.z = lhs.z + rhs.z;
		target.w = lhs.w + rhs.w;

		return target;
	};

	/**
	 * @static
	 * @description Subtracts two four-dimensional vectors and stores the result in a separate vector.
	 * @param {Vector4} lhs Vector on the left-hand side.
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @param {Vector4} target Target vector for storage. (optional)
	 * @returns {Vector4} Resulting vector.
	 */

	Vector4.sub = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector4();
		}

		target.x = lhs.x - rhs.x;
		target.y = lhs.y - rhs.y;
		target.z = lhs.z - rhs.z;
		target.w = lhs.w - rhs.w;

		return target;
	};

	/**
	 * @static
	 * @description Multiplies two four-dimensional vectors and stores the result in a separate vector.
	 * @param {Vector4} lhs Vector on the left-hand side.
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @param {Vector4} target Target vector for storage. (optional)
	 * @returns {Vector4} Resulting vector.
	 */

	Vector4.mul = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector4();
		}

		target.x = lhs.x * rhs.x;
		target.y = lhs.y * rhs.y;
		target.z = lhs.z * rhs.z;
		target.w = lhs.w * rhs.w;

		return target;
	};

	/**
	 * @static
	 * @description Divides two four-dimensional vectors and stores the result in a separate vector. For all components
	 *              in the right-hand vector equal to zero, the corresponding component in the resulting vector will be
	 *              equal to that of the left-hand vector.
	 * @param {Vector4} lhs Vector on the left-hand side.
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @param {Vector4} target Target vector for storage. (optional)
	 * @returns {Vector4} Resulting vector.
	 */

	Vector4.div = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector4();
		}

		target.x = rhs.x < 0.0 || rhs.x > 0.0 ? lhs.x / rhs.x : lhs.x;
		target.y = rhs.y < 0.0 || rhs.y > 0.0 ? lhs.y / rhs.y : lhs.y;
		target.z = rhs.z < 0.0 || rhs.z > 0.0 ? lhs.z / rhs.z : lhs.z;
		target.w = rhs.w < 0.0 || rhs.w > 0.0 ? lhs.w / rhs.w : lhs.w;

		return target;
	};

	/**
	 * @static
	 * @description Scales a four-dimensional vector with a scalar and stores the result in a separate vector.
	 * @param {Vector4} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector4} target Target vector for storage. (optional)
	 * @returns {Vector4} Resulting vector.
	 */

	Vector4.scale = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector4();
		}

		target.x = lhs.x * rhs;
		target.y = lhs.y * rhs;
		target.z = lhs.z * rhs;
		target.w = lhs.w * rhs;

		return target;
	};

	return Vector4;
});

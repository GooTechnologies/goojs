define(["goo/math/Vector"], function(Vector) {
	"use strict";

	Vector3.prototype = Object.create(Vector.prototype);
	Vector3.prototype.setupAliases([['x', 'r'], ['y', 'g'], ['z', 'b']]);

	/**
	 * @name Vector3
	 * @class Vector with 3 components.
	 * @extends Vector
	 * @constructor
	 * @description Creates a new vector.
	 * @param {Float...} arguments Initial values for the components.
	 */

	function Vector3() {
		Vector.call(this, 3);
		this.set(arguments);
	}

	var temp = new Vector3();

	// TODO: add Object.freeze?
	Vector3.ZERO = new Vector3(0, 0, 0);
	Vector3.ONE = new Vector3(1, 1, 1);
	Vector3.UNIT_X = new Vector3(1, 0, 0);
	Vector3.UNIT_Y = new Vector3(0, 1, 0);
	Vector3.UNIT_Z = new Vector3(0, 0, 1);

	/**
	 * @static
	 * @description Performs a component-wise addition between two vectors and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector3.add = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		var left = lhs.data || lhs;
		var right = rhs.data || rhs;

		target.data[0] = left[0] + right[0];
		target.data[1] = left[1] + right[1];
		target.data[2] = left[2] + right[2];

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise subtraction between two vectors and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector3.sub = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		target.data[0] = lhs.data[0] - rhs.data[0];
		target.data[1] = lhs.data[1] - rhs.data[1];
		target.data[2] = lhs.data[2] - rhs.data[2];

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise multiplication between two vectors and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector3.mul = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		target.data[0] = lhs.data[0] * rhs.data[0];
		target.data[1] = lhs.data[1] * rhs.data[1];
		target.data[2] = lhs.data[2] * rhs.data[2];

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise division between two vectors and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Vector3} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector3.div = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		var clean = true;

		target.data[0] = (clean &= (rhs.data[0] < 0.0 || rhs.data[0] > 0.0)) ? lhs.data[0] / rhs.data[0] : 0.0;
		target.data[1] = (clean &= (rhs.data[1] < 0.0 || rhs.data[1] > 0.0)) ? lhs.data[1] / rhs.data[1] : 0.0;
		target.data[2] = (clean &= (rhs.data[2] < 0.0 || rhs.data[2] > 0.0)) ? lhs.data[2] / rhs.data[2] : 0.0;

		if (clean === false) {
			console.warn("[Vector3.div] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise addition between a vector and a scalar and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector3.scalarAdd = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		target.data[0] = lhs.data[0] + rhs;
		target.data[1] = lhs.data[1] + rhs;
		target.data[2] = lhs.data[2] + rhs;

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise subtraction between a vector and a scalar and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector3.scalarSub = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		target.data[0] = lhs.data[0] - rhs;
		target.data[1] = lhs.data[1] - rhs;
		target.data[2] = lhs.data[2] - rhs;

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise multiplication between a vector and a scalar and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @returns {Vector3} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector3.scalarMul = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		target.data[0] = lhs.data[0] * rhs;
		target.data[1] = lhs.data[1] * rhs;
		target.data[2] = lhs.data[2] * rhs;

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise division between a vector and a scalar and stores the result in a separate vector.
	 * @param {Vector3} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector3} target Target vector for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Vector3} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector3.scalarDiv = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		var clean = true;

		rhs = (clean &= (rhs < 0.0 || rhs > 0.0)) ? 1.0 / rhs : 0.0;

		target.data[0] = lhs.data[0] * rhs;
		target.data[1] = lhs.data[1] * rhs;
		target.data[2] = lhs.data[2] * rhs;

		if (clean === false) {
			console.warn("[Vector3.scalarDiv] Attempted to divide by zero!");
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

		temp.data[0] = rhs.data[2] * lhs.data[1] - rhs.data[1] * lhs.data[2];
		temp.data[1] = rhs.data[0] * lhs.data[2] - rhs.data[2] * lhs.data[0];
		temp.data[2] = rhs.data[1] * lhs.data[0] - rhs.data[0] * lhs.data[1];

		target.copy(temp);

		return target;
	};

	/**
	 * @description Performs a component-wise addition between two vectors and stores the result locally.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @returns {Vector3} Self for chaining.
	 */

	Vector3.prototype.add = function(rhs) {
		return Vector3.add(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between two vectors and stores the result locally.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @returns {Vector3} Self for chaining.
	 */

	Vector3.prototype.sub = function(rhs) {
		return Vector3.sub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between two vectors and stores the result locally.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @returns {Vector3} Self for chaining.
	 */

	Vector3.prototype.mul = function(rhs) {
		return Vector3.mul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between two vectors and stores the result locally.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @returns {Vector3} Self for chaining.
	 */

	Vector3.prototype.div = function(rhs) {
		return Vector3.div(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise addition between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector3} Self for chaining.
	 */

	Vector3.prototype.scalarAdd = function(rhs) {
		return Vector3.scalarAdd(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector3} Self for chaining.
	 */

	Vector3.prototype.scalarSub = function(rhs) {
		return Vector3.scalarSub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector3} Self for chaining.
	 */

	Vector3.prototype.scalarMul = function(rhs) {
		return Vector3.scalarMul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector3} Self for chaining.
	 */

	Vector3.prototype.scalarDiv = function(rhs) {
		return Vector3.scalarDiv(this, rhs, this);
	};

	/**
	 * @description Computes the cross product between two vectors and stores the result locally.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @returns {Vector3} Self for chaining.
	 */

	Vector3.prototype.cross = function(rhs) {
		return Vector3.cross(this, rhs, this);
	};

	/**
	 * @description Extracts the rotation from a matrix. Order convention is x followed by y followed by z.
	 * @param {Matrix4x4} matrix Rotational matrix.
	 * @returns {Vector3} Self for chaining.
	 */

	Vector3.prototype.extractRotationFromMatrix = function(matrix) {
		/*
		var sx = Math.sin(angles.x);
		var cx = Math.cos(angles.x);
		var sy = Math.sin(angles.y);
		var cy = Math.cos(angles.y);
		var sz = Math.sin(angles.z);
		var cz = Math.cos(angles.z);

		this.e00 = cz * cy;
		this.e10 = sz * cy;
		this.e20 = 0.0 - sy;
		this.e01 = cz * sy * sx - sz * cx;
		this.e11 = sz * sy * sx + cz * cx;
		this.e21 = cy * sx;
		this.e02 = cz * sy * cx + sz * sx;
		this.e12 = sz * sy * cx - cz * sx;
		this.e22 = cy * cx;
		*/

		return this;
	};

	/**
	 * @description Linearly interpolates between two vectors and stores the result locally.
	 * @param {Vector3} endVec End vector.
	 * @param {Float} scalar
	 * @returns {Vector3} Self for chaining.
	 */

	// REVIEW: This creates a feedback loop when used multiple times which is probably not the intention?
	Vector3.prototype.lerp = function(endVec, scalar) {
		this.x = (1.0 - scalar) * this.x + scalar * endVec.x;
		this.y = (1.0 - scalar) * this.y + scalar * endVec.y;
		this.z = (1.0 - scalar) * this.z + scalar * endVec.z;
		return this;
	};
	
	/**
     * @param x
     * @param y
     * @param z
     * @return the squared distance between the point described by this vector and the given x, y, z point. When
     *         comparing the relative distance between two points it is usually sufficient to compare the squared
     *         distances, thus avoiding an expensive square root operation.
     */
	Vector3.prototype.distanceSquared = function(x,  y,  z) {
        var dx = this.x - x;
        var dy = this.y - y;
        var dz = this.z - z;
        return dx * dx + dy * dy + dz * dz;
    };

	/**
     * @param x
     * @param y
     * @param z
     * @return the distance between the point described by this vector and the given destination point.
     */
	Vector3.prototype.distance = function(x,  y,  z) {
        return Math.sqrt(this.distanceSquared(x, y, z));
    };

	/**
	 * @description Compares two vectors with a maximum tolerance of 0.000001 per component.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @returns {Boolean} True if equal.
	 */

	Vector3.prototype.equals = function(rhs) {
		return Math.abs(this.x - rhs.x) < 0.000001 && Math.abs(this.y - rhs.y) < 0.000001 && Math.abs(this.z - rhs.z) < 0.000001;
	};

	return Vector3;
});

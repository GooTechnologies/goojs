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

		if (clean == false) {
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

		if (clean == false) {
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

		target.data[0] = rhs.data[2] * lhs.data[1] - rhs.data[1] * lhs.data[2];
		target.data[1] = rhs.data[0] * lhs.data[2] - rhs.data[2] * lhs.data[0];
		target.data[2] = rhs.data[1] * lhs.data[0] - rhs.data[0] * lhs.data[1];

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
	 * @description Computes the cross product and stores the result locally.
	 * @param {Vector3} rhs Vector on the right-hand side.
	 * @returns {Vector3} Self for chaining.
	 */

	Vector3.prototype.cross = function(vector) {
		return Vector3.cross(this, vector, this);
	};

	Vector3.prototype.extractRotationFromMatrix = function(matrix, order) {
		this.x = 0.0;
		this.y = 0.0;
		this.z = 0.0;

		switch (order) {
			default:
			case "XYZ":
			case "xyz": {
				// this.e00 = c1 * c2;
				// this.e10 = c2 * s1;
				// this.e20 = 0.0 - s2;
				// this.e01 = c1 * s2 * s3 - c3 * s1;
				// this.e11 = c1 * c3 + s1 * s2 * s3;
				// this.e21 = c2 * s3;
				// this.e02 = s1 * s3 + c1 * c3 * s2;
				// this.e12 = c3 * s1 * s2 - c1 * s3;
				// this.e22 = c2 * c3;

				break;
			}
			case "XZY":
			case "xzy": {
				// this.e00 = c1 * c2;
				// this.e10 = s2;
				// this.e20 = 0.0 - c2 * s1;
				// this.e01 = s1 * s3 - c1 * c3 * s2;
				// this.e11 = c2 * c3;
				// this.e21 = c1 * s3 + c3 * s1 * s2;
				// this.e02 = c3 * s1 + c1 * s2 * s3;
				// this.e12 = 0.0 - c2 * s3;
				// this.e22 = c1 * c3 - s1 * s2 * s3;

				break;
			}
			case "YZX":
			case "yzx": {
				// this.e00 = c2 * c3;
				// this.e10 = s1 * s3 + c1 * c3 * s2;
				// this.e20 = c3 * s1 * s2 - c1 * s3;
				// this.e01 = 0.0 - s2;
				// this.e11 = c1 * c2;
				// this.e21 = c2 * s1;
				// this.e02 = c2 * s3;
				// this.e12 = c1 * s2 * s3 - c3 * s1;
				// this.e22 = c1 * c3 + s1 * s2 * s3;

				break;
			}
			case "YXZ":
			case "yxz": {
				// this.e00 = c1 * c3 - s1 * s2 * s3;
				// this.e10 = c3 * s1 + c1 * s2 * s3;
				// this.e20 = 0.0 - c2 * s3;
				// this.e01 = 0.0 - c2 * s1;
				// this.e11 = c1 * c2;
				// this.e21 = s2;
				// this.e02 = c1 * s3 + c3 * s1 * s2;
				// this.e12 = s1 * s3 - c1 * c3 * s2;
				// this.e22 = c2 * c3;

				break;
			}
			case "ZXY":
			case "zxy": {
				// this.e00 = c1 * c3 + s1 * s2 * s3;
				// this.e10 = c2 * s3;
				// this.e20 = c1 * s2 * s3 - c3 * s1;
				// this.e01 = c3 * s1 * s2 - c1 * s3;
				// this.e11 = c2 * c3;
				// this.e21 = s1 * s3 + c1 * c3 * s2;
				// this.e02 = c2 * s1;
				// this.e12 = 0.0 - s2;
				// this.e22 = c1 * c2;

				break;
			}
			case "ZYX":
			case "zyx": {
				// this.e00 = c2 * c3;
				// this.e10 = c1 * s3 + c3 * s1 * s2;
				// this.e20 = s1 * s3 - c1 * c3 * s2;
				// this.e01 = 0.0 - c2 * s3;
				// this.e11 = c1 * c3 - s1 * s2 * s3;
				// this.e21 = c3 * s1 + c1 * s2 * s3;
				// this.e02 = s2;
				// this.e12 = 0.0 - c2 * s1;
				// this.e22 = c1 * c2;

				break;
			}
		}

		return this;
	};

	Vector3.prototype.cross = function(rhs) {
		var newX = this.y * rhs.z - this.z * rhs.y;
		var newY = this.z * rhs.x - this.x * rhs.z;
		var newZ = this.x * rhs.y - this.y * rhs.x;
		this.set(newX, newY, newZ);

		return this;
	};

	Vector3.prototype.equals = function(rhs) {
		return Math.abs(this.x - rhs.x) < 0.000001 && Math.abs(this.y - rhs.y) < 0.000001 && Math.abs(this.z - rhs.z) < 0.000001;
	};

	return Vector3;
});

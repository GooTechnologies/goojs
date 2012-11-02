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

		target.data[0] = lhs.data[0] + rhs.data[0];
		target.data[1] = lhs.data[1] + rhs.data[1];
		target.data[2] = lhs.data[2] + rhs.data[2];

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

	return Vector3;
});

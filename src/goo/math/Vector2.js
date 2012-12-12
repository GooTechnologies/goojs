define(["goo/math/Vector"], function(Vector) {
	"use strict";

	Vector2.prototype = Object.create(Vector.prototype);
	Vector2.prototype.setupAliases([['x', 'u', 's'], ['y', 'v', 't']]);

	/**
	 * @name Vector2
	 * @class Vector with 2 components.
	 * @extends Vector
	 * @constructor
	 * @description Creates a new vector.
	 * @param {Float...} arguments Initial values for the components.
	 */

	function Vector2() {
		Vector.call(this, 2);
		this.set(arguments);
	}

	/**
	 * @static
	 * @description Performs a component-wise addition between two vectors and stores the result in a separate vector.
	 * @param {Vector2} lhs Vector on the left-hand side.
	 * @param {Vector2} rhs Vector on the right-hand side.
	 * @param {Vector2} target Target vector for storage. (optional)
	 * @returns {Vector2} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector2.add = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector2();
		}

		target.data[0] = lhs.data[0] + rhs.data[0];
		target.data[1] = lhs.data[1] + rhs.data[1];

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise subtraction between two vectors and stores the result in a separate vector.
	 * @param {Vector2} lhs Vector on the left-hand side.
	 * @param {Vector2} rhs Vector on the right-hand side.
	 * @param {Vector2} target Target vector for storage. (optional)
	 * @returns {Vector2} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector2.sub = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector2();
		}

		target.data[0] = lhs.data[0] - rhs.data[0];
		target.data[1] = lhs.data[1] - rhs.data[1];

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise multiplication between two vectors and stores the result in a separate vector.
	 * @param {Vector2} lhs Vector on the left-hand side.
	 * @param {Vector2} rhs Vector on the right-hand side.
	 * @param {Vector2} target Target vector for storage. (optional)
	 * @returns {Vector2} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector2.mul = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector2();
		}

		target.data[0] = lhs.data[0] * rhs.data[0];
		target.data[1] = lhs.data[1] * rhs.data[1];

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise division between two vectors and stores the result in a separate vector.
	 * @param {Vector2} lhs Vector on the left-hand side.
	 * @param {Vector2} rhs Vector on the right-hand side.
	 * @param {Vector2} target Target vector for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Vector2} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector2.div = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector2();
		}

		var clean = true;

		target.data[0] = (clean &= (rhs.data[0] < 0.0 || rhs.data[0] > 0.0)) ? lhs.data[0] / rhs.data[0] : 0.0;
		target.data[1] = (clean &= (rhs.data[1] < 0.0 || rhs.data[1] > 0.0)) ? lhs.data[1] / rhs.data[1] : 0.0;

		if (clean === false) {
			console.warn("[Vector2.div] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise addition between a vector and a scalar and stores the result in a separate vector.
	 * @param {Vector2} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector2} target Target vector for storage. (optional)
	 * @returns {Vector2} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector2.scalarAdd = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector2();
		}

		target.data[0] = lhs.data[0] + rhs;
		target.data[1] = lhs.data[1] + rhs;

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise subtraction between a vector and a scalar and stores the result in a separate vector.
	 * @param {Vector2} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector2} target Target vector for storage. (optional)
	 * @returns {Vector2} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector2.scalarSub = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector2();
		}

		target.data[0] = lhs.data[0] - rhs;
		target.data[1] = lhs.data[1] - rhs;

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise multiplication between a vector and a scalar and stores the result in a separate vector.
	 * @param {Vector2} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector2} target Target vector for storage. (optional)
	 * @returns {Vector2} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector2.scalarMul = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector2();
		}

		target.data[0] = lhs.data[0] * rhs;
		target.data[1] = lhs.data[1] * rhs;

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise division between a vector and a scalar and stores the result in a separate vector.
	 * @param {Vector2} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector2} target Target vector for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Vector2} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector2.scalarDiv = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector2();
		}

		// REVIEW: Cleaner alternative:
		//   var clean = (rhs < 0.0 || rhs > 0.0);
		//   rhs = clean ? 1.0 / rhs : 0.0;
		var clean = true;

		// REVIEW: Why multiply with 0 in case of rhs=0?
		// Isn't an assertion failure and result of +/-Infinity better?
		//
		// REVIEW: Create a new variable instead of reusing rhs like this.
		rhs = (clean &= (rhs < 0.0 || rhs > 0.0)) ? 1.0 / rhs : 0.0;

		target.data[0] = lhs.data[0] * rhs;
		target.data[1] = lhs.data[1] * rhs;

		// REVIEW: Use if (!clean) instead.
		if (clean === false) {
			// REVIEW: Throw an exception instead. Or assertion?
			console.warn("[Vector2.scalarDiv] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @description Performs a component-wise addition between two vectors and stores the result locally.
	 * @param {Vector2} rhs Vector on the right-hand side.
	 * @returns {Vector2} Self for chaining.
	 */

	Vector2.prototype.add = function(rhs) {
		return Vector2.add(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between two vectors and stores the result locally.
	 * @param {Vector2} rhs Vector on the right-hand side.
	 * @returns {Vector2} Self for chaining.
	 */

	Vector2.prototype.sub = function(rhs) {
		return Vector2.sub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between two vectors and stores the result locally.
	 * @param {Vector2} rhs Vector on the right-hand side.
	 * @returns {Vector2} Self for chaining.
	 */

	Vector2.prototype.mul = function(rhs) {
		return Vector2.mul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between two vectors and stores the result locally.
	 * @param {Vector2} rhs Vector on the right-hand side.
	 * @returns {Vector2} Self for chaining.
	 */

	Vector2.prototype.div = function(rhs) {
		return Vector2.div(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise addition between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector2} Self for chaining.
	 */

	Vector2.prototype.scalarAdd = function(rhs) {
		return Vector2.scalarAdd(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector2} Self for chaining.
	 */

	Vector2.prototype.scalarSub = function(rhs) {
		return Vector2.scalarSub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector2} Self for chaining.
	 */

	Vector2.prototype.scalarMul = function(rhs) {
		return Vector2.scalarMul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector2} Self for chaining.
	 */

	Vector2.prototype.scalarDiv = function(rhs) {
		return Vector2.scalarDiv(this, rhs, this);
	};

	return Vector2;
});

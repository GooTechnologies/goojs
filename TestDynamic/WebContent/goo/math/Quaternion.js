define(["goo/math/Vector"], function(Vector) {
	"use strict";

	Quaternion.prototype = Object.create(Vector.prototype);
	Quaternion.prototype.setupAliases([['x'], ['y'], ['z'], ['w']]);

	/**
	 * @name Quaternion
	 * @class Quaternion represents a 4 value math object used in Ardor3D to describe rotations. It has the advantage of being able to avoid lock by
	 *        adding a 4th dimension to rotation.
	 * @extends Vector
	 * @constructor
	 * @description Creates a new quaternion.
	 * @param {Float...} arguments Initial values for the components.
	 */

	function Quaternion() {
		Vector.call(this, 4);
		this.set(arguments);
	}

	Quaternion.IDENTITY = new Quaternion(0, 0, 0, 1);

	/**
	 * @static
	 * @description Performs a component-wise addition between two vectors and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.add = function(lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.data[0] = lhs.data[0] + rhs.data[0];
		target.data[1] = lhs.data[1] + rhs.data[1];
		target.data[2] = lhs.data[2] + rhs.data[2];
		target.data[3] = lhs.data[3] + rhs.data[3];

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise subtraction between two vectors and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.sub = function(lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.data[0] = lhs.data[0] - rhs.data[0];
		target.data[1] = lhs.data[1] - rhs.data[1];
		target.data[2] = lhs.data[2] - rhs.data[2];
		target.data[3] = lhs.data[3] - rhs.data[3];

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise multiplication between two vectors and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.mul = function(lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.data[0] = lhs.data[0] * rhs.data[0];
		target.data[1] = lhs.data[1] * rhs.data[1];
		target.data[2] = lhs.data[2] * rhs.data[2];
		target.data[3] = lhs.data[3] * rhs.data[3];

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise division between two vectors and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.div = function(lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		var clean = true;

		target.data[0] = (clean &= (rhs.data[0] < 0.0 || rhs.data[0] > 0.0)) ? lhs.data[0] / rhs.data[0] : 0.0;
		target.data[1] = (clean &= (rhs.data[1] < 0.0 || rhs.data[1] > 0.0)) ? lhs.data[1] / rhs.data[1] : 0.0;
		target.data[2] = (clean &= (rhs.data[2] < 0.0 || rhs.data[2] > 0.0)) ? lhs.data[2] / rhs.data[2] : 0.0;
		target.data[3] = (clean &= (rhs.data[3] < 0.0 || rhs.data[3] > 0.0)) ? lhs.data[3] / rhs.data[3] : 0.0;

		if (clean == false) {
			console.warn("[Quaternion.div] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise addition between a vector and a scalar and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.scalarAdd = function(lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.data[0] = lhs.data[0] + rhs;
		target.data[1] = lhs.data[1] + rhs;
		target.data[2] = lhs.data[2] + rhs;
		target.data[3] = lhs.data[3] + rhs;

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise subtraction between a vector and a scalar and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.scalarSub = function(lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.data[0] = lhs.data[0] - rhs;
		target.data[1] = lhs.data[1] - rhs;
		target.data[2] = lhs.data[2] - rhs;
		target.data[3] = lhs.data[3] - rhs;

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise multiplication between a vector and a scalar and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.scalarMul = function(lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		target.data[0] = lhs.data[0] * rhs;
		target.data[1] = lhs.data[1] * rhs;
		target.data[2] = lhs.data[2] * rhs;
		target.data[3] = lhs.data[3] * rhs;

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise division between a vector and a scalar and stores the result in a separate vector.
	 * @param {Quaternion} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Quaternion} target Target vector for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Quaternion} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Quaternion.scalarDiv = function(lhs, rhs, target) {
		if (!target) {
			target = new Quaternion();
		}

		var clean = true;

		rhs = (clean &= (rhs < 0.0 || rhs > 0.0)) ? 1.0 / rhs : 0.0;

		target.data[0] = lhs.data[0] * rhs;
		target.data[1] = lhs.data[1] * rhs;
		target.data[2] = lhs.data[2] * rhs;
		target.data[3] = lhs.data[3] * rhs;

		if (clean == false) {
			console.warn("[Quaternion.scalarDiv] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @description Performs a component-wise addition between two vectors and stores the result locally.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.add = function(rhs) {
		return Quaternion.add(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between two vectors and stores the result locally.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.sub = function(rhs) {
		return Quaternion.sub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between two vectors and stores the result locally.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.mul = function(rhs) {
		return Quaternion.mul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between two vectors and stores the result locally.
	 * @param {Quaternion} rhs Vector on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.div = function(rhs) {
		return Quaternion.div(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise addition between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.scalarAdd = function(rhs) {
		return Quaternion.scalarAdd(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.scalarSub = function(rhs) {
		return Quaternion.scalarSub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.scalarMul = function(rhs) {
		return Quaternion.scalarMul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Quaternion} Self for chaining.
	 */

	Quaternion.prototype.scalarDiv = function(rhs) {
		return Quaternion.scalarDiv(this, rhs, this);
	};

	return Quaternion;
});

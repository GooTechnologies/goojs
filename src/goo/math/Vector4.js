define(["goo/math/Vector"], function(Vector) {
	"use strict";

	Vector4.prototype = Object.create(Vector.prototype);
	Vector4.prototype.setupAliases([['x', 'r'], ['y', 'g'], ['z', 'b'], ['w', 'a']]);

	/**
	 * @name Vector4
	 * @class Vector with 4 components.
	 * @extends Vector
	 * @constructor
	 * @description Creates a new vector.
	 * @param {Float...} arguments Initial values for the components.
	 */

	function Vector4() {
		Vector.call(this, 4);
		this.set(arguments);
	}

	/**
	 * @static
	 * @description Performs a component-wise addition between two vectors and stores the result in a separate vector.
	 * @param {Vector4} lhs Vector on the left-hand side.
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @param {Vector4} target Target vector for storage. (optional)
	 * @returns {Vector4} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector4.add = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector4();
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
	 * @param {Vector4} lhs Vector on the left-hand side.
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @param {Vector4} target Target vector for storage. (optional)
	 * @returns {Vector4} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector4.sub = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector4();
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
	 * @param {Vector4} lhs Vector on the left-hand side.
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @param {Vector4} target Target vector for storage. (optional)
	 * @returns {Vector4} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector4.mul = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector4();
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
	 * @param {Vector4} lhs Vector on the left-hand side.
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @param {Vector4} target Target vector for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Vector4} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector4.div = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector4();
		}

		var clean = true;

		target.data[0] = (clean &= (rhs.data[0] < 0.0 || rhs.data[0] > 0.0)) ? lhs.data[0] / rhs.data[0] : 0.0;
		target.data[1] = (clean &= (rhs.data[1] < 0.0 || rhs.data[1] > 0.0)) ? lhs.data[1] / rhs.data[1] : 0.0;
		target.data[2] = (clean &= (rhs.data[2] < 0.0 || rhs.data[2] > 0.0)) ? lhs.data[2] / rhs.data[2] : 0.0;
		target.data[3] = (clean &= (rhs.data[3] < 0.0 || rhs.data[3] > 0.0)) ? lhs.data[3] / rhs.data[3] : 0.0;

		if (clean === false) {
			console.warn("[Vector4.div] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise addition between a vector and a scalar and stores the result in a separate vector.
	 * @param {Vector4} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector4} target Target vector for storage. (optional)
	 * @returns {Vector4} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector4.scalarAdd = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector4();
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
	 * @param {Vector4} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector4} target Target vector for storage. (optional)
	 * @returns {Vector4} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector4.scalarSub = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector4();
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
	 * @param {Vector4} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector4} target Target vector for storage. (optional)
	 * @returns {Vector4} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector4.scalarMul = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector4();
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
	 * @param {Vector4} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector4} target Target vector for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Vector4} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector4.scalarDiv = function(lhs, rhs, target) {
		if (!target) {
			target = new Vector4();
		}

		var clean = true;

		rhs = (clean &= (rhs < 0.0 || rhs > 0.0)) ? 1.0 / rhs : 0.0;

		target.data[0] = lhs.data[0] * rhs;
		target.data[1] = lhs.data[1] * rhs;
		target.data[2] = lhs.data[2] * rhs;
		target.data[3] = lhs.data[3] * rhs;

		if (clean === false) {
			console.warn("[Vector4.scalarDiv] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @description Performs a component-wise addition between two vectors and stores the result locally.
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @returns {Vector4} Self for chaining.
	 */

	Vector4.prototype.add = function(rhs) {
		return Vector4.add(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between two vectors and stores the result locally.
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @returns {Vector4} Self for chaining.
	 */

	Vector4.prototype.sub = function(rhs) {
		return Vector4.sub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between two vectors and stores the result locally.
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @returns {Vector4} Self for chaining.
	 */

	Vector4.prototype.mul = function(rhs) {
		return Vector4.mul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between two vectors and stores the result locally.
	 * @param {Vector4} rhs Vector on the right-hand side.
	 * @returns {Vector4} Self for chaining.
	 */

	Vector4.prototype.div = function(rhs) {
		return Vector4.div(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise addition between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector4} Self for chaining.
	 */

	Vector4.prototype.scalarAdd = function(rhs) {
		return Vector4.scalarAdd(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector4} Self for chaining.
	 */

	Vector4.prototype.scalarSub = function(rhs) {
		return Vector4.scalarSub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector4} Self for chaining.
	 */

	Vector4.prototype.scalarMul = function(rhs) {
		return Vector4.scalarMul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector4} Self for chaining.
	 */

	Vector4.prototype.scalarDiv = function(rhs) {
		return Vector4.scalarDiv(this, rhs, this);
	};

	/**
	 * @description Extracts the rotation from a matrix. Order convention is x followed by y followed by z.
	 * @param {Matrix4x4} matrix Rotational matrix.
	 * @returns {Vector4} Self for chaining.
	 */

	Vector4.prototype.extractRotationFromMatrix = function(matrix) {
		/*
		var l = quaternion.lengthSquared();

		l = (l > 0.0) ? 2.0 / l : 0.0;

		var a = quaternion.x * l;
		var b = quaternion.y * l;
		var c = quaternion.z * l;

		var wa = quaternion.w * a;
		var wb = quaternion.w * b;
		var wc = quaternion.w * c;
		var xa = quaternion.x * a;
		var xb = quaternion.x * b;
		var xc = quaternion.x * c;
		var yb = quaternion.y * b;
		var yc = quaternion.y * c;
		var zc = quaternion.z * c;

		this.e00 = 1.0 - yb - zc;
		this.e10 = xb + wc;
		this.e20 = xc - wb;
		this.e01 = xb - wc;
		this.e11 = 1.0 - xa - zc;
		this.e21 = yc + wa;
		this.e02 = xc + wb;
		this.e12 = yc - wa;
		this.e22 = 1.0 - xa - yb;
		*/

		return this;
	};

	return Vector4;
});

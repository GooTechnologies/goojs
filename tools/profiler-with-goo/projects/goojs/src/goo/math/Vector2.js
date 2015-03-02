define([
	'goo/math/Vector'
],
/** @lends */
function (
	Vector
) {
	'use strict';

	/* ====================================================================== */

	/**
	 * @class Vector with 2 components.
	 * @extends Vector
	 * @constructor
	 * @description Creates a new vector.
	 * @param {Vector2|number[]|...number} arguments Initial values for the components.
	 */

	function Vector2() {
		Vector.call(this, 2);

		if (arguments.length !== 0) {
			this.set(arguments);
		} else {
			this.setd(0,0);
		}
	}

	Vector2.prototype = Object.create(Vector.prototype);
	Vector.setupAliases(Vector2.prototype, [['x', 'u', 's'], ['y', 'v', 't']]);

	/* ====================================================================== */

	Vector2.ZERO = new Vector2(0, 0);
	Vector2.ONE = new Vector2(1, 1);
	Vector2.UNIT_X = new Vector2(1, 0);
	Vector2.UNIT_Y = new Vector2(0, 1);

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise addition and stores the result in a separate vector. Equivalent of 'return (target = lhs + rhs);'.
	 * @param {Vector2|number[]|number} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2} [target] Target vector for storage.
	 * @return {Vector2} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector2.add = function (lhs, rhs, target) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs];
		}

		if (!target) {
			target = new Vector2();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		target.data[0] = ldata[0] + rdata[0];
		target.data[1] = ldata[1] + rdata[1];

		return target;
	};

	/**
	 * @description Performs a component-wise addition and stores the result locally. Equivalent of 'return (this = this + rhs);'.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector2} Self for chaining.
	 */

	Vector2.prototype.add = function (rhs) {
		return Vector2.add(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise subtraction and stores the result in a separate vector. Equivalent of 'return (target = lhs - rhs);'.
	 * @param {Vector2|number[]|number} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2} [target] Target vector for storage.
	 * @return {Vector2} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector2.sub = function (lhs, rhs, target) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs];
		}

		if (!target) {
			target = new Vector2();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;


		target.data[0] = ldata[0] - rdata[0];
		target.data[1] = ldata[1] - rdata[1];

		return target;
	};

	/**
	 * @description Performs a component-wise subtraction and stores the result locally. Equivalent of 'return (this = this - rhs);'.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector2} Self for chaining.
	 */

	Vector2.prototype.sub = function (rhs) {
		return Vector2.sub(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise multiplication and stores the result in a separate vector. Equivalent of 'return (target = lhs * rhs);'.
	 * @param {Vector2|number[]|number} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2} [target] Target vector for storage.
	 * @return {Vector2} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector2.mul = function (lhs, rhs, target) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs];
		}

		if (!target) {
			target = new Vector2();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		target.data[0] = ldata[0] * rdata[0];
		target.data[1] = ldata[1] * rdata[1];

		return target;
	};

	/**
	 * @description Performs a component-wise multiplication and stores the result locally. Equivalent of 'return (this = this * rhs);'.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector2} Self for chaining.
	 */

	Vector2.prototype.mul = function (rhs) {
		return Vector2.mul(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise division and stores the result in a separate vector. Equivalent of 'return (target = lhs / rhs);'.
	 * @param {Vector2|number[]|number} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2} [target] Target vector for storage.
	 * @return {Vector2} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector2.div = function (lhs, rhs, target) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs];
		}

		if (!target) {
			target = new Vector2();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		target.data[0] = ldata[0] / rdata[0];
		target.data[1] = ldata[1] / rdata[1];

		return target;
	};

	/**
	 * @description Performs a component-wise division and stores the result locally. Equivalent of 'return (this = this / rhs);'.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector2} Self for chaining.
	 */

	Vector2.prototype.div = function (rhs) {
		return Vector2.div(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @description Computes the dot product between two vectors. Equivalent of 'return lhs•rhs;'.
	 * @param {Vector2|number[]|number} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {number} Dot product.
	 */

	Vector2.dot = function (lhs, rhs) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs];
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		return ldata[0] * rdata[0] +
			ldata[1] * rdata[1];
	};

	/**
	 * @description Computes the dot product between two vectors. Equivalent of 'return this•rhs;'.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {number} Dot product.
	 */

	Vector2.prototype.dot = function (rhs) {
		return Vector2.dot(this, rhs);
	};

	/* ====================================================================== */

	// Performance methods
	Vector2.prototype.setd = function (x, y) {
		this.data[0] = x;
		this.data[1] = y;

		return this;
	};

	Vector2.prototype.seta = function (array) {
		this.data[0] = array[0];
		this.data[1] = array[1];

		return this;
	};

	Vector2.prototype.setv = function (vec2) {
		this.data[0] = vec2.data[0];
		this.data[1] = vec2.data[1];

		return this;
	};

	/**
	 * Scales the vector by a factor
	 * @param {number} factor
	 * @returns {Vector2} Self for chaining
	 */
	Vector2.prototype.scale = function (factor) {
		this.data[0] *= factor;
		this.data[1] *= factor;
		return this;
	};

	/**
	 * @description Clones the vector.
	 * @return {Vector2} Clone of self.
	 */
	Vector2.prototype.clone = function () {
		return new Vector2(this);
	};

	return Vector2;
});

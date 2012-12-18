define(["goo/math/Vector"], function (Vector) {
	"use strict";

	Vector2.prototype = Object.create(Vector.prototype);
	Vector2.prototype.setupAliases([['x', 'u', 's'], ['y', 'v', 't']]);

	/* ====================================================================== */

	/**
	 * @name Vector2
	 * @class Vector with 2 components.
	 * @extends Vector
	 * @constructor
	 * @description Creates a new vector.
	 * @param {Vector2|Float[]|Float...} arguments Initial values for the components.
	 */

	function Vector2() {
		Vector.call(this, 2);
		var init = arguments.length !== 0 ? arguments : [0, 0];
		this.set(init);
	}

	/* ====================================================================== */

	Vector2.ZERO = new Vector2(0, 0);
	Vector2.ONE = new Vector2(1, 1);
	Vector2.UNIT_X = new Vector2(1, 0);
	Vector2.UNIT_Y = new Vector2(0, 1);

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise addition and stores the result in a separate vector. Equivalent of "return (target = lhs + rhs);".
	 * @param {Vector2|Float[]|Float} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2} [target] Target vector for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Vector2} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector2.add = function (lhs, rhs, target) {
		if (typeof (lhs) === "number") {
			lhs = [lhs, lhs];
		}

		if (typeof (rhs) === "number") {
			rhs = [rhs, rhs];
		}

		if (!target) {
			target = new Vector2();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 2 || rdata.length !== 2) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		target.data[0] = ldata[0] + rdata[0];
		target.data[1] = ldata[1] + rdata[1];

		return target;
	};

	/**
	 * @description Performs a component-wise addition and stores the result locally. Equivalent of "return (this = this + rhs);".
	 * @param {Vector2|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector2} Self for chaining.
	 */

	Vector2.prototype.add = function (rhs) {
		return Vector2.add(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise subtraction and stores the result in a separate vector. Equivalent of "return (target = lhs - rhs);".
	 * @param {Vector2|Float[]|Float} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2} [target] Target vector for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Vector2} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector2.sub = function (lhs, rhs, target) {
		if (typeof (lhs) === "number") {
			lhs = [lhs, lhs];
		}

		if (typeof (rhs) === "number") {
			rhs = [rhs, rhs];
		}

		if (!target) {
			target = new Vector2();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 2 || rdata.length !== 2) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		target.data[0] = ldata[0] - rdata[0];
		target.data[1] = ldata[1] - rdata[1];

		return target;
	};

	/**
	 * @description Performs a component-wise subtraction and stores the result locally. Equivalent of "return (this = this - rhs);".
	 * @param {Vector2|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector2} Self for chaining.
	 */

	Vector2.prototype.sub = function (rhs) {
		return Vector2.sub(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise multiplication and stores the result in a separate vector. Equivalent of "return (target = lhs * rhs);".
	 * @param {Vector2|Float[]|Float} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2} [target] Target vector for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Vector2} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector2.mul = function (lhs, rhs, target) {
		if (typeof (lhs) === "number") {
			lhs = [lhs, lhs];
		}

		if (typeof (rhs) === "number") {
			rhs = [rhs, rhs];
		}

		if (!target) {
			target = new Vector2();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 2 || rdata.length !== 2) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		target.data[0] = ldata[0] * rdata[0];
		target.data[1] = ldata[1] * rdata[1];

		return target;
	};

	/**
	 * @description Performs a component-wise multiplication and stores the result locally. Equivalent of "return (this = this * rhs);".
	 * @param {Vector2|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector2} Self for chaining.
	 */

	Vector2.prototype.mul = function (rhs) {
		return Vector2.mul(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise division and stores the result in a separate vector. Equivalent of "return (target = lhs / rhs);".
	 * @param {Vector2|Float[]|Float} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2} [target] Target vector for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Vector2} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector2.div = function (lhs, rhs, target) {
		if (typeof (lhs) === "number") {
			lhs = [lhs, lhs];
		}

		if (typeof (rhs) === "number") {
			rhs = [rhs, rhs];
		}

		if (!target) {
			target = new Vector2();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 2 || rdata.length !== 2) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		target.data[0] = ldata[0] / rdata[0];
		target.data[1] = ldata[1] / rdata[1];

		return target;
	};

	/**
	 * @description Performs a component-wise division and stores the result locally. Equivalent of "return (this = this / rhs);".
	 * @param {Vector2|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector2} Self for chaining.
	 */

	Vector2.prototype.div = function (rhs) {
		return Vector2.div(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @description Computes the dot product between two vectors. Equivalent of "return lhs•rhs;".
	 * @param {Vector2|Float[]|Float} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2|Float[]|Float} rhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Float} Dot product.
	 */

	Vector2.dot = function (lhs, rhs) {
		if (typeof (lhs) === "number") {
			lhs = [lhs, lhs];
		}

		if (typeof (rhs) === "number") {
			rhs = [rhs, rhs];
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 2 || rdata.length !== 2) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		var sum = 0.0;

		sum += ldata[0] * rdata[0];
		sum += ldata[1] * rdata[1];

		return sum;
	};

	/**
	 * @description Computes the dot product between two vectors. Equivalent of "return this•rhs;".
	 * @param {Vector2|Float[]|Float} rhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Float} Dot product.
	 */

	Vector2.prototype.dot = function (rhs) {
		return Vector2.dot(this, rhs);
	};

	/* ====================================================================== */

	return Vector2;
});

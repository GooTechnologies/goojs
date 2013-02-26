define(["goo/math/Vector"],
	/** @lends Vector3 */
	function (Vector) {
	"use strict";

	/* ====================================================================== */

	/**
	 * @class Vector with 3 components.
	 * @extends Vector
	 * @constructor
	 * @description Creates a new vector.
	 * @param {Vector3|Float[]|Float...} arguments Initial values for the components.
	 */

	function Vector3() {
		Vector.call(this, 3);
		var init = arguments.length !== 0 ? arguments : [0, 0, 0];
		this.set(init);
	}

	Vector3.prototype = Object.create(Vector.prototype);
	Vector3.prototype.setupAliases([['x', 'u', 'r'], ['y', 'v', 'g'], ['z', 'w', 'b']]);

	/* ====================================================================== */

	Vector3.ZERO = new Vector3(0, 0, 0);
	Vector3.ONE = new Vector3(1, 1, 1);
	Vector3.UNIT_X = new Vector3(1, 0, 0);
	Vector3.UNIT_Y = new Vector3(0, 1, 0);
	Vector3.UNIT_Z = new Vector3(0, 0, 1);

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise addition and stores the result in a separate vector. Equivalent of "return (target = lhs + rhs);".
	 * @param {Vector3|Float[]|Float} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector3|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector3} [target] Target vector for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector3.add = function (lhs, rhs, target) {
		if (typeof (lhs) === "number") {
			lhs = [lhs, lhs, lhs];
		}

		if (typeof (rhs) === "number") {
			rhs = [rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector3();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 3 || rdata.length !== 3) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		target.data[0] = ldata[0] + rdata[0];
		target.data[1] = ldata[1] + rdata[1];
		target.data[2] = ldata[2] + rdata[2];

		return target;
	};

	/**
	 * @description Performs a component-wise addition and stores the result locally. Equivalent of "return (this = this + rhs);".
	 * @param {Vector3|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector3} Self for chaining.
	 */

	Vector3.prototype.add = function (rhs) {
		return Vector3.add(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise subtraction and stores the result in a separate vector. Equivalent of "return (target = lhs - rhs);".
	 * @param {Vector3|Float[]|Float} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector3|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector3} [target] Target vector for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector3.sub = function (lhs, rhs, target) {
		if (typeof (lhs) === "number") {
			lhs = [lhs, lhs, lhs];
		}

		if (typeof (rhs) === "number") {
			rhs = [rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector3();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 3 || rdata.length !== 3) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		target.data[0] = ldata[0] - rdata[0];
		target.data[1] = ldata[1] - rdata[1];
		target.data[2] = ldata[2] - rdata[2];

		return target;
	};

	/**
	 * @description Performs a component-wise subtraction and stores the result locally. Equivalent of "return (this = this - rhs);".
	 * @param {Vector3|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector3} Self for chaining.
	 */

	Vector3.prototype.sub = function (rhs) {
		return Vector3.sub(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise multiplication and stores the result in a separate vector. Equivalent of "return (target = lhs * rhs);".
	 * @param {Vector3|Float[]|Float} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector3|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector3} [target] Target vector for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector3.mul = function (lhs, rhs, target) {
		if (typeof (lhs) === "number") {
			lhs = [lhs, lhs, lhs];
		}

		if (typeof (rhs) === "number") {
			rhs = [rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector3();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 3 || rdata.length !== 3) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		target.data[0] = ldata[0] * rdata[0];
		target.data[1] = ldata[1] * rdata[1];
		target.data[2] = ldata[2] * rdata[2];

		return target;
	};

	/**
	 * @description Performs a component-wise multiplication and stores the result locally. Equivalent of "return (this = this * rhs);".
	 * @param {Vector3|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector3} Self for chaining.
	 */

	Vector3.prototype.mul = function (rhs) {
		return Vector3.mul(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise division and stores the result in a separate vector. Equivalent of "return (target = lhs / rhs);".
	 * @param {Vector3|Float[]|Float} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector3|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector3} [target] Target vector for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector3.div = function (lhs, rhs, target) {
		if (typeof (lhs) === "number") {
			lhs = [lhs, lhs, lhs];
		}

		if (typeof (rhs) === "number") {
			rhs = [rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector3();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 3 || rdata.length !== 3) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		target.data[0] = ldata[0] / rdata[0];
		target.data[1] = ldata[1] / rdata[1];
		target.data[2] = ldata[2] / rdata[2];

		return target;
	};

	/**
	 * @description Performs a component-wise division and stores the result locally. Equivalent of "return (this = this / rhs);".
	 * @param {Vector3|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector3} Self for chaining.
	 */

	Vector3.prototype.div = function (rhs) {
		return Vector3.div(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @description Computes the dot product between two vectors. Equivalent of "return lhs•rhs;".
	 * @param {Vector3|Float[]|Float} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector3|Float[]|Float} rhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Float} Dot product.
	 */

	Vector3.dot = function (lhs, rhs) {
		if (typeof (lhs) === "number") {
			lhs = [lhs, lhs, lhs];
		}

		if (typeof (rhs) === "number") {
			rhs = [rhs, rhs, rhs];
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 3 || rdata.length !== 3) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		var sum = 0.0;

		sum += ldata[0] * rdata[0];
		sum += ldata[1] * rdata[1];
		sum += ldata[2] * rdata[2];

		return sum;
	};

	/**
	 * @description Computes the dot product between two vectors. Equivalent of "return this•rhs;".
	 * @param {Vector3|Float[]|Float} rhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Float} Dot product.
	 */

	Vector3.prototype.dot = function (rhs) {
		return Vector3.dot(this, rhs);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Computes the cross product and stores the result in a separate vector. Equivalent of "return (target = lhs x rhs);".
	 * @param {Vector3|Float[]} lhs Vector or array of scalars on the left-hand side.
	 * @param {Vector3|Float[]} rhs Vector or array of scalars on the right-hand side.
	 * @param {Vector3} [target] Target vector for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector3.cross = function (lhs, rhs, target) {
		if (!target) {
			target = new Vector3();
		}

		if (target === lhs || target === rhs) {
			return Vector.copy(Vector3.cross(lhs, rhs), target);
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 3 || rdata.length !== 3) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		target.data[0] = rhs.data[2] * lhs.data[1] - rhs.data[1] * lhs.data[2];
		target.data[1] = rhs.data[0] * lhs.data[2] - rhs.data[2] * lhs.data[0];
		target.data[2] = rhs.data[1] * lhs.data[0] - rhs.data[0] * lhs.data[1];

		return target;
	};

	/**
	 * @static
	 * @description Computes the cross product and stores the result in a separate vector. Equivalent of "return (this = this x rhs);".
	 * @param {Vector3|Float[]} rhs Vector or array of scalars on the right-hand side.
	 * @return {Vector3} Self for chaining.
	 */

	Vector3.prototype.cross = function (rhs) {
		return Vector3.cross(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @description Linearly interpolates between two vectors and stores the result locally.
	 * @param {Vector3} end End vector.
	 * @param {Float} factor Interpolation factor between zero and one.
	 * @return {Vector3} Self for chaining.
	 */
	Vector3.prototype.lerp = function (end, factor) {
		this.x = (1.0 - factor) * this.x + factor * end.x;
		this.y = (1.0 - factor) * this.y + factor * end.y;
		this.z = (1.0 - factor) * this.z + factor * end.z;

		return this;
	};

	// TODO: Testing speed diffs
	Vector3.prototype.setd = function (x, y, z) {
		this.data[0] = x;
		this.data[1] = y;
		this.data[2] = z;

		return this;
	};
	Vector3.prototype.seta = function (array) {
		this.data[0] = array[0];
		this.data[1] = array[1];
		this.data[2] = array[2];

		return this;
	};
	Vector3.prototype.setv = function (vec3) {
		this.data[0] = vec3.data[0];
		this.data[1] = vec3.data[1];
		this.data[2] = vec3.data[2];

		return this;
	};
	Vector3.prototype.addv = function (vec3) {
		this.data[0] += vec3.data[0];
		this.data[1] += vec3.data[1];
		this.data[2] += vec3.data[2];

		return this;
	};
	Vector3.prototype.mulv = function (vec3) {
		this.data[0] *= vec3.data[0];
		this.data[1] *= vec3.data[1];
		this.data[2] *= vec3.data[2];

		return this;
	};
	Vector3.prototype.subv = function (vec3) {
		this.data[0] -= vec3.data[0];
		this.data[1] -= vec3.data[1];
		this.data[2] -= vec3.data[2];

		return this;
	};
	Vector3.prototype.lengthSquaredF = function () {
		return this.data[0] * this.data[0] + this.data[1] * this.data[1] + this.data[2] * this.data[2];
	};

	/* ====================================================================== */

	return Vector3;
});

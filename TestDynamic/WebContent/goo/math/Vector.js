define([], function() {
	"use strict";

	/**
	 * @class N-dimensional vector.
	 * @name Vector
	 * @property {Float32Array} data Storage for the vector components.
	 * @property {Integer} tos Top of stack for putting components.
	 * @constructor
	 * @description Creates a new N-dimensional vector.
	 * @param {Integer} size Number of vector components.
	 */

	function Vector(size) {
		this.data = new Float32Array(size || 0);
		this.tos = 0;
	}

	/**
	 * @static
	 * @description Adds two N-dimensional vectors and stores the result in a separate vector. The resulting vector will
	 *              have a size equal to that of the left-hand vector.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @param {Vector} target Target vector for storage. (optional)
	 * @returns {Vector} Resulting vector.
	 */

	Vector.add = function(lhs, rhs, target) {
		if (!target || target.data.length != lhs.data.length) {
			target = new Vector(lhs.data.length);
		}

		var i = 0;

		for (; i < Math.min(lhs.data.length, rhs.data.length); i++) {
			target.data[i] = lhs.data[i] + rhs.data[i];
		}

		for (; i < lhs.data.length; i++) {
			target.data[i] = lhs.data[i];
		}

		return target;
	};

	/**
	 * @static
	 * @description Subtracts two N-dimensional vectors and stores the result in a separate vector. The resulting vector
	 *              will have a size equal to that of the left-hand vector.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @param {Vector} target Target vector for storage. (optional)
	 * @returns {Vector} Resulting vector.
	 */

	Vector.sub = function(lhs, rhs, target) {
		if (!target || target.data.length != lhs.data.length) {
			target = new Vector(lhs.data.length);
		}

		var i = 0;

		for (; i < Math.min(lhs.data.length, rhs.data.length); i++) {
			target.data[i] = lhs.data[i] - rhs.data[i];
		}

		for (; i < lhs.data.length; i++) {
			target.data[i] = lhs.data[i];
		}

		return target;
	};

	/**
	 * @static
	 * @description Multiplies two N-dimensional vectors and stores the result in a separate vector. The resulting
	 *              vector will have a size equal to that of the left-hand vector.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @param {Vector} target Target vector for storage. (optional)
	 * @returns {Vector} Resulting vector.
	 */

	Vector.mul = function(lhs, rhs, target) {
		if (!target || target.data.length != lhs.data.length) {
			target = new Vector(lhs.data.length);
		}

		var i = 0;

		for (; i < Math.min(lhs.data.length, rhs.data.length); i++) {
			target.data[i] = lhs.data[i] * rhs.data[i];
		}

		for (; i < lhs.data.length; i++) {
			target.data[i] = lhs.data[i];
		}

		return target;
	};

	/**
	 * @static
	 * @description Divides two N-dimensional vectors and stores the result in a separate vector. The resulting vector
	 *              will have a size equal to that of the left-hand vector. For all components in the right-hand vector
	 *              equal to zero, the corresponding component in the resulting vector will be equal to that of the
	 *              left-hand vector.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @param {Vector} target Target vector for storage. (optional)
	 * @returns {Vector} Resulting vector.
	 */

	Vector.div = function(lhs, rhs, target) {
		if (!target || target.data.length != lhs.data.length) {
			target = new Vector(lhs.data.length);
		}

		var i = 0;

		for (; i < Math.min(lhs.data.length, rhs.data.length); i++) {
			if (rhs.data[i] < 0.0 || rhs.data[i] > 0.0) {
				target.data[i] = lhs.data[i] / rhs.data[i];
			} else {
				target.data[i] = lhs.data[i];
			}
		}

		for (; i < lhs.data.length; i++) {
			target.data[i] = lhs.data[i];
		}

		return target;
	};

	/**
	 * @static
	 * @description Scales an N-dimensional vector with a scalar and stores the result in a separate vector.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector} target Target vector for storage. (optional)
	 * @returns {Vector} Resulting vector.
	 */

	Vector.scale = function(lhs, rhs, target) {
		if (!target || target.data.length != lhs.data.length) {
			target = new Vector(lhs.data.length);
		}

		for ( var i = 0; i < lhs.data.length; i++) {
			target.data[i] = lhs.data[i] * rhs;
		}

		return target;
	};

	/**
	 * @description Adds with an N-dimensional vector and stores the result locally.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.add = function(rhs) {
		return Vector.add(this, rhs, this);
	};

	/**
	 * @description Subtracts with an N-dimensional vector and stores the result locally.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.sub = function(rhs) {
		return Vector.sub(this, rhs, this);
	};

	/**
	 * @description Multiplies by an N-dimensional vector and stores the result locally.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.mul = function(rhs) {
		return Vector.mul(this, rhs, this);
	};

	/**
	 * @description Divides by an N-dimensional vector and stores the result locally.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.div = function(rhs) {
		return Vector.div(this, rhs, this);
	};

	/**
	 * @description Scales by a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.scale = function(rhs) {
		return Vector.scale(this, rhs, this);
	};

	/**
	 * @description Copies all components from another N-dimensional vector and resizes itself if the sizes do not
	 *              match.
	 * @param {Vector} source Source vector.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.copy = function(source) {
		if (this.data.length != source.data.length) {
			this.data = new Float32Array(source.data.length);
		}

		for ( var i = 0; i < this.data.length; i++) {
			this.data[i] = source.data[i];
		}

		this.tos = this.data.length;

		return this;
	};

	/**
	 * @description Inverts all components of the N-dimensional vector.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.invert = function() {
		for ( var i = 0; i < this.data.length; i++) {
			this.data[i] = 0.0 - this.data[i];
		}

		return this;
	};

	/**
	 * @description Computes the dot product of the N-dimensional vector.
	 * @returns {Float} Dot product.
	 */

	Vector.prototype.dot = function() {
		var result = 0.0;

		for ( var i = 0; i < this.data.length; i++) {
			result += this.data[i] * this.data[i];
		}

		return result;
	};

	/**
	 * @description Computes the length (euclidian norm) of the N-dimensional vector.
	 * @returns {Float} Length.
	 */

	Vector.prototype.length = function() {
		return Math.sqrt(this.dot());
	};

	/**
	 * @description Normalizes the vector to unit length.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.normalize = function() {
		var l = this.length();

		if (l > 0.0) {
			l = 1.0 / l;

			for ( var i = 0; i < this.data.length; i++) {
				this.data[i] *= l;
			}
		}

		return this;
	};

	/**
	 * @description Gets a component from the vector.
	 * @param {Integer} index Component index.
	 * @throws {IndexExceedsDimensions} If an illegal index is accessed.
	 * @returns {Float} Component value.
	 */

	Vector.prototype.get = function(index) {
		if (index >= 0 && index < this.data.length) {
			return this.data[index];
		} else {
			throw {
				name : "IndexExceedsDimensions",
			};
		}
	};

	/**
	 * @description Sets a component in the vector.
	 * @param {Integer} index Component index.
	 * @param {Float} value Component value.
	 * @throws {IndexExceedsDimensions} If an illegal index is accessed.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.set = function(index, value) {
		if (index >= 0 && index < this.data.length) {
			this.data[index] = value;
		} else {
			throw {
				name : "IndexExceedsDimensions",
			};
		}

		return this;
	};

	/**
	 * @description Puts a component into the vector.
	 * @param {Float} value Component value.
	 * @throws {IndexExceedsDimensions} If an illegal index is accessed.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.put = function(value) {
		if (this.tos < this.data.length) {
			this.data[this.tos++] = value;
		} else {
			throw {
				name : "IndexExceedsDimensions",
			};
		}

		return this;
	};

	/**
	 * @description Converts the N-dimensional vector to a string.
	 * @returns {String} String of values.
	 */

	Vector.prototype.toString = function() {
		var string = "";
		var i = 0;

		string += "[";

		for (; i < this.data.length - 1; i++) {
			string += " " + this.data[i] + ",";
		}

		for (; i < this.data.length; i++) {
			string += " " + this.data[i] + " ";
		}

		string += "]";

		return string;
	};

	return Vector;
});

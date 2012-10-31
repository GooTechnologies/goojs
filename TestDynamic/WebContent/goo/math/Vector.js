define([], function() {
	"use strict";

	/**
	 * @class N-dimensional vector.
	 * @name Vector
	 * @property {Float32Array} data Storage for the vector components.
	 * @constructor
	 * @description Creates a new N-dimensional vector.
	 * @param {Integer} size Number of vector components.
	 */

	function Vector(size) {
		this.data = new Float32Array(size || 0);
	}

	/**
	 * @description Binds aliases to the different vector components.
	 * @param {String[][]} aliases Array of component aliases for each component index.
	 */

	Vector.prototype.setupAliases = function(aliases) {
		var that = this;

		for ( var i = 0; i < aliases.length; i++) {
			(function(index) {
				for ( var j = 0; j < aliases[index].length; j++) {
					Object.defineProperty(that, aliases[index][j], {
						get : function() {
							return this.data[index];
						},
						set : function(value) {
							this.data[index] = value;
						}
					});
				}

				Object.defineProperty(that, i, {
					get : function() {
						return this.data[index];
					},
					set : function(value) {
						this.data[index] = value;
					}
				});
			})(i);
		}
	};

	/**
	 * @static
	 * @description Adds two N-dimensional vectors and stores the result in a separate vector. The resulting vector will have a size equal to that of
	 *              the left-hand vector.
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
	 * @description Subtracts two N-dimensional vectors and stores the result in a separate vector. The resulting vector will have a size equal to
	 *              that of the left-hand vector.
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
	 * @description Multiplies two N-dimensional vectors and stores the result in a separate vector. The resulting vector will have a size equal to
	 *              that of the left-hand vector.
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
	 * @description Divides two N-dimensional vectors and stores the result in a separate vector. The resulting vector will have a size equal to that
	 *              of the left-hand vector. For all components in the right-hand vector equal to zero, the corresponding component in the resulting
	 *              vector will be equal to that of the left-hand vector.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @param {Vector} target Target vector for storage. (optional)
	 * @returns {Vector} Resulting vector.
	 */

	// REVIEW: Throw an exception when trying to divide by zero?
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
	 * @description Computes the dot product of two N-dimensional vectors.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @returns {Float} Dot product.
	 */

	Vector.dot = function(lhs, rhs) {
		var result = 0.0;

		for ( var i = 0; i < Math.min(lhs.data.length, rhs.data.length); i++) {
			result += lhs.data[i] * rhs.data[i];
		}

		return result;
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
	 * @description Copies as many components as possible from another N-dimensional vector.
	 * @param {Vector} source Source vector.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.copy = function(source) {
		this.data.set(source.data);

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
	 * @description Computes the square length of the N-dimensional vector.
	 * @returns {Float} Square length.
	 */

	Vector.prototype.squareLength = function() {
		return Vector.dot(this, this);
	};

	/**
	 * @description Computes the length (euclidian norm) of the N-dimensional vector.
	 * @returns {Float} Length.
	 */

	Vector.prototype.length = function() {
		return Math.sqrt(Vector.dot(this, this));
	};

	/**
	 * @description Normalizes the vector to unit length.
	 * @returns {Vector} Self for chaining.
	 */

	// REVIEW: Throw an exception when trying to divide by zero?
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
	 * @description Sets the components of the N-dimensional vector.
	 * @param {Float...} arguments Component values.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.set = function() {
		for ( var i in arguments) {
			this.data[i] = arguments[i];
		}

		return this;
	};

	/**
	 * @description Converts the N-dimensional vector to a string.
	 * @returns {String} String of values.
	 */

	Vector.prototype.toString = function() {
		var string = "";

		string += "[ ";

		for ( var i = 0; i < this.data.length; i++) {
			string += this.data[i];
			string += i !== this.data.length - 1 ? ", " : "";
		}

		string += " ]";

		return string;
	};

	return Vector;
});

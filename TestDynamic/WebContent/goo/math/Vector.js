define([], function() {
	"use strict";

	/**
	 * @name Vector
	 * @class Vector with N components.
	 * @property {Float32Array} data Storage for the vector components.
	 * @constructor
	 * @description Creates a new vector.
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
	 * @description Performs a component-wise addition between two vectors and stores the result in a separate vector.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @param {Vector} target Target vector for storage. (optional)
	 * @returns {Vector} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector.add = function(lhs, rhs, target) {
		var left = lhs.data || lhs;
		var right = rhs.data || rhs;

		if (!target || target.data.length != left.length) {
			target = new Vector(left.length);
		}

		var i = 0;

		for (; i < Math.min(left.length, right.length); i++) {
			target.data[i] = left[i] + right[i];
		}

		for (; i < left.length; i++) {
			target.data[i] = left[i];
		}

		return target;
	};

	Vector.addOld = function(lhs, rhs, target) {
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
	 * @description Performs a component-wise subtraction between two vectors and stores the result in a separate vector.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @param {Vector} target Target vector for storage. (optional)
	 * @returns {Vector} A new vector if the target vector cannot be used for storage, else the target vector.
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
	 * @description Performs a component-wise multiplication between two vectors and stores the result in a separate vector.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @param {Vector} target Target vector for storage. (optional)
	 * @returns {Vector} A new vector if the target vector cannot be used for storage, else the target vector.
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
	 * @description Performs a component-wise division between two vectors and stores the result in a separate vector.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @param {Vector} target Target vector for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Vector} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector.div = function(lhs, rhs, target) {
		if (!target || target.data.length != lhs.data.length) {
			target = new Vector(lhs.data.length);
		}

		var i = 0;
		var clean = true;

		for (; i < Math.min(lhs.data.length, rhs.data.length); i++) {
			target.data[i] = (clean &= (rhs.data[i] < 0.0 || rhs.data[i] > 0.0)) ? lhs.data[i] / rhs.data[i] : 0.0;
		}

		if (clean == false) {
			console.warn("[Vector.div] Attempted to divide by zero!");
		}

		for (; i < lhs.data.length; i++) {
			target.data[i] = lhs.data[i];
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise addition between a vector and a scalar and stores the result in a separate vector.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector} target Target vector for storage. (optional)
	 * @returns {Vector} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector.scalarAdd = function(lhs, rhs, target) {
		if (!target || target.data.length != lhs.data.length) {
			target = new Vector(lhs.data.length);
		}

		for ( var i = 0; i < lhs.data.length; i++) {
			target.data[i] = lhs.data[i] + rhs;
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise subtraction between a vector and a scalar and stores the result in a separate vector.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector} target Target vector for storage. (optional)
	 * @returns {Vector} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector.scalarSub = function(lhs, rhs, target) {
		if (!target || target.data.length != lhs.data.length) {
			target = new Vector(lhs.data.length);
		}

		for ( var i = 0; i < lhs.data.length; i++) {
			target.data[i] = lhs.data[i] - rhs;
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise multiplication between a vector and a scalar and stores the result in a separate vector.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector} target Target vector for storage. (optional)
	 * @returns {Vector} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector.scalarMul = function(lhs, rhs, target) {
		if (!target || target.data.length != lhs.data.length) {
			target = new Vector(lhs.data.length);
		}

		for ( var i = 0; i < lhs.data.length; i++) {
			target.data[i] = lhs.data[i] * rhs;
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise division between a vector and a scalar and stores the result in a separate vector.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Vector} target Target vector for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Vector} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector.scalarDiv = function(lhs, rhs, target) {
		if (!target || target.data.length != lhs.data.length) {
			target = new Vector(lhs.data.length);
		}

		var clean = true;

		rhs = (clean &= (rhs < 0.0 || rhs > 0.0)) ? 1.0 / rhs : 0.0;

		for ( var i = 0; i < lhs.data.length; i++) {
			target.data[i] = lhs.data[i] * rhs;
		}

		if (clean == false) {
			console.warn("[Vector.scalarDiv] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @static
	 * @description Copies component values from one vector to another.
	 * @param {Vector} source Source vector.
	 * @param {Vector} target Target vector. (optional)
	 * @returns {Vector} A new vector if the target vector cannot be used for storage, else the target vector.
	 */

	Vector.copy = function(source, target) {
		if (!target || target.data.length !== source.data.length) {
			target = new Vector(source.data.length);
		}

		target.data.set(source.data);

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
	 * @description Performs a component-wise addition between two vectors and stores the result locally.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.add = function(rhs) {
		return Vector.add(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between two vectors and stores the result locally.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.sub = function(rhs) {
		return Vector.sub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between two vectors and stores the result locally.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.mul = function(rhs) {
		return Vector.mul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between two vectors and stores the result locally.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.div = function(rhs) {
		return Vector.div(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise addition between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.scalarAdd = function(rhs) {
		return Vector.scalarAdd(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.scalarSub = function(rhs) {
		return Vector.scalarSub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.scalarMul = function(rhs) {
		return Vector.scalarMul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between a vector and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.scalarDiv = function(rhs) {
		return Vector.scalarDiv(this, rhs, this);
	};

	/**
	 * @description Computes the dot product of two N-dimensional vectors.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @returns {Float} Dot product.
	 */

	Vector.prototype.dot = function(rhs) {
		return Vector.dot(this, rhs);
	};

	/**
	 * @description Copies component values from another vector.
	 * @param {Vector} source Source vector.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.copy = function(source) {
		return Vector.copy(source, this);
	};

	/**
	 * @description Inverts all component values of the vector.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.invert = function() {
		for ( var i = 0; i < this.data.length; i++) {
			this.data[i] = 0.0 - this.data[i];
		}

		return this;
	};

	/**
	 * @description Computes the square length of the vector.
	 * @returns {Float} Square length.
	 */

	Vector.prototype.squareLength = function() {
		return Vector.dot(this, this);
	};

	/**
	 * @description Computes the length (euclidian norm) of the vector.
	 * @returns {Float} Length.
	 */

	Vector.prototype.length = function() {
		return Math.sqrt(Vector.dot(this, this));
	};

	/**
	 * @description Normalizes the vector to unit length.
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.normalize = function() {
		var l = this.length();
		var clean = true;

		l = (clean &= (l > 0.0)) ? 1.0 / l : 0.0;

		for ( var i = 0; i < this.data.length; i++) {
			this.data[i] *= l;
		}

		if (clean == false) {
			console.warn("[Vector.prototype.normalize] Attempted to divide by zero!");
		}

		return this;
	};

	/**
	 * @description Sets the components of the vector.
	 * @param {Float...} arguments Component values.
	 * @returns {Vector} Self for chaining.
	 */

	Vector.prototype.set = function() {
		if (arguments.length === 1 && typeof (arguments[0]) === "object") {
			for ( var i in arguments[0]) {
				this.data[i] = arguments[0][i];
			}
		} else {
			for ( var i in arguments) {
				this.data[i] = arguments[i];
			}
		}

		return this;
	};

	/**
	 * @description Converts the vector to a string.
	 * @returns {String} String of component values.
	 */

	Vector.prototype.toString = function() {
		var string = "";

		string += "[";

		for ( var i = 0; i < this.data.length; i++) {
			string += this.data[i];
			string += i !== this.data.length - 1 ? "," : "";
		}

		string += "]";

		return string;
	};

	return Vector;
});

define([
	'goo/math/MathUtils'
],
/** @lends */
function (
	MathUtils
) {
	'use strict';

	/* ====================================================================== */

	/**
	 * @class Vector with N components.
	 * @property {Float32Array} data Storage for the vector components.
	 * @constructor
	 * @description Creates a new vector.
	 * @param {number} size Number of vector components.
	 */

	function Vector(size) {
		this.data = new Float32Array(size);
	}

	/* ====================================================================== */

	/**
	 * @private
	 * @description Binds aliases to the different vector components.
	 * @param {prototype} prototype The prototype to bind to.
	 * @param {String[]} aliases Array of component aliases for each component index.
	 */
	Vector.setupAliases = function (prototype, aliases) {
		for (var i = 0; i < aliases.length; i++) {
			/*jshint loopfunc: true */
			(function (index) {
				for (var j = 0; j < aliases[index].length; j++) {
					Object.defineProperty(prototype, aliases[index][j], {
						get: function () {
							return this.data[index];
						},
						set: function (value) {
							this.data[index] = value;
						}
					});
				}

				Object.defineProperty(prototype, i, {
					get: function () {
						return this.data[index];
					},
					set: function (value) {
						this.data[index] = value;
					}
				});
			})(i);
		}
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise addition and stores the result in a separate vector. Equivalent of 'return (target = lhs + rhs);'.
	 * @param {Vector|number[]} lhs Vector or array of scalars.
	 * @param {Vector|number[]} rhs Vector or array of scalars.
	 * @param {Vector} [target] Target vector for storage.
	 * @return {Vector} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector.add = function (lhs, rhs, target) {
		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;
		var size = ldata.length;

		if (!target) {
			target = new Vector(size);
		}

		for (var i = 0; i < size; i++) {
			target.data[i] = ldata[i] + rdata[i];
		}

		return target;
	};

	/**
	 * @description Performs a component-wise addition and stores the result locally. Equivalent of 'return (this = this + rhs);'.
	 * @param {Vector|number[]} rhs Vector or array of scalars.
	 * @return {Vector} Self for chaining.
	 */

	Vector.prototype.add = function (rhs) {
		return Vector.add(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise subtraction and stores the result in a separate vector. Equivalent of 'return (target = lhs - rhs);'.
	 * @param {Vector|number[]} lhs Vector or array of scalars.
	 * @param {Vector|number[]} rhs Vector or array of scalars.
	 * @param {Vector} [target] Target vector for storage.
	 * @return {Vector} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector.sub = function (lhs, rhs, target) {
		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;
		var size = ldata.length;

		if (!target) {
			target = new Vector(size);
		}

		for (var i = 0; i < size; i++) {
			target.data[i] = ldata[i] - rdata[i];
		}

		return target;
	};

	/**
	 * @description Performs a component-wise addition and stores the result locally. Equivalent of 'return (this = this - rhs);'.
	 * @param {Vector|number[]} rhs Vector or array of scalars.
	 * @return {Vector} Self for chaining.
	 */

	Vector.prototype.sub = function (rhs) {
		return Vector.sub(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise multiplication and stores the result in a separate vector. Equivalent of 'return (target = lhs * rhs);'.
	 * @param {Vector|number[]} lhs Vector or array of scalars.
	 * @param {Vector|number[]} rhs Vector or array of scalars.
	 * @param {Vector} [target] Target vector for storage.
	 * @return {Vector} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector.mul = function (lhs, rhs, target) {
		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;
		var size = ldata.length;

		if (!target) {
			target = new Vector(size);
		}

		for (var i = 0; i < size; i++) {
			target.data[i] = ldata[i] * rdata[i];
		}

		return target;
	};

	/**
	 * @description Performs a component-wise addition and stores the result locally. Equivalent of 'return (this = this * rhs);'.
	 * @param {Vector|number[]} rhs Vector or array of scalars.
	 * @return {Vector} Self for chaining.
	 */

	Vector.prototype.mul = function (rhs) {
		return Vector.mul(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise division and stores the result in a separate vector. Equivalent of 'return (target = lhs / rhs);'.
	 * @param {Vector|number[]} lhs Vector or array of scalars.
	 * @param {Vector|number[]} rhs Vector or array of scalars.
	 * @param {Vector} [target] Target vector for storage.
	 * @return {Vector} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector.div = function (lhs, rhs, target) {
		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;
		var size = ldata.length;

		if (!target) {
			target = new Vector(size);
		}

		for (var i = 0; i < size; i++) {
			target.data[i] = ldata[i] / rdata[i];
		}

		return target;
	};

	/**
	 * @description Performs a component-wise division and stores the result locally. Equivalent of 'return (this = this / rhs);'.
	 * @param {Vector|number[]} rhs Vector or array of scalars.
	 * @return {Vector} Self for chaining.
	 */

	Vector.prototype.div = function (rhs) {
		return Vector.div(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Copies component values and stores them in a separate vector. Equivalent of 'return (target = source);'.
	 * @param {Vector} source Source vector.
	 * @param {Vector} [target] Target vector.
	 * @return {Vector} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector.copy = function (source, target) {
		var size = source.data.length;

		if (!target) {
			target = new Vector(size);
		}

		target.data.set(source.data);

		return target;
	};

	/**
	 * @description Copies component values and stores them locally. Equivalent of 'return (this = source);'.
	 * @param {Vector} source Source vector.
	 * @return {Vector} Self for chaining.
	 */

	Vector.prototype.copy = function (source) {
		return Vector.copy(source, this);
	};

	/* ====================================================================== */

	/**
	 * @description Computes the dot product between two vectors. Equivalent of 'return lhs•rhs;'.
	 * @param {Vector|number[]} lhs Vector or array of scalars on the left-hand side.
	 * @param {Vector|number[]} rhs Vector or array of scalars on the right-hand side.
	 * @return {number} Dot product.
	 */

	Vector.dot = function (lhs, rhs) {
		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;
		var size = ldata.length;

		var sum = 0.0;

		for (var i = 0; i < size; i++) {
			sum += ldata[i] * rdata[i];
		}

		return sum;
	};

	/**
	 * @description Computes the dot product between two vectors. Equivalent of 'return this•rhs;'.
	 * @param {Vector|number[]} rhs Vector or array of scalars on the right-hand side.
	 * @return {number} Dot product.
	 */

	Vector.prototype.dot = function (rhs) {
		return Vector.dot(this, rhs);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Applys a matrix to a vector and stores the result in a separate vector. Equivalent of 'return (target = lhs•rhs);'.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @param {Vector} [target] Target vector for storage.
	 * @return {Vector} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector.apply = function (lhs, rhs, target) {
		var rows = lhs.rows;
		var cols = lhs.cols;
		var size = rhs.data.length;

		if (!target) {
			target = new Vector(rows);
		}

		if (target === rhs) {
			return Vector.copy(Vector.apply(lhs, rhs), target);
		}

		for (var c = 0; c < cols; c++) {
			var o = c * rows;

			for (var r = 0; r < rows; r++) {
				var sum = 0.0;

				for (var i = 0; i < size; i++) {
					sum += lhs.data[i * lhs.rows + r] * rhs.data[i];
				}

				target.data[o + r] = sum;
			}
		}

		return target;
	};

	/**
	 * @description Applys a matrix to a vector and stores the result locally. Equivalent of 'return (this = lhs•this);'.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @return {Vector} Self for chaining.
	 */

	Vector.prototype.apply = function (lhs) {
		return Vector.apply(lhs, this, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Compares two vectors for approximate equality. Equivalent of 'return (lhs ~ rhs);'.
	 * @param {Vector} lhs Vector on the left-hand side.
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @return {Boolean} True if equal.
	 */

	Vector.equals = function (lhs, rhs) {
		var lhsLength = lhs.data.length;
		if (lhsLength !== rhs.data.length) {
			return false;
		}

		for (var i = 0; i < lhsLength; i++) {
			if (Math.abs(lhs.data[i] - rhs.data[i]) > MathUtils.EPSILON) {
				return false;
			}
		}

		return true;
	};

	/**
	 * @description Compares two vectors for approximate equality. Equivalent of 'return (this ~ rhs);'
	 * @param {Vector} rhs Vector on the right-hand side.
	 * @return {Boolean} True if equal.
	 */

	Vector.prototype.equals = function (rhs) {
		return Vector.equals(this, rhs);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Computes the squared distance between two vectors. Equivalent of 'return (rhs - lhs)•(rhs - lhs);'. When comparing the relative
	 *              distances between two points it is usually sufficient to compare the squared distances, thus avoiding an expensive square root
	 *              operation.
	 * @param {Vector|number[]} lhs Vector or array of scalars on the left-hand side.
	 * @param {Vector|number[]} rhs Vector or array of scalars on the right-hand side.
	 * @return {number} Squared distance.
	 */

	Vector.distanceSquared = function (lhs, rhs) {
		return Vector.sub(lhs, rhs).lengthSquared();
	};

	/**
	 * @description Computes the squared distance between two vectors. Equivalent of 'return (rhs - this)•(rhs - this);'. When comparing the
	 *              relative distances between two points it is usually sufficient to compare the squared distances, thus avoiding an expensive square
	 *              root operation.
	 * @param {Vector|number[]} rhs Vector or array of scalars on the right-hand side.
	 * @return {number} Squared distance.
	 */

	Vector.prototype.distanceSquared = function (rhs) {
		return Vector.sub(this, rhs).lengthSquared();
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Computes the distance between two vectors. Equivalent of 'return sqrt((rhs - lhs)•(rhs - lhs));'.
	 * @param {Vector|number[]} lhs Vector or array of scalars on the left-hand side.
	 * @param {Vector|number[]} rhs Vector or array of scalars on the right-hand side.
	 * @return {number} Distance.
	 */

	Vector.distance = function (lhs, rhs) {
		return Vector.sub(lhs, rhs).length();
	};

	/**
	 * @description Computes the distance between two vectors. Equivalent of 'return sqrt((rhs - this)•(rhs - this));'.
	 * @param {Vector|number[]} rhs Vector or array of scalars on the right-hand side.
	 * @return {number} Distance.
	 */

	Vector.prototype.distance = function (rhs) {
		return Vector.sub(this, rhs).length();
	};

	/* ====================================================================== */

	/**
	 * @description Computes the squared length of the vector. Equivalent of 'return this•this;'.
	 * @return {number} Square length.
	 */

	Vector.prototype.lengthSquared = function () {
		return Vector.dot(this, this);
	};

	/* ====================================================================== */

	/**
	 * @description Computes the length of the vector. Equivalent of 'return sqrt(this•this);'.
	 * @return {number} Length.
	 */

	Vector.prototype.length = function () {
		return Math.sqrt(Vector.dot(this, this));
	};

	/**
	 * Scales the vector
	 * @param {number} factor
	 * @returns {Vector} this for chaining
	 */
	Vector.prototype.scale = function(factor) {
		for (var i = this.data.length - 1; i >= 0; i--) {
			this.data[i] *= factor;
		}
		return this;
	};

	/* ====================================================================== */

	/**
	 * @description Inverts all component values of the vector. Equivalent of 'return (this = 0.0 - this);'.
	 * @return {Vector} Self for chaining.
	 */

	Vector.prototype.invert = function () {
		for (var i = 0; i < this.data.length; i++) {
			this.data[i] = 0.0 - this.data[i];
		}

		return this;
	};

	/* ====================================================================== */

	/**
	 * @description Normalizes the vector to unit length. Equivalent of 'return (this = this/sqrt(this•this));'.
	 * @return {Vector} Self for chaining.
	 */

	Vector.prototype.normalize = function () {
		var l = this.length();
		var dataLength = this.data.length;

		if (l < MathUtils.EPSILON) {
			for (var i = 0; i < dataLength; i++) {
				this.data[i] = 0;
			}
		} else {
			l = 1.0 / l;
			for (var i = 0; i < dataLength; i++) {
				this.data[i] *= l;
			}
		}

		return this;
	};

	/* ====================================================================== */

	/**
	 * @description Clones the vector. Equivalent of 'return (clone = this)'.
	 * @return {Vector} Clone of self.
	 */

	Vector.prototype.clone = function () {
		return Vector.copy(this);
	};

	/* ====================================================================== */

	/**
	 * @description Sets the components of the vector.
	 * @param {Vector|number[]|...number} arguments Component values.
	 * @return {Vector} Self for chaining.
	 */

	Vector.prototype.set = function () {
		if (arguments.length === 1 && typeof (arguments[0]) === 'object') {
			if (arguments[0] instanceof Vector) {
				this.copy(arguments[0]);
			} else if (arguments[0].length > 1) {
				for (var i = 0; i < arguments[0].length; i++) {
					this.data[i] = arguments[0][i];
				}
			} else {
				this.set(arguments[0][0]);
			}
		} else {
			for (var i = 0; i < arguments.length; i++) {
				this.data[i] = arguments[i];
			}
		}

		return this;
	};

	/* ====================================================================== */

	/**
	 * @description Converts the vector to a string.
	 * @return {String} String of component values.
	 */

	Vector.prototype.toString = function () {
		var string = '';

		string += '[';

		for (var i = 0; i < this.data.length; i++) {
			string += this.data[i];
			string += i !== this.data.length - 1 ? ', ' : '';
		}

		string += ']';

		return string;
	};

	/* ====================================================================== */

	return Vector;
});

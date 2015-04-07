define([
	'goo/math/MathUtils'
], function (
	MathUtils
) {
	'use strict';

	/**
	 * Matrix with RxC components.
	 * @param {number} rows Number of rows.
	 * @param {number} cols Number of columns.
	 */
	function Matrix(rows, cols) {
		this.rows = rows || 0;
		this.cols = cols || 0;
		/** Column-major storage for the matrix components.
		 * @type {Float32Array}
		 */
		this.data = new Float32Array(this.rows * this.cols);
	}

	/**
	 * Binds aliases to the different matrix components.
	 * @hidden
	 * @param {Object} prototype The prototype to bind to.
	 * @param {string[][]} aliases Array of component aliases for each component index.
	 */
	Matrix.setupAliases = function (prototype, aliases) {
		aliases.forEach(function (aliasesPerComponent, index) {
			aliasesPerComponent.forEach(function (alias) {
				Object.defineProperty(prototype, alias, {
					get: function () {
						return this.data[index];
					},
					set: function (value) {
						this.data[index] = value;
						// #ifdef DEBUG
						if (isNaN(this.data[index])) {
							throw new Error('Tried setting NaN to matrix component ' + alias);
						}
						// #endif
					}
				});
			});

			Object.defineProperty(prototype, index, {
				get: function () {
					return this.data[index];
				},
				set: function (value) {
					this.data[index] = value;
					// #ifdef DEBUG
					if (isNaN(this.data[index])) {
						throw new Error('Tried setting NaN to matrix component ' + index);
					}
					// #endif
				}
			});
		});
	};

	// #ifdef DEBUG
	/**
	 * Throws an error if any of the matrix's components are NaN
	 * @hidden
	 */
	Matrix.prototype.checkIntegrity = function () {
		for (var i = 0; i < this.data.length; i++) {
			if (isNaN(this.data[i])) {
				throw new Error('Matrix contains NaN at index ' + i);
			}
		}
	};

	/**
	 * Replaces the supplied method of object and wraps it in a integrity check
	 * @hidden
	 * @param {object} object The object to attach the post-check to
	 * @param {string} methodName The name of the original method the check is attached to
	 */
	Matrix.addPostCheck = function (object, methodName) {
		var originalMethod = object[methodName];
		object[methodName] = function () {
			var ret = originalMethod.apply(this, arguments);
			if (typeof ret === 'number') {
				if (isNaN(ret)) {
					throw new Error('Matrix method ' + methodName + ' returned NaN');
				}
			}

			this.checkIntegrity();
			return ret;
		};
	};

	/**
	 * Adds more validators at once
	 * @hidden
	 * @param object
	 * @param {string[]} methodNames
	 */
	Matrix.addPostChecks = function (object, methodNames) {
		methodNames.forEach(Matrix.addPostCheck.bind(null, object));
	};
	// #endif

	/* ====================================================================== */

	/**
	 * Compares two matrices for approximate equality.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @returns {boolean} True if equal.
	 */

	Matrix.equals = function (lhs, rhs) {
		if (lhs.rows !== rhs.rows || lhs.cols !== rhs.cols) {
			return false;
		}

		for (var i = 0; i < lhs.data.length; i++) {
			// why the backwards check? because otherwise if NaN is present in either lhs or rhs
			// then Math.abs(NaN) is NaN which is neither bigger or smaller than EPSILON
			// which never satisfies the condition
			// NaN is not close to NaN and we want to preserve that for matrices as well
			if (!(Math.abs(lhs.data[i] - rhs.data[i]) <= MathUtils.EPSILON)) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Compares two matrices for approximate equality.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @returns {boolean} True if equal.
	 */

	Matrix.prototype.equals = function (rhs) {
		return Matrix.equals(this, rhs);
	};

	/* ====================================================================== */

	/**
	 * Tests if the matrix is orthogonal.
	 * @returns {boolean} True if orthogonal.
	 */

	Matrix.prototype.isOrthogonal = function () {
		for (var ca = 0; ca < this.cols; ca++) {
			for (var cb = ca + 1; cb < this.cols; cb++) {
				var oa = ca * this.rows;
				var ob = cb * this.rows;
				var sum = 0.0;

				for (var r = 0; r < this.rows; r++) {
					sum += this.data[oa + r] * this.data[ob + r];
				}

				if (Math.abs(sum) > MathUtils.EPSILON) {
					return false;
				}
			}
		}

		return true;
	};

	/* ====================================================================== */

	/**
	 * Tests if the matrix is normal.
	 * @returns {boolean} True if normal.
	 */

	Matrix.prototype.isNormal = function () {
		for (var c = 0; c < this.cols; c++) {
			var o = c * this.rows;
			var sum = 0.0;

			for (var r = 0; r < this.rows; r++) {
				sum += this.data[o + r] * this.data[o + r];
			}

			if (Math.abs(sum - 1.0) > MathUtils.EPSILON) {
				return false;
			}
		}

		return true;
	};

	/* ====================================================================== */

	/**
	 * Tests if the matrix is orthonormal.
	 * @returns {boolean} True if orthonormal.
	 */

	Matrix.prototype.isOrthonormal = function () {
		return this.isOrthogonal() && this.isNormal();
	};

	/* ====================================================================== */

	/**
	 * Clones the matrix.
	 * @returns {Matrix} Clone of self.
	 */

	Matrix.prototype.clone = function () {
		return Matrix.copy(this);
	};

	/* ====================================================================== */

	/**
	 * Sets the components of the matrix.
	 * @param {Matrix|number[]|...number} arguments Component values.
	 * @returns {Matrix} Self for chaining.
	 */

	Matrix.prototype.set = function () {
		if (arguments.length === 1 && typeof arguments[0] === 'object') {
			if (arguments[0] instanceof Matrix) {
				this.copy(arguments[0]);
			} else {
				for (var i = 0; i < arguments[0].length; i++) {
					this.data[i] = arguments[0][i];
				}
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
	 * Converts the matrix into a string.
	 * @returns {string} String of component values.
	 */

	Matrix.prototype.toString = function () {
		var string = '';

		for (var c = 0; c < this.cols; c++) {
			var offset = c * this.rows;

			string += '[';

			for (var r = 0; r < this.rows; r++) {
				string += this.data[offset + r];
				string += r !== this.rows - 1 ? ', ' : '';
			}

			string += c !== this.cols - 1 ? '], ' : ']';
		}

		return string;
	};

	/* ====================================================================== */

	return Matrix;
});

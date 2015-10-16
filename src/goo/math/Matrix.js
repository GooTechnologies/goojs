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
	 * @param {Array<Array<string>>} aliases Array of component aliases for each component index.
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
	 * @param {Object} object The object to attach the post-check to
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
	 * @param {Array<string>} methodNames
	 */
	Matrix.addPostChecks = function (object, methodNames) {
		methodNames.forEach(Matrix.addPostCheck.bind(null, object));
	};
	// #endif

	// SHIM START
	/**
	 * Performs a component-wise addition.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @returns {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 * @deprecated
	 */

	Matrix.add = function (lhs, rhs, target) {
		console.warn('Matrix.add is deprecated. Use Matrix3.prototype.add, Matrix2.prototype.add or Matrix4.prototype.add instead.');

		var rows = lhs.rows;
		var cols = lhs.cols;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (rhs instanceof Matrix) {
			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] + rhs.data[i];
			}
		} else {
			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] + rhs;
			}
		}

		return target;
	};

	/**
	 * Performs a component-wise addition.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix} Self for chaining.
	 * @deprecated
	 */
	Matrix.prototype.add = function (rhs) {
		console.warn('Matrix.prototype.add is deprecated. Use Matrix3.prototype.add, Matrix2.prototype.add or Matrix4.prototype.add instead.');
		return Matrix.add(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Performs a component-wise subtraction.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @returns {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 * @deprecated
	 */

	Matrix.sub = function (lhs, rhs, target) {
		console.warn('Matrix.sub is deprecated. Use Matrix3.prototype.sub, Matrix2.prototype.sub or Matrix4.prototype.sub instead.');
		var rows = lhs.rows;
		var cols = lhs.cols;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (rhs instanceof Matrix) {
			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] - rhs.data[i];
			}
		} else {
			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] - rhs;
			}
		}

		return target;
	};

	/**
	 * Performs a component-wise subtraction.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix} Self for chaining.
	 * @deprecated
	 */
	Matrix.prototype.sub = function (rhs) {
		console.warn('Matrix.prototype.sub is deprecated. Use Matrix3.prototype.sub, Matrix2.prototype.sub or Matrix4.prototype.sub instead.');
		return Matrix.sub(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Performs a component-wise multiplication.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @returns {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 * @deprecated
	 */

	Matrix.mul = function (lhs, rhs, target) {
		console.warn('Matrix.mul is deprecated. Use Matrix3.prototype.mul, Matrix2.prototype.mul or Matrix4.prototype.mul instead.');
		var rows = lhs.rows;
		var cols = lhs.cols;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (rhs instanceof Matrix) {
			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] * rhs.data[i];
			}
		} else {
			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] * rhs;
			}
		}

		return target;
	};

	/**
	 * Performs a component-wise multiplication.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix} Self for chaining.
	 * @deprecated
	 */

	Matrix.prototype.mul = function (rhs) {
		console.warn('Matrix.prototype.mul is deprecated. Use Matrix3.prototype.mul, Matrix2.prototype.mul or Matrix4.prototype.mul instead.');
		return Matrix.mul(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Performs a component-wise division.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @returns {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 * @deprecated
	 */

	Matrix.div = function (lhs, rhs, target) {
		console.warn('Matrix.div is deprecated. Use Matrix3.prototype.div, Matrix2.prototype.div or Matrix4.prototype.div instead.');
		var rows = lhs.rows;
		var cols = lhs.cols;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (rhs instanceof Matrix) {
			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] / rhs.data[i];
			}
		} else {
			rhs = 1.0 / rhs;

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] * rhs;
			}
		}

		return target;
	};

	/**
	 * Performs a component-wise division.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @returns {Matrix} Self for chaining.
	 * @deprecated
	 */

	Matrix.prototype.div = function (rhs) {
		console.warn('Matrix.prototype.div is deprecated. Use Matrix3.prototype.div, Matrix2.prototype.div or Matrix4.prototype.div instead.');
		return Matrix.div(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Combines two matrices (matrix multiplication) and stores the result in a separate matrix.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @returns {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 * @deprecated
	 */
	Matrix.combine = function (lhs, rhs, target) {
		console.warn('Matrix.combine is deprecated. Use Matrix2/3/4.prototype.mul or Matrix2/3/4.prototype.mul2 instead.');
		var rows = lhs.rows;
		var cols = rhs.cols;
		var size = lhs.cols = rhs.rows;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (target === lhs || target === rhs) {
			return Matrix.copy(Matrix.combine(lhs, rhs), target);
		}

		for (var c = 0; c < cols; c++) {
			var o = c * rows;

			for (var r = 0; r < rows; r++) {
				var sum = 0.0;

				for (var i = 0; i < size; i++) {
					sum += lhs.data[i * lhs.rows + r] * rhs.data[c * rhs.rows + i];
				}

				target.data[o + r] = sum;
			}
		}

		return target;
	};

	/**
	 * Combines two matrices (matrix multiplication) and stores the result locally.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @returns {Matrix} Self for chaining.
	 * @deprecated
	 */

	Matrix.prototype.combine = function (rhs) {
		console.warn('Matrix.prototype.combine is deprecated. Use Matrix2/3/4.prototype.mul or Matrix2/3/4.prototype.mul2 instead.');
		return Matrix.combine(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Transposes a matrix (exchanges rows and columns) and stores the result in a separate matrix.
	 * @param {Matrix} source Source matrix.
	 * @param {Matrix} [target] Target matrix.
	 * @returns {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 * @deprecated
	 */

	Matrix.transpose = function (source, target) {
		console.warn('Matrix.transpose is deprecated. Use Matrix2/3/4.prototype.transpose instead.');
		var rows = source.cols;
		var cols = source.rows;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (target === source) {
			return Matrix.copy(Matrix.transpose(source), target);
		}

		for (var c = 0; c < cols; c++) {
			var o = c * rows;

			for (var r = 0; r < rows; r++) {
				target.data[o + r] = source.data[r * cols + c];
			}
		}

		return target;
	};

	/**
	 * Transposes the matrix (exchanges rows and columns) and stores the result locally.
	 * @returns {Matrix} Self for chaining.
	 * @deprecated
	 */

	Matrix.prototype.transpose = function () {
		console.warn('Matrix.prototype.transpose is deprecated. Use Matrix2/3/4.prototype.transpose instead.');
		return Matrix.transpose(this, this);
	};

	/* ====================================================================== */

	/**
	 * Copies component values and stores them in a separate matrix.
	 * @param {Matrix} source Source matrix.
	 * @param {Matrix} [target] Target matrix.
	 * @returns {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 * @deprecated
	 */

	Matrix.copy = function (source, target) {
		console.warn('Matrix.copy is deprecated. Use Matrix2/3/4.prototype.copy instead.');
		var rows = source.rows;
		var cols = source.cols;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		target.data.set(source.data);

		return target;
	};

	/**
	 * Copies component values and stores them locally.
	 * @param {Matrix} source Source matrix.
	 * @returns {Matrix} Self for chaining.
	 * @deprecated
	 */

	Matrix.prototype.copy = function (source) {
		console.warn('Matrix.prototype.copy is deprecated. Use Matrix2/3/4.prototype.copy instead.');
		return Matrix.copy(source, this);
	};

	/* ====================================================================== */

	/**
	 * Compares two matrices for approximate equality.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @returns {boolean} True if equal.
	 * @deprecated
	 */

	Matrix.equals = function (lhs, rhs) {
		console.warn('Matrix.equals is deprecated. Use Matrix2/3/4.prototype.equals instead.');
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
	 * @deprecated
	 */

	Matrix.prototype.equals = function (rhs) {
		console.warn('Matrix.prototype.equals is deprecated. Use Matrix2/3/4.prototype.equals instead.');
		return Matrix.equals(this, rhs);
	};

	/* ====================================================================== */

	/**
	 * Tests if the matrix is orthogonal.
	 * @returns {boolean} True if orthogonal.
	 * @deprecated
	 */

	Matrix.prototype.isOrthogonal = function () {
		console.warn('Matrix.prototype.isOrthogonal is deprecated. Use Matrix2/3/4.prototype.isOrthogonal instead.');
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
	 * @deprecated
	 */

	Matrix.prototype.isNormal = function () {
		console.warn('Matrix.prototype.isNormal is deprecated. Use Matrix2/3/4.prototype.isNormal instead.');
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
	 * @deprecated
	 */

	Matrix.prototype.isOrthonormal = function () {
		console.warn('Matrix.prototype.isOrthonormal is deprecated. Use Matrix2/3/4.prototype.isOrthonormal instead.');
		return this.isOrthogonal() && this.isNormal();
	};

	/* ====================================================================== */

	/**
	 * Clones the matrix.
	 * @returns {Matrix} Clone of self.
	 * @deprecated
	 */

	Matrix.prototype.clone = function () {
		console.warn('Matrix.prorotype.clone is deprecated. Use Matrix2/3/4.prototype.clone instead.');
		return Matrix.copy(this);
	};

	/* ====================================================================== */

	/**
	 * Sets the components of the matrix.
	 * @param {Matrix|number[]|...number} arguments Component values.
	 * @returns {Matrix} Self for chaining.
	 * @deprecated
	 */

	Matrix.prototype.set = function () {
		console.warn('Matrix.prorotype.set is deprecated. Use Matrix2/3/4.prototype.set instead.');
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

	/**
	 * Converts the matrix into a string.
	 * @returns {string} String of component values.
	 * @deprecated
	 */

	Matrix.prototype.toString = function () {
		console.warn('Matrix.prorotype.toString is deprecated.');
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
	// SHIM END

	return Matrix;
});

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
		this.data = new Float64Array(this.rows * this.cols);
		this.data32 = new Float32Array(this.rows * this.cols);
	}

	/**
	 * Binds aliases to the different matrix components.
	 * @private
	 * @param {prototype} prototype The prototype to bind to.
	 * @param {string[]} aliases Array of component aliases for each component index.
	 */
	Matrix.setupAliases = function (prototype, aliases) {
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
	 * Performs a component-wise addition.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @returns {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix.add = function (lhs, rhs, target) {
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
	 */

	Matrix.prototype.add = function (rhs) {
		return Matrix.add(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Performs a component-wise subtraction.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @returns {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix.sub = function (lhs, rhs, target) {
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
	 */

	Matrix.prototype.sub = function (rhs) {
		return Matrix.sub(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Performs a component-wise multiplication.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @returns {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix.mul = function (lhs, rhs, target) {
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
	 */

	Matrix.prototype.mul = function (rhs) {
		return Matrix.mul(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Performs a component-wise division.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @returns {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix.div = function (lhs, rhs, target) {
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
	 */

	Matrix.prototype.div = function (rhs) {
		return Matrix.div(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Combines two matrices (matrix multiplication) and stores the result in a separate matrix.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @returns {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix.combine = function (lhs, rhs, target) {
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
	 */

	Matrix.prototype.combine = function (rhs) {
		return Matrix.combine(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * Transposes a matrix (exchanges rows and columns) and stores the result in a separate matrix.
	 * @param {Matrix} source Source matrix.
	 * @param {Matrix} [target] Target matrix.
	 * @returns {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix.transpose = function (source, target) {
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
	 */

	Matrix.prototype.transpose = function () {
		return Matrix.transpose(this, this);
	};

	/* ====================================================================== */

	/**
	 * Copies component values and stores them in a separate matrix.
	 * @param {Matrix} source Source matrix.
	 * @param {Matrix} [target] Target matrix.
	 * @returns {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix.copy = function (source, target) {
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
	 */

	Matrix.prototype.copy = function (source) {
		return Matrix.copy(source, this);
	};

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

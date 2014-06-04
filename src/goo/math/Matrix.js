define([
	'goo/math/MathUtils'
],
/** @lends */
function (
	MathUtils
) {
	"use strict";

	/* ====================================================================== */

	/**
	 * @class Matrix with RxC components.
	 * @description Creates a new matrix.
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

	/* ====================================================================== */

	/**
	 * @private
	 * @description Binds aliases to the different matrix components.
	 * @param {string[]} aliases Array of component aliases for each component index.
	 */
	Matrix.prototype.setupAliases = function (aliases) {
		var that = this;

		for (var i = 0; i < aliases.length; i++) {
			/*jshint loopfunc: true */
			(function (index) {
				for (var j = 0; j < aliases[index].length; j++) {
					Object.defineProperty(that, aliases[index][j], {
						get: function () {
							return this.data[index];
						},
						set: function (value) {
							this.data[index] = value;
						}
					});
				}

				Object.defineProperty(that, i, {
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

	var addWarning = false; // have to put them here so not to confuse jsdocs
	/**
	 * Performs a component-wise addition.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @return {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix.add = function (lhs, rhs, target) {
		if (!addWarning) {
			console.warn('Matrix.add is deprecated; consider using the .add method on Matrix2x2/3x3/4x4');
			addWarning = true;
		}

		var rows = lhs.rows;
		var cols = lhs.cols;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (rhs instanceof Matrix) {
			if (rhs.rows !== rows || rhs.cols !== cols || target.rows !== rows || target.cols !== cols) {
				throw { name: "Illegal Arguments", message: "The arguments are of incompatible sizes." };
			}

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] + rhs.data[i];
			}
		} else {
			if (target.rows !== rows || target.cols !== cols) {
				throw { name: "Illegal Arguments", message: "The arguments are of incompatible sizes." };
			}

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] + rhs;
			}
		}

		return target;
	};

	/**
	 * Performs a component-wise addition.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @return {Matrix} Self for chaining.
	 */
	Matrix.prototype.add = function (rhs) {
		return Matrix.add(this, rhs, this);
	};

	/* ====================================================================== */

	var subWarning = false; // have to put them here so not to confuse jsdocs
	/**
	 * Performs a component-wise subtraction.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @return {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix.sub = function (lhs, rhs, target) {
		if (!subWarning) {
			console.warn('Matrix.sub is deprecated; consider using the .sub method on Matrix2x2/3x3/4x4');
			subWarning = true;
		}

		var rows = lhs.rows;
		var cols = lhs.cols;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (rhs instanceof Matrix) {
			if (rhs.rows !== rows || rhs.cols !== cols || target.rows !== rows || target.cols !== cols) {
				throw { name: "Illegal Arguments", message: "The arguments are of incompatible sizes." };
			}

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] - rhs.data[i];
			}
		} else {
			if (target.rows !== rows || target.cols !== cols) {
				throw { name: "Illegal Arguments", message: "The arguments are of incompatible sizes." };
			}

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] - rhs;
			}
		}

		return target;
	};

	/**
	 * Performs a component-wise subtraction.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @return {Matrix} Self for chaining.
	 */
	Matrix.prototype.sub = function (rhs) {
		return Matrix.sub(this, rhs, this);
	};

	/* ====================================================================== */

	var mulWarning = false; // have to put them here so not to confuse jsdocs
	/**
	 * Performs a component-wise multiplication.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @return {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix.mul = function (lhs, rhs, target) {
		if (!mulWarning) {
			console.warn('Matrix.mul is deprecated; consider using the .mul method on Matrix2x2/3x3/4x4');
			mulWarning = true;
		}

		var rows = lhs.rows;
		var cols = lhs.cols;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (rhs instanceof Matrix) {
			if (rhs.rows !== rows || rhs.cols !== cols || target.rows !== rows || target.cols !== cols) {
				throw { name: "Illegal Arguments", message: "The arguments are of incompatible sizes." };
			}

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] * rhs.data[i];
			}
		} else {
			if (target.rows !== rows || target.cols !== cols) {
				throw { name: "Illegal Arguments", message: "The arguments are of incompatible sizes." };
			}

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] * rhs;
			}
		}

		return target;
	};

	/**
	 * Performs a component-wise multiplication.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @return {Matrix} Self for chaining.
	 */
	Matrix.prototype.mul = function (rhs) {
		return Matrix.mul(this, rhs, this);
	};

	/* ====================================================================== */

	var divWarning = false; // have to put them here so not to confuse jsdocs
	/**
	 * Performs a component-wise division.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @return {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix.div = function (lhs, rhs, target) {
		if (!divWarning) {
			console.warn('Matrix.div is deprecated; consider using the .div method on Matrix2x2/3x3/4x4');
			divWarning = true;
		}

		var rows = lhs.rows;
		var cols = lhs.cols;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (rhs instanceof Matrix) {
			if (rhs.rows !== rows || rhs.cols !== cols || target.rows !== rows || target.cols !== cols) {
				throw { name: "Illegal Arguments", message: "The arguments are of incompatible sizes." };
			}

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] / rhs.data[i];
			}
		} else {
			if (target.rows !== rows || target.cols !== cols) {
				throw { name: "Illegal Arguments", message: "The arguments are of incompatible sizes." };
			}

			rhs = 1.0 / rhs;

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] * rhs;
			}
		}

		return target;
	};

	/**
	 * Performs a component-wise division.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @param {Matrix|number} rhs Matrix or scalar on the right-hand side.
	 * @return {Matrix} Self for chaining.
	 */
	Matrix.prototype.div = function (rhs) {
		return Matrix.div(this, rhs, this);
	};

	/* ====================================================================== */

	var combineWarning = false; // have to put them here so not to confuse jsdocs
	/**
	 * Combines two matrices (matrix multiplication) and stores the result in a separate matrix.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @return {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix.combine = function (lhs, rhs, target) {
		if (!combineWarning) {
			console.warn('Matrix.combine is deprecated; consider using the .combine method on Matrix2x2/3x3/4x4');
			combineWarning = true;
		}

		var rows = lhs.rows;
		var cols = rhs.cols;
		var size = lhs.cols = rhs.rows;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (lhs.cols !== size || rhs.rows !== size || target.rows !== rows || target.cols !== cols) {
			throw { name: "Illegal Arguments", message: "The arguments are of incompatible sizes." };
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
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @return {Matrix} Self for chaining.
	 */
	Matrix.prototype.combine = function (rhs) {
		return Matrix.combine(this, rhs, this);
	};

	/* ====================================================================== */

	var transposeWarning = false; // have to put them here so not to confuse jsdocs
	/**
	 * Transposes a matrix (exchanges rows and columns) and stores the result in a separate matrix.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @param {Matrix} source Source matrix.
	 * @param {Matrix} [target] Target matrix.
	 * @return {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix.transpose = function (source, target) {
		if (!transposeWarning) {
			console.warn('Matrix.transpose is deprecated; consider using the .transpose method on Matrix2x2/3x3/4x4');
			transposeWarning = true;
		}

		var rows = source.cols;
		var cols = source.rows;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (target.rows !== rows || target.cols !== cols) {
			throw { name: "Illegal Arguments", message: "The arguments are of incompatible sizes." };
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
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @return {Matrix} Self for chaining.
	 */
	Matrix.prototype.transpose = function () {
		return Matrix.transpose(this, this);
	};

	/* ====================================================================== */

	var copyWarning = false; // have to put them here so not to confuse jsdocs
	/**
	 * Copies component values and stores them in a separate matrix.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @param {Matrix} source Source matrix.
	 * @param {Matrix} [target] Target matrix.
	 * @return {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */
	Matrix.copy = function (source, target) {
		if (!copyWarning) {
			console.warn('Matrix.copy is deprecated; consider using the .copy method on Matrix2x2/3x3/4x4');
			copyWarning = true;
		}

		var rows = source.rows;
		var cols = source.cols;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (target.rows !== rows || target.cols !== cols) {
			throw { name: "Illegal Arguments", message: "The arguments are of incompatible sizes." };
		}

		target.data.set(source.data);

		return target;
	};

	/**
	 * Copies component values and stores them locally.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @param {Matrix} source Source matrix.
	 * @return {Matrix} Self for chaining.
	 */
	Matrix.prototype.copy = function (source) {
		return Matrix.copy(source, this);
	};

	/* ====================================================================== */

	/**
	 * Compares two matrices for approximate equality.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @return {boolean} True if equal.
	 */
	Matrix.equals = function (lhs, rhs) {
		if (lhs.rows !== rhs.rows || lhs.cols !== rhs.cols) {
			return false;
		}

		for (var i = 0; i < lhs.data.length; i++) {
			if (Math.abs(lhs.data[i] - rhs.data[i]) > MathUtils.EPSILON) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Compares two matrices for approximate equality.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @return {boolean} True if equal.
	 */
	Matrix.prototype.equals = function (rhs) {
		return Matrix.equals(this, rhs);
	};

	/* ====================================================================== */

	var isOrthogonalWarning = false; // have to put them here so not to confuse jsdocs
	/**
	 * Tests if the matrix is orthogonal.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @return {boolean} True if orthogonal.
	 */
	Matrix.prototype.isOrthogonal = function () {
		if (!isOrthogonalWarning) {
			console.warn('Matrix.isOrthogonal is deprecated; consider using the .isOrthogonal method on Matrix2x2/3x3/4x4');
			isOrthogonalWarning = true;
		}
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

	var isNormalWarning = false; // have to put them here so not to confuse jsdocs
	/**
	 * Tests if the matrix is normal.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @return {boolean} True if normal.
	 */
	Matrix.prototype.isNormal = function () {
		if (!isNormalWarning) {
			console.warn('Matrix.isNormal is deprecated; consider using the .isNormal method on Matrix2x2/3x3/4x4');
			isNormalWarning = true;
		}

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

	var isOrthonormalWarning = false; // have to put them here so not to confuse jsdocs
	/**
	 * Tests if the matrix is orthonormal.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @return {boolean} True if orthonormal.
	 */
	Matrix.prototype.isOrthonormal = function () {
		if (!isOrthonormalWarning) {
			console.warn('Matrix.isOrthonormal is deprecated; consider using the .isOrthonormal method on Matrix2x2/3x3/4x4');
			isOrthonormalWarning = true;
		}

		return this.isOrthogonal() && this.isNormal();
	};

	/* ====================================================================== */

	var cloneWarning = false; // have to put them here so not to confuse jsdocs
	/**
	 * Clones the matrix.
	 * @deprecated Deprecated as of 0.10.x and scheduled for removal in 0.12.0;
	 * @return {Matrix} Clone of self.
	 */
	Matrix.prototype.clone = function () {
		if (!cloneWarning) {
			console.warn('Matrix.clone is deprecated; consider using the .clone method on Matrix2x2/3x3/4x4');
			cloneWarning = true;
		}
		return Matrix.copy(this);
	};

	/* ====================================================================== */

	/**
	 * Sets the components of the matrix.
	 * @param {Matrix|number[]|number} arguments Component values.
	 * @return {Matrix} Self for chaining.
	 */
	Matrix.prototype.set = function () {
		if (arguments.length === 1 && typeof(arguments[0]) === "object") {
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
	 * @return {string} String of component values.
	 */
	Matrix.prototype.toString = function () {
		var string = "";

		for (var c = 0; c < this.cols; c++) {
			var offset = c * this.rows;

			string += "[";

			for (var r = 0; r < this.rows; r++) {
				string += this.data[offset + r];
				string += r !== this.rows - 1 ? ", " : "";
			}

			string += c !== this.cols - 1 ? "], " : "]";
		}

		return string;
	};

	/* ====================================================================== */

	return Matrix;
});

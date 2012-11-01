define([], function() {
	"use strict";

	/**
	 * @name Matrix
	 * @class Matrix with RxC components.
	 * @property {Float32Array} data Column-major storage for the matrix components.
	 * @constructor
	 * @description Creates a new matrix.
	 * @param {Integer} rows Number of rows.
	 * @param {Integer} cols Number of columns.
	 */

	function Matrix(rows, cols) {
		this.rows = rows || 0;
		this.cols = cols || 0;
		this.data = new Float32Array(this.rows * this.cols);
	}

	/**
	 * @description Binds aliases to the different matrix components.
	 * @param {String[][]} aliases Array of component aliases for each component index.
	 */

	Matrix.prototype.setupAliases = function(aliases) {
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
	 * @description Performs a component-wise addition between two matrices and stores the result in a separate matrix.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @param {Matrix} target Target matrix for storage. (optional)
	 * @returns {Matrix} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix.add = function(lhs, rhs, target) {
		if (!target || target.rows != lhs.rows || target.cols != lhs.cols) {
			target = new Matrix(lhs.rows, lhs.cols);
		}

		target.copy(lhs);

		for ( var c = 0; c < Math.min(lhs.cols, rhs.cols); c++) {
			var o = c * lhs.rows;

			for ( var r = 0; r < Math.min(lhs.rows, rhs.rows); r++) {
				target.data[o + r] += rhs.data[o + r];
			}
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise subtraction between two matrices and stores the result in a separate matrix.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @param {Matrix} target Target matrix for storage. (optional)
	 * @returns {Matrix} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix.sub = function(lhs, rhs, target) {
		if (!target || target.rows != lhs.rows || target.cols != lhs.cols) {
			target = new Matrix(lhs.rows, lhs.cols);
		}

		target.copy(lhs);

		for ( var c = 0; c < Math.min(lhs.cols, rhs.cols); c++) {
			var o = c * lhs.rows;

			for ( var r = 0; r < Math.min(lhs.rows, rhs.rows); r++) {
				target.data[o + r] -= rhs.data[o + r];
			}
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise multiplication between two matrices and stores the result in a separate matrix.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @param {Matrix} target Target matrix for storage. (optional)
	 * @returns {Matrix} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix.mul = function(lhs, rhs, target) {
		if (!target || target.rows != lhs.rows || target.cols != lhs.cols) {
			target = new Matrix(lhs.rows, lhs.cols);
		}

		target.copy(lhs);

		for ( var c = 0; c < Math.min(lhs.cols, rhs.cols); c++) {
			var o = c * lhs.rows;

			for ( var r = 0; r < Math.min(lhs.rows, rhs.rows); r++) {
				target.data[o + r] *= rhs.data[o + r];
			}
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise division between two matrices and stores the result in a separate matrix.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @param {Matrix} target Target matrix for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Matrix} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix.div = function(lhs, rhs, target) {
		if (!target || target.rows != lhs.rows || target.cols != lhs.cols) {
			target = new Matrix(lhs.rows, lhs.cols);
		}

		target.copy(lhs);

		var clean = true;

		for ( var c = 0; c < Math.min(lhs.cols, rhs.cols); c++) {
			var o = c * lhs.rows;

			for ( var r = 0; r < Math.min(lhs.rows, rhs.rows); r++) {
				target.data[o + r] = (clean &= (rhs.data[o + r] < 0.0 || rhs.data[o + r] > 0.0)) ? lhs.data[o + r] / rhs.data[o + r] : 0.0;
			}
		}

		if (clean == false) {
			console.warn("[Matrix.div] Attempted to divide by zero!");
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise addition between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix} target Target matrix for storage. (optional)
	 * @returns {Matrix} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix.scalarAdd = function(lhs, rhs, target) {
		if (!target || target.rows != lhs.rows || target.cols != lhs.cols) {
			target = new Matrix(lhs.rows, lhs.cols);
		}

		for ( var c = 0; c < lhs.cols; c++) {
			var o = c * lhs.rows;

			for ( var r = 0; r < lhs.rows; r++) {
				target.data[o + r] = lhs.data[o + r] + rhs;
			}
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise subtraction between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix} target Target matrix for storage. (optional)
	 * @returns {Matrix} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix.scalarSub = function(lhs, rhs, target) {
		if (!target || target.rows != lhs.rows || target.cols != lhs.cols) {
			target = new Matrix(lhs.rows, lhs.cols);
		}

		for ( var c = 0; c < lhs.cols; c++) {
			var o = c * lhs.rows;

			for ( var r = 0; r < lhs.rows; r++) {
				target.data[o + r] = lhs.data[o + r] - rhs;
			}
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise multiplication between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix} target Target matrix for storage. (optional)
	 * @returns {Matrix} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix.scalarMul = function(lhs, rhs, target) {
		if (!target || target.rows != lhs.rows || target.cols != lhs.cols) {
			target = new Matrix(lhs.rows, lhs.cols);
		}

		for ( var c = 0; c < lhs.cols; c++) {
			var o = c * lhs.rows;

			for ( var r = 0; r < lhs.rows; r++) {
				target.data[o + r] = lhs.data[o + r] * rhs;
			}
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise division between a matrix and a scalar and stores the result in a separate matrix.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @param {Matrix} target Target matrix for storage. (optional)
	 * @throws Outputs a warning in the console if attempting to divide by zero.
	 * @returns {Matrix} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix.scalarDiv = function(lhs, rhs, target) {
		if (!target || target.rows != lhs.rows || target.cols != lhs.cols) {
			target = new Matrix(lhs.rows, lhs.cols);
		}

		if (rhs < 0.0 || rhs > 0.0) {
			rhs = 1.0 / rhs;

			for ( var c = 0; c < lhs.cols; c++) {
				var o = c * lhs.rows;

				for ( var r = 0; r < lhs.rows; r++) {
					target.data[o + r] = lhs.data[o + r] * rhs;
				}
			}
		} else {
			console.warn("[Matrix.scalarDiv] Attempted to divide by zero!");

			target.copy(lhs);
		}

		return target;
	};

	/**
	 * @static
	 * @description Combines two matrices (matrix multiplication) and stores the result in a separate matrix.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @param {Matrix} target Target matrix for storage. (optional)
	 * @returns {Matrix} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix.combine = function(lhs, rhs, target) {
		if (lhs.cols === rhs.rows) {
			if (!target || target.rows !== lhs.rows || target.cols !== rhs.cols || target === lhs || target === rhs) {
				target = new Matrix(lhs.rows, rhs.cols);
			}

			for ( var c = 0; c < target.cols; c++) {
				var o = c * target.rows;

				for ( var r = 0; r < target.rows; r++) {
					var sum = 0.0;

					for ( var i = 0; i < lhs.cols; i++) {
						sum += lhs.data[i * lhs.rows + r] * rhs.data[c * rhs.rows + i];
					}

					target.data[o + r] = sum;
				}
			}

			return target;
		} else {
			console.warn("[Matrix.combine] Attempted to combine two non-matching matrices!");
		}
	};

	/**
	 * @static
	 * @description Copies component values from one matrix to another.
	 * @param {Matrix} source Source matrix.
	 * @param {Matrix} target Target matrix. (optional)
	 * @returns {Matrix} A new matrix if the target matrix cannot be used for storage, else the target matrix.
	 */

	Matrix.copy = function(source, target) {
		if (!target || target.rows != source.rows || target.cols != source.cols) {
			target = new Matrix(source.rows, source.cols);
		}

		target.data.set(source.data);

		return target;
	};

	/**
	 * @description Performs a component-wise addition between two matrices and stores the result locally.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @returns {Matrix} Self for chaining.
	 */

	Matrix.prototype.add = function(rhs) {
		return Matrix.add(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between two matrices and stores the result locally.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @returns {Matrix} Self for chaining.
	 */

	Matrix.prototype.sub = function(rhs) {
		return Matrix.sub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between two matrices and stores the result locally.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @returns {Matrix} Self for chaining.
	 */

	Matrix.prototype.mul = function(rhs) {
		return Matrix.mul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between two matrices and stores the result locally.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @returns {Matrix} Self for chaining.
	 */

	Matrix.prototype.div = function(rhs) {
		return Matrix.div(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise addition between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix} Self for chaining.
	 */

	Matrix.prototype.scalarAdd = function(rhs) {
		return Matrix.scalarAdd(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix} Self for chaining.
	 */

	Matrix.prototype.scalarSub = function(rhs) {
		return Matrix.scalarSub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix} Self for chaining.
	 */

	Matrix.prototype.scalarMul = function(rhs) {
		return Matrix.scalarMul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division between a matrix and a scalar and stores the result locally.
	 * @param {Float} rhs Scalar on the right-hand side.
	 * @returns {Matrix} Self for chaining.
	 */

	Matrix.prototype.scalarDiv = function(rhs) {
		return Matrix.scalarDiv(this, rhs, this);
	};

	/**
	 * @description Combines two matrices (matrix multiplication) and stores the result locally.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @returns {Matrix} Self for chaining.
	 */

	Matrix.prototype.combine = function(rhs) {
		return Matrix.combine(this, rhs, this);
	};

	/**
	 * @description Copies component values from one matrix to another.
	 * @param {Matrix} source Source matrix.
	 * @returns {Matrix} Self for chaining.
	 */

	Matrix.prototype.copy = function(source) {
		return Matrix.copy(source, this);
	};

	/**
	 * @description Sets the components of the matrix.
	 * @param {Float...} arguments Component values.
	 * @returns {Matrix} Self for chaining.
	 */

	Matrix.prototype.set = function() {
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
	 * @description Converts the matrix to a string.
	 * @returns {String} String of component values.
	 */

	Matrix.prototype.toString = function() {
		var string = "";

		for ( var c = 0; c < this.cols; c++) {
			var o = c * this.rows;

			string += "[";

			for ( var r = 0; r < this.rows; r++) {
				string += this.data[o + r];
				string += r !== this.rows - 1 ? "," : "";
			}

			string += c !== this.cols - 1 ? "], " : "]";
		}

		return string;
	};

	return Matrix;
});

define(["goo/math/MathUtils"], function(MathUtils) {
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
	 * @private
	 * @description Binds aliases to the different matrix components.
	 * @param {String[][]} aliases Array of component aliases for each component index.
	 */

	Matrix.prototype.setupAliases = function(aliases) {
		var that = this;

		for (var i = 0; i < aliases.length; i++) {
			(function(index) {
				for (var j = 0; j < aliases[index].length; j++) {
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
	 * @description Performs a component-wise addition.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|Float} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix.add = function(lhs, rhs, target) {
		var rows = lhs.rows;
		var cols = lhs.cols;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (rhs instanceof Matrix) {
			if (rhs.rows != rows || rhs.cols != cols || target.rows != rows || target.cols != cols) {
				throw { name : "Illegal Arguments", message : "The arguments are of incompatible sizes." };
			}

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] + rhs.data[i];
			}
		} else {
			if (target.rows != rows || target.cols != cols) {
				throw { name : "Illegal Arguments", message : "The arguments are of incompatible sizes." };
			}

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] + rhs;
			}
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise subtraction.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|Float} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix.sub = function(lhs, rhs, target) {
		var rows = lhs.rows;
		var cols = lhs.cols;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (rhs instanceof Matrix) {
			if (rhs.rows != rows || rhs.cols != cols || target.rows != rows || target.cols != cols) {
				throw { name : "Illegal Arguments", message : "The arguments are of incompatible sizes." };
			}

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] - rhs.data[i];
			}
		} else {
			if (target.rows != rows || target.cols != cols) {
				throw { name : "Illegal Arguments", message : "The arguments are of incompatible sizes." };
			}

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] - rhs;
			}
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise multiplication.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|Float} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix.mul = function(lhs, rhs, target) {
		var rows = lhs.rows;
		var cols = lhs.cols;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (rhs instanceof Matrix) {
			if (rhs.rows != rows || rhs.cols != cols || target.rows != rows || target.cols != cols) {
				throw { name : "Illegal Arguments", message : "The arguments are of incompatible sizes." };
			}

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] * rhs.data[i];
			}
		} else {
			if (target.rows != rows || target.cols != cols) {
				throw { name : "Illegal Arguments", message : "The arguments are of incompatible sizes." };
			}

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] * rhs;
			}
		}

		return target;
	};

	/**
	 * @static
	 * @description Performs a component-wise division.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix|Float} rhs Matrix or scalar on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix.div = function(lhs, rhs, target) {
		var rows = lhs.rows;
		var cols = lhs.cols;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (rhs instanceof Matrix) {
			if (rhs.rows != rows || rhs.cols != cols || target.rows != rows || target.cols != cols) {
				throw { name : "Illegal Arguments", message : "The arguments are of incompatible sizes." };
			}

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] / rhs.data[i];
			}
		} else {
			if (target.rows != rows || target.cols != cols) {
				throw { name : "Illegal Arguments", message : "The arguments are of incompatible sizes." };
			}

			rhs = 1.0 / rhs;

			for (var i = 0; i < lhs.data.length; i++) {
				target.data[i] = lhs.data[i] * rhs;
			}
		}

		return target;
	};

	/**
	 * @static
	 * @description Combines two matrices (matrix multiplication) and stores the result in a separate matrix.
	 * @param {Matrix} lhs Matrix on the left-hand side.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @param {Matrix} [target] Target matrix for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix.combine = function(lhs, rhs, target) {
		var rows = lhs.rows;
		var cols = rhs.cols;
		var size = lhs.cols = rhs.rows;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (lhs.cols != size || rhs.rows != size || target.rows != rows || target.cols != cols) {
			throw { name : "Illegal Arguments", message : "The arguments are of incompatible sizes." };
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
	 * @static
	 * @description Transposes a matrix (exchanges rows and columns) and stores the result in a separate matrix.
	 * @param {Matrix} source Source matrix.
	 * @param {Matrix} [target] Target matrix.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix.transpose = function(source, target) {
		var rows = source.cols;
		var cols = source.rows;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (target.rows != rows || target.cols != cols) {
			throw { name : "Illegal Arguments", message : "The arguments are of incompatible sizes." };
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
	 * @static
	 * @description Copies component values and stores them in a separate matrix.
	 * @param {Matrix} source Source matrix.
	 * @param {Matrix} [target] Target matrix.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Matrix} A new matrix if the target matrix is omitted, else the target matrix.
	 */

	Matrix.copy = function(source, target) {
		var rows = source.rows;
		var cols = source.cols;

		if (!target) {
			target = new Matrix(rows, cols);
		}

		if (target.rows != rows || target.cols != cols) {
			throw { name : "Illegal Arguments", message : "The arguments are of incompatible sizes." };
		}

		target.data.set(source.data);

		return target;
	};

	/**
	 * @description Performs a component-wise addition.
	 * @param {Matrix|Float} rhs Matrix or scalar on the right-hand side.
	 * @return {Matrix} Self for chaining.
	 */

	Matrix.prototype.add = function(rhs) {
		return Matrix.add(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise subtraction.
	 * @param {Matrix|Float} rhs Matrix or scalar on the right-hand side.
	 * @return {Matrix} Self for chaining.
	 */

	Matrix.prototype.sub = function(rhs) {
		return Matrix.sub(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise multiplication.
	 * @param {Matrix|Float} rhs Matrix or scalar on the right-hand side.
	 * @return {Matrix} Self for chaining.
	 */

	Matrix.prototype.mul = function(rhs) {
		return Matrix.mul(this, rhs, this);
	};

	/**
	 * @description Performs a component-wise division.
	 * @param {Matrix|Float} rhs Matrix or scalar on the right-hand side.
	 * @return {Matrix} Self for chaining.
	 */

	Matrix.prototype.div = function(rhs) {
		return Matrix.div(this, rhs, this);
	};

	/**
	 * @description Combines two matrices (matrix multiplication) and stores the result locally.
	 * @param {Matrix} rhs Matrix on the right-hand side.
	 * @return {Matrix} Self for chaining.
	 */

	Matrix.prototype.combine = function(rhs) {
		return Matrix.combine(this, rhs, this);
	};

	/**
	 * @description Transposes the matrix (exchanges rows and columns) and stores the result locally.
	 * @return {Matrix} Self for chaining.
	 */

	Matrix.prototype.transpose = function() {
		return Matrix.transpose(this, this);
	};

	/**
	 * @description Tests if the matrix is orthogonal.
	 * @return {Boolean} True if orthogonal.
	 */

	Matrix.prototype.isOrthogonal = function() {
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

	/**
	 * @description Tests if the matrix is normal.
	 * @return {Boolean} True if normal.
	 */

	Matrix.prototype.isNormal = function() {
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

	/**
	 * @description Tests if the matrix is orthonormal.
	 * @return {Boolean} True if orthonormal.
	 */

	Matrix.prototype.isOrthonormal = function() {
		return this.isOrthogonal() && this.isNormal();
	};

	/**
	 * @description Copies component values and stores them locally.
	 * @param {Matrix} source Source matrix.
	 * @return {Matrix} Self for chaining.
	 */

	Matrix.prototype.copy = function(source) {
		return Matrix.copy(source, this);
	};

	/**
	 * @description Clones the matrix.
	 * @return {Matrix} Clone of self.
	 */

	Matrix.prototype.clone = function() {
		return Matrix.copy(this);
	};

	/**
	 * @description Sets the components of the matrix.
	 * @param {Matrix|Float[]|Float} arguments Component values.
	 * @return {Matrix} Self for chaining.
	 */

	Matrix.prototype.set = function() {
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

	/**
	 * @description Converts the matrix into a string.
	 * @return {String} String of component values.
	 */

	Matrix.prototype.toString = function() {
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

	return Matrix;
});

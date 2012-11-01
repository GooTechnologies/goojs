define([], function() {
	"use strict";

	function Matrix(rows, cols) {
		this.rows = rows || 0;
		this.cols = cols || 0;
		this.data = new Float32Array(this.rows * this.cols);
	}

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

	Matrix.div = function(lhs, rhs, target) {
		if (!target || target.rows != lhs.rows || target.cols != lhs.cols) {
			target = new Matrix(lhs.rows, lhs.cols);
		}

		target.copy(lhs);

		for ( var c = 0; c < Math.min(lhs.cols, rhs.cols); c++) {
			var o = c * lhs.rows;

			for ( var r = 0; r < Math.min(lhs.rows, rhs.rows); r++) {
				if (rhs.data[o + r] < 0.0 || rhs.data[o + r] > 0.0) {
					target.data[o + r] /= rhs.data[o + r];
				}
			}
		}

		return target;
	};

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

	Matrix.copy = function(source, target) {
		if (!target || target.rows != source.rows || target.cols != source.cols) {
			target = new Matrix(source.rows, source.cols);
		}

		target.data.set(source.data);

		return target;
	};

	Matrix.prototype.add = function(rhs) {
		return Matrix.add(this, rhs, this);
	};

	Matrix.prototype.sub = function(rhs) {
		return Matrix.sub(this, rhs, this);
	};

	Matrix.prototype.mul = function(rhs) {
		return Matrix.mul(this, rhs, this);
	};

	Matrix.prototype.div = function(rhs) {
		return Matrix.div(this, rhs, this);
	};

	Matrix.prototype.scalarAdd = function(rhs) {
		return Matrix.scalarAdd(this, rhs, this);
	};

	Matrix.prototype.scalarSub = function(rhs) {
		return Matrix.scalarSub(this, rhs, this);
	};

	Matrix.prototype.scalarMul = function(rhs) {
		return Matrix.scalarMul(this, rhs, this);
	};

	Matrix.prototype.scalarDiv = function(rhs) {
		return Matrix.scalarDiv(this, rhs, this);
	};

	Matrix.prototype.copy = function(source) {
		return Matrix.copy(source, this);
	};

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

	Matrix.prototype.toString = function() {
		var string = "";

		for ( var c = 0; c < this.cols; c++) {
			var o = c * this.rows;

			string += "[";

			for ( var r = 0; r < this.rows; r++) {
				string += this.data[o + r];
				string += r !== this.rows - 1 ? "," : "";
			}

			string += c !== this.cols - 1 ? "]," : "]";
		}

		return string;
	};

	return Matrix;
});

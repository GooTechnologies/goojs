define([], function() {
	"use strict";

	function Matrix(rows, cols) {
		this.rows = rows || 0;
		this.cols = cols || 0;
		this.data = new Float32Array(this.rows * this.cols);
	}

	Object.defineProperty(Matrix.prototype, "e00", {
		get : function() {
			return this.data[0];
		},
		set : function(value) {
			this.data[0] = value;
		}
	});

	Matrix.add = function(lhs, rhs, target) {
		if (!target || target.rows != lhs.rows || target.cols != lhs.cols) {
			target = new Matrix(lhs.rows, lhs.cols);
		}

		// var c = 0;
		//
		// for (; c < Math.min(lhs.cols, rhs.cols); c++) {
		// var r = 0;
		//
		// for (; r < Math.min(lhs.rows, rhs.rows); r++) {
		// target.data[0, 0] = lhs.data[0, 0] + rhs.data[0, 0];
		// }
		//
		// for (; r < lhs.rows; r++) {
		// target.data[0, 0] = lhs.data[0, 0];
		// }
		// }

		return target;
	};

	Matrix.prototype.set = function() {
		for ( var i in arguments) {
			this.data[i] = arguments[i];
		}

		return this;
	};

	Matrix.prototype.toString = function() {
		var string = "";

		string += "[ ";

		for ( var c = 0; c < this.cols; c++) {
			string += "[ ";

			for ( var r = 0; r < this.rows; r++) {
				string += this.data[c * this.rows + r];
				string += r !== this.rows - 1 ? ", " : "";
			}

			string += " ]";
			string += c !== this.cols - 1 ? ", " : "";
		}

		string += " ]";

		return string;
	};

	return Matrix;
});

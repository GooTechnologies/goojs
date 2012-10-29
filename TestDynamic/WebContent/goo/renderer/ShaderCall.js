define(function() {
	"use strict";

	function ShaderCall(context, uniform) {
		this.context = context;
		this.location = uniform;

		// this.currentRecord = null;
	}

	ShaderCall.prototype.uniform1f = function(v0) {
		var curValue = this.location.value;
		if (curValue === v0) {
			return;
		}
		this.context.uniform1f(this.location, v0);
		this.location.value = v0;
	};

	ShaderCall.prototype.uniform1fv = function(values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.context.uniform1fv(this.location, values);
		this.location.value = values;
	};

	ShaderCall.prototype.uniform1i = function(v0) {
		var curValue = this.location.value;
		if (curValue === v0) {
			return;
		}
		this.context.uniform1i(this.location, v0);
		this.location.value = v0;
	};

	ShaderCall.prototype.uniform1iv = function(values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.context.uniform1iv(this.location, values);
		this.location.value = values;
	};

	ShaderCall.prototype.uniform2f = function(v0, v1) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (curValue.length === 2 && curValue[0] === v0 && curValue[1] === v1) {
				return;
			}
		}
		this.context.uniform2f(this.location, v0, v1);
		this.location.value = [v0, v1];
	};

	ShaderCall.prototype.uniform2fv = function(values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.context.uniform2fv(this.location, values);
		this.location.value = values;
	};

	ShaderCall.prototype.uniform2i = function(v0, v1) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (curValue.length === 2 && curValue[0] === v0 && curValue[1] === v1) {
				return;
			}
		}
		this.context.uniform2i(this.location, v0, v1);
		this.location.value = [v0, v1];
	};

	ShaderCall.prototype.uniform2iv = function(values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.context.uniform2iv(this.location, values);
		this.location.value = values;
	};

	ShaderCall.prototype.uniform3f = function(v0, v1, v2) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (curValue.length === 3 && curValue[0] === v0 && curValue[1] === v1 && curValue[2] === v2) {
				return;
			}
		}
		this.context.uniform3f(this.location, v0, v1, v2);
		this.location.value = [v0, v1, v2];
	};

	ShaderCall.prototype.uniform3fv = function(values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.context.uniform3fv(this.location, values);
		this.location.value = values;
	};

	ShaderCall.prototype.uniform3i = function(v0, v1, v2) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (curValue.length === 3 && curValue[0] === v0 && curValue[1] === v1 && curValue[2] === v2) {
				return;
			}
		}
		this.context.uniform3i(this.location, v0, v1, v2);
		this.location.value = [v0, v1, v2];
	};

	ShaderCall.prototype.uniform3iv = function(values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.context.uniform3iv(this.location, values);
		this.location.value = values;
	};

	ShaderCall.prototype.uniform4f = function(v0, v1, v2, v3) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (curValue.length === 4 && curValue[0] === v0 && curValue[1] === v1 && curValue[2] === v2
				&& curValue[3] === v3) {
				return;
			}
		}
		this.context.uniform4f(this.location, v0, v1, v2, v3);
		this.location.value = [v0, v1, v2, v3];
	};

	ShaderCall.prototype.uniform4fv = function(values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.context.uniform4fv(this.location, values);
		this.location.value = values;
	};

	ShaderCall.prototype.uniform4i = function(v0, v1, v2, v3) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (curValue.length === 4 && curValue[0] === v0 && curValue[1] === v1 && curValue[2] === v2
				&& curValue[3] === v3) {
				return;
			}
		}
		this.context.uniform4i(this.location, v0, v1, v2, v3);
		this.location.value = [v0, v1, v2, v3];
	};

	ShaderCall.prototype.uniform4iv = function(values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.context.uniform4iv(this.location, values);
		this.location.value = values;
	};

	function compareMatrices(e1, e2, size) {
		var equals = true;
		for ( var i = 0; i < size; i++) {
			if (Math.abs(e1[i] - e2[i]) > 0.00000001) {
				equals = false;
				break;
			}
		}
		return equals;
	}

	// NOTE: optimize check before calling.
	ShaderCall.prototype.uniformMatrix2fv = function(transpose, value) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			var equals = compareMatrices(curValue.elements, matrix.elements, 4);
			if (equals) {
				return;
			} else {
				curValue.copy(matrix);
			}
		} else {
			this.location.value = matrix.clone();
		}

		this.context.uniformMatrix2fv(this.location, transpose, matrix.elements);
	};

	// NOTE: optimize check before calling.
	ShaderCall.prototype.uniformMatrix3fv = function(transpose, value) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			var equals = compareMatrices(curValue.elements, matrix.elements, 9);
			if (equals) {
				return;
			} else {
				curValue.copy(matrix);
			}
		} else {
			this.location.value = matrix.clone();
		}

		this.context.uniformMatrix3fv(this.location, transpose, matrix.elements);
	};

	// NOTE: optimize check before calling.
	ShaderCall.prototype.uniformMatrix4fv = function(transpose, matrix) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			var equals = compareMatrices(curValue.elements, matrix.elements, 16);
			if (equals) {
				return;
			} else {
				curValue.copy(matrix);
			}
		} else {
			this.location.value = matrix.clone();
		}

		this.context.uniformMatrix4fv(this.location, transpose, matrix.elements);
	};

	return ShaderCall;
});
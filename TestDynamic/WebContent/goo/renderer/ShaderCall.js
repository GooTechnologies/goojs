define(function() {
	"use strict";

	/**
	 * @name ShaderCall
	 * @class Makes sure shader calls are not done when already set
	 */
	function ShaderCall(context, uniform, type) {
		this.context = context;
		this.location = uniform;

		if (type) {
			switch (type) {
				case 'float':
					this.typeCall = this.uniform1f;
					break;
				case 'bool':
				case 'int':
				case 'integer':
				case 'sampler2D':
				case 'sampler3D':
				case 'samplerCube':
					this.typeCall = this.uniform1i;
					break;
				case 'floatarray':
					this.typeCall = this.uniform1fv;
					break;
				case 'intarray':
					this.typeCall = this.uniform1iv;
					break;
				case 'vec2':
					this.typeCall = this.uniform2fv;
					break;
				case 'vec3':
					this.typeCall = this.uniform3fv;
					break;
				case 'vec4':
					this.typeCall = this.uniform4fv;
					break;
				case 'mat2':
					this.typeCall = this.uniformMatrix2fv;
					break;
				case 'mat3':
					this.typeCall = this.uniformMatrix3fv;
					break;
				case 'mat4':
					this.typeCall = this.uniformMatrix4fv;
					break;
				default:
					throw 'Uniform type not handled: ' + type;
			}
		}
	}

	ShaderCall.prototype.call = function(value) {
		this.typeCall(value);
	};

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
			if (compareArrays(values, curValue)) {
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
			if (compareArrays(values, curValue)) {
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
			if (compareArrays(values, curValue)) {
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
			if (compareArrays(values, curValue)) {
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
			if (compareArrays(values, curValue)) {
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
			if (compareArrays(values, curValue)) {
				return;
			}
		}
		this.context.uniform3iv(this.location, values);
		this.location.value = values;
	};

	ShaderCall.prototype.uniform4f = function(v0, v1, v2, v3) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (curValue.length === 4 && curValue[0] === v0 && curValue[1] === v1 && curValue[2] === v2 && curValue[3] === v3) {
				return;
			}
		}
		this.context.uniform4f(this.location, v0, v1, v2, v3);
		this.location.value = [v0, v1, v2, v3];
	};

	ShaderCall.prototype.uniform4fv = function(values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (compareArrays(values, curValue)) {
				return;
			}
		}
		this.context.uniform4fv(this.location, values);
		this.location.value = values;
	};

	ShaderCall.prototype.uniform4i = function(v0, v1, v2, v3) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (curValue.length === 4 && curValue[0] === v0 && curValue[1] === v1 && curValue[2] === v2 && curValue[3] === v3) {
				return;
			}
		}
		this.context.uniform4i(this.location, v0, v1, v2, v3);
		this.location.value = [v0, v1, v2, v3];
	};

	ShaderCall.prototype.uniform4iv = function(values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (compareArrays(values, curValue)) {
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

	function compareArrays(a1, a2) {
		var l = a1.length;
		if (l !== a2.length) {
			return false;
		}

		for ( var i = 0; i < l; i++) {
			if (a1[i] !== a2[i]) {
				return false;
			}
		}

		return true;
	}

	// NOTE: optimize check before calling.
	ShaderCall.prototype.uniformMatrix2fv = function(matrix, transpose) {
		transpose = transpose === true;
		if (!matrix.data) {
			this.context.uniformMatrix2fv(this.location, transpose, matrix);
			return;
		}

		var curValue = this.location.value;
		if (curValue !== undefined) {
			var equals = compareMatrices(curValue.data, matrix.data, 4);
			if (equals) {
				return;
			} else {
				curValue.copy(matrix);
			}
		} else {
			this.location.value = matrix.clone();
		}

		this.context.uniformMatrix2fv(this.location, transpose, matrix.data);
	};

	// NOTE: optimize check before calling.
	ShaderCall.prototype.uniformMatrix3fv = function(matrix, transpose) {
		transpose = transpose === true;
		if (!matrix.data) {
			this.context.uniformMatrix3fv(this.location, transpose, matrix);
			return;
		}

		var curValue = this.location.value;
		if (curValue !== undefined) {
			var equals = compareMatrices(curValue.data, matrix.data, 9);
			if (equals) {
				return;
			} else {
				curValue.copy(matrix);
			}
		} else {
			this.location.value = matrix.clone();
		}

		this.context.uniformMatrix3fv(this.location, transpose, matrix.data);
	};

	// NOTE: optimize check before calling.
	ShaderCall.prototype.uniformMatrix4fv = function(matrix, transpose) {
		transpose = transpose === true;
		if (!matrix.data) {
			this.context.uniformMatrix4fv(this.location, transpose, matrix);
			return;
		}

		var curValue = this.location.value;
		if (curValue !== undefined) {
			var equals = compareMatrices(curValue.data, matrix.data, 16);
			if (equals) {
				return;
			} else {
				curValue.copy(matrix);
			}
		} else {
			this.location.value = matrix.clone();
		}

		this.context.uniformMatrix4fv(this.location, transpose, matrix.data);
	};

	return ShaderCall;
});
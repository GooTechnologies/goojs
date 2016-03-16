

	/**
	 * Makes sure shader calls are not done when already set
	 */
	function ShaderCall(context, uniform, type) {
		this.context = context;
		this.location = uniform;
		this.location.value = undefined;

		if (type) {
			switch (type) {
				case 'float':
					this.call = this.uniform1f;
					break;
				case 'bool':
				case 'int':
				case 'integer':
				case 'sampler2D':
				case 'sampler3D':
				case 'samplerCube':
					this.call = this.uniform1i;
					break;
				case 'floatarray':
					this.call = this.uniform1fv;
					break;
				case 'intarray':
				case 'samplerArray':
					this.call = this.uniform1iv;
					break;
				case 'ivec2':
					this.call = this.uniform2iv;
					break;
				case 'ivec3':
					this.call = this.uniform3iv;
					break;
				case 'ivec4':
					this.call = this.uniform4iv;
					break;
				case 'vec2':
					this.call = this.uniform2fv;
					break;
				case 'vec3':
					this.call = this.uniform3fv;
					break;
				case 'vec4':
					this.call = this.uniform4fv;
					break;
				case 'mat2':
					this.call = this.uniformMatrix2fv;
					break;
				case 'mat3':
					this.call = this.uniformMatrix3fv;
					break;
				case 'mat4':
					this.call = this.uniformMatrix4fv;
					break;
				default:
					throw new Error('Uniform type not handled: ' + type);
			}
		}
	}

	ShaderCall.prototype.uniform1f = function (v0) {
		var curValue = this.location.value;
		if (curValue === v0) {
			return;
		}
		this.context.uniform1f(this.location, v0);
		this.location.value = v0;
	};

	ShaderCall.prototype.uniform1fv = function (values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (compareArrays(values, curValue)) {
				return;
			}
		}
		this.context.uniform1fv(this.location, values);
		this.location.value = values.slice();
	};

	ShaderCall.prototype.uniform1i = function (v0) {
		var curValue = this.location.value;
		if (curValue === v0) {
			return;
		}
		this.context.uniform1i(this.location, v0);
		this.location.value = v0;
	};

	ShaderCall.prototype.uniform1iv = function (values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (compareArrays(values, curValue)) {
				return;
			}
		}
		this.context.uniform1iv(this.location, values);
		this.location.value = values.slice();
	};

	ShaderCall.prototype.uniform2f = function (v0, v1) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (curValue[0] === v0 && curValue[1] === v1) {
				return;
			}
		}
		this.context.uniform2f(this.location, v0, v1);
		this.location.value = [v0, v1];
	};

	ShaderCall.prototype.uniform2fv = function (values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (compareArrays(values, curValue)) {
				return;
			}
		} else {
			curValue = this.location.value = new Float64Array(values.length);
		}
		this.context.uniform2fv(this.location, values);
		var l = values.length;
		while (l--) {
			curValue[l] = values[l];
		}
	};

	ShaderCall.prototype.uniform2i = function (v0, v1) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (curValue[0] === v0 && curValue[1] === v1) {
				return;
			}
		}
		this.context.uniform2i(this.location, v0, v1);
		this.location.value = [v0, v1];
	};

	ShaderCall.prototype.uniform2iv = function (values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (compareArrays(values, curValue)) {
				return;
			}
		}
		this.context.uniform2iv(this.location, values);
		this.location.value = values.slice();
	};

	ShaderCall.prototype.uniform3f = function (v0, v1, v2) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (curValue[0] === v0 && curValue[1] === v1 && curValue[2] === v2) {
				return;
			}
		} else {
			curValue = this.location.value = [];
		}
		this.context.uniform3f(this.location, v0, v1, v2);
		curValue[0] = v0;
		curValue[1] = v1;
		curValue[2] = v2;
	};

	ShaderCall.prototype.uniform3fv = function (values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (compareArrays(values, curValue)) {
				return;
			}
		} else {
			curValue = this.location.value = new Float64Array(values.length);
		}
		this.context.uniform3fv(this.location, values);
		var l = values.length;
		while (l--) {
			curValue[l] = values[l];
		}
	};

	ShaderCall.prototype.uniform3i = function (v0, v1, v2) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (curValue[0] === v0 && curValue[1] === v1 && curValue[2] === v2) {
				return;
			}
		}
		this.context.uniform3i(this.location, v0, v1, v2);
		this.location.value = [v0, v1, v2];
	};

	ShaderCall.prototype.uniform3iv = function (values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (compareArrays(values, curValue)) {
				return;
			}
		}
		this.context.uniform3iv(this.location, values);
		this.location.value = values.slice();
	};

	ShaderCall.prototype.uniform4f = function (v0, v1, v2, v3) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (curValue[0] === v0 && curValue[1] === v1 && curValue[2] === v2 && curValue[3] === v3) {
				return;
			}
		}
		this.context.uniform4f(this.location, v0, v1, v2, v3);
		this.location.value = [v0, v1, v2, v3];
	};

	ShaderCall.prototype.uniform4fv = function (values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (compareArrays(values, curValue)) {
				return;
			}
		} else {
			curValue = this.location.value = new Float64Array(values.length);
		}
		this.context.uniform4fv(this.location, values);
		var l = values.length;
		while (l--) {
			curValue[l] = values[l];
		}
	};

	ShaderCall.prototype.uniform4i = function (v0, v1, v2, v3) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (curValue[0] === v0 && curValue[1] === v1 && curValue[2] === v2 && curValue[3] === v3) {
				return;
			}
		}
		this.context.uniform4i(this.location, v0, v1, v2, v3);
		this.location.value = [v0, v1, v2, v3];
	};

	ShaderCall.prototype.uniform4iv = function (values) {
		var curValue = this.location.value;
		if (curValue !== undefined) {
			if (compareArrays(values, curValue)) {
				return;
			}
		}
		this.context.uniform4iv(this.location, values);
		this.location.value = values.slice();
	};

	function compareArrays(a1, a2) {
		var l = a1.length;
		while (l--) {
			if (a1[l] !== a2[l]) {
				return false;
			}
		}
		return true;
	}

	// NOTE: optimize check before calling.
	ShaderCall.prototype.uniformMatrix2fv = function (matrix, transpose) {
		transpose = transpose === true;
		if (!matrix.data) {
			var values = matrix;
			var curValue = this.location.value;
			if (curValue !== undefined) {
				if (compareArrays(values, curValue)) {
					return;
				}
			} else {
				curValue = this.location.value = new Float64Array(values.length);
			}
			this.context.uniformMatrix2fv(this.location, transpose, values);
			var l = values.length;
			while (l--) {
				curValue[l] = values[l];
			}
			return;
		}

		var curValue = this.location.value;
		if (curValue !== undefined) {
			var equals = compareArrays(curValue.data, matrix.data);
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
	ShaderCall.prototype.uniformMatrix3fv = function (matrix, transpose) {
		transpose = transpose === true;
		if (!matrix.data) {
			var values = matrix;
			var curValue = this.location.value;
			if (curValue !== undefined) {
				if (compareArrays(values, curValue)) {
					return;
				}
			} else {
				curValue = this.location.value = new Float64Array(values.length);
			}
			this.context.uniformMatrix3fv(this.location, transpose, values);
			var l = values.length;
			while (l--) {
				curValue[l] = values[l];
			}
			return;
		}

		var curValue = this.location.value;
		if (curValue !== undefined) {
			var equals = compareArrays(curValue.data, matrix.data);
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

	ShaderCall.prototype.uniformMatrix4fv = function (matrix, transpose) {
		transpose = transpose === true;
		if (!matrix.data) {
			var values = matrix;
			var curValue = this.location.value;
			if (curValue !== undefined) {
				if (compareArrays(values, curValue)) {
					return;
				}
			} else {
				curValue = this.location.value = new Float64Array(values.length);
			}
			this.context.uniformMatrix4fv(this.location, transpose, values);
			var l = values.length;
			while (l--) {
				curValue[l] = values[l];
			}
			return;
		}

		var curValue = this.location.value;
		if (curValue !== undefined) {
			var equals = compareArrays(curValue.data, matrix.data);
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

	export default ShaderCall;
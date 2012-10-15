define(function() {
	function ShaderCall(glContext) {
		this.glContext = glContext;

		this.location = null;
		this.currentRecord = null;
	}

	ShaderCall.prototype.uniform1f = function(v0) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue === v0) {
			return;
		}
		this.glContext.uniform1f(this.location, v0);
		this.currentRecord.put(this.location, v0);
	};

	ShaderCall.prototype.uniform1fv = function(values) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue != null) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.glContext.uniform1fv(this.location, values);
		this.currentRecord.put(this.location, values);
	};

	ShaderCall.prototype.uniform1i = function(v0) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue === v0) {
			return;
		}
		this.glContext.uniform1i(this.location, v0);
		this.currentRecord.put(this.location, v0);
	};

	ShaderCall.prototype.uniform1iv = function(values) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue != null) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.glContext.uniform1iv(this.location, values);
		this.currentRecord.put(this.location, values);
	};

	ShaderCall.prototype.uniform2f = function(v0, v1) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue != null) {
			if (curValue.length == 2 && curValue[0] == v0 && curValue[1] == v1) {
				return;
			}
		}
		this.glContext.uniform2f(this.location, v0, v1);
		this.currentRecord.put(this.location, [ v0, v1 ]);
	};

	ShaderCall.prototype.uniform2fv = function(values) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue != null) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.glContext.uniform2fv(this.location, values);
		this.currentRecord.put(this.location, values);
	};

	ShaderCall.prototype.uniform2i = function(v0, v1) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue != null) {
			if (curValue.length == 2 && curValue[0] == v0 && curValue[1] == v1) {
				return;
			}
		}
		this.glContext.uniform2i(this.location, v0, v1);
		this.currentRecord.put(this.location, [ v0, v1 ]);
	};

	ShaderCall.prototype.uniform2iv = function(values) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue != null) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.glContext.uniform2iv(this.location, values);
		this.currentRecord.put(this.location, values);
	};

	ShaderCall.prototype.uniform3f = function(v0, v1, v2) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue != null) {
			if (curValue.length == 3 && curValue[0] == v0 && curValue[1] == v1 && curValue[2] == v2) {
				return;
			}
		}
		this.glContext.uniform3f(this.location, v0, v1, v2);
		this.currentRecord.put(this.location, [ v0, v1, v2 ]);
	};

	ShaderCall.prototype.uniform3fv = function(values) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue != null) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.glContext.uniform3fv(this.location, values);
		this.currentRecord.put(this.location, values);
	};

	ShaderCall.prototype.uniform3i = function(v0, v1, v2) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue != null) {
			if (curValue.length == 3 && curValue[0] == v0 && curValue[1] == v1 && curValue[2] == v2) {
				return;
			}
		}
		this.glContext.uniform3i(this.location, v0, v1, v2);
		this.currentRecord.put(this.location, [ v0, v1, v2 ]);
	};

	ShaderCall.prototype.uniform3iv = function(values) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue != null) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.glContext.uniform3iv(this.location, values);
		this.currentRecord.put(this.location, values);
	};

	ShaderCall.prototype.uniform4f = function(v0, v1, v2, v3) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue != null) {
			if (curValue.length == 4 && curValue[0] == v0 && curValue[1] == v1 && curValue[2] == v2
					&& curValue[3] == v3) {
				return;
			}
		}
		this.glContext.uniform4f(this.location, v0, v1, v2, v3);
		this.currentRecord.put(this.location, [ v0, v1, v2, v3 ]);
	};

	ShaderCall.prototype.uniform4fv = function(values) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue != null) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.glContext.uniform4fv(this.location, values);
		this.currentRecord.put(this.location, values);
	};

	ShaderCall.prototype.uniform4i = function(v0, v1, v2, v3) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue != null) {
			if (curValue.length == 4 && curValue[0] == v0 && curValue[1] == v1 && curValue[2] == v2
					&& curValue[3] == v3) {
				return;
			}
		}
		this.glContext.uniform4i(this.location, v0, v1, v2, v3);
		this.currentRecord.put(this.location, [ v0, v1, v2, v3 ]);
	};

	ShaderCall.prototype.uniform4iv = function(values) {
		var curValue = this.currentRecord.get(this.location);
		if (curValue != null) {
			if (Arrays.equals(values, curValue)) {
				return;
			}
		}
		this.glContext.uniform4iv(this.location, values);
		this.currentRecord.put(this.location, values);
	};

	// NOTE: optimize check before calling.
	ShaderCall.prototype.uniformMatrix2fv = function(transpose, value) {
		this.glContext.uniformMatrix2fv(this.location, transpose, value);
	};

	// NOTE: optimize check before calling.
	ShaderCall.prototype.uniformMatrix2fv = function(transpose, value) {
		this.glContext.uniformMatrix2fv(this.location, transpose, value);
	};

	// NOTE: optimize check before calling.
	ShaderCall.prototype.uniformMatrix3fv = function(transpose, value) {
		this.glContext.uniformMatrix3fv(this.location, transpose, value);
	};

	// NOTE: optimize check before calling.
	ShaderCall.prototype.uniformMatrix3fv = function(transpose, value) {
		this.glContext.uniformMatrix3fv(this.location, transpose, value);
	};

	// NOTE: optimize check before calling.
	ShaderCall.prototype.uniformMatrix4fv = function(transpose, value) {
		this.glContext.uniformMatrix4fv(this.location, transpose, value);
	};

	// NOTE: optimize check before calling.
	ShaderCall.prototype.uniformMatrix4fv = function(transpose, value) {
		this.glContext.uniformMatrix4fv(this.location, transpose, value);
	};

	return ShaderCall;
});
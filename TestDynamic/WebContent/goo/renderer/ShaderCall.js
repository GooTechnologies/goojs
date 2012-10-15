define(function() {
	function ShaderCall(glContext) {
		this.glContext = glContext;

		this.location = null;
		this.currentRecord = null;
	}

	ShaderCall.prototype.uniform1f = function(v0) {
		var curValue = this.currentRecord.boundValues.get(location);
		if (curValue === v0) {
			return;
		}
		this.glContext.uniform1f(location, v0);
		this.currentRecord.boundValues.put(location, v0);
	};

	// ShaderCall.prototype.uniform1fv = function( values) {
	// Object curValue = currentRecord.boundValues.get(location);
	// if (curValue != null) {
	// try {
	// if (Arrays.equals(values, () curValue)) {
	// return;
	// }
	// } catch (Exception e) {
	// }
	// }
	// glContext.uniform1fv(location, values);
	// currentRecord.boundValues.put(location, values);
	// }
	//
	//    
	// ShaderCall.prototype.uniform1i = function(int v0) {
	// Object curValue = currentRecord.boundValues.get(location);
	// if (curValue instanceof Integer && ((Integer) curValue).intValue() == v0)
	// {
	// return;
	// }
	// glContext.uniform1i(location, v0);
	// currentRecord.boundValues.put(location, v0);
	// }
	//
	//    
	// // NOTE: optimize check before calling.
	// ShaderCall.prototype.uniform1iv = function(Int v) {
	// glContext.uniform1iv(location, v);
	// }
	//
	//    
	// ShaderCall.prototype.uniform1iv = function(int values) {
	// Object curValue = currentRecord.boundValues.get(location);
	// if (curValue != null) {
	// try {
	// if (Arrays.equals(values, (int) curValue)) {
	// return;
	// }
	// } catch (Exception e) {
	// }
	// }
	// glContext.uniform1iv(location, values);
	// int copy = new int[values.length];
	// System.arraycopy(values, 0, copy, 0, values.length);
	// currentRecord.boundValues.put(location, copy);
	// }
	//
	//    
	// ShaderCall.prototype.uniform2f = function( v0, v1) {
	// Object curValue = currentRecord.boundValues.get(location);
	// if (curValue != null) {
	// try {
	// oldArray = () curValue;
	// if (oldArray.length == 2 && oldArray[0] == v0 && oldArray[1] == v1) {
	// return;
	// }
	// } catch (Exception e) {
	// }
	// }
	// glContext.uniform2f(location, v0, v1);
	// currentRecord.boundValues.put(location, new { v0, v1 });
	// }
	//
	//    
	// // NOTE: optimize check before calling.
	// ShaderCall.prototype.uniform2fv = function( v) {
	// glContext.uniform2fv(location, v);
	// }
	//
	//    
	// ShaderCall.prototype.uniform2fv = function( values) {
	// Object curValue = currentRecord.boundValues.get(location);
	// if (curValue != null) {
	// try {
	// if (Arrays.equals(values, () curValue)) {
	// return;
	// }
	// } catch (Exception e) {
	// }
	// }
	// glContext.uniform2fv(location, values);
	// copy = new [values.length];
	// System.arraycopy(values, 0, copy, 0, values.length);
	// currentRecord.boundValues.put(location, copy);
	// }
	//
	//    
	// ShaderCall.prototype.uniform2i = function(int v0, int v1) {
	// Object curValue = currentRecord.boundValues.get(location);
	// if (curValue != null) {
	// try {
	// int oldArray = (int) curValue;
	// if (oldArray.length == 2 && oldArray[0] == v0 && oldArray[1] == v1) {
	// return;
	// }
	// } catch (Exception e) {
	// }
	// }
	// glContext.uniform2i(location, v0, v1);
	// currentRecord.boundValues.put(location, new int { v0, v1 });
	// }
	//
	//    
	// // NOTE: optimize check before calling.
	// ShaderCall.prototype.uniform2iv = function(Int v) {
	// glContext.uniform2iv(location, v);
	// }
	//
	//    
	// ShaderCall.prototype.uniform2iv = function(int values) {
	// Object curValue = currentRecord.boundValues.get(location);
	// if (curValue != null) {
	// try {
	// if (Arrays.equals(values, (int) curValue)) {
	// return;
	// }
	// } catch (Exception e) {
	// }
	// }
	// glContext.uniform2iv(location, values);
	// int copy = new int[values.length];
	// System.arraycopy(values, 0, copy, 0, values.length);
	// currentRecord.boundValues.put(location, copy);
	// }
	//
	//    
	// ShaderCall.prototype.uniform3f = function( v0, v1, v2) {
	// Object curValue = currentRecord.boundValues.get(location);
	// if (curValue != null) {
	// try {
	// oldArray = () curValue;
	// if (oldArray.length == 3 && oldArray[0] == v0 && oldArray[1] == v1 &&
	// oldArray[2] == v2) {
	// return;
	// }
	// } catch (Exception e) {
	// }
	// }
	// glContext.uniform3f(location, v0, v1, v2);
	// currentRecord.boundValues.put(location, new { v0, v1, v2 });
	// }
	//
	//    
	// // NOTE: optimize check before calling.
	// ShaderCall.prototype.uniform3fv = function( v) {
	// glContext.uniform3fv(location, v);
	// }
	//
	//    
	// ShaderCall.prototype.uniform3fv = function( values) {
	// Object curValue = currentRecord.boundValues.get(location);
	// if (curValue != null) {
	// try {
	// if (Arrays.equals(values, () curValue)) {
	// return;
	// }
	// } catch (Exception e) {
	// }
	// }
	// glContext.uniform3fv(location, values);
	// copy = new [values.length];
	// System.arraycopy(values, 0, copy, 0, values.length);
	// currentRecord.boundValues.put(location, copy);
	// }
	//
	//    
	// ShaderCall.prototype.uniform3i = function(int v0, int v1, int v2) {
	// Object curValue = currentRecord.boundValues.get(location);
	// if (curValue != null) {
	// try {
	// int oldArray = (int) curValue;
	// if (oldArray.length == 3 && oldArray[0] == v0 && oldArray[1] == v1 &&
	// oldArray[2] == v2) {
	// return;
	// }
	// } catch (Exception e) {
	// }
	// }
	// glContext.uniform3i(location, v0, v1, v2);
	// currentRecord.boundValues.put(location, new int { v0, v1, v2 });
	// }
	//
	//    
	// ShaderCall.prototype.uniform3iv = function(int values) {
	// Object curValue = currentRecord.boundValues.get(location);
	// if (curValue != null) {
	// try {
	// if (Arrays.equals(values, (int) curValue)) {
	// return;
	// }
	// } catch (Exception e) {
	// }
	// }
	// glContext.uniform3iv(location, values);
	// int copy = new int[values.length];
	// System.arraycopy(values, 0, copy, 0, values.length);
	// currentRecord.boundValues.put(location, copy);
	// }
	//
	//    
	// ShaderCall.prototype.uniform4f = function( v0, v1, v2, v3) {
	// Object curValue = currentRecord.boundValues.get(location);
	// if (curValue != null) {
	// try {
	// oldArray = () curValue;
	// if (oldArray.length == 4 && oldArray[0] == v0 && oldArray[1] == v1 &&
	// oldArray[2] == v2
	// && oldArray[3] == v3) {
	// return;
	// }
	// } catch (Exception e) {
	// }
	// }
	// glContext.uniform4f(location, v0, v1, v2, v3);
	// currentRecord.boundValues.put(location, new { v0, v1, v2, v3 });
	// }
	//
	//    
	// // NOTE: optimize check before calling.
	// ShaderCall.prototype.uniform4fv = function( v) {
	// glContext.uniform4fv(location, v);
	// }
	//
	//    
	// ShaderCall.prototype.uniform4fv = function( values) {
	// Object curValue = currentRecord.boundValues.get(location);
	// if (curValue != null) {
	// try {
	// if (Arrays.equals(values, () curValue)) {
	// return;
	// }
	// } catch (Exception e) {
	// }
	// }
	// glContext.uniform4fv(location, values);
	// copy = new [values.length];
	// System.arraycopy(values, 0, copy, 0, values.length);
	// currentRecord.boundValues.put(location, copy);
	// }
	//
	//    
	// ShaderCall.prototype.uniform4i = function(int v0, int v1, int v2, int v3)
	// {
	// Object curValue = currentRecord.boundValues.get(location);
	// if (curValue != null) {
	// try {
	// int oldArray = (int) curValue;
	// if (oldArray.length == 4 && oldArray[0] == v0 && oldArray[1] == v1 &&
	// oldArray[2] == v2
	// && oldArray[3] == v3) {
	// return;
	// }
	// } catch (Exception e) {
	// }
	// }
	// glContext.uniform4i(location, v0, v1, v2, v3);
	// currentRecord.boundValues.put(location, new int { v0, v1, v2, v3 });
	// }
	//
	//    
	// // NOTE: optimize check before calling.
	// ShaderCall.prototype.uniform4iv = function(Int v) {
	// glContext.uniform4iv(location, v);
	// }
	//
	//    
	// ShaderCall.prototype.uniform4iv = function(int values) {
	// Object curValue = currentRecord.boundValues.get(location);
	// if (curValue != null) {
	// try {
	// if (Arrays.equals(values, (int) curValue)) {
	// return;
	// }
	// } catch (Exception e) {
	// }
	// }
	// glContext.uniform4iv(location, values);
	// int copy = new int[values.length];
	// System.arraycopy(values, 0, copy, 0, values.length);
	// currentRecord.boundValues.put(location, copy);
	// }
	//
	//    
	// // NOTE: optimize check before calling.
	// ShaderCall.prototype.uniformMatrix2fv = function( transpose, value) {
	// glContext.uniformMatrix2fv(location, transpose, value);
	// }
	//
	//    
	// // NOTE: optimize check before calling.
	// ShaderCall.prototype.uniformMatrix2fv = function( transpose, value) {
	// glContext.uniformMatrix2fv(location, transpose, value);
	// }
	//
	//    
	// // NOTE: optimize check before calling.
	// ShaderCall.prototype.uniformMatrix3fv = function( transpose, value) {
	// glContext.uniformMatrix3fv(location, transpose, value);
	// }
	//
	//    
	// // NOTE: optimize check before calling.
	// ShaderCall.prototype.uniformMatrix3fv = function( transpose, value) {
	// glContext.uniformMatrix3fv(location, transpose, value);
	// }
	//
	//    
	// // NOTE: optimize check before calling.
	// ShaderCall.prototype.uniformMatrix4fv = function( transpose, value) {
	// glContext.uniformMatrix4fv(location, transpose, value);
	// }
	//
	//    
	// // NOTE: optimize check before calling.
	// ShaderCall.prototype.uniformMatrix4fv = function( transpose, value) {
	// glContext.uniformMatrix4fv(location, transpose, value);
	// };

	return ShaderCall;
});
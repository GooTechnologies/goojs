define(function() {
	"use strict";

	function Util() {

	}

	Util.getByteSize = function(type) {
		switch (type) {
			case 'Byte':
				return 1;
			case 'UnsignedByte':
				return 1;
			case 'Short':
				return 2;
			case 'UnsignedShort':
				return 2;
			case 'Int':
				return 4;
			case 'HalfFloat':
				return 2;
			case 'Float':
				return 4;
			case 'Double':
				return 8;
		}
	};

	Util.checkGLError = function(gl) {
		var error = gl.getError();
		var wasError = false;
		while (error !== gl.NO_ERROR) {
			wasError = true;
			if (error === gl.INVALID_ENUM) {
				console
					.error("An unacceptable value is specified for an enumerated argument. The offending command is ignored and has no other side effect than to set the error flag.");
			} else if (error === gl.INVALID_VALUE) {
				console
					.error("A numeric argument is out of range. The offending command is ignored and has no other side effect than to set the error flag.");
			} else if (error === gl.INVALID_OPERATION) {
				console
					.error("The specified operation is not allowed in the current state. The offending command is ignored and has no other side effect than to set the error flag.");
			} else if (error === gl.FRAMEBUFFER_COMPLETE) {
				console
					.error("The command is trying to render to or read from the framebuffer while the currently bound framebuffer is not framebuffer complete (i.e. the return value from glCheckFramebufferStatus is not GL_FRAMEBUFFER_COMPLETE). The offending command is ignored and has no other side effect than to set the error flag.");
			} else if (error === gl.OUT_OF_MEMORY) {
				throw "There is not enough memory left to execute the command. The state of the GL is undefined, except for the state of the error flags, after this error is recorded.";
			}
			error = gl.getError();
		}

		if (wasError) {
			throw "Stopping due to error";
		}
	};

	Util.isPowerOfTwo = function(value) {
		return (value & (value - 1)) === 0;
	};

	Util.nearestPowerOfTwo = function(number) {
		return Math.pow(2, Math.ceil(Math.log(number) / Math.log(2)));
	};

	Util.clone = function(obj) {
		// Handle the 3 simple types, and null or undefined
		if (null == obj || "object" != typeof obj) {
			return obj;
		}

		// Handle Date
		if (obj instanceof Date) {
			var copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}

		// Handle Array
		if (obj instanceof Array) {
			var copy = [];
			for ( var i = 0, len = obj.length; i < len; ++i) {
				copy[i] = Util.clone(obj[i]);
			}
			return copy;
		}

		// Handle Object
		if (obj instanceof Object) {
			var copy = {};
			for ( var attr in obj) {
				if (obj.hasOwnProperty(attr)) {
					copy[attr] = Util.clone(obj[attr]);
				}
			}
			return copy;
		}

		throw new Error("Unable to copy obj! Its type isn't supported.");
	};

	return Util;
});
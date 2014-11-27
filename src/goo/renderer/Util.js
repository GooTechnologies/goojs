/*jshint bitwise: false */
define(
/** @lends */
function () {
	'use strict';

	/**
	 * @class Common utilities
	 */
	function Util() {

	}

	/**
	 * Get size in bytes of a specific type.
	 *
	 * @param {String} type Type to retrieve bytesize for
	 */
	Util.getByteSize = function (type) {
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
			default:
				throw 'Unknown type: ' + type;
		}
	};

	/**
	 * Check if the webgl context contains any errors in the current state
	 *
	 * @param {WebGLContext} gl A valid WebGL context
	 */
	Util.checkGLError = function (gl) {
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

	/**
	 * Checks if a value is power of two
	 *
	 * @param {Number} value Number to check for power of two
	 * @returns true if value is power of two
	 */
	Util.isPowerOfTwo = function (value) {
		return (value & (value - 1)) === 0;
	};

	/**
	 * Converts input number to closest power of two
	 *
	 * @param {Number} number Number to convert to power of two
	 * @returns Nearest power of two of input
	 */
	Util.nearestPowerOfTwo = function (number) {
		return Math.pow(2, Math.ceil(Math.log(number) / Math.log(2)));
	};

	/**
	 * Clones an object recursively
	 *
	 * @param {Object} obj Object to clone
	 * @returns Cloned object
	 */
	Util.clone = function (obj) {
		// Handle the 3 simple types, and null or undefined
		if (obj === null || typeof obj !== 'object') {
			return obj;
		}

		// Handle Uint8Array
		if (obj instanceof Uint8Array) {
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
			for (var i = 0, len = obj.length; i < len; ++i) {
				copy[i] = Util.clone(obj[i]);
			}
			return copy;
		}

		// Handle Object
		if (obj instanceof Object) {
			var copy = {};
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) {
					copy[attr] = Util.clone(obj[attr]);
				}
			}
			return copy;
		}

		throw new Error("Unable to copy obj! Its type isn't supported.");
	};


	Util._blankImages = {};
	Util.getBlankImage = function(texture, color, width, height, maxSize, index) {
		var newWidth = Util.nearestPowerOfTwo(width);
		var newHeight = Util.nearestPowerOfTwo(height);
		newWidth = Math.min(newWidth, maxSize);
		newHeight = Math.min(newHeight, maxSize);

		var strColor = color.length===4?
			'rgba(' + Number(color[0]*255).toFixed(0) + ',' + Number(color[1]*255).toFixed(0) + ',' + Number(color[2]*255).toFixed(0)+','+Number(color[3]).toFixed(2)+')':
			'rgb(' + Number(color[0]*255).toFixed(0) + ',' + Number(color[1]*255).toFixed(0) + ',' + Number(color[2]*255).toFixed(0)+')';
		var cacheKey = strColor+newWidth+'x'+newHeight;
		var canvas = Util._blankImages[cacheKey];
		if (!canvas) {
			canvas = document.createElement('canvas');
			canvas.width = newWidth;
			canvas.height = newHeight;
			var ctx = canvas.getContext('2d');
			ctx.beginPath();
			ctx.rect(0, 0, newWidth, newHeight);
			ctx.fillStyle = strColor;
			ctx.fill();
			Util._blankImages[cacheKey] = canvas;
		}
		if (index === undefined) {
			texture.image = canvas;
		} else {
			texture.image.isData = false;
			texture.image.data[index] = canvas;
		}
	};

	function getImage(data, width, height) {
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		var context = canvas.getContext('2d');

		var imageData = context.createImageData(width, height);
		imageData.data.set(data);
		context.putImageData(imageData, 0, 0);

		return canvas;
	}

	Util.scaleImage = function(texture, image, width, height, maxSize, index) {
		var newWidth = Util.nearestPowerOfTwo(width);
		var newHeight = Util.nearestPowerOfTwo(height);
		newWidth = Math.min(newWidth, maxSize);
		newHeight = Math.min(newHeight, maxSize);

		if (image.width !== newWidth || image.height !== newHeight) {
			var canvas = document.createElement('canvas');
			canvas.width = newWidth;
			canvas.height = newHeight;
			if (image.getAttribute) {
				canvas.setAttribute('data-ref', image.getAttribute('data-ref'));
			}
			var ctx = canvas.getContext('2d');

			if (image.data) {
				// putImageData directly on this canvas will not resize
				// have to putImageData on another canvas and drawImage that afterwards
				ctx.drawImage(getImage(image.data, image.width, image.height), 0, 0, image.width, image.height, 0, 0, newWidth, newHeight);
			} else {
				//! AT: this will choke if fed with a manually created texture ([0, 0, 0, 255, ...])
				ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, newWidth, newHeight);
			}
			//document.body.appendChild(canvas);
			canvas.dataReady = true;
			canvas.src = image.src;
			canvas.originalWidth = width;
			canvas.originalHeight = height;
			if (index === undefined) {
				texture.image = canvas;
			} else {
				texture.image.data[index] = canvas;
			}
			//canvas.parentNode.removeChild(canvas);
		}
	};

	Util.insertionSort = function (array, comparator) {
		for (var i = 1; i < array.length; i++) {
			var tmp = array[i];
			var j = i;
			while (comparator(array[j - 1], tmp) > 0 && j > 0) {
				array[j] = array[j - 1];
				j--;
			}
			array[j] = tmp;
		}
	};

	return Util;
});
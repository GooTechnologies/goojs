/*jshint bitwise: false */
define([
	'goo/util/ObjectUtil'
], function (
	ObjectUtil
) {
	'use strict';

	/**
	 * Renderer-related utilities
	 */
	function RendererUtils() {}

	/**
	 * Get size in bytes of a specific type.
	 *
	 * @param {String} type Type to retrieve bytesize for
	 */
	RendererUtils.getByteSize = function (type) {
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
	RendererUtils.checkGLError = function (gl) {
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
	RendererUtils.isPowerOfTwo = function (value) {
		return (value & (value - 1)) === 0;
	};

	/**
	 * Converts input number to closest power of two
	 * @param {number} number Number to convert to power of two
	 * @returns {number} Nearest power of two of input
	 */
	RendererUtils.nearestPowerOfTwo = function (number) {
		return Math.pow(2, Math.ceil(Math.log(number) / Math.log(2)));
	};

	/**
	 * Clones an object recursively
	 * @deprecated Deprecated as of 0.12.x and scheduled for removal in 0.14.0; Please use `ObjectUtil.deepClone` instead
	 * @param {*} object Object to clone
	 * @returns {*} Cloned object
	 */
	RendererUtils.clone = ObjectUtil.deepClone;

	RendererUtils._blankImages = {};
	RendererUtils.getBlankImage = function(texture, color, width, height, maxSize, index) {
		var newWidth = RendererUtils.nearestPowerOfTwo(width);
		var newHeight = RendererUtils.nearestPowerOfTwo(height);
		newWidth = Math.min(newWidth, maxSize);
		newHeight = Math.min(newHeight, maxSize);

		var strColor = color.length===4?
		'rgba(' + Number(color[0]*255).toFixed(0) + ',' + Number(color[1]*255).toFixed(0) + ',' + Number(color[2]*255).toFixed(0)+','+Number(color[3]).toFixed(2)+')':
		'rgb(' + Number(color[0]*255).toFixed(0) + ',' + Number(color[1]*255).toFixed(0) + ',' + Number(color[2]*255).toFixed(0)+')';
		var cacheKey = strColor+newWidth+'x'+newHeight;
		var canvas = RendererUtils._blankImages[cacheKey];
		if (!canvas) {
			canvas = document.createElement('canvas');
			canvas.width = newWidth;
			canvas.height = newHeight;
			var ctx = canvas.getContext('2d');
			ctx.beginPath();
			ctx.rect(0, 0, newWidth, newHeight);
			ctx.fillStyle = strColor;
			ctx.fill();
			RendererUtils._blankImages[cacheKey] = canvas;
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

	RendererUtils.scaleImage = function(texture, image, width, height, maxSize, index) {
		var newWidth = RendererUtils.nearestPowerOfTwo(width);
		var newHeight = RendererUtils.nearestPowerOfTwo(height);
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

	return RendererUtils;
});

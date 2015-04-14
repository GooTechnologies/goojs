/* jshint bitwise: false */
define([
	'goo/util/ObjectUtil'
], function (
	ObjectUtil
) {
	'use strict';

	var WebGLRenderingContext = window.WebGLRenderingContext;

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
	RendererUtils.getBlankImage = function (texture, color, width, height, maxSize, index) {
		var newWidth = RendererUtils.nearestPowerOfTwo(width);
		var newHeight = RendererUtils.nearestPowerOfTwo(height);
		newWidth = Math.min(newWidth, maxSize);
		newHeight = Math.min(newHeight, maxSize);

		var strColor = color.length === 4 ? 'rgba(' + Number(color[0] * 255).toFixed(0) + ',' + Number(color[1] * 255).toFixed(0) + ',' + Number(color[2] * 255).toFixed(0) + ',' + Number(color[3]).toFixed(2) + ')' : 'rgb(' + Number(color[0] * 255).toFixed(0) + ',' + Number(color[1] * 255).toFixed(0) + ',' + Number(color[2] * 255).toFixed(0) + ')';
		var cacheKey = strColor + newWidth + 'x' + newHeight;
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

	RendererUtils.scaleImage = function (texture, image, width, height, maxSize, index) {
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

	RendererUtils.getGLType = function (type) {
		switch (type) {
			case '2D':
				return WebGLRenderingContext.TEXTURE_2D;
			case 'CUBE':
				return WebGLRenderingContext.TEXTURE_CUBE_MAP;
		}
		throw 'invalid texture type: ' + type;
	};

	RendererUtils.getGLWrap = function (wrap) {
		switch (wrap) {
			case 'Repeat':
				return WebGLRenderingContext.REPEAT;
			case 'MirroredRepeat':
				return WebGLRenderingContext.MIRRORED_REPEAT;
			case 'EdgeClamp':
				return WebGLRenderingContext.CLAMP_TO_EDGE;
		}
		throw "invalid WrapMode type: " + wrap;
	};

	RendererUtils.getGLInternalFormat = function (format) {
		switch (format) {
			case 'RGBA':
				return WebGLRenderingContext.RGBA;
			case 'RGB':
				return WebGLRenderingContext.RGB;
			case 'Alpha':
				return WebGLRenderingContext.ALPHA;
			case 'Luminance':
				return WebGLRenderingContext.LUMINANCE;
			case 'LuminanceAlpha':
				return WebGLRenderingContext.LUMINANCE_ALPHA;
			default:
				throw "Unsupported format: " + format;
		}
	};

	RendererUtils.getGLPixelDataType = function (type) {
		switch (type) {
			case 'UnsignedByte':
				return WebGLRenderingContext.UNSIGNED_BYTE;
			case 'UnsignedShort565':
				return WebGLRenderingContext.UNSIGNED_SHORT_5_6_5;
			case 'UnsignedShort4444':
				return WebGLRenderingContext.UNSIGNED_SHORT_4_4_4_4;
			case 'UnsignedShort5551':
				return WebGLRenderingContext.UNSIGNED_SHORT_5_5_5_1;
			case 'Float':
				return WebGLRenderingContext.FLOAT;
			default:
				throw "Unsupported type: " + type;
		}
	};

	RendererUtils.getFilterFallback = function (filter) {
		switch (filter) {
			case 'NearestNeighborNoMipMaps':
			case 'NearestNeighborNearestMipMap':
			case 'NearestNeighborLinearMipMap':
				return 'NearestNeighborNoMipMaps';
			case 'BilinearNoMipMaps':
			case 'Trilinear':
			case 'BilinearNearestMipMap':
				return 'BilinearNoMipMaps';
			default:
				return 'NearestNeighborNoMipMaps';
		}
	};

	RendererUtils.getGLMagFilter = function (filter) {
		switch (filter) {
			case 'Bilinear':
				return WebGLRenderingContext.LINEAR;
			case 'NearestNeighbor':
				return WebGLRenderingContext.NEAREST;
		}
		throw "invalid MagnificationFilter type: " + filter;
	};

	RendererUtils.getGLMinFilter = function (filter) {
		switch (filter) {
			case 'BilinearNoMipMaps':
				return WebGLRenderingContext.LINEAR;
			case 'Trilinear':
				return WebGLRenderingContext.LINEAR_MIPMAP_LINEAR;
			case 'BilinearNearestMipMap':
				return WebGLRenderingContext.LINEAR_MIPMAP_NEAREST;
			case 'NearestNeighborNoMipMaps':
				return WebGLRenderingContext.NEAREST;
			case 'NearestNeighborNearestMipMap':
				return WebGLRenderingContext.NEAREST_MIPMAP_NEAREST;
			case 'NearestNeighborLinearMipMap':
				return WebGLRenderingContext.NEAREST_MIPMAP_LINEAR;
		}
		throw "invalid MinificationFilter type: " + filter;
	};

	RendererUtils.getGLBufferTarget = function (target) {
		if (target === 'ElementArrayBuffer') {
			return WebGLRenderingContext.ELEMENT_ARRAY_BUFFER;
		}

		return WebGLRenderingContext.ARRAY_BUFFER;
	};

	RendererUtils.getGLArrayType = function (indices) {
		if (indices instanceof Uint8Array) {
			return WebGLRenderingContext.UNSIGNED_BYTE;
		} else if (indices instanceof Uint16Array) {
			return WebGLRenderingContext.UNSIGNED_SHORT;
		} else if (indices instanceof Uint32Array) {
			return WebGLRenderingContext.UNSIGNED_INT;
		} else if (indices instanceof Int8Array) {
			return WebGLRenderingContext.UNSIGNED_BYTE;
		} else if (indices instanceof Int16Array) {
			return WebGLRenderingContext.UNSIGNED_SHORT;
		} else if (indices instanceof Int32Array) {
			return WebGLRenderingContext.UNSIGNED_INT;
		}

		return null;
	};

	RendererUtils.getGLByteSize = function (indices) {
		if (indices instanceof Uint8Array) {
			return 1;
		} else if (indices instanceof Uint16Array) {
			return 2;
		} else if (indices instanceof Uint32Array) {
			return 4;
		} else if (indices instanceof Int8Array) {
			return 1;
		} else if (indices instanceof Int16Array) {
			return 2;
		} else if (indices instanceof Int32Array) {
			return 4;
		}

		return 1;
	};

	RendererUtils.getGLCubeMapFace = function (face) {
		switch (face) {
			case 'PositiveX':
				return WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X;
			case 'NegativeX':
				return WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X;
			case 'PositiveY':
				return WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y;
			case 'NegativeY':
				return WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y;
			case 'PositiveZ':
				return WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z;
			case 'NegativeZ':
				return WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z;
		}
		throw 'Invalid cubemap face: ' + face;
	};

	RendererUtils.getGLBufferUsage = function (usage) {
		var glMode = WebGLRenderingContext.STATIC_DRAW;
		switch (usage) {
			case 'StaticDraw':
				glMode = WebGLRenderingContext.STATIC_DRAW;
				break;
			case 'DynamicDraw':
				glMode = WebGLRenderingContext.DYNAMIC_DRAW;
				break;
			case 'StreamDraw':
				glMode = WebGLRenderingContext.STREAM_DRAW;
				break;
		}
		return glMode;
	};

	RendererUtils.getGLIndexMode = function (indexMode) {
		var glMode = WebGLRenderingContext.TRIANGLES;
		switch (indexMode) {
			case 'Triangles':
				glMode = WebGLRenderingContext.TRIANGLES;
				break;
			case 'TriangleStrip':
				glMode = WebGLRenderingContext.TRIANGLE_STRIP;
				break;
			case 'TriangleFan':
				glMode = WebGLRenderingContext.TRIANGLE_FAN;
				break;
			case 'Lines':
				glMode = WebGLRenderingContext.LINES;
				break;
			case 'LineStrip':
				glMode = WebGLRenderingContext.LINE_STRIP;
				break;
			case 'LineLoop':
				glMode = WebGLRenderingContext.LINE_LOOP;
				break;
			case 'Points':
				glMode = WebGLRenderingContext.POINTS;
				break;
		}
		return glMode;
	};

	RendererUtils.getGLDataType = function (type) {
		switch (type) {
			case 'Float':
			case 'HalfFloat':
			case 'Double':
				return WebGLRenderingContext.FLOAT;
			case 'Byte':
				return WebGLRenderingContext.BYTE;
			case 'UnsignedByte':
				return WebGLRenderingContext.UNSIGNED_BYTE;
			case 'Short':
				return WebGLRenderingContext.SHORT;
			case 'UnsignedShort':
				return WebGLRenderingContext.UNSIGNED_SHORT;
			case 'Int':
				return WebGLRenderingContext.INT;
			case 'UnsignedInt':
				return WebGLRenderingContext.UNSIGNED_INT;

			default:
				throw 'Unknown datatype: ' + type;
		}
	};

	RendererUtils.getGLBlendParam = function (param) {
		switch (param) {
			case 'AddEquation':
				return WebGLRenderingContext.FUNC_ADD;
			case 'SubtractEquation':
				return WebGLRenderingContext.FUNC_SUBTRACT;
			case 'ReverseSubtractEquation':
				return WebGLRenderingContext.FUNC_REVERSE_SUBTRACT;

			case 'ZeroFactor':
				return WebGLRenderingContext.ZERO;
			case 'OneFactor':
				return WebGLRenderingContext.ONE;
			case 'SrcColorFactor':
				return WebGLRenderingContext.SRC_COLOR;
			case 'OneMinusSrcColorFactor':
				return WebGLRenderingContext.ONE_MINUS_SRC_COLOR;
			case 'SrcAlphaFactor':
				return WebGLRenderingContext.SRC_ALPHA;
			case 'OneMinusSrcAlphaFactor':
				return WebGLRenderingContext.ONE_MINUS_SRC_ALPHA;
			case 'DstAlphaFactor':
				return WebGLRenderingContext.DST_ALPHA;
			case 'OneMinusDstAlphaFactor':
				return WebGLRenderingContext.ONE_MINUS_DST_ALPHA;

			case 'DstColorFactor':
				return WebGLRenderingContext.DST_COLOR;
			case 'OneMinusDstColorFactor':
				return WebGLRenderingContext.ONE_MINUS_DST_COLOR;
			case 'SrcAlphaSaturateFactor':
				return WebGLRenderingContext.SRC_ALPHA_SATURATE;

			default:
				throw 'Unknown blend param: ' + param;
		}
	};

	return RendererUtils;
});

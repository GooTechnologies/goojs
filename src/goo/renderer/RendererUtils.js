/* jshint bitwise: false */
define([
	'goo/util/ObjectUtils',
	'goo/math/MathUtils'
], function (
	ObjectUtils,
	MathUtils
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
		var byteSize;

		switch (type) {
			case 'Byte':
			case 'UnsignedByte':
				byteSize = 1;
				break;
			case 'Short':
			case 'UnsignedShort':
			case 'HalfFloat':
				byteSize = 2;
				break;
			case 'Int':
			case 'Float':
				byteSize = 4;
				break;
			case 'Double':
				byteSize = 8;
				break;

			default:
				throw new Error('Unknown type: ' + type);
		}

		return byteSize;
	};

	/**
	 * Check if the webgl context contains any errors in the current state
	 *
	 * @param {WebGLRenderingContext} gl A valid WebGL context
	 */
	RendererUtils.checkGLError = function (gl) {
		var error = gl.getError();
		var wasError = false;
		while (error !== gl.NO_ERROR) {
			wasError = true;
			if (error === gl.INVALID_ENUM) {
				console
					.error('An unacceptable value is specified for an enumerated argument. The offending command is ignored and has no other side effect than to set the error flag.');
			} else if (error === gl.INVALID_VALUE) {
				console
					.error('A numeric argument is out of range. The offending command is ignored and has no other side effect than to set the error flag.');
			} else if (error === gl.INVALID_OPERATION) {
				console
					.error('The specified operation is not allowed in the current state. The offending command is ignored and has no other side effect than to set the error flag.');
			} else if (error === gl.FRAMEBUFFER_COMPLETE) {
				console
					.error('The command is trying to render to or read from the framebuffer while the currently bound framebuffer is not framebuffer complete (i.e. the return value from glCheckFramebufferStatus is not GL_FRAMEBUFFER_COMPLETE). The offending command is ignored and has no other side effect than to set the error flag.');
			} else if (error === gl.OUT_OF_MEMORY) {
				throw new Error('There is not enough memory left to execute the command. The state of the GL is undefined, except for the state of the error flags, after this error is recorded.');
			}
			error = gl.getError();
		}

		if (wasError) {
			throw new Error('Stopping due to error');
		}
	};

	/**
	 * Checks if a value is power of two
	 * @deprecated Deprecated as of v0.14.x and scheduled for removal in v0.16.0; Consider using
	 * MathUtils.isPowerOfTwo instead
	 * @param {Number} value Number to check for power of two
	 * @returns true if value is power of two
	 */
	RendererUtils.isPowerOfTwo = MathUtils.isPowerOfTwo;

	/**
	 * Converts input number to closest power of two
	 * @deprecated Deprecated as of v0.14.x and scheduled for removal in v0.16.0; Consider using
	 * MathUtils.nearestPowerOfTwo instead
	 * @param {number} number Number to convert to power of two
	 * @returns {number} Nearest power of two of input
	 */
	RendererUtils.nearestPowerOfTwo = MathUtils.nearestPowerOfTwo;

	/**
	 * Clones an object recursively
	 * @deprecated Deprecated as of 0.12.x and scheduled for removal in 0.14.0; Please use `ObjectUtils.deepClone` instead
	 * @param {*} object Object to clone
	 * @returns {*} Cloned object
	 */
	RendererUtils.clone = ObjectUtils.deepClone;

	RendererUtils._blankImages = {};
	RendererUtils.getBlankImage = function (texture, color, width, height, maxSize, index) {
		var newWidth = MathUtils.nearestPowerOfTwo(width);
		var newHeight = MathUtils.nearestPowerOfTwo(height);
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
		var newWidth = MathUtils.nearestPowerOfTwo(width);
		var newHeight = MathUtils.nearestPowerOfTwo(height);
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
		var glType;

		switch (type) {
			case '2D':
				glType = WebGLRenderingContext.TEXTURE_2D;
				break;
			case 'CUBE':
				glType = WebGLRenderingContext.TEXTURE_CUBE_MAP;
				break;

			default:
				throw new Error('Invalid texture type: ' + type);
		}

		return glType;
	};

	RendererUtils.getGLWrap = function (wrap) {
		var glWrap;

		switch (wrap) {
			case 'Repeat':
				glWrap = WebGLRenderingContext.REPEAT;
				break;
			case 'MirroredRepeat':
				glWrap = WebGLRenderingContext.MIRRORED_REPEAT;
				break;
			case 'EdgeClamp':
				glWrap = WebGLRenderingContext.CLAMP_TO_EDGE;
				break;

			default:
				throw new Error('Invalid WrapMode type: ' + wrap);
		}

		return glWrap;
	};

	RendererUtils.getGLInternalFormat = function (format) {
		var glInternalFormat;

		switch (format) {
			case 'RGBA':
				glInternalFormat = WebGLRenderingContext.RGBA;
				break;
			case 'RGB':
				glInternalFormat = WebGLRenderingContext.RGB;
				break;
			case 'Alpha':
				glInternalFormat = WebGLRenderingContext.ALPHA;
				break;
			case 'Luminance':
				glInternalFormat = WebGLRenderingContext.LUMINANCE;
				break;
			case 'LuminanceAlpha':
				glInternalFormat = WebGLRenderingContext.LUMINANCE_ALPHA;
				break;

			default:
				throw new Error('Unsupported format: ' + format);
		}

		return glInternalFormat;
	};

	RendererUtils.getGLPixelDataType = function (type) {
		var glPixelDataType;

		switch (type) {
			case 'UnsignedByte':
				glPixelDataType = WebGLRenderingContext.UNSIGNED_BYTE;
				break;
			case 'UnsignedShort565':
				glPixelDataType = WebGLRenderingContext.UNSIGNED_SHORT_5_6_5;
				break;
			case 'UnsignedShort4444':
				glPixelDataType = WebGLRenderingContext.UNSIGNED_SHORT_4_4_4_4;
				break;
			case 'UnsignedShort5551':
				glPixelDataType = WebGLRenderingContext.UNSIGNED_SHORT_5_5_5_1;
				break;
			case 'Float':
				glPixelDataType = WebGLRenderingContext.FLOAT;
				break;

			default:
				throw new Error('Unsupported type: ' + type);
		}

		return glPixelDataType;
	};

	RendererUtils.getFilterFallback = function (filter) {
		var filterFallback;

		switch (filter) {
			case 'NearestNeighborNoMipMaps':
			case 'NearestNeighborNearestMipMap':
			case 'NearestNeighborLinearMipMap':
				filterFallback = 'NearestNeighborNoMipMaps';
				break;
			case 'BilinearNoMipMaps':
			case 'Trilinear':
			case 'BilinearNearestMipMap':
				filterFallback = 'BilinearNoMipMaps';
				break;

			default:
				filterFallback = 'NearestNeighborNoMipMaps';
				break;
		}

		return filterFallback;
	};

	RendererUtils.getGLMagFilter = function (filter) {
		var glMagFilter;

		switch (filter) {
			case 'Bilinear':
				glMagFilter = WebGLRenderingContext.LINEAR;
				break;
			case 'NearestNeighbor':
				glMagFilter = WebGLRenderingContext.NEAREST;
				break;

			default:
				throw new Error('Invalid MagnificationFilter type: ' + filter);
		}

		return glMagFilter;
	};

	RendererUtils.getGLMinFilter = function (filter) {
		var glMinFilter;

		switch (filter) {
			case 'BilinearNoMipMaps':
				glMinFilter = WebGLRenderingContext.LINEAR;
				break;
			case 'Trilinear':
				glMinFilter = WebGLRenderingContext.LINEAR_MIPMAP_LINEAR;
				break;
			case 'BilinearNearestMipMap':
				glMinFilter = WebGLRenderingContext.LINEAR_MIPMAP_NEAREST;
				break;
			case 'NearestNeighborNoMipMaps':
				glMinFilter = WebGLRenderingContext.NEAREST;
				break;
			case 'NearestNeighborNearestMipMap':
				glMinFilter = WebGLRenderingContext.NEAREST_MIPMAP_NEAREST;
				break;
			case 'NearestNeighborLinearMipMap':
				glMinFilter = WebGLRenderingContext.NEAREST_MIPMAP_LINEAR;
				break;

			default:
				throw new Error('Invalid MinificationFilter type: ' + filter);
		}

		return glMinFilter;
	};

	RendererUtils.getGLBufferTarget = function (target) {
		if (target === 'ElementArrayBuffer') {
			return WebGLRenderingContext.ELEMENT_ARRAY_BUFFER;
		}

		return WebGLRenderingContext.ARRAY_BUFFER;
	};

	RendererUtils.getGLArrayType = function (indices) {
		var glArrayType = null;

		if (indices instanceof Uint8Array) {
			glArrayType = WebGLRenderingContext.UNSIGNED_BYTE;
		} else if (indices instanceof Uint16Array) {
			glArrayType = WebGLRenderingContext.UNSIGNED_SHORT;
		} else if (indices instanceof Uint32Array) {
			glArrayType = WebGLRenderingContext.UNSIGNED_INT;
		} else if (indices instanceof Int8Array) {
			glArrayType = WebGLRenderingContext.UNSIGNED_BYTE;
		} else if (indices instanceof Int16Array) {
			glArrayType = WebGLRenderingContext.UNSIGNED_SHORT;
		} else if (indices instanceof Int32Array) {
			glArrayType = WebGLRenderingContext.UNSIGNED_INT;
		}

		return glArrayType;
	};

	RendererUtils.getGLByteSize = function (indices) {
		return indices.BYTES_PER_ELEMENT || 1;
	};

	RendererUtils.getGLCubeMapFace = function (face) {
		var glCubeMapFace;

		switch (face) {
			case 'PositiveX':
				glCubeMapFace = WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X;
				break;
			case 'NegativeX':
				glCubeMapFace = WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X;
				break;
			case 'PositiveY':
				glCubeMapFace = WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y;
				break;
			case 'NegativeY':
				glCubeMapFace = WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y;
				break;
			case 'PositiveZ':
				glCubeMapFace = WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z;
				break;
			case 'NegativeZ':
				glCubeMapFace = WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z;
				break;

			default:
				throw new Error('Invalid cubemap face: ' + face);
		}

		return glCubeMapFace;
	};

	RendererUtils.getGLBufferUsage = function (usage) {
		var glMode;

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

			default:
				glMode = WebGLRenderingContext.STATIC_DRAW;
				break;
		}

		return glMode;
	};

	RendererUtils.getGLIndexMode = function (indexMode) {
		var glMode;

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

			default:
				glMode = WebGLRenderingContext.TRIANGLES;
				break;
		}

		return glMode;
	};

	RendererUtils.getGLDataType = function (type) {
		var glDataType;

		switch (type) {
			case 'Float':
			case 'HalfFloat':
			case 'Double':
				glDataType = WebGLRenderingContext.FLOAT;
				break;
			case 'Byte':
				glDataType = WebGLRenderingContext.BYTE;
				break;
			case 'UnsignedByte':
				glDataType = WebGLRenderingContext.UNSIGNED_BYTE;
				break;
			case 'Short':
				glDataType = WebGLRenderingContext.SHORT;
				break;
			case 'UnsignedShort':
				glDataType = WebGLRenderingContext.UNSIGNED_SHORT;
				break;
			case 'Int':
				glDataType = WebGLRenderingContext.INT;
				break;
			case 'UnsignedInt':
				glDataType = WebGLRenderingContext.UNSIGNED_INT;
				break;

			default:
				throw new Error('Unknown datatype: ' + type);
		}

		return glDataType;
	};

	RendererUtils.getGLBlendParam = function (param) {
		var glBlendParam;

		switch (param) {
			case 'AddEquation':
				glBlendParam = WebGLRenderingContext.FUNC_ADD;
				break;
			case 'SubtractEquation':
				glBlendParam = WebGLRenderingContext.FUNC_SUBTRACT;
				break;
			case 'ReverseSubtractEquation':
				glBlendParam = WebGLRenderingContext.FUNC_REVERSE_SUBTRACT;
				break;

			case 'ZeroFactor':
				glBlendParam = WebGLRenderingContext.ZERO;
				break;
			case 'OneFactor':
				glBlendParam = WebGLRenderingContext.ONE;
				break;
			case 'SrcColorFactor':
				glBlendParam = WebGLRenderingContext.SRC_COLOR;
				break;
			case 'OneMinusSrcColorFactor':
				glBlendParam = WebGLRenderingContext.ONE_MINUS_SRC_COLOR;
				break;
			case 'SrcAlphaFactor':
				glBlendParam = WebGLRenderingContext.SRC_ALPHA;
				break;
			case 'OneMinusSrcAlphaFactor':
				glBlendParam = WebGLRenderingContext.ONE_MINUS_SRC_ALPHA;
				break;
			case 'DstAlphaFactor':
				glBlendParam = WebGLRenderingContext.DST_ALPHA;
				break;
			case 'OneMinusDstAlphaFactor':
				glBlendParam = WebGLRenderingContext.ONE_MINUS_DST_ALPHA;
				break;

			case 'DstColorFactor':
				glBlendParam = WebGLRenderingContext.DST_COLOR;
				break;
			case 'OneMinusDstColorFactor':
				glBlendParam = WebGLRenderingContext.ONE_MINUS_DST_COLOR;
				break;
			case 'SrcAlphaSaturateFactor':
				glBlendParam = WebGLRenderingContext.SRC_ALPHA_SATURATE;
				break;

			default:
				throw new Error('Unknown blend param: ' + param);
		}

		return glBlendParam;
	};

	return RendererUtils;
});

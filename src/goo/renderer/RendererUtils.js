/* jshint bitwise: false */
define([
	'goo/util/ObjectUtils',
	'goo/renderer/Capabilities',
	'goo/math/MathUtils'
], function (
	ObjectUtils,
	Capabilities,
	MathUtils
) {
	'use strict';

	/**
	 * Renderer-related utilities
	 */
	function RendererUtils() {}

	/**
	 * Get size in bytes of a specific type.
	 *
	 * @param {string} type Type to retrieve bytesize for
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
	 * @param {number} value Number to check for power of two
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

	RendererUtils.getGLType = function (context, type) {
		var glType;

		switch (type) {
			case '2D':
				glType = context.TEXTURE_2D;
				break;
			case 'CUBE':
				glType = context.TEXTURE_CUBE_MAP;
				break;

			default:
				throw new Error('Invalid texture type: ' + type);
		}

		return glType;
	};

	RendererUtils.getGLWrap = function (context, wrap) {
		var glWrap;

		switch (wrap) {
			case 'Repeat':
				glWrap = context.REPEAT;
				break;
			case 'MirroredRepeat':
				glWrap = context.MIRRORED_REPEAT;
				break;
			case 'EdgeClamp':
				glWrap = context.CLAMP_TO_EDGE;
				break;

			default:
				throw new Error('Invalid WrapMode type: ' + wrap);
		}

		return glWrap;
	};

	RendererUtils.getGLInternalFormat = function (context, format) {
		var glInternalFormat;

		switch (format) {
			case 'RGBA':
				glInternalFormat = context.RGBA;
				break;
			case 'RGB':
				glInternalFormat = context.RGB;
				break;
			case 'Alpha':
				glInternalFormat = context.ALPHA;
				break;
			case 'Luminance':
				glInternalFormat = context.LUMINANCE;
				break;
			case 'LuminanceAlpha':
				glInternalFormat = context.LUMINANCE_ALPHA;
				break;

			default:
				throw new Error('Unsupported format: ' + format);
		}

		return glInternalFormat;
	};

	RendererUtils.getGLPixelDataType = function (context, type) {
		return RendererUtils.getGLDataType(context, type);
	};

	RendererUtils.getGLDataType = function (context, type) {
		var glDataType;

		switch (type) {
			case 'Float':
			case 'Double':
				glDataType = context.FLOAT;
				break;
			case 'Byte':
				glDataType = context.BYTE;
				break;
			case 'UnsignedByte':
				glDataType = context.UNSIGNED_BYTE;
				break;
			case 'Short':
				glDataType = context.SHORT;
				break;
			case 'UnsignedShort':
				glDataType = context.UNSIGNED_SHORT;
				break;
			case 'Int':
				glDataType = context.INT;
				break;
			case 'UnsignedInt':
				glDataType = context.UNSIGNED_INT;
				break;
			case 'UnsignedShort565':
				glDataType = context.UNSIGNED_SHORT_5_6_5;
				break;
			case 'UnsignedShort4444':
				glDataType = context.UNSIGNED_SHORT_4_4_4_4;
				break;
			case 'UnsignedShort5551':
				glDataType = context.UNSIGNED_SHORT_5_5_5_1;
				break;
			case 'HalfFloat':
				glDataType = Capabilities.TextureHalfFloat.HALF_FLOAT_OES;
				break;

			default:
				throw new Error('Unknown datatype: ' + type);
		}

		return glDataType;
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

	RendererUtils.getGLMagFilter = function (context, filter) {
		var glMagFilter;

		switch (filter) {
			case 'Bilinear':
				glMagFilter = context.LINEAR;
				break;
			case 'NearestNeighbor':
				glMagFilter = context.NEAREST;
				break;

			default:
				throw new Error('Invalid MagnificationFilter type: ' + filter);
		}

		return glMagFilter;
	};

	RendererUtils.getGLMinFilter = function (context, filter) {
		var glMinFilter;

		switch (filter) {
			case 'BilinearNoMipMaps':
				glMinFilter = context.LINEAR;
				break;
			case 'Trilinear':
				glMinFilter = context.LINEAR_MIPMAP_LINEAR;
				break;
			case 'BilinearNearestMipMap':
				glMinFilter = context.LINEAR_MIPMAP_NEAREST;
				break;
			case 'NearestNeighborNoMipMaps':
				glMinFilter = context.NEAREST;
				break;
			case 'NearestNeighborNearestMipMap':
				glMinFilter = context.NEAREST_MIPMAP_NEAREST;
				break;
			case 'NearestNeighborLinearMipMap':
				glMinFilter = context.NEAREST_MIPMAP_LINEAR;
				break;

			default:
				throw new Error('Invalid MinificationFilter type: ' + filter);
		}

		return glMinFilter;
	};

	RendererUtils.getGLBufferTarget = function (context, target) {
		if (target === 'ElementArrayBuffer') {
			return context.ELEMENT_ARRAY_BUFFER;
		}

		return context.ARRAY_BUFFER;
	};

	RendererUtils.getGLArrayType = function (context, indices) {
		var glArrayType = null;

		if (indices instanceof Uint8Array) {
			glArrayType = context.UNSIGNED_BYTE;
		} else if (indices instanceof Uint16Array) {
			glArrayType = context.UNSIGNED_SHORT;
		} else if (indices instanceof Uint32Array) {
			glArrayType = context.UNSIGNED_INT;
		} else if (indices instanceof Int8Array) {
			glArrayType = context.UNSIGNED_BYTE;
		} else if (indices instanceof Int16Array) {
			glArrayType = context.UNSIGNED_SHORT;
		} else if (indices instanceof Int32Array) {
			glArrayType = context.UNSIGNED_INT;
		}

		return glArrayType;
	};

	RendererUtils.getGLByteSize = function (indices) {
		return indices.BYTES_PER_ELEMENT || 1;
	};

	RendererUtils.getGLCubeMapFace = function (context, face) {
		var glCubeMapFace;

		switch (face) {
			case 'PositiveX':
				glCubeMapFace = context.TEXTURE_CUBE_MAP_POSITIVE_X;
				break;
			case 'NegativeX':
				glCubeMapFace = context.TEXTURE_CUBE_MAP_NEGATIVE_X;
				break;
			case 'PositiveY':
				glCubeMapFace = context.TEXTURE_CUBE_MAP_POSITIVE_Y;
				break;
			case 'NegativeY':
				glCubeMapFace = context.TEXTURE_CUBE_MAP_NEGATIVE_Y;
				break;
			case 'PositiveZ':
				glCubeMapFace = context.TEXTURE_CUBE_MAP_POSITIVE_Z;
				break;
			case 'NegativeZ':
				glCubeMapFace = context.TEXTURE_CUBE_MAP_NEGATIVE_Z;
				break;

			default:
				throw new Error('Invalid cubemap face: ' + face);
		}

		return glCubeMapFace;
	};

	RendererUtils.getGLBufferUsage = function (context, usage) {
		var glMode;

		switch (usage) {
			case 'StaticDraw':
				glMode = context.STATIC_DRAW;
				break;
			case 'DynamicDraw':
				glMode = context.DYNAMIC_DRAW;
				break;
			case 'StreamDraw':
				glMode = context.STREAM_DRAW;
				break;

			default:
				glMode = context.STATIC_DRAW;
				break;
		}

		return glMode;
	};

	RendererUtils.getGLIndexMode = function (context, indexMode) {
		var glMode;

		switch (indexMode) {
			case 'Triangles':
				glMode = context.TRIANGLES;
				break;
			case 'TriangleStrip':
				glMode = context.TRIANGLE_STRIP;
				break;
			case 'TriangleFan':
				glMode = context.TRIANGLE_FAN;
				break;
			case 'Lines':
				glMode = context.LINES;
				break;
			case 'LineStrip':
				glMode = context.LINE_STRIP;
				break;
			case 'LineLoop':
				glMode = context.LINE_LOOP;
				break;
			case 'Points':
				glMode = context.POINTS;
				break;

			default:
				glMode = context.TRIANGLES;
				break;
		}

		return glMode;
	};

	RendererUtils.getGLBlendParam = function (context, param) {
		var glBlendParam;

		switch (param) {
			case 'AddEquation':
				glBlendParam = context.FUNC_ADD;
				break;
			case 'SubtractEquation':
				glBlendParam = context.FUNC_SUBTRACT;
				break;
			case 'ReverseSubtractEquation':
				glBlendParam = context.FUNC_REVERSE_SUBTRACT;
				break;

			case 'ZeroFactor':
				glBlendParam = context.ZERO;
				break;
			case 'OneFactor':
				glBlendParam = context.ONE;
				break;
			case 'SrcColorFactor':
				glBlendParam = context.SRC_COLOR;
				break;
			case 'OneMinusSrcColorFactor':
				glBlendParam = context.ONE_MINUS_SRC_COLOR;
				break;
			case 'SrcAlphaFactor':
				glBlendParam = context.SRC_ALPHA;
				break;
			case 'OneMinusSrcAlphaFactor':
				glBlendParam = context.ONE_MINUS_SRC_ALPHA;
				break;
			case 'DstAlphaFactor':
				glBlendParam = context.DST_ALPHA;
				break;
			case 'OneMinusDstAlphaFactor':
				glBlendParam = context.ONE_MINUS_DST_ALPHA;
				break;

			case 'DstColorFactor':
				glBlendParam = context.DST_COLOR;
				break;
			case 'OneMinusDstColorFactor':
				glBlendParam = context.ONE_MINUS_DST_COLOR;
				break;
			case 'SrcAlphaSaturateFactor':
				glBlendParam = context.SRC_ALPHA_SATURATE;
				break;

			default:
				throw new Error('Unknown blend param: ' + param);
		}

		return glBlendParam;
	};

	return RendererUtils;
});

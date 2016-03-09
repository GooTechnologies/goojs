/*jshint bitwise: false*/
define([
	'goo/renderer/Capabilities',
	'goo/renderer/RendererRecord',
	'goo/renderer/RendererUtils',
	'goo/renderer/TextureCreator',
	'goo/renderer/pass/RenderTarget',
	'goo/math/Vector4',
	'goo/entities/Entity',
	'goo/renderer/Texture',
	'goo/loaders/dds/DdsLoader',
	'goo/loaders/dds/DdsUtils',
	'goo/renderer/Material',
	'goo/math/Transform',
	'goo/renderer/RenderQueue',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/shadow/ShadowHandler',
	'goo/renderer/RenderStats',
	'goo/entities/SystemBus',
	'goo/renderer/TaskScheduler',
	'goo/renderer/RenderInfo',
	'goo/math/MathUtils'
], function (
	Capabilities,
	RendererRecord,
	RendererUtils,
	TextureCreator,
	RenderTarget,
	Vector4,
	Entity,
	Texture,
	DdsLoader,
	DdsUtils,
	Material,
	Transform,
	RenderQueue,
	ShaderLib,
	ShadowHandler,
	RenderStats,
	SystemBus,
	TaskScheduler,
	RenderInfo,
	MathUtils
) {
	'use strict';

	var STUB_METHOD = function () {};

	/**
	 * The renderer handles displaying of graphics data to a render context.
	 * It accepts an object containing the settings for the renderer.
	 *
	 * @param {Object} parameters Renderer settings.
	 * @param {boolean} [parameters.alpha=false] Enables the possibility to render non-opaque pixels.
	 * @param {boolean} [parameters.premultipliedAlpha=true] Whether the colors are premultiplied with the alpha channel.
	 * @param {boolean} [parameters.antialias=true] Enables antialiasing.
	 * @param {boolean} [parameters.stencil=false] Enables the stencil buffer.
	 * @param {boolean} [parameters.preserveDrawingBuffer=false]
	 * @param {boolean} [parameters.useDevicePixelRatio=false] Take into account the device pixel ratio (for retina screens etc).
	 * @param {canvas} [parameters.canvas] If not supplied, Renderer will create a new canvas.
	 * @param {function(string)} [parameters.onError] Called with message when error occurs.
	 */
	function Renderer(parameters) {
		parameters = parameters || {};

		var _canvas = parameters.canvas;
		if (_canvas === undefined) {
			_canvas = document.createElement('canvas');
			_canvas.width = 500;
			_canvas.height = 500;
		}
		_canvas.screencanvas = true; // CocoonJS support
		this.domElement = _canvas;

		this._alpha = parameters.alpha !== undefined ? parameters.alpha : false;
		this._premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true;
		this._antialias = parameters.antialias !== undefined ? parameters.antialias : true;
		this._stencil = parameters.stencil !== undefined ? parameters.stencil : false;
		this._preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false;
		this._useDevicePixelRatio = parameters.useDevicePixelRatio !== undefined ? parameters.useDevicePixelRatio : false;
		this._onError = parameters.onError;

		this._contextSettings = {
			alpha: this._alpha,
			premultipliedAlpha: this._premultipliedAlpha,
			antialias: this._antialias,
			stencil: this._stencil,
			preserveDrawingBuffer: this._preserveDrawingBuffer
		};

		/** @type {WebGLRenderingContext} */
		this.context = null;
		this.establishContext();

		this._setupContextLost();

		if (parameters.debug) {
			this.setupDebugging(parameters);
		}

		/** @type {RendererRecord} */
		this.rendererRecord = new RendererRecord();

		this.maxTextureSize = !isNaN(parameters.maxTextureSize) ? Math.min(parameters.maxTextureSize, Capabilities.maxTexureSize) : Capabilities.maxTexureSize;
		this.maxCubemapSize = !isNaN(parameters.maxTextureSize) ? Math.min(parameters.maxTextureSize, Capabilities.maxCubemapSize) : Capabilities.maxCubemapSize;

		/** Can be one of: <ul><li>lowp</li><li>mediump</li><li>highp</li></ul>
		 * If the shader doesn't specify a precision, a string declaring this precision will be added.
		 * @type {string}
		 */
		this.shaderPrecision = parameters.shaderPrecision || 'highp';
		if (this.shaderPrecision === 'highp' && Capabilities.vertexShaderHighpFloat.precision > 0 && Capabilities.fragmentShaderHighpFloat.precision > 0) {
			this.shaderPrecision = 'highp';
		} else if (this.shaderPrecision !== 'lowp' && Capabilities.vertexShaderMediumpFloat.precision > 0 && Capabilities.fragmentShaderMediumpFloat.precision > 0) {
			this.shaderPrecision = 'mediump';
		} else {
			this.shaderPrecision = 'lowp';
		}

		/**
		 * Used to scale down/up the pixels in the canvas. If you set downScale=2, you will get half the number of pixels in X and Y. Default is 1.
		 * @type {number}
		 */
		this.downScale = parameters.downScale || 1;

		//! AT: why are there 2 clear colors?
		// Default setup
		/**
		 * Current clear color of the scene. Use .setClearColor() to set it.
		 * @type {Vector4}
		 * @readonly
		 */
		this.clearColor = new Vector4();
		// You need 64 bits for number equality
		this._clearColor = new Vector4();
		this.setClearColor(0.3, 0.3, 0.3, 1.0);


		/** @type {number} */
		this.viewportX = 0;
		/** @type {number} */
		this.viewportY = 0;
		/** @type {number} */
		this.viewportWidth = 0;
		/** @type {number} */
		this.viewportHeight = 0;
		/** @type {number} */
		this.currentWidth = 0;
		/** @type {number} */
		this.currentHeight = 0;
		/**
		 * @type {number}
		 * @readonly
		 */
		this.devicePixelRatio = 1;

		//this.overrideMaterial = null;
		this._overrideMaterials = [];
		this._mergedMaterial = new Material('Merged Material');

		this.renderQueue = new RenderQueue();

		this.info = new RenderStats();

		this.shadowHandler = new ShadowHandler();

		// Hardware picking
		this.hardwarePicking = null;

		SystemBus.addListener('goo.setClearColor', function (color) {
			this.setClearColor.apply(this, color);
		}.bind(this));

		// ---
		//! AT: ugly fix for the resizing style-less canvas to 1 px for desktop
		// apparently this is the only way to find out the user zoom level

		if (document.createElementNS) {
			this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			this.svg.setAttribute('version', '1.1');
			this.svg.style.position = 'absolute';
			this.svg.style.display = 'none';
			document.body.appendChild(this.svg);
		} else {
			//! AT: placeholder to avoid another conditional below in checkResize
			this.svg = { currentScale: 1 };
		}

		// Dan: Since GooRunner.clear() wipes all listeners from SystemBus,
		//      this needs to be re-added here again for each new GooRunner/Renderer
		//      cycle.
		SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
			Renderer.mainCamera = newCam.camera;
			this.checkResize(Renderer.mainCamera);
		}.bind(this));

		this._definesIndices = [];

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	/**
	 *Enables debug mode on the webgl context for easier development.
	 *
	 * @param {Object} parameters
	 * @param {boolean} parameters.validate
	 */
	Renderer.prototype.setupDebugging = function (parameters) {
		// XXX: This is a temporary solution to easily enable webgl debugging during development...
		var request = new XMLHttpRequest();
		request.open('GET', '/js/goo/lib/webgl-debug.js', false);
		request.onreadystatechange = function () {
			if (request.readyState === 4) {
				if (request.status >= 200 && request.status <= 299) {
					// Yes, eval is intended, sorry checkstyle
					// jshint evil:true
					window['eval'].call(window, request.responseText);
				}
			}
		};
		request.send(null);

		if (typeof (window.WebGLDebugUtils) === 'undefined') {
			console.warn('You need to include webgl-debug.js in your script definition to run in debug mode.');
		} else {
			console.log('Running in webgl debug mode.');
			if (parameters.validate) {
				console.log('Running with "undefined arguments" validation.');
				this.context = window.WebGLDebugUtils.makeDebugContext(this.context, this.onDebugError.bind(this), validateNoneOfTheArgsAreUndefined);
			} else {
				this.context = window.WebGLDebugUtils.makeDebugContext(this.context, this.onDebugError.bind(this));
			}
		}
	};

	/**
	 *Fetches a working webgl context element and sets it to the Renderer.
	 *
	 */
	Renderer.prototype.establishContext = function () {
		if (!!window.WebGLRenderingContext) {
			//! AT: this list may require cleanup
			var contextNames = ['experimental-webgl', 'webgl', 'moz-webgl', 'webkit-3d'];
			for (var i = 0; i < contextNames.length; i++) {
				try {
					this.context = this.domElement.getContext(contextNames[i], this._contextSettings);
					if (this.context && typeof this.context.getParameter === 'function') {
						// WebGL is supported & enabled
						break;
					}
				} catch (e) {}
			}
			if (!this.context) {
				// WebGL is supported but disabled
				throw {
					name: 'GooWebGLError',
					message: 'WebGL is supported but disabled',
					supported: true,
					enabled: false
				};
			}
		}

		var context = this.context;

		context.clearDepth(1);
		context.clearStencil(0);
		context.stencilMask(0);

		context.enable(context.DEPTH_TEST);
		context.depthFunc(context.LEQUAL);

		//! AT: is this still necessary?
		if (context.getShaderPrecisionFormat === undefined) {
			this.context.getShaderPrecisionFormat = function () {
				return {
					rangeMin: 1,
					rangeMax: 1,
					precision: 1
				};
			};
		}

		Capabilities.init(this.context);
	};

	/**
	 * Sets up handlers for context lost/restore.
	 * @private
	 */
	Renderer.prototype._setupContextLost = function () {
		this.domElement.addEventListener('webglcontextlost', function (event) {
			event.preventDefault();
			SystemBus.emit('goo.contextLost');
		}, false);

		this.domElement.addEventListener('webglcontextrestored', function () {
			this._restoreContext();
			SystemBus.emit('goo.contextRestored');
		}.bind(this), false);
	};

	/**
	 * Restores the webgl context.
	 * @private
	 */
	Renderer.prototype._restoreContext = STUB_METHOD; // will be overriden

	function validateNoneOfTheArgsAreUndefined(functionName, args) {
		for (var ii = 0; ii < args.length; ++ii) {
			if (args[ii] === undefined) {
				console.error('undefined passed to gl.' + functionName + '('
					+ window.WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ')');
			}
		}
	}

	/**
	 * Outputs the webgl errors with the respective erroring function name and arguments using console.error.
	 * @param {Object} err
	 * @param {string} functionName
	 * @param {Array} args
	 */
	Renderer.prototype.onDebugError = function (err, functionName, args) {
		// Based on the default error handler in WebGLDebugUtils
		// apparently we can't do args.join(',');
		var message = 'WebGL error ' + window.WebGLDebugUtils.glEnumToString(err) + ' in ' + functionName + '(';
		for (var ii = 0; ii < args.length; ++ii) {
			message += ((ii === 0) ? '' : ', ') +
				window.WebGLDebugUtils.glFunctionArgToString(functionName, ii, args[ii]);
		}
		message += ')';
		console.error(message);
		if (this._onError) {
			this._onError(message);
		}
	};

	Renderer.mainCamera = null;

	/**
	 * Checks if this.domElement.offsetWidth or Height / this.downScale is unequal to this.domElement.width or height.
	 * If that is the case it will call this.setSize.
	 * Also checks if the camera aspect changed and updates it by calling camera.setFrustumPerspective().
	 *
	 * @param {Camera} [camera] optional camera argument.
	 */
	Renderer.prototype.checkResize = function (camera) {
		var devicePixelRatio = this.devicePixelRatio = this._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / this.svg.currentScale : 1;

		var adjustWidth, adjustHeight;
		if (navigator.isCocoonJS) {
			adjustWidth = window.innerWidth;
			adjustHeight = window.innerHeight;
		} else {
			adjustWidth = this.domElement.offsetWidth;
			adjustHeight = this.domElement.offsetHeight;
		}
		adjustWidth = Math.max(adjustWidth * devicePixelRatio / this.downScale, 1);
		adjustHeight = Math.max(adjustHeight * devicePixelRatio / this.downScale, 1);

		var fullWidth = adjustWidth;
		var fullHeight = adjustHeight;

		if (camera && camera.lockedRatio === true && camera.aspect) {
			adjustWidth = adjustHeight * camera.aspect;
		}

		var aspect = adjustWidth / adjustHeight;
		this.setSize(adjustWidth, adjustHeight, fullWidth, fullHeight);

		if (camera && camera.lockedRatio === false && camera.aspect !== aspect) {
			camera.aspect = aspect;
			if (camera.projectionMode === 0) {
				camera.setFrustumPerspective();
			} else {
				camera.setFrustum();
			}
			camera.onFrameChange();
		}
	};

	/**
	 * Sets this.domElement.width and height using the parameters.
	 * Then it calls this.setViewport(0, 0, width, height);
	 * Finally it resets the hardwarePicking.pickingTarget.
	 *
	 * @param {number} width Aspect ratio corrected width.
	 * @param {number} height Aspect ratio corrected height.
	 * @param {number} [fullWidth] Full viewport width.
	 * @param {number} [fullHeight] Full viewport height.
	 */
	Renderer.prototype.setSize = function (width, height, fullWidth, fullHeight) {
		if (fullWidth === undefined) {
			fullWidth = width;
		}
		if (fullHeight === undefined) {
			fullHeight = height;
		}

		this.domElement.width = fullWidth;
		this.domElement.height = fullHeight;

		if (width > fullWidth) {
			var mult = fullWidth / width;
			width = fullWidth;
			height = fullHeight * mult;
		}

		var w = (fullWidth - width) * 0.5;
		var h = (fullHeight - height) * 0.5;

		if (w !== this.viewportX || h !== this.viewportY ||
			width !== this.viewportWidth || height !== this.viewportHeight) {
			this.setViewport(w, h, width, height);

			if (this.hardwarePicking !== null) {
				this.hardwarePicking.pickingTarget = null;
			}
		}
	};

	/**
	 * Sets this.viewportX and viewportY to the parameters or to 0.
	 * Sets this.viewportWidth and viewportHeight to the parameters or to this.domElement.width and height.
	 * Finally it calls this.context.viewport(x, y, w, h) with the resulting values.
	 * @param {number} [x] optional x coordinate.
	 * @param {number} [y] optional y coordinate.
	 * @param {number} [width] optional width coordinate.
	 * @param {number} [height] optional height coordinate.
	 */
	Renderer.prototype.setViewport = function (x, y, width, height) {
		this.viewportX = x !== undefined ? x : 0;
		this.viewportY = y !== undefined ? y : 0;

		this.viewportWidth = width !== undefined ? width : this.domElement.width;
		this.viewportHeight = height !== undefined ? height : this.domElement.height;

		this.context.viewport(this.viewportX, this.viewportY, this.viewportWidth, this.viewportHeight);

		SystemBus.emit('goo.viewportResize', {
			x: this.viewportX,
			y: this.viewportY,
			width: this.viewportWidth,
			height: this.viewportHeight
		}, true);
	};

	/**
	 * Set the background color of the 3D view. All colors are defined in the range 0.0 - 1.0.
	 *
	 * @param {number} r Red value.
	 * @param {number} g Green value.
	 * @param {number} b Blue value.
	 * @param {number} a Alpha value.
	 */
	Renderer.prototype.setClearColor = function (r, g, b, a) {
		//! AT: is exact equality important here?
		if (this._clearColor.r === r &&
			this._clearColor.g === g &&
			this._clearColor.b === b &&
			this._clearColor.a === a
		) {
			return;
		}

		this._clearColor.r = r;
		this._clearColor.g = g;
		this._clearColor.b = b;
		this._clearColor.a = a;
		this.clearColor.copy(this._clearColor);
		this.context.clearColor(r, g, b, a);
	};

	/**
	 * Binds the given BufferData's buffer, or creates a buffer and bind it if none exist.
	 *
	 * @param {BufferData} bufferData BufferData to bind.
	 */
	Renderer.prototype.bindData = function (bufferData) {
		var glBuffer = bufferData.glBuffer;
		var context = this.context;

		if (glBuffer !== null) {
			this.setBoundBuffer(glBuffer, bufferData.target);
			if (bufferData._dataNeedsRefresh) {
				context.bufferSubData(RendererUtils.getGLBufferTarget(context, bufferData.target), 0, bufferData.data);
				bufferData._dataNeedsRefresh = false;
			}
		} else {
			glBuffer = context.createBuffer();
			bufferData.glBuffer = glBuffer;

			this.rendererRecord.invalidateBuffer(bufferData.target);
			this.setBoundBuffer(glBuffer, bufferData.target);
			context.bufferData(RendererUtils.getGLBufferTarget(context, bufferData.target), bufferData.data, RendererUtils.getGLBufferUsage(context, bufferData._dataUsage));
		}
	};

	/**
	 * Update the data buffer of an attribute at it's offset location.
	 *
	 * @param {ArrayBuffer} attributeData New attribute data buffer.
	 * @param {number} offset The starting location offset to the attribute buffer.
	 */
	Renderer.prototype.updateAttributeData = function (attributeData, offset) {
		this.context.bufferSubData(this.context.ARRAY_BUFFER, offset, attributeData);
	};

	Renderer.prototype.setShadowType = function (type) {
		this.shadowHandler.shadowType = type;
	};

	/**
	 * Update the shadowHandler for the provided entities and lights.
	 *
	 * @param {SimplePartitioner} partitioner The partitioner used to determine what gets to be shadowed.
	 * @param {Array<Entity>} entities Array of all the entities to cast shadows.
	 * @param {Array<Light>} lights Array of all the lights to cast shadows for.
	 */
	Renderer.prototype.updateShadows = function (partitioner, entities, lights) {
		this.shadowHandler.checkShadowRendering(this, partitioner, entities, lights);
	};

	/**
	 * Preloads a texture.
	 *
	 * @param {WebGLRenderingContext} context
	 * @param {Texture} texture
	 */
	Renderer.prototype.preloadTexture = function (context, texture) {
		//! schteppe: Is there any case where we want to preload a texture to another context than this.context?

		// REVIEW: Veeeeery similar to loadTexture. Merge?
		//! AT: the code will diverge; it was initially copy-pasted and adapted to suit the need, but it will have to be iterated on; adding more ifs for different code paths is not gonna make the code nicer

		// this.bindTexture(context, texture, unit, record);
		// context.activeTexture(context.TEXTURE0 + unit); // do I need this?

		//! schteppe: What if the .glTexture is not allocated yet?
		context.bindTexture(RendererUtils.getGLType(context, texture.variant), texture.glTexture);

		// set alignment to support images with width % 4 !== 0, as
		// images are not aligned
		context.pixelStorei(context.UNPACK_ALIGNMENT, texture.unpackAlignment);

		// Using premultiplied alpha
		context.pixelStorei(context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);

		// set if we want to flip on Y
		context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, texture.flipY);

		// TODO: Check for the restrictions of using npot textures
		// see: http://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support
		// TODO: Add "usesMipmaps" to check if minfilter has mipmap mode

		var image = texture.image;
		if (texture.variant === '2D') {
			if (!image) {
				context.texImage2D(context.TEXTURE_2D, 0, RendererUtils.getGLInternalFormat(context, texture.format), texture.width, texture.height, 0,
					RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLDataType(context, texture.type), null);
			} else {
				if (!image.isCompressed && (texture.generateMipmaps || image.width > this.maxTextureSize || image.height > this.maxTextureSize)) {
					this.checkRescale(texture, image, image.width, image.height, this.maxTextureSize);
					image = texture.image;
				}

				if (image.isData === true) {
					if (image.isCompressed) {
						this.loadCompressedTexture(context, context.TEXTURE_2D, texture, image.data);
					} else {
						context.texImage2D(context.TEXTURE_2D, 0, RendererUtils.getGLInternalFormat(context, texture.format), image.width,
							image.height, texture.hasBorder ? 1 : 0, RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLDataType(context, texture.type), image.data);
					}
				} else {
					context.texImage2D(context.TEXTURE_2D, 0, RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLDataType(context, texture.type), image);
				}

				if (texture.generateMipmaps && !image.isCompressed) {
					context.generateMipmap(context.TEXTURE_2D);
				}
			}
		} else if (texture.variant === 'CUBE') {
			if (image && !image.isData && (texture.generateMipmaps || image.width > this.maxCubemapSize || image.height > this.maxCubemapSize)) {
				for (var i = 0; i < Texture.CUBE_FACES.length; i++) {
					if (image.data[i] && !image.data[i].buffer ) {
						RendererUtils.scaleImage(texture, image.data[i], image.width, image.height, this.maxCubemapSize, i);
					} else {
						// REVIEW: Hard coded background color that should be determined by Create?
						RendererUtils.getBlankImage(texture, [0.3, 0.3, 0.3, 0], image.width, image.height, this.maxCubemapSize, i);
					}
				}
				texture.image.width = Math.min(this.maxCubemapSize, MathUtils.nearestPowerOfTwo(texture.image.width));
				texture.image.height = Math.min(this.maxCubemapSize, MathUtils.nearestPowerOfTwo(texture.image.height));
				image = texture.image;
			}

			for (var faceIndex = 0; faceIndex < Texture.CUBE_FACES.length; faceIndex++) {
				var face = Texture.CUBE_FACES[faceIndex];

				if (!image) {
					context.texImage2D(RendererUtils.getGLCubeMapFace(context, face), 0, RendererUtils.getGLInternalFormat(context, texture.format), texture.width, texture.height, 0,
						RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLDataType(context, texture.type), null);
				} else {
					if (image.isData === true) {
						if (image.isCompressed) {
							this.loadCompressedTexture(context, RendererUtils.getGLCubeMapFace(context, face), texture, image.data[faceIndex]);
						} else {
							context.texImage2D(RendererUtils.getGLCubeMapFace(context, face), 0, RendererUtils.getGLInternalFormat(context, texture.format), image.width,
								image.height, texture.hasBorder ? 1 : 0, RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLDataType(context, texture.type), image.data[faceIndex]);
						}
					} else {
						context.texImage2D(RendererUtils.getGLCubeMapFace(context, face), 0, RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLDataType(context, texture.type), image.data[faceIndex]);
					}
				}
			}

			if (image && texture.generateMipmaps && !image.isCompressed) {
				context.generateMipmap(context.TEXTURE_CUBE_MAP);
			}
		}
	};

	/**
	 * Preloads the textures of a material.
	 *
	 * @private
	 * @param {Material} material
	 * @param {Array} queue
	 */
	Renderer.prototype.preloadTextures = function (material, queue) {
		var context = this.context;
		var textureKeys = Object.keys(material._textureMaps);

		// for (var i = 0; i < textureKeys.length; i++) {
		// gotta simulate lexical scoping
		textureKeys.forEach(function (textureKey) {
			var texture = material.getTexture(textureKey);

			if (texture === undefined) {
				return;
			}

			var textureList = texture;
			if (texture instanceof Array === false) {
				textureList = [texture];
			}

			// for (var j = 0; j < textureList.length; j++) {
			// gotta simulate lexical scoping
			textureList.forEach(function (texture) {
				if (!texture) { return; }
				queue.push(function () {
					if (texture instanceof RenderTarget === false &&
						(texture.image === undefined || texture.checkDataReady() === false)
					) {
						if (texture.variant === '2D') {
							texture = TextureCreator.DEFAULT_TEXTURE_2D;
						} else if (texture.variant === 'CUBE') {
							texture = TextureCreator.DEFAULT_TEXTURE_CUBE;
						}
					}

					if (texture.glTexture === null) {
						texture.glTexture = context.createTexture();
						this.preloadTexture(context, texture);
						texture.needsUpdate = false;
					} else if (texture instanceof Texture && texture.checkNeedsUpdate()) {
						this.preloadTexture(context, texture);
						texture.needsUpdate = false;
					}
				}.bind(this));
			}, this);
		}, this);
	};

	var preloadMaterialsRenderInfo = new RenderInfo();

	/**
	 * Preloads textures that come with the materials on the supplied "renderables".
	 *
	 * @param {Array} renderList An array of all the "renderables".
	 * @returns {RSVP.Promise}
	 */
	Renderer.prototype.preloadMaterials = function (renderList) {
		var queue = [];
		var renderInfo = preloadMaterialsRenderInfo;
		renderInfo.reset();

		if (Array.isArray(renderList)) {
			for (var i = 0; i < renderList.length; i++) {
				var renderable = renderList[i];
				if (renderable.isSkybox && this._overrideMaterials.length > 0) {
					continue;
				}

				// this function does so much more than I need it to do
				// I only need the material of the renderable
				renderInfo.fill(renderable);

				for (var j = 0; j < renderInfo.materials.length; j++) {
					this.preloadTextures(renderInfo.materials[j], queue);
				}
			}
		} else {
			renderInfo.fill(renderList);
			for (var j = 0; j < renderInfo.materials.length; j++) {
				this.preloadTextures(renderInfo.materials[j], queue);
			}
		}

		return TaskScheduler.each(queue);
	};

	/**
	 * Preprocesses a shader and compiles it.
	 *
	 * @private
	 * @param {Material} material
	 * @param {RenderInfo} renderInfo
	 */
	Renderer.prototype.precompileShader = function (material, renderInfo) {
		var shader = material.shader;

		shader.updateProcessors(renderInfo);
		this.findOrCacheMaterialShader(material, renderInfo);
		shader = material.shader;
		shader.precompile(this);
	};

	/**
	 * Remove all shaders from cache.
	 */
	Renderer.prototype.clearShaderCache = function () {
		this.rendererRecord.shaderCache.clear();
	};

	/**
	 * Precompiles shaders of the supplied "renderables".
	 *
	 * @param {Array} renderList An array of all the "renderables".
	 * @param {Array<Light>} lights
	 */
	Renderer.prototype.precompileShaders = function (renderList, lights) {
		var renderInfo = new RenderInfo();

		if (lights) {
			renderInfo.lights = lights;
		}

		var queue = [];

		if (Array.isArray(renderList)) {
			for (var i = 0; i < renderList.length; i++) {
				var renderable = renderList[i];
				if (renderable.isSkybox && this._overrideMaterials.length > 0) {
					continue;
				}
				renderInfo.fill(renderable);

				for (var j = 0; j < renderInfo.materials.length; j++) {
					renderInfo.material = renderInfo.materials[j];
					this.precompileShader(renderInfo.materials[j], renderInfo, queue);
				}
			}
		} else {
			renderInfo.fill(renderList);
			for (var j = 0; j < renderInfo.materials.length; j++) {
				renderInfo.material = renderInfo.materials[j];
				this.precompileShader(renderInfo.materials[j], renderInfo, queue);
			}
		}

		return TaskScheduler.each(queue);
	};

	//! MF: This method appears to be unused, and it's way of using renderInfo.fill might be questionable.
	/**
	 * Creates buffers of the supplied renderList.
	 *
	 * @hidden
	 * @param {Array} renderList An array of "renderables".
	 */
	Renderer.prototype.preloadBuffers = function (renderList) {
		var renderInfo = new RenderInfo();

		if (Array.isArray(renderList)) {
			for (var i = 0; i < renderList.length; i++) {
				var renderable = renderList[i];
				if (renderable.isSkybox && this._overrideMaterials.length > 0) {
					continue;
				}
				renderInfo.fill(renderable);
				for (var j = 0; j < renderInfo.materials.length; j++) {
					renderInfo.material = renderInfo.materials[j];
					this.preloadBuffer(renderable, renderInfo.materials[j], renderInfo);
				}
			}
		} else {
			renderInfo.fill(renderList);
			for (var j = 0; j < renderInfo.materials.length; j++) {
				renderInfo.material = renderInfo.materials[j];
				this.preloadBuffer(renderList, renderInfo.materials[j], renderInfo);
			}
		}
	};

	/**
	 * Creates buffers of the supplied "renderables".
	 *
	 * @hidden
	 * @param {Array} renderables
	 * @param {Material} material
	 * @param {RenderInfo} renderInfo
	 */
	Renderer.prototype.preloadBuffer = function (renderables, material, renderInfo) {
		var meshData = renderInfo.meshData;
		if (meshData.vertexData === null || meshData.vertexData !== null && meshData.vertexData.data.byteLength === 0 || meshData.indexData !== null
			&& meshData.indexData.data.byteLength === 0) {
			return;
		}
		this.bindData(meshData.vertexData);
		if (meshData.getIndexBuffer() !== null) {
			this.bindData(meshData.getIndexData());
		}

		var materials = renderInfo.materials;
		var flatOrWire = null;
		var originalData = meshData;

		var count;
		if (this._overrideMaterials.length === 0) {
			count = materials.length;
		} else {
			count = this._overrideMaterials.length;
		}

		for (var i = 0; i < count; i++) {
			var material = null, orMaterial = null;

			if (i < materials.length) {
				material = materials[i];
			}
			if (i < this._overrideMaterials.length) {
				orMaterial = this._overrideMaterials[i];
			}

			if (material && orMaterial) {
				this._override(orMaterial, material, this._mergedMaterial);
				material = this._mergedMaterial;
			} else if (orMaterial) {
				material = orMaterial;
			}

			if (!material.shader) {
				if (!material.errorOnce) {
					console.warn('No shader set on material: ' + material.name);
					material.errorOnce = true;
				}
				continue;
			} else {
				material.errorOnce = false;
			}

			if (material.wireframe && flatOrWire !== 'wire') {
				if (!meshData.wireframeData) {
					meshData.wireframeData = meshData.buildWireframeData();
				}
				meshData = meshData.wireframeData;
				this.bindData(meshData.vertexData);
				flatOrWire = 'wire';
			} else if (material.flat && flatOrWire !== 'flat') {
				if (!meshData.flatMeshData) {
					meshData.flatMeshData = meshData.buildFlatMeshData();
				}
				meshData = meshData.flatMeshData;
				this.bindData(meshData.vertexData);
				flatOrWire = 'flat';
			} else if (!material.wireframe && !material.flat && flatOrWire !== null) {
				meshData = originalData;
				this.bindData(meshData.vertexData);
				flatOrWire = null;
			}
		}
	};

	var renderRenderInfo = new RenderInfo();

	var startEachShaderFrame = function (shader) {
		shader.startFrame();
	};

	/**
	 * Renders a "renderable" or a list of renderables. Handles all setup and updates of materials/shaders and states.
	 * @param {Array<Entity>} renderList A list of "renderables". Eg Entities with the right components or objects with mesh data, material and transform.
	 * @param {Camera} camera Main camera for rendering.
	 * @param {Array<Light>} lights Lights used in the rendering.
	 * @param {RenderTarget} [renderTarget=null] Optional rendertarget to use as target for rendering, or null to render to the screen.
	 * @param {(boolean|Object)} [clear=false] true/false to clear or not clear all types, or an object in the form <code>{color:true/false, depth:true/false, stencil:true/false}</code>
	 * @param {Array<Material>} [overrideMaterials] Optional list of materials to override the renderList materials.
	 */
	Renderer.prototype.render = function (renderList, camera, lights, renderTarget, clear, overrideMaterials) {
		if (overrideMaterials) {
			this._overrideMaterials = (overrideMaterials instanceof Array) ? overrideMaterials : [overrideMaterials];
		} else {
			this._overrideMaterials = [];
		}
		if (!camera) {
			return;
		} else if (Renderer.mainCamera === null && !renderTarget) {
			Renderer.mainCamera = camera;
		}

		this.setRenderTarget(renderTarget);

		if (clear === undefined || clear === null || clear === true) {
			this.clear();
		} else if (typeof clear === 'object') {
			this.clear(clear.color, clear.depth, clear.stencil);
		}

		this.rendererRecord.shaderCache.forEach(startEachShaderFrame);

		var renderInfo = renderRenderInfo;
		renderInfo.reset();
		renderInfo.camera = camera;
		renderInfo.mainCamera = Renderer.mainCamera;
		renderInfo.lights = lights;
		renderInfo.shadowHandler = this.shadowHandler;
		renderInfo.renderer = this;

		if (Array.isArray(renderList)) {
			this.renderQueue.sort(renderList, camera);

			for (var i = 0; i < renderList.length; i++) {
				var renderable = renderList[i];
				if (renderable.isSkybox && this._overrideMaterials.length > 0) {
					continue;
				}
				renderInfo.fill(renderable);
				this.renderMesh(renderInfo);
			}
		} else {
			renderInfo.fill(renderList);
			this.renderMesh(renderInfo);
		}

		// TODO: shouldnt we check for generateMipmaps setting on rendertarget?
		if (
			renderTarget &&
			renderTarget.generateMipmaps &&
			MathUtils.isPowerOfTwo(renderTarget.width) &&
			MathUtils.isPowerOfTwo(renderTarget.height)
		) {
			this.updateRenderTargetMipmap(renderTarget);
		}
	};

	/*
	REVIEW:
	+ it is not called from anywhere outside of the renderer and it probably is not of public interest so it should be private
	+ moreover it does not change `this` in any way nor does it need to belong to instances of Renderer - it can be only a helper function
	+ it could also use a description of what it's supposed to do
	 */
	/**
	 * Fills the store parameter with the combined properties of mat1 and mat2.
	 *
	 * @param {Material} mat1
	 * @param {Material} mat2
	 * @param {Material} store
	 */
	Renderer.prototype._override = function (mat1, mat2, store) {
		store.empty();
		var keys = Object.keys(store);
		for (var i = 0, l = keys.length; i < l; i++) {
			var key = keys[i];

			var storeVal = store[key];
			var mat1Val = mat1[key];
			var mat2Val = mat2[key];
			if (storeVal instanceof Object && key !== 'shader') {
				var matkeys = Object.keys(mat1Val);
				for (var j = 0, l2 = matkeys.length; j < l2; j++) {
					var prop = matkeys[j];
					storeVal[prop] = mat1Val[prop];
				}
				var matkeys = Object.keys(mat2Val);
				for (var j = 0, l2 = matkeys.length; j < l2; j++) {
					var prop = matkeys[j];
					if (storeVal[prop] === undefined) {
						storeVal[prop] = mat2Val[prop];
					}
				}
			} else {
				if (mat1Val !== undefined) {
					store[key] = mat1Val;
				} else {
					store[key] = mat2Val;
				}
			}
		}
	};

	/**
	 * Renders a mesh from a RenderInfo.
	 *
	 * @param {RenderInfo} renderInfo
	 */
	Renderer.prototype.renderMesh = function (renderInfo) {
		var meshData = renderInfo.meshData;
		if (!meshData || meshData.vertexData === null || meshData.vertexData !== null && meshData.vertexData.data.byteLength === 0 || meshData.indexData !== null
			&& meshData.indexData.data.byteLength === 0) {
			return;
		}

		this.bindData(meshData.vertexData);

		if (meshData._attributeDataNeedsRefresh) {
			meshData._dirtyAttributeNames.forEach(function (name) {
				this.updateAttributeData(meshData.dataViews[name], meshData.attributeMap[name].offset);
			}, this);

			meshData._attributeDataNeedsRefresh = false;
			meshData._dirtyAttributeNames.clear();
		}

		var materials = renderInfo.materials;

		/*if (this.overrideMaterial !== null) {
			materials = this.overrideMaterial instanceof Array ? this.overrideMaterial : [this.overrideMaterial];
		}*/

		var flatOrWire = null;
		var originalData = meshData;

		// number of materials to render - own materials or overriding materials
		var count = 0;
		if (this._overrideMaterials.length === 0) {
			count = materials.length;
		} else {
			count = this._overrideMaterials.length;
		}

		for (var i = 0; i < count; i++) {
			this.renderMeshMaterial(i, materials, flatOrWire, originalData, renderInfo);
		}
	};

	/**
	 * Call the shader processors of the given material and update material cache.
	 *
	 * @param {Material} material
	 * @param {RenderInfo} renderInfo
	 */
	Renderer.prototype.callShaderProcessors = function (material, renderInfo) {
		// Check for caching of shader that use defines
		material.shader.updateProcessors(renderInfo);
		this.findOrCacheMaterialShader(material, renderInfo);
	};

	/**
	 * Render a material with the given parameters.
	 *
	 * @param {number} materialIndex
	 * @param {Array<Material>} materials
	 * @param {boolean} flatOrWire
	 * @param {MeshData} originalData
	 * @param {RenderInfo} renderInfo
	 */
	Renderer.prototype.renderMeshMaterial = function (materialIndex, materials, flatOrWire, originalData, renderInfo) {
		var material = null, orMaterial = null;

		if (materialIndex < materials.length) {
			material = materials[materialIndex];
		}
		if (materialIndex < this._overrideMaterials.length) {
			orMaterial = this._overrideMaterials[materialIndex];
		}

		material = this.configureRenderInfo(renderInfo, materialIndex, material, orMaterial, originalData, flatOrWire);
		var meshData = renderInfo.meshData;

		this.callShaderProcessors(material, renderInfo);

		material.shader.apply(renderInfo, this);

		this.updateDepthTest(material);
		this.updateCulling(material);
		this.updateBlending(material);
		this.updateOffset(material);
		this.updateTextures(material);

		this.updateLineAndPointSettings(material);

		this._checkDualTransparency(material, meshData);

		this.updateCulling(material);
		this._drawBuffers(meshData);

		this.info.calls++;
		this.info.vertices += meshData.vertexCount;
		this.info.indices += meshData.indexCount;
	};

	/**
	 * Draw the buffers of a MeshData using the specified index-mode.
	 *
	 * @param {MeshData} meshData
	 */
	Renderer.prototype._drawBuffers = function (meshData) {
		if (meshData.getIndexBuffer() !== null) {
			this.bindData(meshData.getIndexData());
			if (meshData.getIndexLengths() !== null) {
				this.drawElementsVBO(meshData.getIndexBuffer(), meshData.getIndexModes(), meshData.getIndexLengths());
			} else {
				this.drawElementsVBO(meshData.getIndexBuffer(), meshData.getIndexModes(), [meshData.getIndexBuffer().length]);
			}
		} else {
			if (meshData.getIndexLengths() !== null) {
				this.drawArraysVBO(meshData.getIndexModes(), meshData.getIndexLengths());
			} else {
				this.drawArraysVBO(meshData.getIndexModes(), [meshData.vertexCount]);
			}
		}
	};

	/**
	 * Decides which MeshData and Material to set on the renderInfo parameter object, also returns the specified material.
	 *
	 * @param {RenderInfo} renderInfo
	 * @param {number} materialIndex
	 * @param {Material} material
	 * @param {Material} orMaterial
	 * @param {MeshData} originalData
	 * @param {string} flatOrWire Can be one of 'flat' or 'wire'
	 * @returns {Material}
	 */
	Renderer.prototype.configureRenderInfo = function (renderInfo, materialIndex, material, orMaterial, originalData, flatOrWire) {
		var meshData = renderInfo.meshData;
		if (materialIndex < this._overrideMaterials.length) {
			orMaterial = this._overrideMaterials[materialIndex];
		}

		if (material && orMaterial && orMaterial.fullOverride !== true) {
			this._override(orMaterial, material, this._mergedMaterial);
			material = this._mergedMaterial;
		} else if (orMaterial) {
			material = orMaterial;
		}

		if (!material.shader) {
			if (!material.errorOnce) {
				console.warn('No shader set on material: ' + material.name);
				material.errorOnce = true;
			}
			return;
		} else {
			material.errorOnce = false;
		}

		if (material.wireframe && flatOrWire !== 'wire') {
			if (!meshData.wireframeData) {
				meshData.wireframeData = meshData.buildWireframeData();
			}
			meshData = meshData.wireframeData;
			this.bindData(meshData.vertexData);
			flatOrWire = 'wire';
		} else if (material.flat && flatOrWire !== 'flat') {
			if (!meshData.flatMeshData) {
				meshData.flatMeshData = meshData.buildFlatMeshData();
			}
			meshData = meshData.flatMeshData;
			this.bindData(meshData.vertexData);
			flatOrWire = 'flat';
		} else if (!material.wireframe && !material.flat && flatOrWire !== null) {
			meshData = originalData;
			this.bindData(meshData.vertexData);
			flatOrWire = null;
		}


		renderInfo.material = material;
		renderInfo.meshData = meshData;
		return material;
	};

	/**
	 * Finds shader of the material in the cache, or add it to the cache if not added yet. Then update the uniforms to the cached shader.
	 *
	 * @param {Material} material
	 * @param {RenderInfo} renderInfo
	 */
	Renderer.prototype.findOrCacheMaterialShader = function (material, renderInfo) {
		// check defines. if no hit in cache -> add to cache. if hit in cache,
		// replace with cache version and copy over uniforms.

		var shader = material.shader;
		var shaderCache = this.rendererRecord.shaderCache;
		shader.endFrame();

		var defineKey = shader.getDefineKey(this._definesIndices);

		var cachedShader = shaderCache.get(defineKey);
		if (cachedShader === material.shader) {
			return;
		}

		if (cachedShader) {
			cachedShader.defines = {};
			if (material.shader.defines) {
				var keys = Object.keys(material.shader.defines);
				for (var i = 0, l = keys.length; i < l; i++) {
					var key = keys[i];
					cachedShader.defines[key] = material.shader.defines[key];
				}
				cachedShader.defineKey = material.shader.defineKey;
			}

			var uniforms = material.shader.uniforms;
			var keys = Object.keys(uniforms);
			for (var i = 0, l = keys.length; i < l; i++) {
				var key = keys[i];
				var origUniform = cachedShader.uniforms[key] = uniforms[key];
				if (origUniform instanceof Array) {
					cachedShader.uniforms[key] = origUniform.slice(0);
				}
			}
			material.shader = cachedShader;
		} else {
			if (shader.builder) {
				shader.builder(shader, renderInfo);
			}

			shader = shader.clone();
			shaderCache.set(defineKey, shader);
			material.shader = shader;
		}
	};

	/**
	 * Checks a material for dualTransparency and if enabled, draws the MeshData buffers again with inverse cullFace.
	 *
	 * @param {Material} material
	 * @param {MeshData} meshData
	 */
	Renderer.prototype._checkDualTransparency = function (material, meshData) {
		if (material.dualTransparency) {
			var savedCullFace = material.cullState.cullFace;
			var newCullFace = savedCullFace === 'Front' ? 'Back' : 'Front';
			material.cullState.cullFace = newCullFace;

			this.updateCulling(material);
			this._drawBuffers(meshData);

			material.cullState.cullFace = savedCullFace;
		}
	};

	/**
	 * Read pixels from current framebuffer to a typed array (ArrayBufferView).
	 *
	 * @param {number} x x offset of rectangle to read from.
	 * @param {number} y y offset of rectangle to read from.
	 * @param {number} width width of rectangle to read from.
	 * @param {number} height height of rectangle to read from.
	 * @param {ArrayBufferView} store ArrayBufferView to store data in (Uint8Array).
	 */
	Renderer.prototype.readPixels = function (x, y, width, height, store) {
		store = store || new Uint8Array(width * height * 4);
		var context = this.context;
		context.readPixels(x, y, width, height, context.RGBA, context.UNSIGNED_BYTE, store);
		return store;
	};

	/**
	 * Read pixels from a texture to a typed array (ArrayBufferView).
	 *
	 * @param {Texture} texture texture to read pixels from.
	 * @param {number} x x offset of rectangle to read from.
	 * @param {number} y y offset of rectangle to read from.
	 * @param {number} width width of rectangle to read from.
	 * @param {number} height height of rectangle to read from.
	 * @param {ArrayBufferView} store ArrayBufferView to store data in (Uint8Array).
	 */
	Renderer.prototype.readTexturePixels = function (texture, x, y, width, height, store) {
		store = store || new Uint8Array(width * height * 4);
		var context = this.context;
		var glFrameBuffer = context.createFramebuffer();
		context.bindFramebuffer(context.FRAMEBUFFER, glFrameBuffer);
		context.framebufferTexture2D(context.FRAMEBUFFER, context.COLOR_ATTACHMENT0,
			context.TEXTURE_2D, texture.glTexture, 0);
		if (context.checkFramebufferStatus(context.FRAMEBUFFER) === context.FRAMEBUFFER_COMPLETE) {
			context.readPixels(x, y, width, height, context.RGBA, context.UNSIGNED_BYTE, store);
		}
		return store;
	};

	/**
	 * Draws a vertex buffer object (VBO) using drawElements.
	 *
	 * @param {BufferData} indices The index-buffer.
	 * @param {Array<string>} indexModes Array of index-modes.
	 * @param {Array<number>} indexLengths Array of index-counts per index-mode.
	 */
	Renderer.prototype.drawElementsVBO = function (indices, indexModes, indexLengths) {
		var offset = 0;
		var indexModeCounter = 0;
		var type = indices.type = indices.type || RendererUtils.getGLArrayType(this.context, indices);
		var byteSize = RendererUtils.getGLByteSize(indices);

		for (var i = 0; i < indexLengths.length; i++) {
			var count = indexLengths[i];
			var glIndexMode = RendererUtils.getGLIndexMode(this.context, indexModes[indexModeCounter]);

			this.context.drawElements(glIndexMode, count, type, offset * byteSize);

			offset += count;

			if (indexModeCounter < indexModes.length - 1) {
				indexModeCounter++;
			}
		}
	};

	/**
	 * Draws a vertex buffer object (VBO) using drawArrays.
	 *
	 * @param {Array<string>} indexModes Array of index-modes.
	 * @param {Array<number>} indexLengths Array of index-counts per index-mode.
	 */
	Renderer.prototype.drawArraysVBO = function (indexModes, indexLengths) {
		var offset = 0;
		var indexModeCounter = 0;

		for (var i = 0; i < indexLengths.length; i++) {
			var count = indexLengths[i];
			var glIndexMode = RendererUtils.getGLIndexMode(this.context, indexModes[indexModeCounter]);

			this.context.drawArrays(glIndexMode, offset, count);

			offset += count;

			if (indexModeCounter < indexModes.length - 1) {
				indexModeCounter++;
			}
		}
	};

	/**
	 * Render entities to be used with the Renderer.pick.
	 *
	 * @param {Array<Entity>} renderList A list of "renderables". Eg Entities with the right components or objects with mesh data, material and transform.
	 * @param {Camera} camera Main camera for rendering to pick.
	 * @param {(boolean|Object)} [clear=false] true/false to clear or not clear all types, or an object in the form <code>{color:true/false, depth:true/false, stencil:true/false}</code>
	 * @param {boolean} skipUpdateBuffer
	 * @param {boolean} doScissor
	 * @param {number} clientX scissor position X.
	 * @param {number} clientY scissor position Y.
	 * @param {Material} customPickingMaterial Custom picking material.
	 * @param {boolean} skipOverride
	 */
	Renderer.prototype.renderToPick = function (renderList, camera, clear, skipUpdateBuffer, doScissor, clientX, clientY, customPickingMaterial, skipOverride) {
		if (this.viewportWidth * this.viewportHeight === 0) {
			return;
		}
		var pickingResolutionDivider = 4;
		if (this.hardwarePicking === null) {
			var pickingMaterial = Material.createEmptyMaterial(ShaderLib.pickingShader, 'pickingMaterial');
			pickingMaterial.blendState = {
				blending: 'NoBlending',
				blendEquation: 'AddEquation',
				blendSrc: 'SrcAlphaFactor',
				blendDst: 'OneMinusSrcAlphaFactor'
			};
			pickingMaterial.wireframe = false;

			this.hardwarePicking = {
				pickingTarget: new RenderTarget(this.viewportWidth / pickingResolutionDivider, this.viewportHeight / pickingResolutionDivider, {
					minFilter: 'NearestNeighborNoMipMaps',
					magFilter: 'NearestNeighbor'
				}),
				pickingMaterial: pickingMaterial,
				pickingBuffer: new Uint8Array(4),
				clearColorStore: new Vector4()
			};
			skipUpdateBuffer = false;
		} else if (this.hardwarePicking.pickingTarget === null) {
			this.hardwarePicking.pickingTarget = new RenderTarget(this.viewportWidth / pickingResolutionDivider, this.viewportHeight / pickingResolutionDivider, {
					minFilter: 'NearestNeighborNoMipMaps',
					magFilter: 'NearestNeighbor'
				});
			skipUpdateBuffer = false;
		}

		if (!skipUpdateBuffer) {
			this.hardwarePicking.clearColorStore.set(this.clearColor);
			if (doScissor && clientX !== undefined && clientY !== undefined) {
				var devicePixelRatio = this._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / this.svg.currentScale : 1;

				var x = Math.floor((clientX * devicePixelRatio - this.viewportX) / pickingResolutionDivider);
				var y = Math.floor((this.viewportHeight - (clientY * devicePixelRatio - this.viewportY)) / pickingResolutionDivider);
				this.context.enable(this.context.SCISSOR_TEST);
				this.context.scissor(x, y, 1, 1);
			}

			var pickList = [];
			for (var i = 0, l = renderList.length; i < l; i++) {
				var entity = renderList[i];
				if (!entity.meshRendererComponent || entity.meshRendererComponent.isPickable) {
					pickList.push(entity);
				}
			}

			if (skipOverride) {
				this.render(pickList, camera, [], this.hardwarePicking.pickingTarget, clear);
			} else {
				this.render(pickList, camera, [], this.hardwarePicking.pickingTarget, clear, customPickingMaterial || this.hardwarePicking.pickingMaterial);
			}

			if (doScissor) {
				this.context.disable(this.context.SCISSOR_TEST);
			}
		} else {
			this.setRenderTarget(this.hardwarePicking.pickingTarget);
		}
	};

	/**
	 * Determine what entity ID is at a specific pixel of the camera.
	 *
	 * @param {number} clientX pixel position X to pick at.
	 * @param {number} clientY pixel position Y to pick at.
	 * @param {Object} pickingStore An object with variables 'id' and 'depth' to be populated by the function.
	 * @param {Camera} camera Same camera that was used with Renderer.renderToPick.
	 */
	Renderer.prototype.pick = function (clientX, clientY, pickingStore, camera) {
		if (this.viewportWidth * this.viewportHeight === 0) {
			pickingStore.id = -1;
			pickingStore.depth = 0;
			return;
		}
		var devicePixelRatio = this._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / this.svg.currentScale : 1;

		var pickingResolutionDivider = 4;
		var x = Math.floor((clientX * devicePixelRatio - this.viewportX) / pickingResolutionDivider);
		var y = Math.floor((this.viewportHeight - (clientY * devicePixelRatio - this.viewportY)) / pickingResolutionDivider);

		this.readPixels(x, y, 1, 1, this.hardwarePicking.pickingBuffer);

		var id = this.hardwarePicking.pickingBuffer[0] * 255.0 + this.hardwarePicking.pickingBuffer[1] - 1;
		var depth = (this.hardwarePicking.pickingBuffer[2] / 255.0 + (this.hardwarePicking.pickingBuffer[3] / (255.0 * 255.0))) * camera.far;
		pickingStore.id = id;
		pickingStore.depth = depth;
	};

	/**
	 * Update the webgl contexts line and point settings.
	 *
	 * @param {Material} material
	 */
	Renderer.prototype.updateLineAndPointSettings = function (material) {
		var record = this.rendererRecord.lineRecord;
		var lineWidth = material.lineWidth || 1;

		if (record.lineWidth !== lineWidth) {
			this.context.lineWidth(lineWidth);
			record.lineWidth = lineWidth;
		}
	};

	/**
	 * Update the webgl contexts depth test settings.
	 *
	 * @param {Material} material
	 */
	Renderer.prototype.updateDepthTest = function (material) {
		var record = this.rendererRecord.depthRecord;
		var depthState = material.depthState;

		if (record.enabled !== depthState.enabled) {
			if (depthState.enabled) {
				this.context.enable(this.context.DEPTH_TEST);
			} else {
				this.context.disable(this.context.DEPTH_TEST);
			}
			record.enabled = depthState.enabled;
		}
		if (record.write !== depthState.write) {
			if (depthState.write) {
				this.context.depthMask(true);
			} else {
				this.context.depthMask(false);
			}
			record.write = depthState.write;
		}
		if (record.depthFunc !== depthState.depthFunc) {
			this.context.depthFunc(RendererUtils.getGLDepthFunc(this.context, depthState.depthFunc));
			record.depthFunc = depthState.depthFunc;
		}
	};

	/**
	 * Update the webgl contexts culling settings.
	 *
	 * @param {Material} material
	 */
	Renderer.prototype.updateCulling = function (material) {
		var record = this.rendererRecord.cullRecord;
		var cullFace = material.cullState.cullFace;
		var frontFace = material.cullState.frontFace;
		var enabled = material.cullState.enabled;

		if (record.enabled !== enabled) {
			if (enabled) {
				this.context.enable(this.context.CULL_FACE);
			} else {
				this.context.disable(this.context.CULL_FACE);
			}
			record.enabled = enabled;
		}

		if (record.cullFace !== cullFace) {
			var glCullFace = cullFace === 'Front' ? this.context.FRONT : cullFace === 'Back' ? this.context.BACK
				: this.context.FRONT_AND_BACK;
			this.context.cullFace(glCullFace);
			record.cullFace = cullFace;
		}

		if (record.frontFace !== frontFace) {
			switch (frontFace) {
				case 'CCW':
					this.context.frontFace(this.context.CCW);
					break;
				case 'CW':
					this.context.frontFace(this.context.CW);
					break;
			}
			record.frontFace = frontFace;
		}
	};

	/**
	 * Update the webgl contexts settings concerning textures.
	 * updates the material textures if necessary.
	 *
	 * @param {Material} material
	 */
	Renderer.prototype.updateTextures = function (material) {
		var context = this.context;
		var textureSlots = material.shader.textureSlots;

		for (var i = 0; i < textureSlots.length; i++) {
			var textureSlot = textureSlots[i];
			var texture = material.getTexture(textureSlot.mapping);

			if (texture === undefined) {
				continue;
			}

			var textureList = texture;
			if (texture instanceof Array === false) {
				textureList = [texture];
			}

			for (var j = 0; j < textureList.length; j++) {
				texture = textureList[j];

				var texIndex = textureSlot.index instanceof Array ? textureSlot.index[j] : textureSlot.index;

				if (texture === null || texture instanceof RenderTarget && texture.glTexture === null ||
					texture instanceof RenderTarget === false && (texture.image === undefined ||
						texture.checkDataReady() === false)) {
					if (textureSlot.format === 'sampler2D') {
						texture = TextureCreator.DEFAULT_TEXTURE_2D;
					} else if (textureSlot.format === 'samplerCube') {
						texture = TextureCreator.DEFAULT_TEXTURE_CUBE;
					}
				}

				var unitrecord = this.rendererRecord.textureRecord[texIndex];
				if (unitrecord === undefined) {
					unitrecord = this.rendererRecord.textureRecord[texIndex] = {};
				}

				if (texture.glTexture === null) {
					texture.glTexture = context.createTexture();
					this.updateTexture(context, texture, texIndex, unitrecord);
					texture.needsUpdate = false;
				} else if (texture instanceof RenderTarget === false && texture.checkNeedsUpdate()) {
					this.updateTexture(context, texture, texIndex, unitrecord);
					texture.needsUpdate = false;
				} else {
					this.bindTexture(context, texture, texIndex, unitrecord);
				}

				var imageObject = texture.image !== undefined ? texture.image : texture;
				var isTexturePowerOfTwo = MathUtils.isPowerOfTwo(imageObject.width) && MathUtils.isPowerOfTwo(imageObject.height);
				this.updateTextureParameters(texture, isTexturePowerOfTwo);
			}
		}
	};

	/**
	 * Update the webgl contexts settings of a single texture, such as filtering and wrapping.
	 *
	 * @param {Texture} texture
	 * @param {boolean} isImagePowerOfTwo
	 */
	Renderer.prototype.updateTextureParameters = function (texture, isImagePowerOfTwo) {
		var context = this.context;

		var texrecord = texture.textureRecord;

		var glType = RendererUtils.getGLType(context, texture.variant);
		if (texrecord.magFilter !== texture.magFilter) {
			context.texParameteri(glType, context.TEXTURE_MAG_FILTER, RendererUtils.getGLMagFilter(context, texture.magFilter));
			texrecord.magFilter = texture.magFilter;
		}
		var minFilter = isImagePowerOfTwo ? texture.minFilter : RendererUtils.getFilterFallback(texture.minFilter);
		if (texrecord.minFilter !== minFilter) {
			context.texParameteri(glType, context.TEXTURE_MIN_FILTER, RendererUtils.getGLMinFilter(context, minFilter));
			texrecord.minFilter = minFilter;
		}

		// repeating NPOT textures are not supported in webgl https://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences
		var wrapS = isImagePowerOfTwo ? texture.wrapS : 'EdgeClamp';
		if (texrecord.wrapS !== wrapS) {
			var glwrapS = RendererUtils.getGLWrap(context, wrapS);
			context.texParameteri(glType, context.TEXTURE_WRAP_S, glwrapS);
			texrecord.wrapS = wrapS;
		}
		var wrapT = isImagePowerOfTwo ? texture.wrapT : 'EdgeClamp';
		if (texrecord.wrapT !== wrapT) {
			var glwrapT = RendererUtils.getGLWrap(context, wrapT);
			context.texParameteri(glType, context.TEXTURE_WRAP_T, glwrapT);
			texrecord.wrapT = wrapT;
		}

		if (Capabilities.TextureFilterAnisotropic && texture.type !== 'Float') {
			var anisotropy = texture.anisotropy;
			if (texrecord.anisotropy !== anisotropy) {
				context.texParameterf(glType, Capabilities.TextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(anisotropy, Capabilities.maxAnisotropy));
				texrecord.anisotropy = anisotropy;
			}
		}
	};

	/**
	 * Binds a texture to webgl.
	 *
	 * @param {WebGLRenderingContext} context
	 * @param {Texture} texture
	 * @param {number} unit The index for the textureRecord.
	 * @param {Object} record
	 */
	Renderer.prototype.bindTexture = function (context, texture, unit, record) {
		if (record.boundTexture === undefined || texture.glTexture !== undefined && record.boundTexture !== texture.glTexture) {
			context.activeTexture(context.TEXTURE0 + unit);
			context.bindTexture(RendererUtils.getGLType(context, texture.variant), texture.glTexture);
			record.boundTexture = texture.glTexture;
		}
	};

	/**
	 * Unbinds a texture from webgl.
	 *
	 * @param {WebGLRenderingContext} context
	 * @param {Texture} texture
	 * @param {number} unit The index for the textureRecord.
	 * @param {Object} record
	 */
	Renderer.prototype.unbindTexture = function (context, texture, unit, record) {
		context.activeTexture(context.TEXTURE0 + unit);
		context.bindTexture(RendererUtils.getGLType(context, texture.variant), null);
		record.boundTexture = undefined;
	};

	/**
	 * Loads a compressed texture into webgl and optionally generates mipmaps.
	 *
	 * @param {WebGLRenderingContext} context
	 * @param {number} target For example context.TEXTURE_2D.
	 * @param {Texture} texture
	 * @param {(Uint8Array|ArrayBufferView)} imageData The image data object.
	 */
	Renderer.prototype.loadCompressedTexture = function (context, target, texture, imageData) {
		var mipSizes = texture.image.mipmapSizes;
		var dataOffset = 0, dataLength = 0;
		var width = texture.image.width, height = texture.image.height;
		var ddsExt = Capabilities.CompressedTextureS3TC;

		if (!ddsExt) {
			texture.image = undefined;
			texture.needsUpdate = true;
			console.warn('Tried to load unsupported compressed texture.');
			return;
		}

		var internalFormat = ddsExt.COMPRESSED_RGBA_S3TC_DXT5_EXT;
		if (texture.format === 'PrecompressedDXT1') {
			internalFormat = ddsExt.COMPRESSED_RGB_S3TC_DXT1_EXT;
		} else if (texture.format === 'PrecompressedDXT1A') {
			internalFormat = ddsExt.COMPRESSED_RGBA_S3TC_DXT1_EXT;
		} else if (texture.format === 'PrecompressedDXT3') {
			internalFormat = ddsExt.COMPRESSED_RGBA_S3TC_DXT3_EXT;
		} else if (texture.format === 'PrecompressedDXT5') {
			internalFormat = ddsExt.COMPRESSED_RGBA_S3TC_DXT5_EXT;
		} else {
			throw new Error('Unhandled compression format: ' + imageData.getDataFormat().name());
		}

		if (typeof mipSizes === 'undefined' || mipSizes === null) {
			if (imageData instanceof Uint8Array) {
				context.compressedTexImage2D(target, 0, internalFormat, width, height, 0, imageData);
			} else {
				context.compressedTexImage2D(target, 0, internalFormat, width, height, 0, new Uint8Array(imageData.buffer, imageData.byteOffset,
					imageData.byteLength));
			}
		} else {
			texture.generateMipmaps = false;
			if (imageData instanceof Array) {
				for (var i = 0; i < imageData.length; i++) {
					context.compressedTexImage2D(target, i, internalFormat, width, height, 0, imageData[i]);
					//! SH: REVIEW: this operation is being done many times, not very DRY; also Math.floor is practically as fast as ~~, does the same thing, and is more readable. http://jsperf.com/jsfvsbitnot/15
					width = ~~(width / 2) > 1 ? ~~(width / 2) : 1;
					height = ~~(height / 2) > 1 ? ~~(height / 2) : 1;
				}
			} else {
				for (var i = 0; i < mipSizes.length; i++) {
					dataLength = mipSizes[i];
					context.compressedTexImage2D(target, i, internalFormat, width, height, 0, new Uint8Array(imageData.buffer, imageData.byteOffset
						+ dataOffset, dataLength));
					width = ~~(width / 2) > 1 ? ~~(width / 2) : 1;
					height = ~~(height / 2) > 1 ? ~~(height / 2) : 1;
					dataOffset += dataLength;
				}
			}

			var expectedMipmaps = 1 + Math.ceil(Math.log(Math.max(texture.image.height, texture.image.width)) / Math.log(2));
			var size = mipSizes[mipSizes.length - 1];
			if (mipSizes.length < expectedMipmaps) {
				for (var i = mipSizes.length; i < expectedMipmaps; i++) {
					size = ~~((width + 3) / 4) * ~~((height + 3) / 4) * texture.image.bpp * 2;
					context.compressedTexImage2D(target, i, internalFormat, width, height, 0, new Uint8Array(size));
					width = ~~(width / 2) > 1 ? ~~(width / 2) : 1;
					height = ~~(height / 2) > 1 ? ~~(height / 2) : 1;
				}
			}
		}
	};

	/**
	 * Updates a texture in webgl with the Texture objects settings.
	 *
	 * @param {WebGLRenderingContext} context
	 * @param {Texture} texture
	 * @param {number} unit
	 * @param {Object} record
	 */
	Renderer.prototype.updateTexture = function (context, texture, unit, record) {
		// this.bindTexture(context, texture, unit, record);
		context.activeTexture(context.TEXTURE0 + unit);
		context.bindTexture(RendererUtils.getGLType(context, texture.variant), texture.glTexture);
		record.boundTexture = texture.glTexture;

		// set alignment to support images with width % 4 !== 0, as
		// images are not aligned
		context.pixelStorei(context.UNPACK_ALIGNMENT, texture.unpackAlignment);

		// Using premultiplied alpha
		context.pixelStorei(context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);

		// set if we want to flip on Y
		context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, texture.flipY);

		// TODO: Check for the restrictions of using npot textures
		// see: http://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support
		// TODO: Add "usesMipmaps" to check if minfilter has mipmap mode

		var image = texture.image;
		if (texture.variant === '2D') {
			if (!image) {
				context.texImage2D(context.TEXTURE_2D, 0, RendererUtils.getGLInternalFormat(context, texture.format), texture.width, texture.height, 0,
					RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLDataType(context, texture.type), null);
			} else {
				if (!(image instanceof HTMLVideoElement) && !image.isCompressed && (texture.generateMipmaps || texture.wrapS !== 'EdgeClamp' || texture.wrapT !== 'EdgeClamp' || image.width > this.maxTextureSize || image.height > this.maxTextureSize)) {
					this.checkRescale(texture, image, image.width, image.height, this.maxTextureSize);
					image = texture.image;
				}

				if (image.isData === true) {
					if (image.isCompressed) {
						this.loadCompressedTexture(context, context.TEXTURE_2D, texture, image.data);
					} else {
						context.texImage2D(context.TEXTURE_2D, 0, RendererUtils.getGLInternalFormat(context, texture.format), image.width,
							image.height, texture.hasBorder ? 1 : 0, RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLDataType(context, texture.type), image.data);
					}
				} else {
					context.texImage2D(context.TEXTURE_2D, 0, RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLDataType(context, texture.type), image);
				}

				if (texture.generateMipmaps && !image.isCompressed) {
					context.generateMipmap(context.TEXTURE_2D);
				}
			}
		} else if (texture.variant === 'CUBE') {
			if (image && !image.isData && (texture.generateMipmaps || image.width > this.maxCubemapSize || image.height > this.maxCubemapSize)) {
				for (var i = 0; i < Texture.CUBE_FACES.length; i++) {
					if (image.data[i] && !image.data[i].buffer ) {
						RendererUtils.scaleImage(texture, image.data[i], image.width, image.height, this.maxCubemapSize, i);
					} else {
						RendererUtils.getBlankImage(texture, [0.3, 0.3, 0.3, 0], image.width, image.height, this.maxCubemapSize, i);
					}
				}
				texture.image.width = Math.min(this.maxCubemapSize, MathUtils.nearestPowerOfTwo(texture.image.width));
				texture.image.height = Math.min(this.maxCubemapSize, MathUtils.nearestPowerOfTwo(texture.image.height));
				image = texture.image;
			}

			for (var faceIndex = 0; faceIndex < Texture.CUBE_FACES.length; faceIndex++) {
				var face = Texture.CUBE_FACES[faceIndex];

				if (!image) {
					context.texImage2D(RendererUtils.getGLCubeMapFace(context, face), 0, RendererUtils.getGLInternalFormat(context, texture.format), texture.width, texture.height, 0,
						RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLDataType(context, texture.type), null);
				} else {
					if (image.isData === true) {
						if (image.isCompressed) {
							this.loadCompressedTexture(context, RendererUtils.getGLCubeMapFace(context, face), texture, image.data[faceIndex]);
						} else {
							context.texImage2D(RendererUtils.getGLCubeMapFace(context, face), 0, RendererUtils.getGLInternalFormat(context, texture.format), image.width,
								image.height, texture.hasBorder ? 1 : 0, RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLDataType(context, texture.type), image.data[faceIndex]);
						}
					} else {
						context.texImage2D(RendererUtils.getGLCubeMapFace(context, face), 0, RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLInternalFormat(context, texture.format), RendererUtils.getGLDataType(context, texture.type), image.data[faceIndex]);
					}
				}
			}

			if (image && texture.generateMipmaps && !image.isCompressed) {
				context.generateMipmap(context.TEXTURE_CUBE_MAP);
			}
		}
	};

	/**
	 * Updates a texture in webgl with the Texture objects settings.
	 *
	 * @param {Texture} texture
	 * @param {Image} image Can be an Image, TypedArray or an array of Images (for cubemaps).
	 * @param {number} width The new image width.
	 * @param {number} height The new image height.
	 * @param {number} maxSize
	 * @param {number} index
	 */
	Renderer.prototype.checkRescale = function (texture, image, width, height, maxSize, index) {
		RendererUtils.scaleImage(texture, image, width, height, maxSize, index);
	};

	/**
	 * Update the blend settings on the webgl context.
	 *
	 * @param {Material} material
	 */
	Renderer.prototype.updateBlending = function (material) {
		var blendRecord = this.rendererRecord.blendRecord;
		var context = this.context;

		var blending = material.blendState.blending;
		if (blending !== blendRecord.blending) {
			if (blending === 'NoBlending') {
				context.disable(context.BLEND);
			} else if (blending === 'AdditiveBlending') {
				context.enable(context.BLEND);
				context.blendEquation(context.FUNC_ADD);
				context.blendFunc(context.SRC_ALPHA, context.ONE);
			} else if (blending === 'SubtractiveBlending') {
				// TODO: Find blendFuncSeparate() combination
				context.enable(context.BLEND);
				context.blendEquation(context.FUNC_REVERSE_SUBTRACT);
				context.blendFunc(context.SRC_ALPHA, context.ONE);
			} else if (blending === 'MultiplyBlending') {
				// TODO: Find blendFuncSeparate() combination
				context.enable(context.BLEND);
				context.blendEquation(context.FUNC_ADD);
				context.blendFunc(context.DST_COLOR, context.ONE_MINUS_SRC_ALPHA);
			} else if (blending === 'AlphaBlending') {
				context.enable(context.BLEND);
				context.blendEquation(context.FUNC_ADD);
				context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
			} else if (blending === 'TransparencyBlending') {
				context.enable(context.BLEND);
				context.blendEquationSeparate(
					context.FUNC_ADD,
					context.FUNC_ADD
				);
				context.blendFuncSeparate(
					context.SRC_ALPHA,
					context.ONE_MINUS_SRC_ALPHA,
					context.ONE,
					context.ONE_MINUS_SRC_ALPHA
				);
			} else if (blending === 'CustomBlending') {
				context.enable(context.BLEND);
			} else if (blending === 'SeparateBlending') {
				context.enable(context.BLEND);
				context.blendEquationSeparate(
						RendererUtils.getGLBlendParam(context, material.blendState.blendEquationColor),
						RendererUtils.getGLBlendParam(context, material.blendState.blendEquationAlpha));
				context.blendFuncSeparate(
					RendererUtils.getGLBlendParam(context, material.blendState.blendSrcColor),
					RendererUtils.getGLBlendParam(context, material.blendState.blendDstColor),
					RendererUtils.getGLBlendParam(context, material.blendState.blendSrcAlpha),
					RendererUtils.getGLBlendParam(context, material.blendState.blendDstAlpha));
			} else {
				context.enable(context.BLEND);
				context.blendEquationSeparate(context.FUNC_ADD, context.FUNC_ADD);
				context.blendFuncSeparate(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA, context.ONE,
					context.ONE_MINUS_SRC_ALPHA);
			}

			blendRecord.blending = blending;
		}

		if (blending === 'CustomBlending') {
			var blendEquation = material.blendState.blendEquation;
			var blendSrc = material.blendState.blendSrc;
			var blendDst = material.blendState.blendDst;

			if (blendEquation !== blendRecord.blendEquation) {
				context.blendEquation(RendererUtils.getGLBlendParam(context, blendEquation));
				blendRecord.blendEquation = blendEquation;
			}

			if (blendSrc !== blendRecord.blendSrc || blendDst !== blendRecord.blendDst) {
				context.blendFunc(RendererUtils.getGLBlendParam(context, blendSrc), RendererUtils.getGLBlendParam(context, blendDst));

				blendRecord.blendSrc = blendSrc;
				blendRecord.blendDst = blendDst;
			}
		} else {
			blendRecord.blendEquation = null;
			blendRecord.blendSrc = null;
			blendRecord.blendDst = null;
		}
	};

	/**
	 * Updates the polygon offset settings on the webgl context.
	 *
	 * @param {Material} material
	 */
	Renderer.prototype.updateOffset = function (material) {
		var offsetRecord = this.rendererRecord.offsetRecord;
		var context = this.context;

		var enabled = material.offsetState.enabled;
		var factor = material.offsetState.factor;
		var units = material.offsetState.units;

		if (offsetRecord.enabled !== enabled) {
			if (enabled) {
				context.enable(context.POLYGON_OFFSET_FILL);
			} else {
				context.disable(context.POLYGON_OFFSET_FILL);
			}

			offsetRecord.enabled = enabled;
		}

		if (enabled && (offsetRecord.factor !== factor || offsetRecord.units !== units)) {
			context.polygonOffset(factor, units);

			offsetRecord.factor = factor;
			offsetRecord.units = units;
		}
	};

	/**
	 * Binds a buffer to the webgl context.
	 *
	 * @param {WebGLBuffer} buffer
	 * @param {string} target for example 'ArrayBuffer'.
	 */
	Renderer.prototype.setBoundBuffer = function (buffer, target) {
		var targetBuffer = this.rendererRecord.currentBuffer[target];
		if (!targetBuffer.valid || targetBuffer.buffer !== buffer) {
			this.context.bindBuffer(RendererUtils.getGLBufferTarget(this.context, target), buffer);
			targetBuffer.buffer = buffer;
			targetBuffer.valid = true;
			if (target === 'ArrayBuffer') {
				this.rendererRecord.attributeCache.length = 0;
			}
		}
	};

	/**
	 * Binds vertex attributes to the webgl context.
	 *
	 * @param {number} attribIndex
	 * @param {Object} attribute See MeshData.createAttribute for definition.
	 */
	Renderer.prototype.bindVertexAttribute = function (attribIndex, attribute) {
		var hashKey = this.rendererRecord.attributeCache[attribIndex];
		if (hashKey !== attribute.hashKey) {
			this.context.vertexAttribPointer(attribIndex, attribute.count, RendererUtils.getGLDataType(this.context, attribute.type), attribute.normalized, attribute.stride, attribute.offset);
			this.rendererRecord.attributeCache[attribIndex] = attribute.hashKey;
		}
	};

	/**
	 * Clears the webgl context with the specified options.
	 *
	 * @param {boolean} color
	 * @param {boolean} depth
	 * @param {boolean} stencil
	 */
	Renderer.prototype.clear = function (color, depth, stencil) {
		var bits = 0;

		if (color === undefined || color) {
			bits |= this.context.COLOR_BUFFER_BIT;
		}
		if (depth === undefined || depth) {
			bits |= this.context.DEPTH_BUFFER_BIT;
		}
		if (stencil === undefined || stencil) {
			bits |= this.context.STENCIL_BUFFER_BIT;
		}

		var record = this.rendererRecord.depthRecord;
		if (record.write !== true) {
			this.context.depthMask(true);
			record.write = true;
		}

		if (bits) {
			this.context.clear(bits);
		}
	};

	/**
	 * Flushes the webgl context.
	 *
	 */
	Renderer.prototype.flush = function () {
		this.context.flush();
	};

	/**
	 * calls finish on the webgl context.
	 *
	 */
	Renderer.prototype.finish = function () {
		this.context.finish();
	};

	// ---------------------------------------------

	/**
	 * Setup a Frame Buffer Object with the supplied render target.
	 *
	 * @param {WebGLFramebuffer} framebuffer
	 * @param {RenderTarget} renderTarget
	 * @param {number} textureTarget For instance context.TEXTURE_2D.
	 */
	Renderer.prototype.setupFrameBuffer = function (framebuffer, renderTarget, textureTarget) {
		this.context.bindFramebuffer(this.context.FRAMEBUFFER, framebuffer);
		this.context.framebufferTexture2D(this.context.FRAMEBUFFER, this.context.COLOR_ATTACHMENT0, textureTarget,
			renderTarget.glTexture, 0);
	};

	/**
	 * Setup an Render Buffer Object with the supplied render target.
	 *
	 * @param {WebGLRenderbuffer} renderbuffer
	 * @param {RenderTarget} renderTarget
	 */
	Renderer.prototype.setupRenderBuffer = function (renderbuffer, renderTarget) {
		var context = this.context;
		context.bindRenderbuffer(context.RENDERBUFFER, renderbuffer);

		if (renderTarget.depthBuffer && !renderTarget.stencilBuffer) {
			context.renderbufferStorage(context.RENDERBUFFER, context.DEPTH_COMPONENT16, renderTarget.width,
				renderTarget.height);
			context.framebufferRenderbuffer(context.FRAMEBUFFER, context.DEPTH_ATTACHMENT,
				context.RENDERBUFFER, renderbuffer);
		} else if (renderTarget.depthBuffer && renderTarget.stencilBuffer) {
			context.renderbufferStorage(context.RENDERBUFFER, context.DEPTH_STENCIL, renderTarget.width,
				renderTarget.height);
			context.framebufferRenderbuffer(context.FRAMEBUFFER, context.DEPTH_STENCIL_ATTACHMENT,
				context.RENDERBUFFER, renderbuffer);
		} else {
			this.context
				.renderbufferStorage(context.RENDERBUFFER, context.RGBA4, renderTarget.width, renderTarget.height);
		}
	};

	/**
	 * Binds the supplied render target's FBO to the webgl context.
	 * Creates FBO and RBO for the render target if not set already.
	 *
	 * @param {RenderTarget} renderTarget
	 */
	Renderer.prototype.setRenderTarget = function (renderTarget) {
		var context = this.context;
		if (renderTarget && !renderTarget._glFrameBuffer) {
			if (renderTarget.depthBuffer === undefined) {
				renderTarget.depthBuffer = true;
			}
			if (renderTarget.stencilBuffer === undefined) {
				renderTarget.stencilBuffer = true;
			}

			if (renderTarget.glTexture === null) {
				renderTarget.glTexture = this.context.createTexture();
			}

			// Setup texture, create render and frame buffers
			var isTargetPowerOfTwo = MathUtils.isPowerOfTwo(renderTarget.width) && MathUtils.isPowerOfTwo(renderTarget.height);
			var glFormat = RendererUtils.getGLInternalFormat(context, renderTarget.format);
			var glType = RendererUtils.getGLDataType(context, renderTarget.type);

			renderTarget._glFrameBuffer = this.context.createFramebuffer();
			renderTarget._glRenderBuffer = this.context.createRenderbuffer();

			this.context.bindTexture(context.TEXTURE_2D, renderTarget.glTexture);
			this.updateTextureParameters(renderTarget, isTargetPowerOfTwo);

			this.context
				.texImage2D(context.TEXTURE_2D, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null);

			this.setupFrameBuffer(renderTarget._glFrameBuffer, renderTarget, context.TEXTURE_2D);
			this.setupRenderBuffer(renderTarget._glRenderBuffer, renderTarget);

			if (renderTarget.generateMipmaps && isTargetPowerOfTwo) {
				this.context.generateMipmap(context.TEXTURE_2D);
			}

			// Release everything
			this.context.bindTexture(context.TEXTURE_2D, null);
			this.context.bindRenderbuffer(context.RENDERBUFFER, null);
			this.context.bindFramebuffer(context.FRAMEBUFFER, null);
		}

		var framebuffer, width, height, vx, vy;

		if (renderTarget) {
			framebuffer = renderTarget._glFrameBuffer;

			vx = 0;
			vy = 0;
			width = renderTarget.width;
			height = renderTarget.height;
		} else {
			framebuffer = null;

			vx = this.viewportX;
			vy = this.viewportY;
			width = this.viewportWidth;
			height = this.viewportHeight;
		}

		if (framebuffer !== this.rendererRecord.currentFrameBuffer) {
			context.bindFramebuffer(context.FRAMEBUFFER, framebuffer);
			context.viewport(vx, vy, width, height);

			this.rendererRecord.currentFrameBuffer = framebuffer;

			// Need to force rebinding of textures on framebuffer change (TODO: verify this)
			this.rendererRecord.textureRecord = [];
		}

		this.currentWidth = width;
		this.currentHeight = height;
	};

	/**
	 * Updates the render targets mipmaps.
	 *
	 * @param {RenderTarget} renderTarget
	 */
	Renderer.prototype.updateRenderTargetMipmap = function (renderTarget) {
		var context = this.context;
		context.bindTexture(context.TEXTURE_2D, renderTarget.glTexture);
		context.generateMipmap(context.TEXTURE_2D);
		context.bindTexture(context.TEXTURE_2D, null);
	};

	/**
	 * Deallocates a meshdata with the Renderer's webgl context.
	 *
	 * @param {MeshData} meshData
	 */
	Renderer.prototype._deallocateMeshData = function (meshData) {
		meshData.destroy(this.context);
	};

	/**
	 * Deallocates a texture with the Renderer's webgl context.
	 *
	 * @param {Texture} texture
	 */
	Renderer.prototype._deallocateTexture = function (texture) {
		texture.destroy(this.context);
	};

	/**
	 * Deallocates a render target with the Renderer's webgl context.
	 *
	 * @param {RenderTarget} renderTarget
	 */
	Renderer.prototype._deallocateRenderTarget = function (renderTarget) {
		renderTarget.destroy(this.context);
	};

	/**
	 * Deallocates a shader.
	 *
	 * @param {Shader} shader
	 */
	Renderer.prototype._deallocateShader = function (shader) {
		shader.destroy();
	};

	return Renderer;
});

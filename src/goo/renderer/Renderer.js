/*jshint bitwise: false*/
define([
	'goo/renderer/Capabilities',
	'goo/renderer/RendererRecord',
	'goo/renderer/RendererUtils',
	'goo/renderer/Util',
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
	'goo/renderer/RenderInfo'
], function (
	Capabilities,
	RendererRecord,
	RendererUtils,
	Util,
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
	RenderInfo
) {
	'use strict';

	var STUB_METHOD = function () {};
	var WebGLRenderingContext = window.WebGLRenderingContext;

	/**
	 * The renderer handles displaying of graphics data to a render context.
	 * It accepts an object containing the settings for the renderer.
	 * @param {object} parameters Renderer settings.
	 * @param {boolean} [parameters.alpha=false] Enables the possibility to render non-opaque pixels
	 * @param {boolean} [parameters.premultipliedAlpha=true] Whether the colors are premultiplied with the alpha channel.
	 * @param {boolean} [parameters.antialias=true] Enables antialiasing.
	 * @param {boolean} [parameters.stencil=false] Enables the stencil buffer.
	 * @param {boolean} [parameters.preserveDrawingBuffer=false]
	 * @param {boolean} [parameters.useDevicePixelRatio=false] Take into account the device pixel ratio (for retina screens etc)
	 * @param {canvas} [parameters.canvas] If not supplied, Renderer will create a new canvas
	 * @param {function (string)} [parameters.onError] Called with message when error occurs
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

		//! AT: is this still necessary?
		if (this.context.getShaderPrecisionFormat === undefined) {
			this.context.getShaderPrecisionFormat = function () {
				return {
					"rangeMin": 1,
					"rangeMax": 1,
					"precision": 1
				};
			};
		}

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
		//console.log("Shader precision: " + this.shaderPrecision);

		this.downScale = parameters.downScale || 1;

		//! AT: why are there 2 clear colors?
		// Default setup
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

	Renderer.prototype.establishContext = function () {
		if (!!window.WebGLRenderingContext) {
			//! AT: this list may require cleanup
			var contextNames = ["experimental-webgl", "webgl", "moz-webgl", "webkit-3d"];
			for (var i = 0; i < contextNames.length; i++) {
				try {
					this.context = this.domElement.getContext(contextNames[i], this._contextSettings);
					if (this.context && typeof(this.context.getParameter) === "function") {
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
		} else {
			// WebGL is not supported
			throw {
				name: 'GooWebGLError',
				message: 'WebGL is not supported',
				supported: false,
				enabled: false
			};
		}

		this.context.clearDepth(1);
		this.context.clearStencil(0);
		this.context.stencilMask(0);

		this.context.enable(WebGLRenderingContext.DEPTH_TEST);
		this.context.depthFunc(WebGLRenderingContext.LEQUAL);

		Capabilities.init(this.context);
	};

	/**
	 * Sets up handlers for context lost/restore
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
	 * Restores thw webgl context
	 * @private
	 */
	Renderer.prototype._restoreContext = STUB_METHOD; // will be overriden

	function validateNoneOfTheArgsAreUndefined(functionName, args) {
		for (var ii = 0; ii < args.length; ++ii) {
			if (args[ii] === undefined) {
				console.error("undefined passed to gl." + functionName + "("
					+ window.WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
			}
		}
	}

	Renderer.prototype.onDebugError = function (err, functionName, args) {
		// Based on the default error handler in WebGLDebugUtils
		// apparently we can't do args.join(",");
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
	 * Checks if this.domElement.offsetWidth or Height / this.downScale is unequal to this.domElement.width or height
	 * if that is the case it will call this.setSize
	 * It also checks if the camera aspect changed and will update it calling camera.setFrustumPerspective()
	 * @param {Camera} [camera] optional camera argument
	 */
	Renderer.prototype.checkResize = function (camera) {
		var devicePixelRatio = this.devicePixelRatio = this._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / this.svg.currentScale : 1;

		var adjustWidth, adjustHeight;
		if (document.querySelector) {
			adjustWidth = this.domElement.offsetWidth;
			adjustHeight = this.domElement.offsetHeight;
		} else {
			adjustWidth = window.innerWidth;
			adjustHeight = window.innerHeight;
		}
		adjustWidth = adjustWidth * devicePixelRatio / this.downScale;
		adjustHeight = adjustHeight * devicePixelRatio / this.downScale;

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
	 * Finally it resets the hardwarePicking.pickingTarget
	 * @param {number} width aspect ratio corrected width
	 * @param {number} height aspect ratio corrected height
	 * @param {number} [fullWidth] full viewport width
	 * @param {number} [fullHeight] full viewport height
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
	 * Sets this.viewportX and viewportY to the parameters or to 0
	 * Sets this.viewportWidth and viewportHeight to the parameters or to this.domElement.width and height.
	 * Finally it calls this.context.viewport(x, y, w, h) with the resulting values.
	 * @param {number} [x] optional x coordinate
	 * @param {number} [y] optional y coordinate
	 * @param {number} [width] optional width coordinate
	 * @param {number} [height] optional height coordinate
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
	 * Set the background color of the 3D view. All colors are defined in the range 0.0 - 1.0
	 * @param {number} r Red
	 * @param {number} g Green
	 * @param {number} b Blue
	 * @param {number} a Alpha
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

	Renderer.prototype.bindData = function (bufferData) {
		var glBuffer = bufferData.glBuffer;
		if (glBuffer !== null) {
			this.setBoundBuffer(glBuffer, bufferData.target);
			if (bufferData._dataNeedsRefresh) {
				this.context.bufferSubData(RendererUtils.getGLBufferTarget(bufferData.target), 0, bufferData.data);
				bufferData._dataNeedsRefresh = false;
			}
		} else {
			glBuffer = this.context.createBuffer();
			bufferData.glBuffer = glBuffer;

			this.rendererRecord.invalidateBuffer(bufferData.target);
			this.setBoundBuffer(glBuffer, bufferData.target);
			this.context.bufferData(RendererUtils.getGLBufferTarget(bufferData.target), bufferData.data, RendererUtils.getGLBufferUsage(bufferData._dataUsage));
		}
	};

	Renderer.prototype.updateAttributeData = function (attributeData, offset) {
		this.context.bufferSubData(WebGLRenderingContext.ARRAY_BUFFER, offset, attributeData);
	};

	Renderer.prototype.setShadowType = function (type) {
		this.shadowHandler.shadowType = type;
	};

	Renderer.prototype.updateShadows = function (partitioner, entities, lights) {
		this.shadowHandler.checkShadowRendering(this, partitioner, entities, lights);
	};

	/**
	 * Preloads a texture
	 * @param context
	 * @param texture
	 */
	Renderer.prototype.preloadTexture = function (context, texture) {
		//! schteppe: Is there any case where we want to preload a texture to another context than this.context?

		// REVIEW: Veeeeery similar to loadTexture. Merge?
		//! AT: the code will diverge; it was initially copy-pasted and adapted to suit the need, but it will have to be iterated on; adding more ifs for different code paths is not gonna make the code nicer

		// this.bindTexture(context, texture, unit, record);
		// context.activeTexture(WebGLRenderingContext.TEXTURE0 + unit); // do I need this?

		//! schteppe: What if the .glTexture is not allocated yet?
		context.bindTexture(RendererUtils.getGLType(texture.variant), texture.glTexture);

		// set alignment to support images with width % 4 !== 0, as
		// images are not aligned
		context.pixelStorei(WebGLRenderingContext.UNPACK_ALIGNMENT, texture.unpackAlignment);

		// Using premultiplied alpha
		context.pixelStorei(WebGLRenderingContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);

		// set if we want to flip on Y
		context.pixelStorei(WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL, texture.flipY);

		// TODO: Check for the restrictions of using npot textures
		// see: http://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support
		// TODO: Add "usesMipmaps" to check if minfilter has mipmap mode

		var image = texture.image;
		if (texture.variant === '2D') {
			if (!image) {
				context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, RendererUtils.getGLInternalFormat(texture.format), texture.width, texture.height, 0,
					RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLPixelDataType(texture.type), null);
			} else {
				if (!image.isCompressed && (texture.generateMipmaps || image.width > this.maxTextureSize || image.height > this.maxTextureSize)) {
					this.checkRescale(texture, image, image.width, image.height, this.maxTextureSize);
					image = texture.image;
				}

				if (image.isData === true) {
					if (image.isCompressed) {
						this.loadCompressedTexture(context, WebGLRenderingContext.TEXTURE_2D, texture, image.data);
					} else {
						context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, RendererUtils.getGLInternalFormat(texture.format), image.width,
							image.height, texture.hasBorder ? 1 : 0, RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLPixelDataType(texture.type), image.data);
					}
				} else {
					context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLPixelDataType(texture.type), image);
				}

				if (texture.generateMipmaps && !image.isCompressed) {
					context.generateMipmap(WebGLRenderingContext.TEXTURE_2D);
				}
			}
		} else if (texture.variant === 'CUBE') {
			if (image && !image.isData && (texture.generateMipmaps || image.width > this.maxCubemapSize || image.height > this.maxCubemapSize)) {
				for (var i = 0; i < Texture.CUBE_FACES.length; i++) {
					if (image.data[i] && !image.data[i].buffer ) {
						Util.scaleImage(texture, image.data[i], image.width, image.height, this.maxCubemapSize, i);
					} else {
						// REVIEW: Hard coded background color that should be determined by Create?
						Util.getBlankImage(texture, [0.3, 0.3, 0.3, 0], image.width, image.height, this.maxCubemapSize, i);
					}
				}
				texture.image.width = Math.min(this.maxCubemapSize, Util.nearestPowerOfTwo(texture.image.width));
				texture.image.height = Math.min(this.maxCubemapSize, Util.nearestPowerOfTwo(texture.image.height));
				image = texture.image;
			}

			for (var faceIndex = 0; faceIndex < Texture.CUBE_FACES.length; faceIndex++) {
				var face = Texture.CUBE_FACES[faceIndex];

				if (!image) {
					context.texImage2D(RendererUtils.getGLCubeMapFace(face), 0, RendererUtils.getGLInternalFormat(texture.format), texture.width, texture.height, 0,
						RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLPixelDataType(texture.type), null);
				} else {
					if (image.isData === true) {
						if (image.isCompressed) {
							this.loadCompressedTexture(context, RendererUtils.getGLCubeMapFace(face), texture, image.data[faceIndex]);
						} else {
							context.texImage2D(RendererUtils.getGLCubeMapFace(face), 0, RendererUtils.getGLInternalFormat(texture.format), image.width,
								image.height, texture.hasBorder ? 1 : 0, RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLPixelDataType(texture.type), image.data[faceIndex]);
						}
					} else {
						context.texImage2D(RendererUtils.getGLCubeMapFace(face), 0, RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLPixelDataType(texture.type), image.data[faceIndex]);
					}
				}
			}

			if (image && texture.generateMipmaps && !image.isCompressed) {
				context.generateMipmap(WebGLRenderingContext.TEXTURE_CUBE_MAP);
			}
		}
	};

	/**
	 * Preloads the textures of a material
	 * @private
	 * @param material
	 * @param queue
	 */
	Renderer.prototype.preloadTextures = function (material, queue) {
		var context = this.context;
		var textureKeys = Object.keys(material._textureMaps);

		// for (var i = 0; i < textureKeys.length; i++) {
		// gotta simulate lexical scoping
		textureKeys.forEach(function (textureKey) {
			var texture = material.getTexture(textureKey);

			if (texture === undefined) {
				return ;
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
					} else if (texture instanceof RenderTarget === false && texture.checkNeedsUpdate()) {
						this.preloadTexture(context, texture);
						texture.needsUpdate = false;
					}
				}.bind(this));
			}.bind(this));
		}.bind(this));
	};

	var preloadMaterialsRenderInfo = new RenderInfo();

	/**
	 * Preloads textures that come with the materials on the supplied "renderables"
	 * @param renderList
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
	 * Preprocesses a shader and compiles it
	 * @private
	 * @param material
	 * @param renderInfo
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
	 * Precompiles shaders of the supplied "renderables"
	 * @param renderList
	 * @param lights
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
	 * Creates buffers of the supplied "renderables"
	 * @param renderList
	 * @param material
	 * @param renderInfo
	 */
	Renderer.prototype.preloadBuffer = function (renderable, material, renderInfo) {
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

		var count = 0;
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
	 * @param {Entity[]} renderList A list of "renderables". Eg Entities with the right components or objects with mesh data, material and transform
	 * @param {Camera} camera Main camera for rendering
	 * @param {Light[]} lights Lights used in the rendering
	 * @param {RenderTarget} [renderTarget=null] Optional rendertarget to use as target for rendering, or null to render to the screen
	 * @param {boolean} [clear=false] true/false to clear or not clear all types, or an object in the form <code>{color: true/false, depth: true/false, stencil: true/false}
	 */
	Renderer.prototype.render = function (renderList, camera, lights, renderTarget, clear, overrideMaterials) {
		if (overrideMaterials) {
			this._overrideMaterials = (overrideMaterials instanceof Array) ? overrideMaterials : [overrideMaterials];
		} else {
			this._overrideMaterials = [];
		}
		if (!camera) {
			return;
		} else if (Renderer.mainCamera === null) {
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
		if (renderTarget && renderTarget.generateMipmaps && Util.isPowerOfTwo(renderTarget.width) && Util.isPowerOfTwo(renderTarget.height)) {
			this.updateRenderTargetMipmap(renderTarget);
		}
	};

	/*
	REVIEW:
	+ it is not called from anywhere outside of the renderer and it probably is not of public interest so it should be private
	+ moreover it does not change `this` in any way nor does it need to belong to instances of Renderer - it can be only a helper function
	+ it could also use a description of what it's supposed to do
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

	Renderer.prototype.callShaderProcessors = function (material, renderInfo) {
		// Check for caching of shader that use defines
		material.shader.updateProcessors(renderInfo);
		this.findOrCacheMaterialShader(material, renderInfo);
	};

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

	Renderer.prototype.findOrCacheMaterialShader = function (material, renderInfo) {
		// check defines. if no hit in cache -> add to cache. if hit in cache,
		// replace with cache version and copy over uniforms.
		var shader = material.shader;
		var defineKey = shader.getDefineKey(this._definesIndices);
		shader.endFrame();

		var shaderCache = this.rendererRecord.shaderCache;
		var cachedShader = shaderCache.get(defineKey);

		if (cachedShader) {
			if (cachedShader !== material.shader) {
				var uniforms = material.shader.uniforms;
				var keys = Object.keys(uniforms);
				for (var i = 0, l = keys.length; i < l; i++) {
					var key = keys[i];
					var origUniform = cachedShader.uniforms[key] = uniforms[key];
					if (origUniform instanceof Array) {
						cachedShader.uniforms[key] = origUniform.slice(0);
					}
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
	 * Read pixels from current framebuffer to a typed array (ArrayBufferView)
	 *
	 * @param {number} x x offset of rectangle to read from
	 * @param {number} y y offset of rectangle to read from
	 * @param {number} width width of rectangle to read from
	 * @param {number} height height of rectangle to read from
	 * @param {ArrayBufferView} store ArrayBufferView to store data in (Uint8Array)
	 */
	Renderer.prototype.readPixels = function (x, y, width, height, store) {
		store = store || new Uint8Array(width * height * 4);
		this.context.readPixels(x, y, width, height, WebGLRenderingContext.RGBA, WebGLRenderingContext.UNSIGNED_BYTE, store);
		return store;
	};

	/**
	 * Read pixels from a texture to a typed array (ArrayBufferView)
	 *
	 * @param {Texture} texture texture to read pixels from
	 * @param {number} x x offset of rectangle to read from
	 * @param {number} y y offset of rectangle to read from
	 * @param {number} width width of rectangle to read from
	 * @param {number} height height of rectangle to read from
	 * @param {ArrayBufferView} store ArrayBufferView to store data in (Uint8Array)
	 */
	Renderer.prototype.readTexturePixels = function (texture, x, y, width, height, store) {
		store = store || new Uint8Array(width * height * 4);
		var glFrameBuffer = this.context.createFramebuffer();
		this.context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, glFrameBuffer);
		this.context.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0,
			WebGLRenderingContext.TEXTURE_2D, texture.glTexture, 0);
		if (this.context.checkFramebufferStatus(WebGLRenderingContext.FRAMEBUFFER) === WebGLRenderingContext.FRAMEBUFFER_COMPLETE) {
			this.context.readPixels(x, y, width, height, WebGLRenderingContext.RGBA, WebGLRenderingContext.UNSIGNED_BYTE, store);
		}
		return store;
	};

	Renderer.prototype.drawElementsVBO = function (indices, indexModes, indexLengths) {
		var offset = 0;
		var indexModeCounter = 0;
		var type = indices.type = indices.type || RendererUtils.getGLArrayType(indices);
		var byteSize = RendererUtils.getGLByteSize(indices);

		for (var i = 0; i < indexLengths.length; i++) {
			var count = indexLengths[i];
			var glIndexMode = RendererUtils.getGLIndexMode(indexModes[indexModeCounter]);

			this.context.drawElements(glIndexMode, count, type, offset * byteSize);

			offset += count;

			if (indexModeCounter < indexModes.length - 1) {
				indexModeCounter++;
			}
		}
	};

	Renderer.prototype.drawArraysVBO = function (indexModes, indexLengths) {
		var offset = 0;
		var indexModeCounter = 0;

		for (var i = 0; i < indexLengths.length; i++) {
			var count = indexLengths[i];
			var glIndexMode = RendererUtils.getGLIndexMode(indexModes[indexModeCounter]);

			this.context.drawArrays(glIndexMode, offset, count);

			offset += count;

			if (indexModeCounter < indexModes.length - 1) {
				indexModeCounter++;
			}
		}
	};

	// Hardware picking
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
				this.context.enable(WebGLRenderingContext.SCISSOR_TEST);
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
				this.context.disable(WebGLRenderingContext.SCISSOR_TEST);
			}
		} else {
			this.setRenderTarget(this.hardwarePicking.pickingTarget);
		}
	};

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

	Renderer.prototype.updateLineAndPointSettings = function (material) {
		var record = this.rendererRecord.lineRecord;
		var lineWidth = material.lineWidth || 1;

		if (record.lineWidth !== lineWidth) {
			this.context.lineWidth(lineWidth);
			record.lineWidth = lineWidth;
		}
	};

	Renderer.prototype.updateDepthTest = function (material) {
		var record = this.rendererRecord.depthRecord;
		var depthState = material.depthState;

		if (record.enabled !== depthState.enabled) {
			if (depthState.enabled) {
				this.context.enable(WebGLRenderingContext.DEPTH_TEST);
			} else {
				this.context.disable(WebGLRenderingContext.DEPTH_TEST);
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
		// this.context.depthFunc(WebGLRenderingContext.LEQUAL);
	};

	Renderer.prototype.updateCulling = function (material) {
		var record = this.rendererRecord.cullRecord;
		var cullFace = material.cullState.cullFace;
		var frontFace = material.cullState.frontFace;
		var enabled = material.cullState.enabled;

		if (record.enabled !== enabled) {
			if (enabled) {
				this.context.enable(WebGLRenderingContext.CULL_FACE);
			} else {
				this.context.disable(WebGLRenderingContext.CULL_FACE);
			}
			record.enabled = enabled;
		}

		if (record.cullFace !== cullFace) {
			var glCullFace = cullFace === 'Front' ? WebGLRenderingContext.FRONT : cullFace === 'Back' ? WebGLRenderingContext.BACK
				: WebGLRenderingContext.FRONT_AND_BACK;
			this.context.cullFace(glCullFace);
			record.cullFace = cullFace;
		}

		if (record.frontFace !== frontFace) {
			switch (frontFace) {
				case 'CCW':
					this.context.frontFace(WebGLRenderingContext.CCW);
					break;
				case 'CW':
					this.context.frontFace(WebGLRenderingContext.CW);
					break;
			}
			record.frontFace = frontFace;
		}
	};

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

				if (texture === null ||
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
				var isTexturePowerOfTwo = Util.isPowerOfTwo(imageObject.width) && Util.isPowerOfTwo(imageObject.height);
				this.updateTextureParameters(texture, isTexturePowerOfTwo);
			}
		}
	};

	Renderer.prototype.updateTextureParameters = function (texture, isImagePowerOfTwo) {
		var context = this.context;

		var texrecord = texture.textureRecord;

		var glType = RendererUtils.getGLType(texture.variant);
		if (texrecord.magFilter !== texture.magFilter) {
			context.texParameteri(glType, WebGLRenderingContext.TEXTURE_MAG_FILTER, RendererUtils.getGLMagFilter(texture.magFilter));
			texrecord.magFilter = texture.magFilter;
		}
		var minFilter = isImagePowerOfTwo ? texture.minFilter : RendererUtils.getFilterFallback(texture.minFilter);
		if (texrecord.minFilter !== minFilter) {
			context.texParameteri(glType, WebGLRenderingContext.TEXTURE_MIN_FILTER, RendererUtils.getGLMinFilter(minFilter));
			texrecord.minFilter = minFilter;
		}

		var wrapS = isImagePowerOfTwo ? texture.wrapS : 'EdgeClamp';
		if (texrecord.wrapS !== wrapS) {
			var glwrapS = RendererUtils.getGLWrap(wrapS, context);
			context.texParameteri(glType, WebGLRenderingContext.TEXTURE_WRAP_S, glwrapS);
			texrecord.wrapS = wrapS;
		}
		var wrapT = isImagePowerOfTwo ? texture.wrapT : 'EdgeClamp';
		if (texrecord.wrapT !== wrapT) {
			var glwrapT = RendererUtils.getGLWrap(wrapT, context);
			context.texParameteri(glType, WebGLRenderingContext.TEXTURE_WRAP_T, glwrapT);
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

	Renderer.prototype.bindTexture = function (context, texture, unit, record) {
		if (record.boundTexture === undefined || texture.glTexture !== undefined && record.boundTexture !== texture.glTexture) {
			context.activeTexture(WebGLRenderingContext.TEXTURE0 + unit);
			context.bindTexture(RendererUtils.getGLType(texture.variant), texture.glTexture);
			record.boundTexture = texture.glTexture;
		}
	};

	Renderer.prototype.unbindTexture = function (context, texture, unit, record) {
		context.activeTexture(WebGLRenderingContext.TEXTURE0 + unit);
		context.bindTexture(RendererUtils.getGLType(texture.variant), null);
		record.boundTexture = undefined;
	};

	Renderer.prototype.loadCompressedTexture = function (context, target, texture, imageData) {
		var mipSizes = texture.image.mipmapSizes;
		var dataOffset = 0, dataLength = 0;
		var width = texture.image.width, height = texture.image.height;
		var ddsExt = Capabilities.CompressedTextureS3TC;
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
			throw new Error("Unhandled compression format: " + imageData.getDataFormat().name());
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

	Renderer.prototype.updateTexture = function (context, texture, unit, record) {
		// this.bindTexture(context, texture, unit, record);
		context.activeTexture(WebGLRenderingContext.TEXTURE0 + unit);
		context.bindTexture(RendererUtils.getGLType(texture.variant), texture.glTexture);
		record.boundTexture = texture.glTexture;

		// set alignment to support images with width % 4 !== 0, as
		// images are not aligned
		context.pixelStorei(WebGLRenderingContext.UNPACK_ALIGNMENT, texture.unpackAlignment);

		// Using premultiplied alpha
		context.pixelStorei(WebGLRenderingContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);

		// set if we want to flip on Y
		context.pixelStorei(WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL, texture.flipY);

		// TODO: Check for the restrictions of using npot textures
		// see: http://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support
		// TODO: Add "usesMipmaps" to check if minfilter has mipmap mode

		var image = texture.image;
		if (texture.variant === '2D') {
			if (!image) {
				context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, RendererUtils.getGLInternalFormat(texture.format), texture.width, texture.height, 0,
					RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLPixelDataType(texture.type), null);
			} else {
				if (!image.isCompressed && (texture.generateMipmaps || image.width > this.maxTextureSize || image.height > this.maxTextureSize)) {
					this.checkRescale(texture, image, image.width, image.height, this.maxTextureSize);
					image = texture.image;
				}

				if (image.isData === true) {
					if (image.isCompressed) {
						this.loadCompressedTexture(context, WebGLRenderingContext.TEXTURE_2D, texture, image.data);
					} else {
						context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, RendererUtils.getGLInternalFormat(texture.format), image.width,
							image.height, texture.hasBorder ? 1 : 0, RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLPixelDataType(texture.type), image.data);
					}
				} else {
					context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLPixelDataType(texture.type), image);
				}

				if (texture.generateMipmaps && !image.isCompressed) {
					context.generateMipmap(WebGLRenderingContext.TEXTURE_2D);
				}
			}
		} else if (texture.variant === 'CUBE') {
			if (image && !image.isData && (texture.generateMipmaps || image.width > this.maxCubemapSize || image.height > this.maxCubemapSize)) {
				for (var i = 0; i < Texture.CUBE_FACES.length; i++) {
					if (image.data[i] && !image.data[i].buffer ) {
						Util.scaleImage(texture, image.data[i], image.width, image.height, this.maxCubemapSize, i);
					} else {
						Util.getBlankImage(texture, [0.3, 0.3, 0.3, 0], image.width, image.height, this.maxCubemapSize, i);
					}
				}
				texture.image.width = Math.min(this.maxCubemapSize, Util.nearestPowerOfTwo(texture.image.width));
				texture.image.height = Math.min(this.maxCubemapSize, Util.nearestPowerOfTwo(texture.image.height));
				image = texture.image;
			}

			for (var faceIndex = 0; faceIndex < Texture.CUBE_FACES.length; faceIndex++) {
				var face = Texture.CUBE_FACES[faceIndex];

				if (!image) {
					context.texImage2D(RendererUtils.getGLCubeMapFace(face), 0, RendererUtils.getGLInternalFormat(texture.format), texture.width, texture.height, 0,
						RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLPixelDataType(texture.type), null);
				} else {
					if (image.isData === true) {
						if (image.isCompressed) {
							this.loadCompressedTexture(context, RendererUtils.getGLCubeMapFace(face), texture, image.data[faceIndex]);
						} else {
							context.texImage2D(RendererUtils.getGLCubeMapFace(face), 0, RendererUtils.getGLInternalFormat(texture.format), image.width,
								image.height, texture.hasBorder ? 1 : 0, RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLPixelDataType(texture.type), image.data[faceIndex]);
						}
					} else {
						context.texImage2D(RendererUtils.getGLCubeMapFace(face), 0, RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLInternalFormat(texture.format), RendererUtils.getGLPixelDataType(texture.type), image.data[faceIndex]);
					}
				}
			}

			if (image && texture.generateMipmaps && !image.isCompressed) {
				context.generateMipmap(WebGLRenderingContext.TEXTURE_CUBE_MAP);
			}
		}
	};

	Renderer.prototype.checkRescale = function (texture, image, width, height, maxSize, index) {
		Util.scaleImage(texture, image, width, height, maxSize, index);
	};

	Renderer.prototype.updateBlending = function (material) {
		var blendRecord = this.rendererRecord.blendRecord;
		var context = this.context;

		var blending = material.blendState.blending;
		if (blending !== blendRecord.blending) {
			if (blending === 'NoBlending') {
				context.disable(WebGLRenderingContext.BLEND);
			} else if (blending === 'AdditiveBlending') {
				context.enable(WebGLRenderingContext.BLEND);
				context.blendEquation(WebGLRenderingContext.FUNC_ADD);
				context.blendFunc(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE);
			} else if (blending === 'SubtractiveBlending') {
				// TODO: Find blendFuncSeparate() combination
				context.enable(WebGLRenderingContext.BLEND);
				context.blendEquation(WebGLRenderingContext.FUNC_REVERSE_SUBTRACT);
				context.blendFunc(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE);
			} else if (blending === 'MultiplyBlending') {
				// TODO: Find blendFuncSeparate() combination
				context.enable(WebGLRenderingContext.BLEND);
				context.blendEquation(WebGLRenderingContext.FUNC_ADD);
				context.blendFunc(WebGLRenderingContext.DST_COLOR, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
			} else if (blending === 'AlphaBlending') {
				context.enable(WebGLRenderingContext.BLEND);
				context.blendEquation(WebGLRenderingContext.FUNC_ADD);
				context.blendFunc(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
			} else if (blending === 'TransparencyBlending') {
				context.enable(WebGLRenderingContext.BLEND);
				context.blendEquationSeparate(
					WebGLRenderingContext.FUNC_ADD,
					WebGLRenderingContext.FUNC_ADD
				);
				context.blendFuncSeparate(
					WebGLRenderingContext.SRC_ALPHA,
					WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
					WebGLRenderingContext.ONE,
					WebGLRenderingContext.ONE_MINUS_SRC_ALPHA
				);
			} else if (blending === 'CustomBlending') {
				context.enable(WebGLRenderingContext.BLEND);
			} else if (blending === 'SeparateBlending') {
				context.enable(WebGLRenderingContext.BLEND);
				context.blendEquationSeparate(
						RendererUtils.getGLBlendParam(material.blendState.blendEquationColor),
						RendererUtils.getGLBlendParam(material.blendState.blendEquationAlpha));
				context.blendFuncSeparate(
					RendererUtils.getGLBlendParam(material.blendState.blendSrcColor),
					RendererUtils.getGLBlendParam(material.blendState.blendDstColor),
					RendererUtils.getGLBlendParam(material.blendState.blendSrcAlpha),
					RendererUtils.getGLBlendParam(material.blendState.blendDstAlpha));
			} else {
				context.enable(WebGLRenderingContext.BLEND);
				context.blendEquationSeparate(WebGLRenderingContext.FUNC_ADD, WebGLRenderingContext.FUNC_ADD);
				context.blendFuncSeparate(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA, WebGLRenderingContext.ONE,
					WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
			}

			blendRecord.blending = blending;
		}

		if (blending === 'CustomBlending') {
			var blendEquation = material.blendState.blendEquation;
			var blendSrc = material.blendState.blendSrc;
			var blendDst = material.blendState.blendDst;

			if (blendEquation !== blendRecord.blendEquation) {
				context.blendEquation(RendererUtils.getGLBlendParam(blendEquation));
				blendRecord.blendEquation = blendEquation;
			}

			if (blendSrc !== blendRecord.blendSrc || blendDst !== blendRecord.blendDst) {
				context.blendFunc(RendererUtils.getGLBlendParam(blendSrc), RendererUtils.getGLBlendParam(blendDst));

				blendRecord.blendSrc = blendSrc;
				blendRecord.blendDst = blendDst;
			}
		} else {
			blendRecord.blendEquation = null;
			blendRecord.blendSrc = null;
			blendRecord.blendDst = null;
		}
	};

	Renderer.prototype.updateOffset = function (material) {
		var offsetRecord = this.rendererRecord.offsetRecord;
		var context = this.context;

		var enabled = material.offsetState.enabled;
		var factor = material.offsetState.factor;
		var units = material.offsetState.units;

		if (offsetRecord.enabled !== enabled) {
			if (enabled) {
				context.enable(WebGLRenderingContext.POLYGON_OFFSET_FILL);
			} else {
				context.disable(WebGLRenderingContext.POLYGON_OFFSET_FILL);
			}

			offsetRecord.enabled = enabled;
		}

		if (enabled && (offsetRecord.factor !== factor || offsetRecord.units !== units)) {
			context.polygonOffset(factor, units);

			offsetRecord.factor = factor;
			offsetRecord.units = units;
		}
	};

	Renderer.prototype.setBoundBuffer = function (buffer, target) {
		var targetBuffer = this.rendererRecord.currentBuffer[target];
		if (!targetBuffer.valid || targetBuffer.buffer !== buffer) {
			this.context.bindBuffer(RendererUtils.getGLBufferTarget(target), buffer);
			targetBuffer.buffer = buffer;
			targetBuffer.valid = true;
			if (target === 'ArrayBuffer') {
				this.rendererRecord.attributeCache.length = 0;
			}
		}
	};

	Renderer.prototype.bindVertexAttribute = function (attribIndex, attribute) {
		var hashKey = this.rendererRecord.attributeCache[attribIndex];
		if (hashKey !== attribute.hashKey) {
			this.context.vertexAttribPointer(attribIndex, attribute.count, RendererUtils.getGLDataType(attribute.type), attribute.normalized, attribute.stride, attribute.offset);
			this.rendererRecord.attributeCache[attribIndex] = attribute.hashKey;
		}
	};

	Renderer.prototype.clear = function (color, depth, stencil) {
		var bits = 0;

		if (color === undefined || color) {
			bits |= WebGLRenderingContext.COLOR_BUFFER_BIT;
		}
		if (depth === undefined || depth) {
			bits |= WebGLRenderingContext.DEPTH_BUFFER_BIT;
		}
		if (stencil === undefined || stencil) {
			bits |= WebGLRenderingContext.STENCIL_BUFFER_BIT;
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

	Renderer.prototype.flush = function () {
		this.context.flush();
	};

	Renderer.prototype.finish = function () {
		this.context.finish();
	};

	// ---------------------------------------------

	Renderer.prototype.setupFrameBuffer = function (framebuffer, renderTarget, textureTarget) {
		this.context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, framebuffer);
		this.context.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0, textureTarget,
			renderTarget.glTexture, 0);
	};

	Renderer.prototype.setupRenderBuffer = function (renderbuffer, renderTarget) {
		this.context.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, renderbuffer);

		if (renderTarget.depthBuffer && !renderTarget.stencilBuffer) {
			this.context.renderbufferStorage(WebGLRenderingContext.RENDERBUFFER, WebGLRenderingContext.DEPTH_COMPONENT16, renderTarget.width,
				renderTarget.height);
			this.context.framebufferRenderbuffer(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.DEPTH_ATTACHMENT,
				WebGLRenderingContext.RENDERBUFFER, renderbuffer);
		} else if (renderTarget.depthBuffer && renderTarget.stencilBuffer) {
			this.context.renderbufferStorage(WebGLRenderingContext.RENDERBUFFER, WebGLRenderingContext.DEPTH_STENCIL, renderTarget.width,
				renderTarget.height);
			this.context.framebufferRenderbuffer(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.DEPTH_STENCIL_ATTACHMENT,
				WebGLRenderingContext.RENDERBUFFER, renderbuffer);
		} else {
			this.context
				.renderbufferStorage(WebGLRenderingContext.RENDERBUFFER, WebGLRenderingContext.RGBA4, renderTarget.width, renderTarget.height);
		}
	};

	Renderer.prototype.setRenderTarget = function (renderTarget) {
		if (renderTarget && !renderTarget._glFrameBuffer) {
			if (renderTarget.depthBuffer === undefined) {
				renderTarget.depthBuffer = true;
			}
			if (renderTarget.stencilBuffer === undefined) {
				renderTarget.stencilBuffer = true;
			}

			renderTarget.glTexture = this.context.createTexture();

			// Setup texture, create render and frame buffers
			var isTargetPowerOfTwo = Util.isPowerOfTwo(renderTarget.width) && Util.isPowerOfTwo(renderTarget.height);
			var glFormat = RendererUtils.getGLInternalFormat(renderTarget.format);
			var glType = RendererUtils.getGLDataType(renderTarget.type);

			renderTarget._glFrameBuffer = this.context.createFramebuffer();
			renderTarget._glRenderBuffer = this.context.createRenderbuffer();

			this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, renderTarget.glTexture);
			this.updateTextureParameters(renderTarget, isTargetPowerOfTwo);

			this.context
				.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null);

			this.setupFrameBuffer(renderTarget._glFrameBuffer, renderTarget, WebGLRenderingContext.TEXTURE_2D);
			this.setupRenderBuffer(renderTarget._glRenderBuffer, renderTarget);

			if (renderTarget.generateMipmaps && isTargetPowerOfTwo) {
				this.context.generateMipmap(WebGLRenderingContext.TEXTURE_2D);
			}

			// Release everything
			this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, null);
			this.context.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, null);
			this.context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
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
			this.context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, framebuffer);
			this.context.viewport(vx, vy, width, height);

			this.rendererRecord.currentFrameBuffer = framebuffer;

			// Need to force rebinding of textures on framebuffer change (TODO: verify this)
			this.rendererRecord.textureRecord = [];
		}

		this.currentWidth = width;
		this.currentHeight = height;
	};

	Renderer.prototype.updateRenderTargetMipmap = function (renderTarget) {
		this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, renderTarget.glTexture);
		this.context.generateMipmap(WebGLRenderingContext.TEXTURE_2D);
		this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, null);
	};

	Renderer.prototype._deallocateMeshData = function (meshData) {
		meshData.destroy(this.context);
	};

	Renderer.prototype._deallocateTexture = function (texture) {
		texture.destroy(this.context);
	};

	Renderer.prototype._deallocateRenderTarget = function (renderTarget) {
		renderTarget.destroy(this.context);
	};

	Renderer.prototype._deallocateShader = function (shader) {
		shader.destroy();
	};

	return Renderer;
});

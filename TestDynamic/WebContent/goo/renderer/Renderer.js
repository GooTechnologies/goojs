define(
	['goo/renderer/RendererRecord', 'goo/renderer/Camera', 'goo/renderer/Util', 'goo/renderer/TextureCreator', 'goo/renderer/pass/RenderTarget',
			'goo/math/Vector4'],
	function(RendererRecord, Camera, Util, TextureCreator, RenderTarget, Vector4) {
		"use strict";

		/**
		 * Creates a new renderer object
		 * 
		 * @name Renderer
		 * @class The renderer handles displaying of graphics data to a render context
		 * @param {Settings} parameters Renderer settings
		 */
		function Renderer(parameters) {
			parameters = parameters || {};

			var _canvas = parameters.canvas;
			if (_canvas === undefined) {
				_canvas = document.createElement('canvas');
				_canvas.width = 500;
				_canvas.height = 500;
			}
			this.domElement = _canvas;

			// this.lineRecord = null;// new LineRecord();
			this.rendererRecord = new RendererRecord();

			this._alpha = parameters.alpha !== undefined ? parameters.alpha : false;
			this._premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true;
			this._antialias = parameters.antialias !== undefined ? parameters.antialias : false;
			this._stencil = parameters.stencil !== undefined ? parameters.stencil : false;
			this._preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false;

			try {
				var settings = {
					alpha : this._alpha,
					premultipliedAlpha : this._premultipliedAlpha,
					antialias : this._antialias,
					stencil : this._stencil,
					preserveDrawingBuffer : this._preserveDrawingBuffer
				};

				if (!(this.context = _canvas.getContext('experimental-webgl', settings))) {
					console.error('Error creating WebGL context.');
					throw 'Error creating WebGL context.';
				}
			} catch (error) {
				console.error(error);
			}

			// function getAllVariables(object) {
			// return Object.getOwnPropertyNames(object).filter(
			// function(property) {
			// return (typeof object[property] != 'function') && property
			// !== 'caller'
			// && property !== 'callee' && property !== 'arguments';
			// });
			// }
			//
			// var keys = getAllVariables(WebGLRenderingContext);
			// for ( var prop in keys) {
			// var key = keys[prop];
			// var value = WebGLRenderingContext[key];
			// Renderer[key] = value;
			// }

			this.clearColor = new Vector4();
			this.setClearColor(0.8, 0.8, 0.8, 1.0);
			this.context.clearDepth(1);
			this.context.clearStencil(0);

			this.context.enable(WebGLRenderingContext.DEPTH_TEST);
			this.context.depthFunc(WebGLRenderingContext.LEQUAL);

			// this.context.frontFace(this.context.CCW);
			// this.context.cullFace(this.context.BACK);
			// this.context.enable(this.context.CULL_FACE);

			this.viewportX = 0;
			this.viewportY = 0;
			this.viewportWidth = 0;
			this.viewportHeight = 0;
			this.currentWidth = 0;
			this.currentHeight = 0;

			this.info = {
				memory : {
					programs : 0,
					geometries : 0,
					textures : 0
				},
				render : {
					calls : 0,
					vertices : 0,
					faces : 0,
					points : 0
				}
			};
		}

		Renderer.prototype.checkResize = function(camera) {
			if (this.domElement.offsetWidth !== this.domElement.width || this.domElement.offsetHeight !== this.domElement.height) {
				this.setSize(this.domElement.offsetWidth, this.domElement.offsetHeight);
			}

			var aspect = this.domElement.width / this.domElement.height;
			if (camera && camera.aspect !== aspect) {
				camera.aspect = aspect;
				camera.updateProjection();
			}
		};

		Renderer.prototype.setSize = function(width, height) {
			this.domElement.width = width;
			this.domElement.height = height;

			this.setViewport(0, 0, width, height);
		};

		Renderer.prototype.setViewport = function(x, y, width, height) {
			this.viewportX = x !== undefined ? x : 0;
			this.viewportY = y !== undefined ? y : 0;

			this.viewportWidth = width !== undefined ? width : this.domElement.width;
			this.viewportHeight = height !== undefined ? height : this.domElement.height;

			this.context.viewport(this.viewportX, this.viewportY, this.viewportWidth, this.viewportHeight);
		};

		Renderer.prototype.setClearColor = function(r, g, b, a) {
			this.clearColor.set(r, g, b, a);
			this.context.clearColor(r, g, b, a);
		};

		Renderer.prototype.bindData = function(bufferData) {
			var glBuffer = null;
			if (bufferData !== null) {
				glBuffer = bufferData.glBuffer;
				if (glBuffer !== null) {
					if (bufferData._dataNeedsRefresh) {
						this.setBoundBuffer(bufferData.glBuffer, bufferData.target);
						this.context.bufferSubData(this.getGLBufferTarget(bufferData.target), 0, bufferData.data);
						bufferData._dataNeedsRefresh = false;
					}
				} else {
					glBuffer = this.context.createBuffer();
					bufferData.glBuffer = glBuffer;

					this.rendererRecord.invalidateBuffer(bufferData.target);
					this.setBoundBuffer(glBuffer, bufferData.target);
					this.context.bufferData(this.getGLBufferTarget(bufferData.target), bufferData.data, this.getGLBufferUsage(bufferData._dataUsage));
				}
			}

			if (glBuffer !== null) {
				this.setBoundBuffer(glBuffer, bufferData.target);
			} else {
				this.setBoundBuffer(null, bufferData.target);
			}
		};

		Renderer.prototype.render = function(renderList, camera, renderTarget) {
			if (!camera) {
				return;
			}

			// if (renderTarget) {
			this.setRenderTarget(renderTarget);
			// }

			for ( var i in renderList) {
				var entity = renderList[i];
				var renderInfo = {
					meshData : entity.meshDataComponent.meshData,
					materials : entity.meshRendererComponent.materials,
					transform : entity.transformComponent.worldTransform,
					camera : camera,
					lights : entity._world.getManager('LightManager').lights
				};
				this.renderMesh(renderInfo);
			}
		};

		Renderer.prototype.renderMesh = function(renderInfo) {
			var meshData = renderInfo.meshData;
			var materials = renderInfo.materials;

			this.bindData(meshData.vertexData);

			for ( var i in materials) {
				var material = materials[i];

				renderInfo.material = material;
				material.shader.apply(renderInfo, this);

				this.updateCulling(material);
				this.updateTextures(material);

				if (meshData.getIndexBuffer() !== null) {
					this.bindData(meshData.getIndexData());
					if (meshData.getIndexLengths() !== null) {
						this.drawElementsVBO(meshData.getIndexBuffer(), meshData.getIndexModes(), meshData.getIndexLengths(), meshData.wireframe);
					} else {
						this.drawElementsVBO(meshData.getIndexBuffer(), meshData.getIndexModes(), [meshData.getIndexBuffer().length],
							meshData.wireframe);
					}
				} else {
					if (meshData.getIndexLengths() !== null) {
						this.drawArraysVBO(meshData.getIndexModes(), meshData.getIndexLengths(), meshData.wireframe);
					} else {
						this.drawArraysVBO(meshData.getIndexModes(), [meshData.vertexCount], meshData.wireframe);
					}
				}
			}
		};

		Renderer.prototype.drawElementsVBO = function(indices, indexModes, indexLengths, wireframe) {
			var offset = 0;
			var indexModeCounter = 0;

			for ( var i = 0; i < indexLengths.length; i++) {
				var count = indexLengths[i];

				var glIndexMode = this.getGLIndexMode(wireframe ? 'LineLoop' : indexModes[indexModeCounter]);

				var type = this.getGLArrayType(indices);
				var byteSize = this.getGLByteSize(indices);

				this.context.drawElements(glIndexMode, count, type, offset * byteSize);

				offset += count;

				if (indexModeCounter < indexModes.length - 1) {
					indexModeCounter++;
				}
			}
		};

		Renderer.prototype.drawArraysVBO = function(indexModes, indexLengths, wireframe) {
			var offset = 0;
			var indexModeCounter = 0;

			for ( var i = 0; i < indexLengths.length; i++) {
				var count = indexLengths[i];

				var glIndexMode = this.getGLIndexMode(wireframe ? 'LineLoop' : indexModes[indexModeCounter]);

				this.context.drawArrays(glIndexMode, offset, count);

				offset += count;

				if (indexModeCounter < indexModes.length - 1) {
					indexModeCounter++;
				}
			}
		};

		Renderer.prototype.updateCulling = function(material) {
			var record = this.rendererRecord.cullRecord;
			var cullFace = material.cullState.cullFace;
			var frontFace = material.cullState.frontFace;
			var enabled = material.cullState.enabled;

			if (record.enabled !== undefined && record.enabled !== enabled) {
				if (enabled) {
					this.context.enable(WebGLRenderingContext.CULL_FACE);
				} else {
					this.context.disable(WebGLRenderingContext.CULL_FACE);
				}
				record.enabled = false;
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

		Renderer.prototype.updateTextures = function(material) {
			var context = this.context;
			for ( var i = 0; i < material.shader.textureCount; i++) {
				var texture = material.textures[i];

				if (texture === undefined || (texture.image && texture.image.dataReady === undefined)) {
					texture = TextureCreator.DEFAULT_TEXTURE;
				}

				var unitrecord = this.rendererRecord.textureRecord[i];
				if (unitrecord === undefined) {
					unitrecord = this.rendererRecord.textureRecord[i] = {};
				}

				if (texture.glTexture === null) {
					texture.glTexture = context.createTexture();
					this.updateTexture(context, texture, i, unitrecord);
				} else if (texture.needsUpdate) {
					this.updateTexture(context, texture, i, unitrecord);
					texture.needsUpdate = false;
				} else {
					this.bindTexture(context, texture, i, unitrecord);
				}

				this.updateTextureParameters(texture);
			}
		};

		Renderer.prototype.updateTextureParameters = function(texture) {
			var context = this.context;

			var texrecord = texture.textureRecord;
			if (texrecord === undefined) {
				texrecord = {};
				texture.textureRecord = texrecord;
			}

			// TODO: bind?
			if (texrecord.magFilter !== texture.magFilter) {
				context.texParameteri(this.getGLType(texture.variant), WebGLRenderingContext.TEXTURE_MAG_FILTER, this
					.getGLMagFilter(texture.magFilter));
				texrecord.magFilter = texture.magFilter;
			}
			if (texrecord.minFilter !== texture.minFilter) {
				context.texParameteri(this.getGLType(texture.variant), WebGLRenderingContext.TEXTURE_MIN_FILTER, this
					.getGLMinFilter(texture.minFilter));
				texrecord.minFilter = texture.minFilter;
			}

			if (texture.variant === '2D') {
				var wrapS = this.getGLWrap(texture.wrapS, context);
				var wrapT = this.getGLWrap(texture.wrapT, context);
				if (texrecord.wrapS !== wrapS) {
					context.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_WRAP_S, wrapS);
					texrecord.wrapS = wrapS;
				}
				if (texrecord.wrapT !== wrapT) {
					context.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_WRAP_T, wrapT);
					texrecord.wrapT = wrapT;
				}
			} else if (texture.variant === 'CUBE') {
				// GwtGLTextureStateUtil.applyWrap(gl, (TextureCubeMap)
				// texture, texRecord,
				// unit, record, caps);
			}
		};

		Renderer.prototype.bindTexture = function(context, texture, unit, record) {
			context.activeTexture(WebGLRenderingContext.TEXTURE0 + unit);
			if (record.boundTexture === undefined || (texture.glTexture !== undefined && record.boundTexture != texture.glTexture)) {
				context.bindTexture(WebGLRenderingContext.TEXTURE_2D, texture.glTexture);
				record.boundTexture = texture.glTexture;
			}
		};

		Renderer.prototype.getGLType = function(type) {
			switch (type) {
				case '2D':
					return WebGLRenderingContext.TEXTURE_2D;
				case 'CUBE':
					return WebGLRenderingContext.TEXTURE_CUBE_MAP;
			}
			throw "invalid texture type: " + type;
		};

		// var fisk = 0;
		Renderer.prototype.updateTexture = function(context, texture, unit, record) {
			this.bindTexture(context, texture, unit, record);

			// set alignment to support images with width % 4 !== 0, as
			// images are not aligned
			context.pixelStorei(WebGLRenderingContext.UNPACK_ALIGNMENT, 1);

			// set if we want to flip on Y
			context.pixelStorei(WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL, texture.flipY ? 1 : 0);

			if (texture.generateMipmaps) {
				var image = texture.image;
				var newWidth = Util.nearestPowerOfTwo(image.width);
				var newHeight = Util.nearestPowerOfTwo(image.height);
				if (image.width !== newWidth || image.height !== newHeight) {
					var canvas = document.createElement('canvas'); // !!!!!
					canvas.width = newWidth;
					canvas.height = newHeight;
					var ctx = canvas.getContext('2d');
					ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, newWidth, newHeight);
					document.body.appendChild(canvas);
					canvas.dataReady = true;
					texture.image = canvas;

					// console.dir(canvas);
					// canvas.style['position'] = 'absolute';
					// canvas.style['top'] = (fisk * 105) + 'px';
					// canvas.style['right'] = '10px';
					// canvas.style['width'] = '100px';
					// canvas.style['height'] = '100px';
					// canvas.style['z-index'] = 5;
					// fisk++;
					canvas.parentNode.removeChild(canvas);
				}
			}

			if (!texture.image) {
				// context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType,
				// null);
				context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this.getGLInternalFormat(texture.format), texture.width, texture.height, 0,
					this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), null);
			} else if (texture.image.isData === true) {
				var hasBorder = false; // TODO

				context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this.getGLInternalFormat(texture.format), texture.image.width,
					texture.image.height, hasBorder ? 1 : 0, this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type),
					texture.image);
			} else {
				context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this.getGLInternalFormat(texture.format), this
					.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), texture.image);
			}

			if (texture.generateMipmaps) {
				context.generateMipmap(context.TEXTURE_2D);
			}
		};

		Renderer.prototype.getGLWrap = function(wrap) {
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

		Renderer.prototype.getGLInternalFormat = function(format) {
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

		Renderer.prototype.getGLPixelDataType = function(type) {
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

		Renderer.prototype.getGLMagFilter = function(magFilter, context) {
			switch (magFilter) {
				case 'Bilinear':
					return WebGLRenderingContext.LINEAR;
				case 'NearestNeighbor':
				default:
					return WebGLRenderingContext.NEAREST;
			}
		};

		Renderer.prototype.getGLMinFilter = function(filter) {
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

		Renderer.prototype.getGLBufferTarget = function(target) {
			if (target === 'ElementArrayBuffer') {
				return WebGLRenderingContext.ELEMENT_ARRAY_BUFFER;
			}

			return WebGLRenderingContext.ARRAY_BUFFER;
		};

		Renderer.prototype.getGLArrayType = function(indices) {
			if (indices instanceof Int8Array) {
				return WebGLRenderingContext.UNSIGNED_BYTE;
			} else if (indices instanceof Int16Array) {
				return WebGLRenderingContext.UNSIGNED_SHORT;
			} else if (indices instanceof Int32Array) {
				return WebGLRenderingContext.UNSIGNED_INT;
			}

			return null;
			// throw new IllegalArgumentException("Unknown buffer type: " +
			// indices);
		};

		Renderer.prototype.getGLByteSize = function(indices) {
			if (indices instanceof Int8Array) {
				return 1;
			} else if (indices instanceof Int16Array) {
				return 2;
			} else if (indices instanceof Int32Array) {
				return 4;
			}

			return 1;
		};

		Renderer.prototype.getGLBufferUsage = function(usage) {
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

		Renderer.prototype.getGLIndexMode = function(indexMode) {
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

		Renderer.prototype.setBoundBuffer = function(buffer, target) {
			if (!this.rendererRecord.currentBuffer[target].valid || this.rendererRecord.currentBuffer[target].buffer !== buffer) {
				this.context.bindBuffer(this.getGLBufferTarget(target), buffer);
				this.rendererRecord.currentBuffer[target] = {
					buffer : buffer,
					valid : true
				};
			}
		};

		Renderer.prototype.bindVertexAttribute = function(attribIndex, tupleSize, type, normalized, stride, offset, record) {
			this.context.vertexAttribPointer(attribIndex, tupleSize, this.getGLDataType(type), normalized, stride, offset);

			if (record.boundAttributes.indexOf(attribIndex) === -1) {
				this.context.enableVertexAttribArray(attribIndex);
				record.boundAttributes.push(attribIndex);
			}
			// if (Constants.extraGLErrorChecks) {
			// checkCardError();
			// }
		};

		Renderer.prototype.getGLDataType = function(type) {
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
			}
		};

		Renderer.prototype.clear = function(color, depth, stencil) {
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

			this.context.clear(bits);
		};

		Renderer.prototype.flush = function() {
			this.context.flush();
		};

		Renderer.prototype.finish = function() {
			this.context.finish();
		};

		// ---------------------------------------------

		Renderer.prototype.setupFrameBuffer = function(framebuffer, renderTarget, textureTarget) {
			this.context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, framebuffer);
			this.context.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0, textureTarget,
				renderTarget.glTexture, 0);
		};

		Renderer.prototype.setupRenderBuffer = function(renderbuffer, renderTarget) {
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
				this.context.renderbufferStorage(WebGLRenderingContext.RENDERBUFFER, WebGLRenderingContext.RGBA4, renderTarget.width,
					renderTarget.height);
			}
		};

		Renderer.prototype.setRenderTarget = function(renderTarget) {
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
				var glFormat = this.getGLInternalFormat(renderTarget.format);
				var glType = this.getGLDataType(renderTarget.type);

				renderTarget._glFrameBuffer = this.context.createFramebuffer();
				renderTarget._glRenderBuffer = this.context.createRenderbuffer();

				this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, renderTarget.glTexture);
				// TODO
				// setTextureParameters(WebGLRenderingContext.TEXTURE_2D, renderTarget, isTargetPowerOfTwo);
				this.updateTextureParameters(renderTarget);

				this.context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType,
					null);

				this.setupFrameBuffer(renderTarget._glFrameBuffer, renderTarget, WebGLRenderingContext.TEXTURE_2D);
				this.setupRenderBuffer(renderTarget._glRenderBuffer, renderTarget);

				if (isTargetPowerOfTwo) {
					this.context.generateMipmap(WebGLRenderingContext.TEXTURE_2D);
				}

				// Release everything
				this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, null);
				this.context.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, null);
				this.context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
			}

			var framebuffer, width, height, vx, vy;

			if (renderTarget) {
				framebuffer = renderTarget._glFramebuffer;

				width = renderTarget.width;
				height = renderTarget.height;

				vx = 0;
				vy = 0;
			} else {
				framebuffer = null;

				width = this.viewportWidth;
				height = this.viewportHeight;

				vx = this.viewportX;
				vy = this.viewportY;
			}

			if (framebuffer !== this.rendererRecord.currentFramebuffer) {
				this.context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, framebuffer);
				this.context.viewport(vx, vy, width, height);

				this.rendererRecord.currentFramebuffer = framebuffer;
			}

			this.currentWidth = width;
			this.currentHeight = height;
		};

		Renderer.prototype.updateRenderTargetMipmap = function(renderTarget) {
			this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, renderTarget.glTexture);
			this.context.generateMipmap(WebGLRenderingContext.TEXTURE_2D);
			this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, null);
		};

		return Renderer;
	});
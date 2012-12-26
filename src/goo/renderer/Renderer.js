/*jshint bitwise: false */
define(['goo/renderer/RendererRecord', 'goo/renderer/Camera', 'goo/renderer/Util', 'goo/renderer/TextureCreator', 'goo/renderer/pass/RenderTarget',
		'goo/math/Vector4', 'goo/entities/Entity', 'goo/renderer/Texture', 'goo/loaders/dds/DdsLoader', 'goo/loaders/dds/DdsUtils',
		'goo/renderer/MeshData', 'goo/renderer/Material'],
		function (RendererRecord, Camera, Util, TextureCreator, RenderTarget, Vector4, Entity, Texture, DdsLoader, DdsUtils, MeshData, Material) {
	"use strict";

	var WebGLRenderingContext = window.WebGLRenderingContext;

	/**
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

			this.glExtensionCompressedTextureS3TC = DdsLoader.SUPPORTS_DDS = DdsUtils.isSupported(this.context);
			this.glExtensionTextureFloat = this.context.getExtension('OES_texture_float');
			this.glExtensionStandardDerivatives = this.context.getExtension('OES_standard_derivatives');
			this.glExtensionTextureFilterAnisotropic = this.context.getExtension('EXT_texture_filter_anisotropic')
				|| this.context.getExtension('MOZ_EXT_texture_filter_anisotropic')
				|| this.context.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
			// this.glExtensionCompressedTextureS3TC = this.context.getExtension('WEBGL_compressed_texture_s3tc')
			// || this.context.getExtension('MOZ_WEBGL_compressed_texture_s3tc')
			// || this.context.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc');

			if (!this.glExtensionTextureFloat) {
				console.log('Float textures not supported.');
			}
			if (!this.glExtensionStandardDerivatives) {
				console.log('Standard derivatives not supported.');
			}
			if (!this.glExtensionTextureFilterAnisotropic) {
				console.log('Anisotropic texture filtering not supported.');
			}
			if (!this.glExtensionCompressedTextureS3TC) {
				console.log('S3TC compressed textures not supported.');
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
		this.setClearColor(0.3, 0.3, 0.3, 1.0);
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

		this.overrideMaterial = null;

		this.info = {
			calls : 0,
			vertices : 0,
			indices : 0,
			reset : function () {
				this.calls = 0;
				this.vertices = 0;
				this.indices = 0;
			},
			toString : function () {
				return 'Calls: ' + this.calls + ' Vertices: ' + this.vertices + ' Indices: ' + this.indices;
			}
		};
	}

	Renderer.prototype.checkResize = function (camera) {
		if (this.domElement.offsetWidth !== this.domElement.width || this.domElement.offsetHeight !== this.domElement.height) {
			this.setSize(this.domElement.offsetWidth, this.domElement.offsetHeight);
		}

		var aspect = this.domElement.width / this.domElement.height;
		if (camera && camera.aspect !== aspect) {
			camera.aspect = aspect;
			camera.setFrustumPerspective();
		}
	};

	Renderer.prototype.setSize = function (width, height) {
		this.domElement.width = width;
		this.domElement.height = height;

		this.setViewport(0, 0, width, height);
	};

	Renderer.prototype.setViewport = function (x, y, width, height) {
		this.viewportX = x !== undefined ? x : 0;
		this.viewportY = y !== undefined ? y : 0;

		this.viewportWidth = width !== undefined ? width : this.domElement.width;
		this.viewportHeight = height !== undefined ? height : this.domElement.height;

		this.context.viewport(this.viewportX, this.viewportY, this.viewportWidth, this.viewportHeight);
	};

	Renderer.prototype.setClearColor = function (r, g, b, a) {
		this.clearColor.set(r, g, b, a);
		this.context.clearColor(r, g, b, a);
	};

	Renderer.prototype.bindData = function (bufferData) {
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

	Renderer.prototype.render = function (renderList, camera, lights, renderTarget, clear) {
		if (!camera) {
			return;
		}

		this.setRenderTarget(renderTarget);

		if (clear === undefined || clear === true) {
			this.clear();
		}

		var renderInfo = {
			camera : camera,
			lights : lights
		};

		if (Array.isArray(renderList)) {
			for (var i = 0; i < renderList.length; i++) {
				var renderable = renderList[i];
				this.fillRenderInfo(renderable, renderInfo);
				this.renderMesh(renderInfo);
			}
		} else {
			this.fillRenderInfo(renderList, renderInfo);
			this.renderMesh(renderInfo);
		}

		// var error = this.context.getError();
		// if (error !== WebGLRenderingContext.NO_ERROR) {
		// throw "Error: " + error;
		// }
	};

	Renderer.prototype.fillRenderInfo = function (renderable, renderInfo) {
		if (renderable instanceof Entity) {
			renderInfo.meshData = renderable.meshDataComponent.meshData;
			renderInfo.materials = renderable.meshRendererComponent.materials;
			renderInfo.transform = renderable.transformComponent.worldTransform;
		} else {
			renderInfo.meshData = renderable.meshData;
			renderInfo.materials = renderable.materials;
			renderInfo.transform = renderable.transform;
		}
	};

	Renderer.prototype.renderMesh = function (renderInfo) {
		var meshData = renderInfo.meshData;
		var materials = renderInfo.materials;
		if (this.overrideMaterial !== null) {
			materials = [this.overrideMaterial];
		}

		this.bindData(meshData.vertexData);

		var isWireframe = false;
		var originalData = meshData;

		for (var i = 0; i < materials.length; i++) {
			var material = materials[i];
			if (!material.shader) {
				// console.warn('No shader set on material: ' + material.name);
				continue;
			}

			if (material.wireframe && !isWireframe) {
				if (!meshData.wireframeData) {
					meshData.wireframeData = this.buildWireframeData(meshData);
				}
				meshData = meshData.wireframeData;
				this.bindData(meshData.vertexData);
				if (!material.wireframeMaterial) {
					material.wireframeMaterial = this.buildWireframeMaterial(material);
				}
				material = material.wireframeMaterial;
				isWireframe = true;
			} else if (!material.wireframe && isWireframe) {
				meshData = originalData;
				this.bindData(meshData.vertexData);
				iswireframe = false;
			}

			renderInfo.material = material;
			material.shader.apply(renderInfo, this);

			this.updateDepthTest(material);
			this.updateCulling(material);
			this.updateBlending(material);
			this.updateTextures(material);

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

			this.info.calls++;
			this.info.vertices += meshData.vertexCount;
			this.info.indices += meshData.indexCount;
		}
	};

	Renderer.prototype.drawElementsVBO = function (indices, indexModes, indexLengths) {
		var offset = 0;
		var indexModeCounter = 0;

		for (var i = 0; i < indexLengths.length; i++) {
			var count = indexLengths[i];

			var glIndexMode = this.getGLIndexMode(indexModes[indexModeCounter]);

			var type = this.getGLArrayType(indices);
			var byteSize = this.getGLByteSize(indices);

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

			var glIndexMode = this.getGLIndexMode(indexModes[indexModeCounter]);

			this.context.drawArrays(glIndexMode, offset, count);

			offset += count;

			if (indexModeCounter < indexModes.length - 1) {
				indexModeCounter++;
			}
		}
	};

	Renderer.prototype.buildWireframeData = function (meshData) {
		var attributeMap = Util.clone(meshData.attributeMap);
		var wireframeData = new MeshData(attributeMap, meshData.vertexCount, meshData.indexCount * 2);
		for (var atr in attributeMap) {
			wireframeData.getAttributeBuffer(atr).set(meshData.getAttributeBuffer(atr));
		}
		var origI = meshData.getIndexBuffer();
		var targetI = wireframeData.getIndexBuffer();
		// TODO: fix this to handle other indexmodes than 'triangles'
		for (var ii = 0; ii < meshData.indexCount; ii++) {
			var i1 = origI[ii * 3 + 0];
			var i2 = origI[ii * 3 + 1];
			var i3 = origI[ii * 3 + 2];

			targetI[ii * 6 + 0] = i1;
			targetI[ii * 6 + 1] = i2;
			targetI[ii * 6 + 2] = i2;
			targetI[ii * 6 + 3] = i3;
			targetI[ii * 6 + 4] = i3;
			targetI[ii * 6 + 5] = i1;
		}
		wireframeData.indexModes[0] = 'Lines';
		return wireframeData;
	};

	Renderer.prototype.buildWireframeMaterial = function (material) {
		var wireDef = {};
		wireDef.defines = material.shader.defines;
		wireDef.attributes = material.shader.attributes;
		wireDef.uniforms = material.shader.uniforms;
		wireDef.vshader = material.shader.vertexSource;
		wireDef.fshader = Material.shaders.simple.fshader;
		var wireframeMaterial = Material.createMaterial(wireDef, 'Wireframe');
		wireframeMaterial.textures = material.textures;
		return wireframeMaterial;
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
			switch (frontFace)
			{
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
		for (var i = 0; i < material.shader.textureSlots.length; i++) {
			var texture = material.textures[i];

			if (texture === undefined || !texture instanceof RenderTarget && texture.image === undefined || texture.image
				&& texture.image.dataReady === undefined) {
				if (material.shader.textureSlots[i].format === 'sampler2D') {
					texture = TextureCreator.DEFAULT_TEXTURE_2D;
				} else if (material.shader.textureSlots[i].format === 'samplerCube') {
					texture = TextureCreator.DEFAULT_TEXTURE_CUBE;
				}
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

			var imageObject = texture.image !== undefined ? texture.image : texture;
			var isTexturePowerOfTwo = Util.isPowerOfTwo(imageObject.width) && Util.isPowerOfTwo(imageObject.height);
			this.updateTextureParameters(texture, isTexturePowerOfTwo);
		}
	};

	Renderer.prototype.updateTextureParameters = function (texture, isImagePowerOfTwo) {
		var context = this.context;

		var texrecord = texture.textureRecord;
		if (texrecord === undefined) {
			texrecord = {};
			texture.textureRecord = texrecord;
		}

		var glType = this.getGLType(texture.variant);

		if (texrecord.magFilter !== texture.magFilter) {
			context.texParameteri(glType, WebGLRenderingContext.TEXTURE_MAG_FILTER, this.getGLMagFilter(texture.magFilter));
			texrecord.magFilter = texture.magFilter;
		}
		var minFilter = isImagePowerOfTwo ? texture.minFilter : this.getFilterFallback(texture.minFilter);
		if (texrecord.minFilter !== minFilter) {
			context.texParameteri(glType, WebGLRenderingContext.TEXTURE_MIN_FILTER, this.getGLMinFilter(minFilter));
			texrecord.minFilter = minFilter;
		}

		var wrapS = isImagePowerOfTwo ? texture.wrapS : 'EdgeClamp';
		if (texrecord.wrapS !== wrapS) {
			var glwrapS = this.getGLWrap(wrapS, context);
			context.texParameteri(glType, WebGLRenderingContext.TEXTURE_WRAP_S, glwrapS);
			texrecord.wrapS = wrapS;
		}
		var wrapT = isImagePowerOfTwo ? texture.wrapT : 'EdgeClamp';
		if (texrecord.wrapT !== wrapT) {
			var glwrapT = this.getGLWrap(wrapT, context);
			context.texParameteri(glType, WebGLRenderingContext.TEXTURE_WRAP_T, glwrapT);
			texrecord.wrapT = wrapT;
		}
	};

	Renderer.prototype.bindTexture = function (context, texture, unit, record) {
		context.activeTexture(WebGLRenderingContext.TEXTURE0 + unit);
		if (record.boundTexture === undefined || texture.glTexture !== undefined && record.boundTexture !== texture.glTexture) {
			context.bindTexture(this.getGLType(texture.variant), texture.glTexture);
			record.boundTexture = texture.glTexture;
		}
	};

	Renderer.prototype.getGLType = function (type) {
		switch (type)
		{
		case '2D':
			return WebGLRenderingContext.TEXTURE_2D;
		case 'CUBE':
			return WebGLRenderingContext.TEXTURE_CUBE_MAP;
		}
		throw "invalid texture type: " + type;
	};

	Renderer.prototype.loadCompressedTexture = function (context, target, texture, imageData) {
		var mipSizes = texture.image.mipmapSizes;
		var dataOffset = 0, dataLength = 0;
		var width = texture.image.width, height = texture.image.height;
		var ddsExt = DdsUtils.getDdsExtension(context);
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
			throw new Error("Unhandled compression format: " + img.getDataFormat().name());
		}

		if (mipSizes == null) {
			if (imageData instanceof Uint8Array) {
				context.compressedTexImage2D(target, 0, internalFormat, width, height, 0, imageData);
			} else {
				context.compressedTexImage2D(target, 0, internalFormat, width, height, 0, new Uint8Array(imageData.buffer, imageData.byteOffset,
					imageData.byteLength));
			}
		} else {
			texture.generateMipmaps = false;
			for (var i = 0; i < mipSizes.length; i++) {
				dataLength = mipSizes[i];
				context.compressedTexImage2D(target, i, internalFormat, width, height, 0, new Uint8Array(imageData.buffer, imageData.byteOffset
					+ dataOffset, dataLength));
				width = ~~(width / 2) > 1 ? ~~(width / 2) : 1;
				height = ~~(height / 2) > 1 ? ~~(height / 2) : 1;
				dataOffset += dataLength;
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
		this.bindTexture(context, texture, unit, record);

		// set alignment to support images with width % 4 !== 0, as
		// images are not aligned
		context.pixelStorei(WebGLRenderingContext.UNPACK_ALIGNMENT, 1);

		// set if we want to flip on Y
		context.pixelStorei(WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL, texture.flipY);

		if (texture.generateMipmaps) {
			var image = texture.image;

			if (texture.variant === '2D') {
				this.checkRescale(texture, image, image.width, image.height);
			} else if (texture.variant === 'CUBE') {
				for (var i = 0; i < 6; i++) {
					this.checkRescale(texture, image.data[i], image.width, image.height);
				}
			}
		}

		// TODO: Add "usesMipmaps" to check if minfilter has mipmap mode

		if (texture.variant === '2D') {
			if (!texture.image) {
				context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this.getGLInternalFormat(texture.format), texture.width, texture.height, 0,
					this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), null);
			} else if (texture.image.isData === true) {
				if (texture.image.isCompressed) {
					this.loadCompressedTexture(context, WebGLRenderingContext.TEXTURE_2D, texture, texture.image.data);
				} else {
					context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this.getGLInternalFormat(texture.format), texture.image.width,
						texture.image.height, texture.hasBorder ? 1 : 0, this.getGLInternalFormat(texture.format), this
							.getGLPixelDataType(texture.type), texture.image.data);
				}
			} else {
				context.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this.getGLInternalFormat(texture.format), this
					.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), texture.image);
			}

			if (texture.generateMipmaps && texture.image && !texture.image.isCompressed) {
				context.generateMipmap(WebGLRenderingContext.TEXTURE_2D);
			}
		} else if (texture.variant === 'CUBE') {
			for (var faceIndex = 0; faceIndex < Texture.CUBE_FACES.length; faceIndex++) {
				var face = Texture.CUBE_FACES[faceIndex];

				if (!texture.image) {
					context.texImage2D(this.getGLCubeMapFace(face), 0, this.getGLInternalFormat(texture.format), texture.width, texture.height, 0,
						this.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), null);
				} else if (texture.image.isData === true) {
					if (texture.image.isCompressed) {
						this.loadCompressedTexture(context, this.getGLCubeMapFace(face), texture, texture.image.data[faceIndex]);
					} else {
						context.texImage2D(this.getGLCubeMapFace(face), 0, this.getGLInternalFormat(texture.format), texture.image.width,
							texture.image.height, texture.hasBorder ? 1 : 0, this.getGLInternalFormat(texture.format), this
								.getGLPixelDataType(texture.type), texture.image.data[faceIndex]);
					}
				} else {
					context.texImage2D(this.getGLCubeMapFace(face), 0, this.getGLInternalFormat(texture.format), this
						.getGLInternalFormat(texture.format), this.getGLPixelDataType(texture.type), texture.image.data[faceIndex]);
				}
			}

			if (texture.generateMipmaps && texture.image && !texture.image.isCompressed) {
				context.generateMipmap(WebGLRenderingContext.TEXTURE_CUBE_MAP);
			}
		}
	};

	Renderer.prototype.checkRescale = function (texture, image, width, height) {
		var newWidth = Util.nearestPowerOfTwo(width);
		var newHeight = Util.nearestPowerOfTwo(height);
		if (width !== newWidth || height !== newHeight) {
			var canvas = document.createElement('canvas'); // !!!!!
			canvas.width = newWidth;
			canvas.height = newHeight;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(image, 0, 0, width, height, 0, 0, newWidth, newHeight);
			document.body.appendChild(canvas);
			canvas.dataReady = true;
			texture.image = canvas;
			canvas.parentNode.removeChild(canvas);
		}
	};

	Renderer.prototype.getGLWrap = function (wrap) {
		switch (wrap)
		{
		case 'Repeat':
			return WebGLRenderingContext.REPEAT;
		case 'MirroredRepeat':
			return WebGLRenderingContext.MIRRORED_REPEAT;
		case 'EdgeClamp':
			return WebGLRenderingContext.CLAMP_TO_EDGE;
		}
		throw "invalid WrapMode type: " + wrap;
	};

	Renderer.prototype.getGLInternalFormat = function (format) {
		switch (format)
		{
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

	Renderer.prototype.getGLPixelDataType = function (type) {
		switch (type)
		{
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

	Renderer.prototype.getFilterFallback = function (filter) {
		switch (filter)
		{
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

	Renderer.prototype.getGLMagFilter = function (filter) {
		switch (filter)
		{
		case 'Bilinear':
			return WebGLRenderingContext.LINEAR;
		case 'NearestNeighbor':
			return WebGLRenderingContext.NEAREST;
		default:
			return WebGLRenderingContext.NEAREST;
		}
	};

	Renderer.prototype.getGLMinFilter = function (filter) {
		switch (filter)
		{
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

	Renderer.prototype.getGLBufferTarget = function (target) {
		if (target === 'ElementArrayBuffer') {
			return WebGLRenderingContext.ELEMENT_ARRAY_BUFFER;
		}

		return WebGLRenderingContext.ARRAY_BUFFER;
	};

	Renderer.prototype.getGLArrayType = function (indices) {
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

	Renderer.prototype.getGLByteSize = function (indices) {
		if (indices instanceof Int8Array) {
			return 1;
		} else if (indices instanceof Int16Array) {
			return 2;
		} else if (indices instanceof Int32Array) {
			return 4;
		}

		return 1;
	};

	Renderer.prototype.getGLCubeMapFace = function (face) {
		switch (face)
		{
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

	Renderer.prototype.getGLBufferUsage = function (usage) {
		var glMode = WebGLRenderingContext.STATIC_DRAW;
		switch (usage)
		{
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

	Renderer.prototype.getGLIndexMode = function (indexMode) {
		var glMode = WebGLRenderingContext.TRIANGLES;
		switch (indexMode)
		{
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
				context.blendEquation(WebGLRenderingContext.FUNC_ADD);
				context.blendFunc(WebGLRenderingContext.ZERO, WebGLRenderingContext.ONE_MINUS_SRC_COLOR);
			} else if (blending === 'MultiplyBlending') {
				// TODO: Find blendFuncSeparate() combination
				context.enable(WebGLRenderingContext.BLEND);
				context.blendEquation(WebGLRenderingContext.FUNC_ADD);
				context.blendFunc(WebGLRenderingContext.ZERO, WebGLRenderingContext.SRC_COLOR);
			} else if (blending === 'CustomBlending') {
				context.enable(WebGLRenderingContext.BLEND);
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
				context.blendEquation(this.getGLBlendParam(blendEquation));
				blendRecord.blendEquation = blendEquation;
			}

			if (blendSrc !== blendRecord.blendSrc || blendDst !== blendRecord.blendDst) {
				context.blendFunc(this.getGLBlendParam(blendSrc), this.getGLBlendParam(blendDst));

				blendRecord.blendSrc = blendSrc;
				blendRecord.blendDst = blendDst;
			}
		} else {
			blendRecord.blendEquation = null;
			blendRecord.blendSrc = null;
			blendRecord.blendDst = null;
		}
	};

	Renderer.prototype.setBoundBuffer = function (buffer, target) {
		if (!this.rendererRecord.currentBuffer[target].valid || this.rendererRecord.currentBuffer[target].buffer !== buffer) {
			this.context.bindBuffer(this.getGLBufferTarget(target), buffer);
			this.rendererRecord.currentBuffer[target] = {
				buffer : buffer,
				valid : true
			};
		}
	};

	Renderer.prototype.bindVertexAttribute = function (attribIndex, tupleSize, type, normalized, stride, offset, record) {
		this.context.vertexAttribPointer(attribIndex, tupleSize, this.getGLDataType(type), normalized, stride, offset);

		if (record.boundAttributes.indexOf(attribIndex) === -1) {
			this.context.enableVertexAttribArray(attribIndex);
			record.boundAttributes.push(attribIndex);
		}
		// if (Constants.extraGLErrorChecks) {
		// checkCardError();
		// }
	};

    // REVIEW: Rewrite as a map object? (http://jsperf.com/performance-of-assigning-variables-in-javascript)
	Renderer.prototype.getGLDataType = function (type) {
		switch (type)
		{
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

	// REVIEW: Rewrite as a map object? (http://jsperf.com/performance-of-assigning-variables-in-javascript)
	Renderer.prototype.getGLBlendParam = function (param) {
		switch (param)
		{
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

		this.context.clear(bits);
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
			var glFormat = this.getGLInternalFormat(renderTarget.format);
			var glType = this.getGLDataType(renderTarget.type);

			renderTarget._glFrameBuffer = this.context.createFramebuffer();
			renderTarget._glRenderBuffer = this.context.createRenderbuffer();

			this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, renderTarget.glTexture);
			// TODO
			// setTextureParameters(WebGLRenderingContext.TEXTURE_2D, renderTarget, isTargetPowerOfTwo);
			this.updateTextureParameters(renderTarget, isTargetPowerOfTwo);

			this.context
				.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null);

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
			framebuffer = renderTarget._glFrameBuffer;

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

		if (framebuffer !== this.rendererRecord.currentFrameBuffer) {
			this.context.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, framebuffer);
			this.context.viewport(vx, vy, width, height);

			this.rendererRecord.currentFrameBuffer = framebuffer;
		}

		this.currentWidth = width;
		this.currentHeight = height;
	};

	Renderer.prototype.updateRenderTargetMipmap = function (renderTarget) {
		this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, renderTarget.glTexture);
		this.context.generateMipmap(WebGLRenderingContext.TEXTURE_2D);
		this.context.bindTexture(WebGLRenderingContext.TEXTURE_2D, null);
	};

	return Renderer;
});

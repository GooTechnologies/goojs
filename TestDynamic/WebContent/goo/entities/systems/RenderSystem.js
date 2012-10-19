define([ 'goo/entities/systems/System', 'goo/renderer/TextureCreator' ], function(System, TextureCreator) {
	function RenderSystem(renderList) {
		System.call(this, 'RenderSystem', null, true);

		this.renderList = renderList;
	}

	RenderSystem.prototype = Object.create(System.prototype);

	RenderSystem.prototype.render = function(renderer) {
		renderer.checkResize();

		renderer.clear();

		for (i in this.renderList) {
			var entity = this.renderList[i];
			this.renderEntity(renderer, entity);
		}

		renderer.flush();
	};

	RenderSystem.prototype.renderEntity = function(renderer, entity) {
		var shaderInfo = {
			meshData : entity.MeshDataComponent.meshData,
			transform : entity.TransformComponent.worldTransform,
			materials : entity.MeshRendererComponent.materials
		};

		var context = renderer.context;

		// bind our interleaved data
		renderer.bindData(shaderInfo.meshData.vertexData);

		for (i in shaderInfo.materials) {
			var material = shaderInfo.materials[i];

			if (material.shader == null) {
				return;
			}

			// for (final StateType type : StateType.values) {
			// renderer.applyState(type, material.getRenderState(type));
			// }

			shaderInfo.material = material;
			material.shader.apply(shaderInfo, renderer);

			updateTextures(material, renderer);

			var meshData = shaderInfo.meshData;
			if (meshData.getIndexBuffer() != null) {
				renderer.bindData(meshData.getIndexData());
				if (meshData.getIndexLengths() != null) {
					renderer.drawElementsVBO(meshData.getIndexBuffer(), meshData.getIndexModes(), meshData
							.getIndexLengths());
				} else {
					renderer.drawElementsVBO(meshData.getIndexBuffer(), meshData.getIndexModes(), [ meshData
							.getIndexBuffer().length ]);
				}
			} else {
				if (meshData.getIndexLengths() != null) {
					renderer.drawArraysVBO(meshData.getIndexModes(), meshData.getIndexLengths());
				} else {
					renderer.drawArraysVBO(meshData.getIndexModes(), [ meshData.getVertexCount() ]);
				}
			}
		}
	};

	function updateTextures(material, renderer) {
		var context = renderer.context;
		for (i = 0; i < material.shader.textureCount; i++) {
			var texture = material.textures[i];
			if (texture === undefined || texture.image.dataReady === undefined) {
				return;
				texture = TextureCreator.DEFAULT_TEXTURE;
			}

			if (texture.glTexture == null) {
				texture.glTexture = renderer.context.createTexture();
				updateTexture(context, texture, i);
			} else if (texture.needsUpdate) {
				texture.needsUpdate = false;
				updateTexture(context, texture, i);
			} else {
				bindTexture(context, texture, i);
			}

			// TODO: bind?
			context.texParameteri(getGLType(texture.variant, context), context.TEXTURE_MAG_FILTER, getGLMagFilter(
					texture.magFilter, context));
			context.texParameteri(getGLType(texture.variant, context), context.TEXTURE_MIN_FILTER, getGLMinFilter(
					texture.minFilter, context));

			// TODO: bind?
			// GwtGLTextureStateUtil.applyWrap(gl, texture, texRecord, i,
			// record, caps);
			if (texture.variant === '2D') {
				// GwtGLTextureStateUtil.applyWrap(gl, (Texture2D) texture,
				// texRecord, unit, record, caps);
				var wrapS = getGLWrap(texture.wrapS, context);
				var wrapT = getGLWrap(texture.wrapT, context);
				context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, wrapS);
				context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, wrapT);
			} else if (texture.variant === 'CUBE') {
				// GwtGLTextureStateUtil.applyWrap(gl, (TextureCubeMap)
				// texture, texRecord,
				// unit, record, caps);
			}
		}
	}

	function bindTexture(context, texture, unit) {
		context.activeTexture(context.TEXTURE0 + unit);
		context.bindTexture(context.TEXTURE_2D, texture.glTexture);
	}

	function getGLType(type, context) {
		switch (type) {
			case '2D':
				return context.TEXTURE_2D;
			case 'CUBE':
				return context.TEXTURE_CUBE_MAP;
		}
		throw "invalid texture type: " + type;
	}

	function updateTexture(context, texture, unit) {
		bindTexture(context, texture, unit);

		// set alignment to support images with width % 4 != 0, as
		// images are not aligned
		context.pixelStorei(context.UNPACK_ALIGNMENT, 1);

		// set if we want to flip on Y
		context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, texture.flipY ? 1 : 0);

		context.texImage2D(context.TEXTURE_2D, 0, getGLInternalFormat(texture.format, context), getGLInternalFormat(
				texture.format, context), getGLPixelDataType(texture.type, context), texture.image);

		if (texture.generateMipmaps) {
			context.generateMipmap(context.TEXTURE_2D);
		}
	}

	function getGLWrap(wrap, context) {
		switch (wrap) {
			case 'Repeat':
				return context.REPEAT;
			case 'MirroredRepeat':
				return context.MIRRORED_REPEAT;
			case 'EdgeClamp':
				return context.CLAMP_TO_EDGE;
		}
		throw "invalid WrapMode type: " + wrap;
	}

	function getGLInternalFormat(format, context) {
		switch (format) {
			case 'RGBA':
				return context.RGBA;
			case 'RGB':
				return context.RGB;
			case 'Alpha':
				return context.ALPHA;
			case 'Luminance':
				return context.LUMINANCE;
			case 'LuminanceAlpha':
				return context.LUMINANCE_ALPHA;
			default:
				throw "Unsupported format: " + format;
		}
	}

	function getGLPixelDataType(type, context) {
		switch (type) {
			case 'UnsignedByte':
				return context.UNSIGNED_BYTE;
			case 'UnsignedShort565':
				return context.UNSIGNED_SHORT_5_6_5;
			case 'UnsignedShort4444':
				return context.UNSIGNED_SHORT_4_4_4_4;
			case 'UnsignedShort5551':
				return context.UNSIGNED_SHORT_5_5_5_1;
			case 'Float':
				return context.FLOAT;
			default:
				throw "Unsupported type: " + type;
		}
	}

	function getGLMagFilter(magFilter, context) {
		switch (magFilter) {
			case 'Bilinear':
				return context.LINEAR;
			case 'NearestNeighbor':
			default:
				return context.NEAREST;

		}
	}

	function getGLMinFilter(filter, context) {
		switch (filter) {
			case 'BilinearNoMipMaps':
				return context.LINEAR;
			case 'Trilinear':
				return context.LINEAR_MIPMAP_LINEAR;
			case 'BilinearNearestMipMap':
				return context.LINEAR_MIPMAP_NEAREST;
			case 'NearestNeighborNoMipMaps':
				return context.NEAREST;
			case 'NearestNeighborNearestMipMap':
				return context.NEAREST_MIPMAP_NEAREST;
			case 'NearestNeighborLinearMipMap':
				return context.NEAREST_MIPMAP_LINEAR;
		}
		throw "invalid MinificationFilter type: " + filter;
	}

	return RenderSystem;
});
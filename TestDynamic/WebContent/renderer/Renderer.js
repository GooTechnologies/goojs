define(
		[ 'renderer/ShaderRecord', 'renderer/RendererRecord' ],
		function(ShaderRecord, RendererRecord) {
			function Renderer(parameters) {
				parameters = parameters || {};

				var _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement('canvas');

				this.lineRecord = null;// new LineRecord();
				this.shaderRecord = new ShaderRecord();
				this.rendererRecord = new RendererRecord();

				this._alpha = parameters.alpha !== undefined ? parameters.alpha : true;
				this._premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha
						: true;
				this._antialias = parameters.antialias !== undefined ? parameters.antialias : false;
				this._stencil = parameters.stencil !== undefined ? parameters.stencil : true;
				this._preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer
						: false;

				try {
					// var settings = {
					// alpha : this._alpha,
					// premultipliedAlpha : this._premultipliedAlpha,
					// antialias : this._antialias,
					// stencil : this._stencil,
					// preserveDrawingBuffer : this._preserveDrawingBuffer
					// };

					if (!(this.context = _canvas.getContext('experimental-webgl'))) {
						throw 'Error creating WebGL context.';
					}
				} catch (error) {
					console.error(error);
				}
			}

			Renderer.prototype.bindData = function(bufferData) {
				console.log('bindData: ' + arguments);

				var glBuffer = null;
				if (bufferData != null) {
					glBuffer = bufferData._dataRefs.get(this.context);
					if (glBuffer != null) {
						updateBuffer(bufferData, this.rendererRecord, this.context);
						if (bufferData._dataNeedsRefresh) {
							this.setBoundBuffer(bufferData.getDataRef(context), bufferData.getTarget());
							_gl.bufferSubData(this.getGLBufferTarget(bufferData.getTarget()), 0, bufferData.getData());
							bufferData._dataNeedsRefresh = false;
						}
						// if (Constants.extraGLErrorChecks) {
						// checkCardError();
						// }
					} else {
						glBuffer = this.context.createBuffer();
						bufferData._dataRefs.put(this.context, glBuffer);

						this.rendererRecord.invalidateBuffer(bufferData.target);
						this.setBoundBuffer(glBuffer, bufferData.target);
						this.context.bufferData(this.getGLBufferTarget(bufferData.target), bufferData.data, this
								.getGLBufferUsage(bufferData._dataUsage));
					}
				}

				if (glBuffer != null) {
					this.setBoundBuffer(glBuffer, bufferData.target);
				} else {
					this.setBoundBuffer(null, bufferData.target);
				}

				// if (Constants.extraGLErrorChecks) {
				// checkCardError();
				// }
			};

			Renderer.prototype.drawElementsVBO = function(indices, indexModes, indexLengths) {
				console.log('drawElementsVBO');
				console.log(arguments);

				var offset = 0;
				var indexModeCounter = 0;
				// if (Constants.extraGLErrorChecks) {
				// checkCardError();
				// }
				for ( var i = 0; i < indexLengths.length; i++) {
					var count = indexLengths[i];

					var glIndexMode = this.getGLIndexMode(indexModes[indexModeCounter]);

					console.log(indices);
					var type = this.getGLDataType(indices);
					var byteSize = indices.getDataType().getBytesPerEntry();

					// offset in this call is done in bytes.
					this.context.drawElements(glIndexMode, count, type, offset * byteSize);
					// if (Constants.stats) {
					// addStats(indexModes[indexModeCounter], count);
					// }

					offset += count;

					if (indexModeCounter < indexModes.length - 1) {
						indexModeCounter++;
					}
				}
				// if (Constants.extraGLErrorChecks) {
				// checkCardError();
				// }
			};

			Renderer.prototype.drawArraysVBO = function(indexModes, indexLengths) {
				console.log('drawArraysVBO: ' + arguments);
			};

			Renderer.prototype.getGLBufferTarget = function(target) {
				if (target == 'ElementArrayBuffer') {
					return this.context.ELEMENT_ARRAY_BUFFER;
				}

				return this.context.ARRAY_BUFFER;
			};

			Renderer.prototype.getGLDataType = function(indices) {
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

			Renderer.prototype.getGLBufferUsage = function(usage) {
				var glMode = this.context.STATIC_DRAW;
				switch (usage) {
					case 'StaticDraw':
						glMode = this.context.STATIC_DRAW;
						break;
					case 'DynamicDraw':
						glMode = this.context.DYNAMIC_DRAW;
						break;
					case 'StreamDraw':
						glMode = this.context.STREAM_DRAW;
						break;
				}
				return glMode;
			};

			Renderer.prototype.getGLIndexMode = function(indexMode) {
				var glMode = this.context.TRIANGLES;
				switch (indexMode) {
					case 'Triangles':
						glMode = this.context.TRIANGLES;
						break;
					case 'TriangleStrip':
						glMode = this.context.TRIANGLE_STRIP;
						break;
					case 'TriangleFan':
						glMode = this.context.TRIANGLE_FAN;
						break;
					case 'Lines':
						glMode = this.context.LINES;
						break;
					case 'LineStrip':
						glMode = this.context.LINE_STRIP;
						break;
					case 'LineLoop':
						glMode = this.context.LINE_LOOP;
						break;
					case 'Points':
						glMode = this.context.POINTS;
						break;
				}
				return glMode;
			}

			Renderer.prototype.setBoundBuffer = function(buffer, target) {
				console.log(target);
				console.log(this.rendererRecord);
				if (!this.rendererRecord.currentBuffer[target].valid
						|| this.rendererRecord.currentBuffer[target].buffer != buffer) {
					this.context.bindBuffer(this.getGLBufferTarget(target), buffer);
					this.rendererRecord.currentBuffer[target] = {
						buffer : buffer,
						valid : true
					};
				}
			};

			Renderer.prototype.bindVertexAttribute = function(attribIndex, tupleSize, type, normalized, stride, offset,
					record) {
				console.log('bindVertexAttribute: ' + arguments);
				this.context.vertexAttribPointer(attribIndex, tupleSize, this.getGLDataType(type), normalized, stride,
						offset);

				if (record.boundAttributes.indexOf(attribIndex) == -1) {
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
						return this.context.FLOAT;
					case 'Byte':
						return this.context.BYTE;
					case 'UnsignedByte':
						return this.context.UNSIGNED_BYTE;
					case 'Short':
						return this.context.SHORT;
					case 'UnsignedShort':
						return this.context.UNSIGNED_SHORT;
					case 'Int':
						return this.context.INT;
					case 'UnsignedInt':
						return this.context.UNSIGNED_INT;
				}
			};

			return Renderer;
		});
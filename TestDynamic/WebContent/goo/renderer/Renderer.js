"use strict";

define(
		[ 'goo/renderer/ShaderRecord', 'goo/renderer/RendererRecord', 'goo/renderer/Camera', 'goo/renderer/Util' ],
		function(ShaderRecord, RendererRecord, Camera, Util) {
			function Renderer(parameters) {
				parameters = parameters || {};

				var _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement('canvas');
				_canvas.width = 500;
				_canvas.height = 500;
				this.domElement = _canvas;
				this.domElement.id = 'goo';

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

				this.camera = new Camera(45, 1, 1, 1000);

				this.setClearColor(0.8, 0.8, 0.8, 1.0);
				this.context.clearDepth(1);
				this.context.clearStencil(0);

				this.context.enable(WebGLRenderingContext.DEPTH_TEST);
				this.context.depthFunc(WebGLRenderingContext.LEQUAL);

				// this.context.frontFace(this.context.CCW);
				// this.context.cullFace(this.context.BACK);
				// this.context.enable(this.context.CULL_FACE);
			}

			Renderer.prototype.checkResize = function() {
				if (this.domElement.offsetWidth !== this.domElement.width
						|| this.domElement.offsetHeight !== this.domElement.height) {
					this.domElement.width = this.domElement.offsetWidth;
					this.domElement.height = this.domElement.offsetHeight;
					this.camera.aspect = this.domElement.width / this.domElement.height;
					this.context.viewport(0, 0, this.domElement.width, this.domElement.height);
					this.camera.updateProjection();
				}
			};

			Renderer.prototype.setClearColor = function(red, green, blue, alpha) {
				this.clearColor = {
					red : 0.8,
					green : 0.8,
					blue : 0.8,
					alpha : 1.0
				};
				this.context.clearColor(red, green, blue, alpha);
			};

			Renderer.prototype.bindData = function(bufferData) {
				var glBuffer = null;
				if (bufferData !== null) {
					glBuffer = bufferData._dataRefs.get(this.context);
					if (glBuffer !== null) {
						// updateBuffer(bufferData, this.rendererRecord,
						// this.context);
						if (bufferData._dataNeedsRefresh) {
							this.setBoundBuffer(bufferData._dataRefs.get(this.context), bufferData.target);
							this.context.bufferSubData(this.getGLBufferTarget(bufferData.target), 0, bufferData.data);
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

				if (glBuffer !== null) {
					this.setBoundBuffer(glBuffer, bufferData.target);
				} else {
					this.setBoundBuffer(null, bufferData.target);
				}

				// if (Constants.extraGLErrorChecks) {
				// checkCardError();
				// }
			};

			Renderer.prototype.drawElementsVBO = function(indices, indexModes, indexLengths) {
				// console.log(arguments);

				var offset = 0;
				var indexModeCounter = 0;
				// if (Constants.extraGLErrorChecks) {
				// checkCardError();
				// Util.checkGLError(this.context);
				// }
				for ( var i = 0; i < indexLengths.length; i++) {
					var count = indexLengths[i];

					var glIndexMode = this.getGLIndexMode(indexModes[indexModeCounter]);

					var type = this.getGLArrayType(indices);
					var byteSize = this.getGLByteSize(indices);

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
				// Util.checkGLError(this.context);
				// }
			};

			Renderer.prototype.drawArraysVBO = function(indexModes, indexLengths) {
				console.log('drawArraysVBO: ' + arguments);
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
				if (!this.rendererRecord.currentBuffer[target].valid
						|| this.rendererRecord.currentBuffer[target].buffer !== buffer) {
					this.context.bindBuffer(this.getGLBufferTarget(target), buffer);
					this.rendererRecord.currentBuffer[target] = {
						buffer : buffer,
						valid : true
					};
				}
			};

			Renderer.prototype.bindVertexAttribute = function(attribIndex, tupleSize, type, normalized, stride, offset,
					record) {
				this.context.vertexAttribPointer(attribIndex, tupleSize, this.getGLDataType(type), normalized, stride,
						offset);

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

			Renderer.prototype.flush = function(buffer, target) {
				this.context.flush();
			};

			return Renderer;
		});
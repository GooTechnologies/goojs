"use strict";

define(
		[ 'goo/renderer/ShaderCall', 'goo/renderer/Util', 'goo/entities/GooRunner' ],
		function(ShaderCall, Util, GooRunner) {
			function Shader(name, vertexSource, fragmentSource) {
				this.name = name;
				this.vertexSource = vertexSource;
				this.fragmentSource = fragmentSource;

				this.shaderProgram = null;

				this.attributeMapping = {};
				this.attributeIndexMapping = {};

				this.uniformMapping = {};
				this.uniformCallMapping = {};
				this.uniformLocationMapping = {};

				this.patternStr = '\\b(attribute|uniform)\\s+(float|int|bool|vec2|vec3|vec4|mat3|mat4|sampler2D|sampler3D|samplerCube)\\s+(\\w+);(?:\\s*//\\s*!\\s*(\\w+))*';
				this.regExp = new RegExp(this.patternStr, 'g');
				this.textureCount = 0;

				this.defaultCallbacks = {};
				setupDefaultCallbacks(this.defaultCallbacks);
				this.currentCallbacks = {};
			}

			function setupDefaultCallbacks(defaultCallbacks) {
				defaultCallbacks['PROJECTION_MATRIX'] = function(uniformMapping, shaderInfo) {
					uniformMapping['PROJECTION_MATRIX'].uniformMatrix4fv(false,
							GooRunner.renderer.camera.projectionMatrix.elements);
				};
				defaultCallbacks['VIEW_MATRIX'] = function(uniformMapping, shaderInfo) {
					uniformMapping['VIEW_MATRIX'].uniformMatrix4fv(false,
							GooRunner.renderer.camera.matrixWorldInverse.elements);
				};
				defaultCallbacks['WORLD_MATRIX'] = function(uniformMapping, shaderInfo) {
					uniformMapping['WORLD_MATRIX'].uniformMatrix4fv(false, shaderInfo.transform.matrix.elements);
				};
				for ( var i = 0; i < 16; i++) {
					defaultCallbacks['TEXTURE' + i] = (function(i) {
						return function(uniformMapping, shaderInfo) {
							uniformMapping['TEXTURE' + i].uniform1i(i);
						};
					})(i);
				}
			}

			Shader.prototype.apply = function(shaderInfo, renderer) {
				var context = renderer.context;
				var record = renderer.shaderRecord;

				if (this.shaderProgram === null) {
					this.investigateShaders();
					this.compile(renderer);
				}

				// Set the ShaderProgram active
				if (record.usedProgram !== this.shaderProgram) {
					context.useProgram(this.shaderProgram);
					record.usedProgram = this.shaderProgram;
				}

				// Bind attributes
				var descriptors = shaderInfo.meshData._dataMap.descriptors;
				for ( var key in descriptors) {
					var descriptor = descriptors[key];
					var attribute = this.attributeIndexMapping[descriptor.attributeName];
					if (attribute !== undefined) {
						renderer.bindVertexAttribute(attribute, descriptor.count, descriptor.type,
								descriptor.normalized, descriptor.stride * Util.getByteSize(descriptor.type),
								descriptor.offset, record);
					}
				}

				for ( var i in this.currentCallbacks) {
					this.currentCallbacks[i](this.uniformCallMapping, shaderInfo);
				}

				// record.valid = true;
			};

			Shader.prototype.bindCallback = function(name, callback) {
				this.currentCallbacks[name] = callback;
			};

			Shader.prototype.investigateShaders = function() {
				this.textureCount = 0;
				this.investigateShader(this.vertexSource);
				this.investigateShader(this.fragmentSource);
			};

			Shader.prototype.investigateShader = function(source) {
				this.regExp.lastIndex = 0;
				var matcher = this.regExp.exec(source);

				while (matcher !== null) {
					var type = matcher[1];
					var format = matcher[2];
					var variableName = matcher[3];
					var bindingName = matcher[4];

					if (bindingName === undefined) {
						bindingName = variableName;
					}

					if ("attribute" === type) {
						this.attributeMapping[bindingName] = variableName;
					} else {
						if (format.indexOf("sampler") === 0) {
							this.textureCount++;
						}
						this.uniformMapping[bindingName] = variableName;
					}

					if (this.defaultCallbacks[bindingName] !== undefined) {
						this.currentCallbacks[bindingName] = this.defaultCallbacks[bindingName];
					}

					matcher = this.regExp.exec(source);
				}
			};

			Shader.prototype.compile = function(renderer) {
				var context = renderer.context;
				var record = renderer.shaderRecord;

				var vertexShader = this._getShader(context, WebGLRenderingContext.VERTEX_SHADER, this.vertexSource);
				var fragmentShader = this._getShader(context, WebGLRenderingContext.FRAGMENT_SHADER,
						this.fragmentSource);

				if (vertexShader === null || fragmentShader === null) {
					console.error("Shader error - no shaders");
				}

				this.shaderProgram = context.createProgram();
				var error = context.getError();
				if (this.shaderProgram === null || error !== WebGLRenderingContext.NO_ERROR) {
					console.error("Shader error: " + error + " [shader: " + this.name + "]");
				}

				context.attachShader(this.shaderProgram, vertexShader);
				context.attachShader(this.shaderProgram, fragmentShader);

				// Link the Shader Program
				context.linkProgram(this.shaderProgram);
				if (!context.getProgramParameter(this.shaderProgram, WebGLRenderingContext.LINK_STATUS)) {
					console.error("Could not initialise shaders: " + context.getProgramInfoLog(shaderProgram));
				}

				for ( var key in this.attributeMapping) {
					var attributeIndex = context.getAttribLocation(this.shaderProgram, this.attributeMapping[key]);
					this.attributeIndexMapping[key] = attributeIndex;
				}

				for ( var key in this.uniformMapping) {
					var uniform = context.getUniformLocation(this.shaderProgram, this.uniformMapping[key]);
					this.uniformLocationMapping[key] = uniform;

					var shaderCall = new ShaderCall(context);

					var uniformRecord = record.uniformRecords.get(this.shaderProgram);
					if (uniformRecord === null) {
						uniformRecord = new Hashtable();
						record.uniformRecords.put(this.shaderProgram, uniformRecord);
					}

					shaderCall.currentRecord = uniformRecord;
					shaderCall.location = uniform;
					this.uniformCallMapping[key] = shaderCall;
				}

				console.log("Shader [" + this.name + "] compiled");
			};

			Shader.prototype._getShader = function(context, type, source) {
				var shader = context.createShader(type);

				context.shaderSource(shader, source);
				context.compileShader(shader);

				// check if the Shader is successfully compiled
				if (!context.getShaderParameter(shader, WebGLRenderingContext.COMPILE_STATUS)) {
					console.error(context.getShaderInfoLog(shader));
					return null;
				}

				return shader;
			};

			return Shader;
		});
define(
	['goo/renderer/ShaderCall', 'goo/renderer/Util', 'goo/entities/GooRunner'],
	function(ShaderCall, Util, GooRunner) {
		"use strict";

		/**
		 * Creates a new shader object
		 * 
		 * @name Shader
		 * @class Defines vertex and fragment shader and bindings to shader callbacks
		 * @param {String} name Shader name (mostly for debug/tool use)
		 * @param {String} vertexSource Vertex shader source
		 * @param {String} fragmentSource Fragment shader source
		 */
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

			this.textureCount = 0;

			this.defaultCallbacks = {};
			setupDefaultCallbacks(this.defaultCallbacks);
			this.currentCallbacks = {};
		}

		var regExp = /\b(attribute|uniform)\s+(float|int|bool|vec2|vec3|vec4|mat3|mat4|sampler2D|sampler3D|samplerCube)\s+(\w+);(?:\s*\/\/\s*!\s*(\w+))*/g;

		function setupDefaultCallbacks(defaultCallbacks) {
			defaultCallbacks['PROJECTION_MATRIX'] = function(uniformMapping, shaderInfo) {
				var camera = GooRunner.renderer.camera;
				var uniform = uniformMapping['PROJECTION_MATRIX'];
				var matrix = camera.projectionMatrix;

				uniform.uniformMatrix4fv(false, matrix);
			};
			defaultCallbacks['VIEW_MATRIX'] = function(uniformMapping, shaderInfo) {
				var camera = GooRunner.renderer.camera;
				var uniform = uniformMapping['VIEW_MATRIX'];
				var matrix = camera.matrixWorldInverse;

				uniform.uniformMatrix4fv(false, matrix);
			};
			defaultCallbacks['WORLD_MATRIX'] = function(uniformMapping, shaderInfo) {
				var uniform = uniformMapping['WORLD_MATRIX'];
				var matrix = shaderInfo.transform.matrix;
				uniform.uniformMatrix4fv(false, matrix);
			};

			for ( var i = 0; i < 16; i++) {
				defaultCallbacks['TEXTURE' + i] = (function(i) {
					return function(uniformMapping, shaderInfo) {
						uniformMapping['TEXTURE' + i].uniform1i(i);
					};
				})(i);
			}

			// TODO
			var lightPos = new THREE.Vector3(-20, 20, 20);
			for ( var i = 0; i < 4; i++) {
				defaultCallbacks['LIGHT' + i] = (function(i) {
					return function(uniformMapping, shaderInfo) {
						var light = shaderInfo.lights[i];
						if (light !== undefined) {
							uniformMapping['LIGHT' + i].uniform3f(light.translation.x, light.translation.y,
								light.translation.z);
						} else {
							uniformMapping['LIGHT' + i].uniform3f(lightPos.x, lightPos.y, lightPos.z);
						}
					};
				})(i);
			}

			defaultCallbacks['CAMERA'] = function(uniformMapping, shaderInfo) {
				var cameraPosition = GooRunner.renderer.camera.position;
				uniformMapping['CAMERA'].uniform3f(cameraPosition.x, cameraPosition.y, cameraPosition.z);
			};

			var DEFAULT_AMBIENT = {
				r : 0.1,
				g : 0.1,
				b : 0.1,
				a : 1.0
			};
			var DEFAULT_EMISSIVE = {
				r : 0,
				g : 0,
				b : 0,
				a : 0
			};
			var DEFAULT_DIFFUSE = {
				r : 1,
				g : 1,
				b : 1,
				a : 1
			};
			var DEFAULT_SPECULAR = {
				r : 0.8,
				g : 0.8,
				b : 0.8,
				a : 1.0
			};
			defaultCallbacks['AMBIENT'] = function(uniformMapping, shaderInfo) {
				var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.ambient
					: DEFAULT_AMBIENT;
				uniformMapping['AMBIENT'].uniform4f(materialState.r, materialState.g, materialState.b, materialState.a);
			};
			defaultCallbacks['EMISSIVE'] = function(uniformMapping, shaderInfo) {
				var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.emissive
					: DEFAULT_EMISSIVE;
				uniformMapping['EMISSIVE']
					.uniform4f(materialState.r, materialState.g, materialState.b, materialState.a);
			};
			defaultCallbacks['DIFFUSE'] = function(uniformMapping, shaderInfo) {
				var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.diffuse
					: DEFAULT_DIFFUSE;
				uniformMapping['DIFFUSE'].uniform4f(materialState.r, materialState.g, materialState.b, materialState.a);
			};
			defaultCallbacks['SPECULAR'] = function(uniformMapping, shaderInfo) {
				var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.specular
					: DEFAULT_SPECULAR;
				uniformMapping['SPECULAR']
					.uniform4f(materialState.r, materialState.g, materialState.b, materialState.a);
			};
			defaultCallbacks['SPECULAR_POWER'] = function(uniformMapping, shaderInfo) {
				var shininess = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.shininess
					: 8.0;
				uniformMapping['SPECULAR_POWER'].uniform1f(shininess);
			};

		}

		Shader.prototype.apply = function(shaderInfo, renderer) {
			var context = renderer.context;
			var record = renderer.rendererRecord;

			if (this.shaderProgram === null) {
				this._investigateShaders();
				this.compile(renderer);
			}

			// Set the ShaderProgram active
			if (record.usedProgram !== this.shaderProgram) {
				context.useProgram(this.shaderProgram);
				record.usedProgram = this.shaderProgram;
			}

			// Bind attributes
			var attributeMap = shaderInfo.meshData.attributeMap;
			for ( var key in attributeMap) {
				var attribute = attributeMap[key];
				var attributeIndex = this.attributeIndexMapping[key];
				if (attributeIndex !== undefined) {
					renderer.bindVertexAttribute(attributeIndex, attribute.count, attribute.type,
						attribute.normalized || true, 0, attribute.offset, record);
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

		Shader.prototype._investigateShaders = function() {
			this.textureCount = 0;
			this._investigateShader(this.vertexSource);
			this._investigateShader(this.fragmentSource);
		};

		Shader.prototype._investigateShader = function(source) {
			regExp.lastIndex = 0;
			var matcher = regExp.exec(source);

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

				matcher = regExp.exec(source);
			}
		};

		Shader.prototype.compile = function(renderer) {
			var context = renderer.context;

			var vertexShader = this._getShader(context, WebGLRenderingContext.VERTEX_SHADER, this.vertexSource);
			var fragmentShader = this._getShader(context, WebGLRenderingContext.FRAGMENT_SHADER, this.fragmentSource);

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

				if (attributeIndex === -1) {
					console.warn('Attribute [' + this.attributeMapping[key] + '/' + key
						+ '] variable not found in shader. Probably unused and optimized away.');
				}
			}

			for ( var key in this.uniformMapping) {
				var uniform = context.getUniformLocation(this.shaderProgram, this.uniformMapping[key]);

				if (uniform !== null && this.defaultCallbacks[key] !== undefined) {
					this.currentCallbacks[key] = this.defaultCallbacks[key];
				} else {
					console.warn('Uniform [' + this.uniformMapping[key]
						+ '] variable not found in shader. Probably unused and optimized away. ' + key);
					continue;
				}

				this.uniformLocationMapping[key] = uniform;

				this.uniformCallMapping[key] = new ShaderCall(context, uniform);
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

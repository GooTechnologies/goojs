define(['goo/renderer/ShaderCall', 'goo/renderer/Util', 'goo/math/Matrix4x4', 'goo/math/Vector3', 'goo/entities/World'],
	function (ShaderCall, Util, Matrix4x4, Vector3, World) {
	"use strict";

	/**
	 * @name Shader
	 * @class Defines vertex and fragment shader and uniforms to shader callbacks
	 * @param {String} name Shader name (mostly for debug/tool use)
	 * @param {ShaderDefinition} shaderDefinition Shader data
	 *
	 * <pre>
	 * {
	 *    vshader : [required] vertex shader source
	 *    fshader : [required] fragment shader source
	 *    defines : shader definitions (becomes #define)
	 *    attributes : attribute bindings
	 *       attribute bindings need to map to an attribute in the meshdata being rendered
	 *    uniforms : uniform bindings
	 *       uniform bindings can be a value (like 2.5 or [1, 2]) or a function
	 * }
	 * </pre>
	 */
	function Shader(name, shaderDefinition) {
		if (!shaderDefinition.vshader || !shaderDefinition.fshader) {
			throw new Error('Missing shader sources for shader: ' + name);
		}

		this.name = name;
		this.vertexSource = shaderDefinition.vshader;
		this.fragmentSource = shaderDefinition.fshader;

		this.shaderProgram = null;

		// Attributes detected in the shader
		this.attributeMapping = {};
		this.attributeIndexMapping = {};

		// Uniforms detected in the shader
		this.uniformMapping = {};
		this.uniformCallMapping = {};

		this.textureSlots = [];

		this.defaultCallbacks = {};
		setupDefaultCallbacks(this.defaultCallbacks);
		this.currentCallbacks = {};

		this.defines = shaderDefinition.defines;
		this.attributes = shaderDefinition.attributes;
		this.uniforms = shaderDefinition.uniforms;

		this._id = Shader.id++;
	}

	Shader.id = 0;

	var regExp = /\b(attribute|uniform)\s+(float|int|bool|vec2|vec3|vec4|mat3|mat4|sampler2D|sampler3D|samplerCube)\s+(\w+)(\s*\[\s*\w+\s*\])*;/g;

	Shader.prototype.apply = function (shaderInfo, renderer) {
		var context = renderer.context;
		var record = renderer.rendererRecord;

		if (this.shaderProgram === null) {
			this._investigateShaders();
			this.addDefines(this.defines);
			this.compile(renderer);
		}

		// Set the ShaderProgram active
		if (record.usedProgram !== this.shaderProgram) {
			context.useProgram(this.shaderProgram);
			record.usedProgram = this.shaderProgram;
		}

		// Bind attributes
		if (this.attributes) {
			var attributeMap = shaderInfo.meshData.attributeMap;
			for (var key in this.attributes) {
				var attribute = attributeMap[this.attributes[key]];
				if (!attribute) {
					// TODO: log or what?
					continue;
				}

				var attributeIndex = this.attributeIndexMapping[key];
				if (attributeIndex === undefined) {
					// console.warn('Attribute binding [' + name + '] does not exist in the shader.');
					continue;
				}

				renderer.bindVertexAttribute(attributeIndex, attribute.count, attribute.type, attribute.normalized, 0, attribute.offset, record);
			}
		}

		// Bind uniforms
		if (this.uniforms) {
			for (var name in this.uniforms) {
				var mapping = this.uniformCallMapping[name];
				if (!mapping) {
					// console.warn('Uniform binding [' + name + '] does not exist in the shader.');
					continue;
				}
				var defValue = this.uniforms[name];

				try {
					if (typeof defValue === 'string') {
						var callback = this.currentCallbacks[name];
						if (callback) {
							callback(mapping, shaderInfo);
						}
					} else {
						var value = typeof defValue === 'function' ? defValue(shaderInfo) : defValue;
						mapping.call(value);
					}
				} catch (err) {
					// IGNORE
					// console.error(err);
				}
			}
		}
	};

	Shader.prototype.rebuild = function () {
		this.shaderProgram = null;
		this.attributeMapping = {};
		this.attributeIndexMapping = {};
		this.uniformMapping = {};
		this.uniformCallMapping = {};
		this.currentCallbacks = {};
	};

	Shader.prototype._investigateShaders = function () {
		this.textureSlots = [];
		this._investigateShader(this.vertexSource);
		this._investigateShader(this.fragmentSource);
	};

	Shader.prototype._investigateShader = function (source) {
		regExp.lastIndex = 0;
		var matcher = regExp.exec(source);

		while (matcher !== null) {
			var definition = {
				type : matcher[1],
				format : matcher[2],
				variableName : matcher[3],
				arrayName : matcher[4]
			};

			if (definition.arrayName) {
				if (definition.format === 'float') {
					definition.format = 'floatarray';
				} else if (definition.format === 'int') {
					definition.format = 'intarray';
				}
			}

			if ("attribute" === definition.type) {
				this.attributeMapping[definition.variableName] = definition;
			} else {
				if (definition.format.indexOf("sampler") === 0) {
					var textureSlot = {
						format : definition.format,
						name : definition.variableName
					};
					this.textureSlots.push(textureSlot);
				}
				this.uniformMapping[definition.variableName] = definition;
			}

			matcher = regExp.exec(source);
		}
	};

	Shader.prototype.compile = function (renderer) {
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
			console.error("Could not initialise shaders: " + context.getProgramInfoLog(this.shaderProgram));
		}

		for (var key in this.attributeMapping) {
			var attributeIndex = context.getAttribLocation(this.shaderProgram, key);
			if (attributeIndex === -1) {
				console.warn('Attribute [' + this.attributeMapping[key] + '/' + key
					+ '] variable not found in shader. Probably unused and optimized away.');
				continue;
			}

			this.attributeIndexMapping[key] = attributeIndex;
		}

		for (var key in this.uniformMapping) {
			var uniform = context.getUniformLocation(this.shaderProgram, key);

			if (uniform === null) {
				console.warn('Uniform [' + key + '] variable not found in shader. Probably unused and optimized away. ' + key);
				continue;
			}

			this.uniformCallMapping[key] = new ShaderCall(context, uniform, this.uniformMapping[key].format);
		}

		if (this.attributes) {
			for (var name in this.attributes) {
				var mapping = this.attributeIndexMapping[name];
				if (mapping === undefined) {
					console.warn('No attribute found for binding: ' + name + ' [' + this.name + '][' + this._id + ']');
					// delete this.attributes[name];
				}
			}
			for (var name in this.attributeIndexMapping) {
				var mapping = this.attributes[name];
				if (mapping === undefined) {
					console.warn('No binding found for attribute: ' + name + ' [' + this.name + '][' + this._id + ']');
				}
			}
		}

		if (this.uniforms) {
			// Fix links ($link)
			if (this.uniforms.$link) {
				var links = this.uniforms.$link instanceof Array ? this.uniforms.$link : [this.uniforms.$link];
				for (var i = 0; i < links.length; i++) {
					var link = links[i];
					for (var key in link) {
						this.uniforms[key] = link[key];
					}
				}
				delete this.uniforms.$link;
			}

			for (var name in this.uniforms) {
				var mapping = this.uniformCallMapping[name];
				if (mapping === undefined) {
					console.warn('No uniform found for binding: ' + name + ' [' + this.name + '][' + this._id + ']');
					// delete this.uniforms[name];
				}

				var value = this.uniforms[name];
				if (this.defaultCallbacks[value]) {
					this.currentCallbacks[name] = this.defaultCallbacks[value];
				}
			}
			for (var name in this.uniformCallMapping) {
				var mapping = this.uniforms[name];
				if (mapping === undefined) {
					console.warn('No binding found for uniform: ' + name + ' [' + this.name + '][' + this._id + ']');
				}
			}
		}

		console.log('Shader [' + this.name + '][' + this._id + '] compiled');
	};

	Shader.prototype._getShader = function (context, type, source) {
		var shader = context.createShader(type);

		context.shaderSource(shader, source);
		context.compileShader(shader);

		// check if the Shader is successfully compiled
		if (!context.getShaderParameter(shader, WebGLRenderingContext.COMPILE_STATUS)) {
			console.error('Shader [' + this.name + '][' + this._id + '] ' + context.getShaderInfoLog(shader));
			return null;
		}

		return shader;
	};

	Shader.prototype.addDefines = function (defines) {
		if (!defines) {
			return;
		}

		var defineStr = this.generateDefines(defines);

		this.vertexSource = defineStr + '\n' + this.vertexSource;
		this.fragmentSource = defineStr + '\n' + this.fragmentSource;
	};

	Shader.prototype.generateDefines = function (defines) {
		var chunks = [];
		for (var d in defines) {
			var value = defines[d];
			if (value === false) {
				continue;
			}

			var chunk = "#define " + d + " " + value;
			chunks.push(chunk);
		}

		return chunks.join("\n");
	};

	function setupDefaultCallbacks(defaultCallbacks) {
		var IDENTITY_MATRIX = new Matrix4x4();

		defaultCallbacks[Shader.PROJECTION_MATRIX] = function (uniformCall, shaderInfo) {
			var camera = shaderInfo.camera;
			var matrix = camera.getProjectionMatrix();
			uniformCall.uniformMatrix4fv(matrix);
		};
		defaultCallbacks[Shader.VIEW_MATRIX] = function (uniformCall, shaderInfo) {
			var camera = shaderInfo.camera;
			var matrix = camera.getViewMatrix();
			uniformCall.uniformMatrix4fv(matrix);
		};
		defaultCallbacks[Shader.WORLD_MATRIX] = function (uniformCall, shaderInfo) {
			var matrix = shaderInfo.transform !== undefined ? shaderInfo.transform.matrix : IDENTITY_MATRIX;
			uniformCall.uniformMatrix4fv(matrix);
		};

		for (var i = 0; i < 16; i++) {
			defaultCallbacks[Shader['TEXTURE' + i]] = function (i) {
				return function (uniformCall, shaderInfo) {
					uniformCall.uniform1i(i);
				};
			}(i);
		}

		// TODO
		var lightPos = new Vector3(-20, 20, 20);
		for (var i = 0; i < 4; i++) {
			defaultCallbacks[Shader['LIGHT' + i]] = function (i) {
				return function (uniformCall, shaderInfo) {
					var light = shaderInfo.lights[i];
					if (light !== undefined) {
						uniformCall.uniform3f(light.translation.x, light.translation.y, light.translation.z);
					} else {
						uniformCall.uniform3f(lightPos.x, lightPos.y, lightPos.z);
					}
				};
			}(i);
		}

		defaultCallbacks[Shader.CAMERA] = function (uniformCall, shaderInfo) {
			var cameraPosition = shaderInfo.camera.translation;
			uniformCall.uniform3f(cameraPosition.x, cameraPosition.y, cameraPosition.z);
		};
		defaultCallbacks[Shader.NEAR_PLANE] = function (uniformCall, shaderInfo) {
			uniformCall.uniform1f(shaderInfo.camera._frustumNear);
		};
		defaultCallbacks[Shader.FAR_PLANE] = function (uniformCall, shaderInfo) {
			uniformCall.uniform1f(shaderInfo.camera._frustumFar);
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
		defaultCallbacks[Shader.AMBIENT] = function (uniformCall, shaderInfo) {
			var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.ambient : DEFAULT_AMBIENT;
			uniformCall.uniform4f(materialState.r, materialState.g, materialState.b, materialState.a);
		};
		defaultCallbacks[Shader.EMISSIVE] = function (uniformCall, shaderInfo) {
			var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.emissive : DEFAULT_EMISSIVE;
			uniformCall.uniform4f(materialState.r, materialState.g, materialState.b, materialState.a);
		};
		defaultCallbacks[Shader.DIFFUSE] = function (uniformCall, shaderInfo) {
			var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.diffuse : DEFAULT_DIFFUSE;
			uniformCall.uniform4f(materialState.r, materialState.g, materialState.b, materialState.a);
		};
		defaultCallbacks[Shader.SPECULAR] = function (uniformCall, shaderInfo) {
			var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.specular : DEFAULT_SPECULAR;
			uniformCall.uniform4f(materialState.r, materialState.g, materialState.b, materialState.a);
		};
		defaultCallbacks[Shader.SPECULAR_POWER] = function (uniformCall, shaderInfo) {
			var shininess = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.shininess : 8.0;
			uniformCall.uniform1f(shininess);
		};

		defaultCallbacks[Shader.TIME] = function (uniformCall, shaderInfo) {
			uniformCall.uniform1f(World.time);
		};
	}

	Shader.prototype.toString = function () {
		return this.name;
	};

	Shader.PROJECTION_MATRIX = 'PROJECTION_MATRIX';
	Shader.VIEW_MATRIX = 'VIEW_MATRIX';
	Shader.WORLD_MATRIX = 'WORLD_MATRIX';
	for (var i = 0; i < 16; i++) {
		Shader['TEXTURE' + i] = 'TEXTURE' + i;
	}
	for (var i = 0; i < 4; i++) {
		Shader['LIGHT' + i] = 'LIGHT' + i;
	}
	Shader.CAMERA = 'CAMERA';
	Shader.AMBIENT = 'AMBIENT';
	Shader.EMISSIVE = 'EMISSIVE';
	Shader.DIFFUSE = 'DIFFUSE';
	Shader.SPECULAR = 'SPECULAR';
	Shader.SPECULAR_POWER = 'SPECULAR_POWER';
	Shader.NEAR_PLANE = 'NEAR_PLANE';
	Shader.FAR_PLANE = 'FAR_PLANE';
	Shader.TIME = 'TIME';

	return Shader;
});

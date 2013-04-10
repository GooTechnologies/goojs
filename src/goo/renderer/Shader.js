define([
	'goo/renderer/ShaderCall',
	'goo/math/Matrix4x4',
	'goo/math/Vector3',
	'goo/entities/World',
	'goo/renderer/RenderQueue'
],
/** @lends */
function (
	ShaderCall,
	Matrix4x4,
	Vector3,
	World,
	RenderQueue
) {
	"use strict";

	var WebGLRenderingContext = window.WebGLRenderingContext;

	/**
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

		/**
		 * Attributes detected in the shader source code.
		 * Maps attribute variable's name to {format}.
		 * @type {Object.<string, {format:string}>}
		 */
		this.attributeMapping = {};

		/**
		 * Maps attribute variable's name to attribute location (from getAttribLocation).
		 * @type {Object.<{string, number}>}
		 */
		this.attributeIndexMapping = {};

		/**
		 * Uniforms detected in the shader source code.
		 * Maps variable name to {format}.
		 * @type {Object.<string, {format:string}>}
		 */
		this.uniformMapping = {};

		/**
		 * Maps uniform variable name to ShaderCall object.
		 * @type {Object.<{string, ShaderCall}>}
		 */
		this.uniformCallMapping = {};

		/**
		 * Texture slots detected in the shader source code.
		 * @type {Array.<format:string, name:string>}
		 */
		this.textureSlots = [];

		this.defaultCallbacks = {};
		setupDefaultCallbacks(this.defaultCallbacks);
		this.currentCallbacks = {};

		this.defines = shaderDefinition.defines;
		this.attributes = shaderDefinition.attributes;
		this.uniforms = shaderDefinition.uniforms;

		this.renderQueue = RenderQueue.OPAQUE;

		this._id = Shader.id++;

		this.errorOnce = false;
	}

	Shader.id = 0;

	/*
	 * Matches an attribute or uniform variable declaration.
	 *
	 * Match groups:
	 *
	 *   1: type (attribute|uniform)
	 *   2: format (float|int|bool|vec2|vec3|vec4|mat3|mat4|sampler2D|sampler3D|samplerCube)
	 *   3: variable name
	 *   4: if exists, the variable is an array
	 */
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
		var switchedProgram = false;
		if (record.usedProgram !== this.shaderProgram) {
			context.useProgram(this.shaderProgram);
			record.usedProgram = this.shaderProgram;
			switchedProgram = true;
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

				if (switchedProgram) {
					renderer.context.enableVertexAttribArray(attributeIndex);
				}
				renderer.bindVertexAttribute(attributeIndex, attribute);
			}
		}

		// Bind uniforms
		if (this.uniforms) {
			var materialUniforms = shaderInfo.material.uniforms;
			try {
				for (var name in this.uniforms) {
					var mapping = this.uniformCallMapping[name];
					if (!mapping) {
						// console.warn('Uniform binding [' + name + '] does not exist in the shader.');
						continue;
					}
					var defValue = materialUniforms[name] || this.uniforms[name];

					if (typeof defValue === 'string') {
						var callback = this.currentCallbacks[name];
						if (callback) {
							callback(mapping, shaderInfo);
						}
					} else {
						var value = typeof defValue === 'function' ? defValue(shaderInfo) : defValue;
						mapping.call(value);
					}
				}
				this.errorOnce = false;
			} catch (err) {
				if (this.errorOnce === false) {
					console.error(err.stack);
					this.errorOnce = true;
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
		Shader.investigateShader(this.vertexSource, this);
		Shader.investigateShader(this.fragmentSource, this);
	};

	/**
	 * Extract shader variable definitions from shader source code.
	 * @static
	 * @param {string} source The source code.
	 * @param {{attributeMapping:Object, uniformMapping:Object, textureSlots:Array}} target
	 */
	Shader.investigateShader = function (source, target) {
		regExp.lastIndex = 0;
		var matcher = regExp.exec(source);

		while (matcher !== null) {
			var definition = {
				// data type: float, int, ...
				format: matcher[2]
			};
			var type = matcher[1];  // "attribute" or "uniform"
			var variableName = matcher[3];
			var arrayDeclaration = matcher[4];
			if (arrayDeclaration) {
				if (definition.format === 'float') {
					definition.format = 'floatarray';
				} else if (definition.format === 'int') {
					definition.format = 'intarray';
				}
			}

			if ("attribute" === type) {
				target.attributeMapping[variableName] = definition;
			} else {
				if (definition.format.indexOf("sampler") === 0) {
					var textureSlot = {
						format: definition.format,
						name: variableName
					};
					target.textureSlots.push(textureSlot);
				}
				target.uniformMapping[variableName] = definition;
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

			var chunk = '#define ' + d + ' ' + value;
			chunks.push(chunk);
		}

		return chunks.join('\n');
	};

	function setupDefaultCallbacks(defaultCallbacks) {
		var IDENTITY_MATRIX = new Matrix4x4();

		defaultCallbacks[Shader.PROJECTION_MATRIX] = function (uniformCall, shaderInfo) {
			var matrix = shaderInfo.camera.getProjectionMatrix();
			uniformCall.uniformMatrix4fv(matrix);
		};
		defaultCallbacks[Shader.VIEW_MATRIX] = function (uniformCall, shaderInfo) {
			var matrix = shaderInfo.camera.getViewMatrix();
			uniformCall.uniformMatrix4fv(matrix);
		};
		defaultCallbacks[Shader.WORLD_MATRIX] = function (uniformCall, shaderInfo) {
			var matrix = shaderInfo.transform !== undefined ? shaderInfo.transform.matrix : IDENTITY_MATRIX;
			uniformCall.uniformMatrix4fv(matrix);
		};

		defaultCallbacks[Shader.VIEW_INVERSE_MATRIX] = function (uniformCall, shaderInfo) {
			var matrix = shaderInfo.camera.getViewInverseMatrix();
			uniformCall.uniformMatrix4fv(matrix);
		};
		defaultCallbacks[Shader.VIEW_PROJECTION_MATRIX] = function (uniformCall, shaderInfo) {
			var matrix = shaderInfo.camera.getViewProjectionMatrix();
			uniformCall.uniformMatrix4fv(matrix);
		};
		defaultCallbacks[Shader.VIEW_PROJECTION_INVERSE_MATRIX] = function (uniformCall, shaderInfo) {
			var matrix = shaderInfo.camera.getViewProjectionInverseMatrix();
			uniformCall.uniformMatrix4fv(matrix);
		};

		for (var i = 0; i < 16; i++) {
			/*jshint loopfunc: true */
			defaultCallbacks[Shader['TEXTURE' + i]] = (function (i) {
				return function (uniformCall) {
					uniformCall.uniform1i(i);
				};
			})(i);
		}

		for (var i = 0; i < 4; i++) {
			/*jshint loopfunc: true */
			defaultCallbacks[Shader['LIGHT' + i]] = (function (i) {
				return function (uniformCall, shaderInfo) {
					var light = shaderInfo.lights[i];
					if (light !== undefined) {
						uniformCall.uniform3f(light.translation.x, light.translation.y, light.translation.z);
					} else {
						uniformCall.uniform3f(-20, 20, 20);
					}
				};
			})(i);
		}

		defaultCallbacks[Shader.CAMERA] = function (uniformCall, shaderInfo) {
			var cameraPosition = shaderInfo.camera.translation;
			uniformCall.uniform3f(cameraPosition.x, cameraPosition.y, cameraPosition.z);
		};
		defaultCallbacks[Shader.NEAR_PLANE] = function (uniformCall, shaderInfo) {
			uniformCall.uniform1f(shaderInfo.camera.near);
		};
		defaultCallbacks[Shader.FAR_PLANE] = function (uniformCall, shaderInfo) {
			uniformCall.uniform1f(shaderInfo.camera.far);
		};
		defaultCallbacks[Shader.MAIN_NEAR_PLANE] = function (uniformCall, shaderInfo) {
			uniformCall.uniform1f(shaderInfo.mainCamera.near);
		};
		defaultCallbacks[Shader.MAIN_FAR_PLANE] = function (uniformCall, shaderInfo) {
			uniformCall.uniform1f(shaderInfo.mainCamera.far);
		};

		var DEFAULT_AMBIENT = [0.1, 0.1, 0.1, 1.0];
		var DEFAULT_EMISSIVE = [0, 0, 0, 0];
		var DEFAULT_DIFFUSE = [1, 1, 1, 1];
		var DEFAULT_SPECULAR = [0.8, 0.8, 0.8, 1.0];
		defaultCallbacks[Shader.AMBIENT] = function (uniformCall, shaderInfo) {
			var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.ambient : DEFAULT_AMBIENT;
			uniformCall.uniform4fv(materialState);
		};
		defaultCallbacks[Shader.EMISSIVE] = function (uniformCall, shaderInfo) {
			var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.emissive : DEFAULT_EMISSIVE;
			uniformCall.uniform4fv(materialState);
		};
		defaultCallbacks[Shader.DIFFUSE] = function (uniformCall, shaderInfo) {
			var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.diffuse : DEFAULT_DIFFUSE;
			uniformCall.uniform4fv(materialState);
		};
		defaultCallbacks[Shader.SPECULAR] = function (uniformCall, shaderInfo) {
			var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.specular : DEFAULT_SPECULAR;
			uniformCall.uniform4fv(materialState);
		};
		defaultCallbacks[Shader.SPECULAR_POWER] = function (uniformCall, shaderInfo) {
			var shininess = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.shininess : 8.0;
			shininess = Math.max(shininess, 1.0);
			uniformCall.uniform1f(shininess);
		};

		defaultCallbacks[Shader.TIME] = function (uniformCall) {
			uniformCall.uniform1f(World.time);
		};

		defaultCallbacks[Shader.LIGHT_PROJECTION_MATRIX] = function (uniformCall, shaderInfo) {
			var camera = shaderInfo.lightCamera;
			var matrix = camera.getProjectionMatrix();
			uniformCall.uniformMatrix4fv(matrix);
		};
		defaultCallbacks[Shader.LIGHT_VIEW_MATRIX] = function (uniformCall, shaderInfo) {
			var camera = shaderInfo.lightCamera;
			var matrix = camera.getViewMatrix();
			uniformCall.uniformMatrix4fv(matrix);
		};
		defaultCallbacks[Shader.LIGHT_NEAR_PLANE] = function (uniformCall, shaderInfo) {
			uniformCall.uniform1f(shaderInfo.lightCamera.near);
		};
		defaultCallbacks[Shader.LIGHT_FAR_PLANE] = function (uniformCall, shaderInfo) {
			uniformCall.uniform1f(shaderInfo.lightCamera.far);
		};
		defaultCallbacks[Shader.RESOLUTION] = function (uniformCall, shaderInfo) {
			uniformCall.uniform2f(shaderInfo.renderer.viewportWidth, shaderInfo.renderer.viewportHeight);
		};
	}

	Shader.prototype.getShaderDefinition = function () {
		return {
			vshader: this.vertexSource,
			fshader: this.fragmentSource,
			defines: this.defines,
			attributes: this.attributes,
			uniforms: this.uniforms
		};
	};

	Shader.prototype.toString = function () {
		return this.name;
	};

	Shader.PROJECTION_MATRIX = 'PROJECTION_MATRIX';
	Shader.VIEW_MATRIX = 'VIEW_MATRIX';
	Shader.VIEW_INVERSE_MATRIX = 'VIEW_INVERSE_MATRIX';
	Shader.VIEW_PROJECTION_MATRIX = 'VIEW_PROJECTION_MATRIX';
	Shader.VIEW_PROJECTION_INVERSE_MATRIX = 'VIEW_PROJECTION_INVERSE_MATRIX';
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
	Shader.MAIN_NEAR_PLANE = 'NEAR_PLANE';
	Shader.MAIN_FAR_PLANE = 'FAR_PLANE';
	Shader.TIME = 'TIME';
	Shader.RESOLUTION = 'RESOLUTION';

	Shader.LIGHT_PROJECTION_MATRIX = 'LIGHT_PROJECTION_MATRIX';
	Shader.LIGHT_VIEW_MATRIX = 'LIGHT_VIEW_MATRIX';
	Shader.LIGHT_NEAR_PLANE = 'LIGHT_NEAR_PLANE';
	Shader.LIGHT_FAR_PLANE = 'LIGHT_FAR_PLANE';

	return Shader;
});

var ShaderCall = require('../renderer/ShaderCall');
var Matrix3 = require('../math/Matrix3');
var Matrix4 = require('../math/Matrix4');
var World = require('../entities/World');
var RenderQueue = require('../renderer/RenderQueue');
var ObjectUtils = require('../util/ObjectUtils');
var SystemBus = require('../entities/SystemBus');



	/* global WebGLRenderingContext */

	/**
	 * Defines vertex and fragment shader and uniforms to shader callbacks
	 * @param {string} name Shader name (mostly for debug/tool use)
	 * @param {ShaderDefinition} shaderDefinition Shader data
	 *
	 * <code>
	 * {
	 *    vshader: [required] vertex shader source
	 *    fshader: [required] fragment shader source
	 *    defines : shader definitions (becomes #define)
	 *    attributes : attribute bindings
	 *       attribute bindings need to map to an attribute in the meshdata being rendered
	 *    uniforms : uniform bindings
	 *       uniform bindings can be a value (like 2.5 or [1, 2]) or a function
	 * }
	 * </code>
	 */
	function Shader(name, shaderDefinition) {
		if (!shaderDefinition.vshader || !shaderDefinition.fshader) {
			throw new Error('Missing shader sources for shader: ' + name);
		}

		this.originalShaderDefinition = shaderDefinition;
		this.shaderDefinition = shaderDefinition;

		this.origVertexSource = shaderDefinition.vshader;
		this.origFragmentSource = shaderDefinition.fshader;

		/** The shader name
		 * @type {string}
		 */
		this.name = name;

		this.shaderProgram = null;
		this.vertexShader = null;
		this.fragmentShader = null;

		/**
		 * The renderer where the program and shaders were allocated.
		 * @type {WebGLRenderingContext}
		 */
		this.renderer = null;

		/**
		 * Attributes detected in the shader source code.
		 * Maps attribute variable's name to <code>{format: string}</code>
		 * @type {Object<string, object>}}
		 */
		this.attributeMapping = {};

		/**
		 * Maps attribute variable's name to attribute location (from getAttribLocation).
		 * @type {Object<string, number>}
		 */
		this.attributeIndexMapping = {};

		/**
		 * Uniforms detected in the shader source code.
		 * Maps variable name to <code>{format: string}</code>.
		 * @type {Object<string, object>}
		 */
		this.uniformMapping = {};

		/**
		 * Maps uniform variable name to ShaderCall object.
		 * @type {Object<string, ShaderCall>}
		 */
		this.uniformCallMapping = {};

		/**
		 * Texture slots detected in the shader source code.
		 * Will be an array of <code>{format: string, name: string}</code>
		 * @type {Array}
		 */
		this.textureSlots = [];
		this.textureSlotsNaming = {};
		this.textureIndex = 0;

		this.currentCallbacks = {};

		this.overridePrecision = shaderDefinition.precision || null;
		this.processors = shaderDefinition.processors;
		this.builder = shaderDefinition.builder;
		this.defines = shaderDefinition.defines || {};
		this.attributes = shaderDefinition.attributes || {};
		this.uniforms = shaderDefinition.uniforms || {};
		this.defineKey = shaderDefinition.defineKey || '';
		this.defineKeyDirty = true;
		this.frameStart = true;
		this.attributeKeys = null;
		this.matchedUniforms = [];

		/** Determines the order in which an object is drawn. There are four pre-defined render queues:
		 *		<ul>
		 *			<li>RenderQueue.BACKGROUND = Rendered before any other objects. Commonly used for skyboxes and the likes (0-999)
		 *			<li>RenderQueue.OPAQUE = Used for most objects, typically opaque geometry. Rendered front to back (1000-1999)
		 *			<li>RenderQueue.TRANSPARENT = For all alpha-blended objects. Rendered back to front (2000-2999)
		 *			<li>RenderQueue.OVERLAY = For overlay effects like lens-flares etc (3000+)
		 *		</ul>
		 * By default materials use the render queue of the shader. See {@link RenderQueue} for more info
		 * @type {number}
		 */
		this.renderQueue = RenderQueue.OPAQUE;

		// this._id = Shader.id++;
		if (Shader.cache.has(shaderDefinition)) {
			this._id = Shader.cache.get(shaderDefinition);
		} else {
			this._id = Shader.cache.size;
			Shader.cache.set(shaderDefinition, this._id);
		}
		// console.log('creating shader', this._id, this.name);

		this.errorOnce = false;

		this.vertexSource = typeof this.origVertexSource === 'function' ? this.origVertexSource() : this.origVertexSource;
		this.fragmentSource = typeof this.origFragmentSource === 'function' ? this.origFragmentSource() : this.origFragmentSource;

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	// Shader.id = 0;
	Shader.cache = new Map();

	Shader.prototype.clone = function () {
		return new Shader(this.name, ObjectUtils.deepClone({
			precision: this.precision,
			processors: this.processors,
			builder: this.builder,
			defines: this.defines,
			attributes: this.attributes,
			uniforms: this.uniforms,
			vshader: this.origVertexSource,
			fshader: this.origFragmentSource,
			defineKey: this.defineKey
		}));
	};

	Shader.prototype.cloneOriginal = function () {
		return new Shader(this.name, this.originalShaderDefinition);
	};

	/**
	 * Compiles a shader and does not apply it
	 * @private
	 * @param renderer
	 */
	Shader.prototype.precompile = function (renderer) {
		if (this.shaderProgram === null) {
			this._investigateShaders();
			this.addDefines(this.defines);
			this.addPrecision(this.overridePrecision || renderer.shaderPrecision);
			this.compile(renderer);
		}
	};

	/*
	 * Matches an attribute or uniform variable declaration.
	 *
	 * Match groups:
	 *
	 *   1: type (attribute|uniform)
	 *   2: format (float|int|bool|vec2|vec3|vec4|mat2|mat3|mat4|sampler2D|sampler3D|samplerCube)
	 *   3: variable name
	 *   4: if exists, the variable is an array
	 */
	var regExp = /\b(attribute|uniform)\s+(float|int|bool|vec2|vec3|vec4|mat2|mat3|mat4|sampler2D|sampler3D|samplerCube)\s+(\w+)(\s*\[\s*\w+\s*\])*;/g;

	Shader.prototype.compileProgram = function (renderer) {
		if (this.shaderProgram === null) {
			this._investigateShaders();
			this.addDefines(this.defines);
			this.addPrecision(this.overridePrecision || renderer.shaderPrecision);
			this.compile(renderer);
		}
	};

	Shader.prototype.activateProgram = function (record, context) {
		if (record.usedProgram !== this.shaderProgram) {
			context.useProgram(this.shaderProgram);
			record.usedProgram = this.shaderProgram;
			return true;
		}
	};

	Shader.prototype.bindAttributeKey = function (record, renderer, attributeMap, key) {
		var attribute = attributeMap[this.attributes[key]];
		if (!attribute) {
			return;
		}

		var attributeIndex = this.attributeIndexMapping[key];
		if (attributeIndex === undefined) {
			// console.warn('Attribute binding [' + name + '] does not exist in the shader.');
			return;
		}

		record.newlyEnabledAttributes[attributeIndex] = true;
		renderer.bindVertexAttribute(attributeIndex, attribute);
	};

	Shader.prototype.bindAttributes = function (record, renderer, attributeMap) {
		if (this.attributes) {
			for (var i = 0, l = this.attributeKeys.length; i < l; i++) {
				this.bindAttributeKey(record, renderer, attributeMap, this.attributeKeys[i]);
			}
		}
	};

	Shader.prototype.disableAttributes = function (record, context) {
		for (var i = 0, l = record.enabledAttributes.length; i < l; i++) {
			var enabled = record.enabledAttributes[i];
			var newEnabled = record.newlyEnabledAttributes[i];
			if (!newEnabled && enabled) {
				context.disableVertexAttribArray(i);
				record.enabledAttributes[i] = false;
			}
		}
	};

	Shader.prototype.enableAttributes = function (record, context) {
		for (var i = 0, l = record.newlyEnabledAttributes.length; i < l; i++) {
			var enabled = record.enabledAttributes[i];
			var newEnabled = record.newlyEnabledAttributes[i];
			if (newEnabled && !enabled) {
				context.enableVertexAttribArray(i);
				record.enabledAttributes[i] = true;
			}
		}
	};

	Shader.prototype.matchUniforms = function (shaderInfo) {
		var uniforms = this.matchedUniforms;
		if (uniforms) {
			this.textureIndex = 0;

			for (var i = 0, l = uniforms.length; i < l; i++) {
				this._bindUniform(uniforms[i], shaderInfo);
			}
		}
	};

	Shader.prototype.apply = function (shaderInfo, renderer) {
		var context = renderer.context;
		var record = renderer.rendererRecord;

		this.compileProgram(renderer);
		// Set the ShaderProgram active
		this.activateProgram(record, context);

		record.newlyEnabledAttributes.length = 0;

		// Bind attributes
		this.bindAttributes(record, renderer, shaderInfo.meshData.attributeMap);

		this.disableAttributes(record, context);
		this.enableAttributes(record, context);
		this.matchUniforms(shaderInfo);
	};

	Shader.prototype.defineValue = function (shaderInfo, name) {
		var defValue = shaderInfo.material.uniforms[name];
		if (defValue === undefined) {
			defValue = this.uniforms[name];
		}
		return defValue;
	};


	Shader.prototype.mapSlot = function (shaderInfo, mapping, slot) {
		var maps = shaderInfo.material.getTexture(slot.mapping);
		if (maps instanceof Array) {
			this.arrayType(mapping, slot, maps);
		} else {
			slot.index = this.textureIndex;
			mapping.call(this.textureIndex++);
		}
	};

	Shader.prototype.arrayType = function (mapping, slot, maps) {
		var arr = [];
		slot.index = [];
		for (var i = 0; i < maps.length; i++) {
			slot.index.push(this.textureIndex);
			arr.push(this.textureIndex++);
		}
		mapping.call(arr);
	};

	Shader.prototype.stringType = function (shaderInfo, name, mapping) {
		var callback = this.currentCallbacks[name];
		if (callback) {
			callback(mapping, shaderInfo);
		} else {
			var slot = this.textureSlotsNaming[name];
			if (slot !== undefined) {
				this.mapSlot(shaderInfo, mapping, slot);
			}
		}
	};

	Shader.prototype.callMapping = function (shaderInfo, name, mapping) {
		var defValue = this.defineValue(shaderInfo, name);
		var type = typeof defValue;
		if (type === 'string') {
			this.stringType(shaderInfo, name, mapping, defValue);
		} else {
			var value = type === 'function' ? defValue(shaderInfo) : defValue;
			if (value !== undefined) {
				mapping.call(value);
			}
		}
	};

	Shader.prototype._bindUniform = function (name, shaderInfo) {
		var mapping = this.uniformCallMapping[name];
		if (mapping === undefined) {
			return;
		}
		this.callMapping(shaderInfo, name, mapping);
	};

	Shader.prototype.setDefine = function (key, value) {
		this.defineKeyDirty = this.defineKeyDirty || this.defines[key] !== value;
		this.defines[key] = value;
	};

	Shader.prototype.removeDefine = function (key) {
		this.defineKeyDirty = this.defineKeyDirty || this.defines[key] !== undefined;
		this.defines[key] = undefined;
	};

	Shader.prototype.hasDefine = function (key) {
		return this.defines[key] !== false && this.defines[key] !== undefined;
	};

	Shader.prototype.startFrame = function () {
		this.frameStart = true;
	};

	Shader.prototype.endFrame = function () {
		this.frameStart = false;
	};

	Shader.prototype.updateProcessors = function (renderInfo) {
		if (this.processors) {
			for (var j = 0; j < this.processors.length; j++) {
				this.processors[j](this, renderInfo);
			}
		}
	};

	Shader.prototype.getDefineKey = function (definesIndices) {
		if (this.defineKeyDirty) {
			var key = 'Key:' + this.name;
			var defineArray = Object.keys(this.defines);
			for (var i = 0; i < defineArray.length; i++) {
				var defineArrayKey = defineArray[i];
				var defineVal = this.defines[defineArrayKey];
				if (defineVal === undefined || defineVal === false) {
					continue;
				}
				if (definesIndices.indexOf(defineArrayKey) === -1) {
					definesIndices.push(defineArrayKey);
				}
			}
			for (var i = 0, l = definesIndices.length; i < l; i++) {
				var defineArrayKey = definesIndices[i];
				var defineVal = this.defines[defineArrayKey];
				if (defineVal === undefined || defineVal === false) {
					continue;
				}
				key += '_' + i + ':' + defineVal;
			}
			this.defineKey = key;
			this.defineKeyDirty = false;
		}

		return this.defineKey;
	};


	Shader.prototype.rebuild = function () {
		this.shaderProgram = null;
		this.attributeMapping = {};
		this.attributeIndexMapping = {};
		this.uniformMapping = {};
		this.uniformCallMapping = {};
		this.currentCallbacks = {};
		this.attributeKeys = null;
		this.vertexSource = typeof this.origVertexSource === 'function' ? this.origVertexSource() : this.origVertexSource;
		this.fragmentSource = typeof this.origFragmentSource === 'function' ? this.origFragmentSource() : this.origFragmentSource;
		this.defineKeyDirty = true;
	};

	Shader.prototype._investigateShaders = function () {
		this.textureSlots = [];
		this.textureSlotsNaming = {};
		Shader.investigateShader(this.vertexSource, this);
		Shader.investigateShader(this.fragmentSource, this);
	};

	/**
	 * Extract shader variable definitions from shader source code.
	 * @param {string} source The source code.
	 * @param {Object} target
	 * @param {Object} target.attributeMapping
	 * @param {Object} target.uniformMapping
	 * @param {Array} target.textureSlots
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
				} else if (definition.format.indexOf('sampler') === 0) {
					definition.format = 'samplerArray';
				}
			}

			if (type === 'attribute') {
				target.attributeMapping[variableName] = definition;
			} else {
				if (definition.format.indexOf('sampler') === 0) {
					var textureSlot = {
						format: definition.format,
						name: variableName,
						mapping: target.uniforms[variableName],
						index: target.textureSlots.length
					};
					target.textureSlots.push(textureSlot);
					target.textureSlotsNaming[textureSlot.name] = textureSlot;
				}
				target.uniformMapping[variableName] = definition;
			}

			matcher = regExp.exec(source);
		}
	};

	Shader.prototype.compile = function (renderer) {
		var context = renderer.context;
		this.renderer = renderer;
		this.vertexShader = this._getShader(context, context.VERTEX_SHADER !== undefined ? context.VERTEX_SHADER : WebGLRenderingContext.VERTEX_SHADER, this.vertexSource);
		this.fragmentShader = this._getShader(context, context.FRAGMENT_SHADER !== undefined ? context.FRAGMENT_SHADER : WebGLRenderingContext.FRAGMENT_SHADER, this.fragmentSource);

		if (this.vertexShader === null || this.fragmentShader === null) {
			console.error('Shader error - no shaders');
		}

		this.shaderProgram = context.createProgram();

		var error = context.getError();
		if (this.shaderProgram === null || error !== 0) {
			console.error('Shader error: ' + error + ' [shader: ' + this.name + ']');
			SystemBus.emit('goo.shader.error');
		}

		context.attachShader(this.shaderProgram, this.vertexShader);
		context.attachShader(this.shaderProgram, this.fragmentShader);

		// Link the Shader Program
		context.linkProgram(this.shaderProgram);
		if (!context.getProgramParameter(this.shaderProgram, (context.LINK_STATUS !== undefined ? context.LINK_STATUS : WebGLRenderingContext.LINK_STATUS))) {
			var errInfo = context.getProgramInfoLog(this.shaderProgram);
			console.error('Could not initialise shaders: ' + errInfo);
			SystemBus.emit('goo.shader.error', errInfo);
		}

		for (var key in this.attributeMapping) {
			var attributeIndex = context.getAttribLocation(this.shaderProgram, key);
			if (attributeIndex === -1) {
				continue;
			}

			this.attributeIndexMapping[key] = attributeIndex;
		}

		for (var key in this.uniformMapping) {
			var uniform = context.getUniformLocation(this.shaderProgram, key);

			if (uniform === null) {
				var l = this.textureSlots.length;
				for (var i = 0; i < l; i++) {
					var slot = this.textureSlots[i];
					if (slot.name === key) {
						this.textureSlots.splice(i, 1);
						delete this.textureSlotsNaming[slot.name];
						for (; i < l - 1; i++) {
							this.textureSlots[i].index--;
						}
						break;
					}
				}
				continue;
			}

			this.uniformCallMapping[key] = new ShaderCall(context, uniform, this.uniformMapping[key].format);
		}

		if (this.attributes) {
			this.attributeKeys = Object.keys(this.attributes);
		}

		if (this.uniforms) {
			this.matchedUniforms = [];
			for (var name in this.uniforms) {
				var mapping = this.uniformCallMapping[name];
				if (mapping !== undefined) {
					this.matchedUniforms.push(name);
				}

				var value = this.uniforms[name];
				if (this.defaultCallbacks[value]) {
					this.currentCallbacks[name] = this.defaultCallbacks[value];
				}
			}
		}
	};

	var errorRegExp = /\b\d+:(\d+):\s(.+)\b/g;
	var errorRegExpIE = /\((\d+),\s*\d+\):\s(.+)/g;

	Shader.prototype._getShader = function (context, type, source) {
		var shader = context.createShader(type);

		context.shaderSource(shader, source);
		context.compileShader(shader);

		// check if the Shader is successfully compiled
		if (!context.getShaderParameter(shader, context.COMPILE_STATUS !== undefined ? context.COMPILE_STATUS : WebGLRenderingContext.COMPILE_STATUS)) {
			var infoLog = context.getShaderInfoLog(shader);
			var shaderType = type === (context.VERTEX_SHADER !== undefined ? context.VERTEX_SHADER : WebGLRenderingContext.VERTEX_SHADER) ? 'VertexShader' : 'FragmentShader';

			errorRegExp.lastIndex = 0;
			var errorMatcher = errorRegExp.exec(infoLog);
			if (errorMatcher === null) {
				errorMatcher = errorRegExpIE.exec(infoLog);
			}
			if (errorMatcher !== null) {
				while (errorMatcher !== null) {
					var splitSource = source.split('\n');
					var lineNum = errorMatcher[1];
					var errorStr = errorMatcher[2];
					console.error('Error in ' + shaderType + ' - [' + this.name + '][' + this._id + '] at line ' + lineNum + ':');
					console.error('\tError: ' + errorStr);
					console.error('\tSource: ' + splitSource[lineNum - 1]);
					errorMatcher = errorRegExp.exec(infoLog);
				}
			} else {
				console.error('Error in ' + shaderType + ' - [' + this.name + '][' + this._id + '] ' + infoLog);
			}

			return null;
		}

		return shader;
	};

	var precisionRegExp = /\bprecision\s+(lowp|mediump|highp)\s+(float|int);/g;

	Shader.prototype.addPrecision = function (precision) {
		precisionRegExp.lastIndex = 0;
		var vertMatcher = precisionRegExp.exec(this.vertexSource);
		if (vertMatcher === null) {
			this.vertexSource = 'precision ' + precision + ' float;' + '\n' + this.vertexSource;
		}
		precisionRegExp.lastIndex = 0;
		var fragMatcher = precisionRegExp.exec(this.fragmentSource);
		if (fragMatcher === null) {
			this.fragmentSource = 'precision ' + precision + ' float;' + '\n' + this.fragmentSource;
		}
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
			if (value === false || value === undefined) {
				continue;
			}

			var chunk = '#define ' + d + ' ' + value;
			chunks.push(chunk);
		}

		return chunks.join('\n');
	};

	function setupDefaultCallbacks(defaultCallbacks) {
		defaultCallbacks[Shader.PROJECTION_MATRIX] = function (uniformCall, shaderInfo) {
			var matrix = shaderInfo.camera.getProjectionMatrix();
			uniformCall.uniformMatrix4fv(matrix);
		};
		defaultCallbacks[Shader.VIEW_MATRIX] = function (uniformCall, shaderInfo) {
			var matrix = shaderInfo.camera.getViewMatrix();
			uniformCall.uniformMatrix4fv(matrix);
		};
		defaultCallbacks[Shader.WORLD_MATRIX] = function (uniformCall, shaderInfo) {
			//! AT: when is this condition ever true?
			var matrix = shaderInfo.transform !== undefined ? shaderInfo.transform.matrix : Matrix4.IDENTITY;
			uniformCall.uniformMatrix4fv(matrix);
		};
		defaultCallbacks[Shader.NORMAL_MATRIX] = function (uniformCall, shaderInfo) {
			//! AT: when is this condition ever true?
			var matrix = shaderInfo.transform !== undefined ? shaderInfo.transform.normalMatrix : Matrix3.IDENTITY;
			uniformCall.uniformMatrix3fv(matrix);
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

		for (var i = 0; i < 8; i++) {
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
		defaultCallbacks[Shader.LIGHTCOUNT] = function (uniformCall, shaderInfo) {
			uniformCall.uniform1i(shaderInfo.lights.length);
		};

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
		defaultCallbacks[Shader.MAIN_DEPTH_SCALE] = function (uniformCall, shaderInfo) {
			uniformCall.uniform1f(1.0 / (shaderInfo.mainCamera.far - shaderInfo.mainCamera.near));
		};


		defaultCallbacks[Shader.AMBIENT] = function (uniformCall, shaderInfo) {
			var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.ambient : Shader.DEFAULT_AMBIENT;
			uniformCall.uniform4fv(materialState);
		};
		defaultCallbacks[Shader.EMISSIVE] = function (uniformCall, shaderInfo) {
			var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.emissive : Shader.DEFAULT_EMISSIVE;
			uniformCall.uniform4fv(materialState);
		};
		defaultCallbacks[Shader.DIFFUSE] = function (uniformCall, shaderInfo) {
			var materialState = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.diffuse : Shader.DEFAULT_DIFFUSE;
			uniformCall.uniform4fv(materialState);
		};
		defaultCallbacks[Shader.SPECULAR] = function (uniformCall, shaderInfo) {
			var materialState = Shader.DEFAULT_SPECULAR;
			if (shaderInfo.material.materialState !== undefined) {
				materialState = shaderInfo.material.materialState.specular;
				materialState[3] = Math.max(shaderInfo.material.materialState.shininess, 1);
			}
			uniformCall.uniform4fv(materialState);
		};
		defaultCallbacks[Shader.SPECULAR_POWER] = function (uniformCall, shaderInfo) {
			var shininess = shaderInfo.material.materialState !== undefined ? shaderInfo.material.materialState.shininess : Shader.DEFAULT_SHININESS;
			shininess = Math.max(shininess, 1.0);
			uniformCall.uniform1f(shininess);
		};

		defaultCallbacks[Shader.TIME] = function (uniformCall) {
			uniformCall.uniform1f(World.time);
		};
		defaultCallbacks[Shader.TPF] = function (uniformCall) {
			uniformCall.uniform1f(World.tpf);
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

	Shader.prototype.destroy = function () {
		if (this.shaderProgram) {
			this.renderer.context.deleteProgram(this.shaderProgram);
			this.shaderProgram = null;
		}
		if (this.vertexShader) {
			this.renderer.context.deleteShader(this.vertexShader);
			this.vertexShader = null;
		}
		if (this.fragmentShader) {
			this.renderer.context.deleteShader(this.fragmentShader);
			this.fragmentShader = null;
		}
		this.renderer = null;
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
	Shader.NORMAL_MATRIX = 'NORMAL_MATRIX';
	for (var i = 0; i < 8; i++) {
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
	Shader.MAIN_DEPTH_SCALE = 'DEPTH_SCALE';
	Shader.TIME = 'TIME';
	Shader.TPF = 'TPF';
	Shader.RESOLUTION = 'RESOLUTION';

	Shader.DIFFUSE_MAP = 'DIFFUSE_MAP';
	Shader.NORMAL_MAP = 'NORMAL_MAP';
	Shader.SPECULAR_MAP = 'SPECULAR_MAP';
	Shader.LIGHT_MAP = 'LIGHT_MAP';
	Shader.SHADOW_MAP = 'SHADOW_MAP';
	Shader.AO_MAP = 'AO_MAP';
	Shader.EMISSIVE_MAP = 'EMISSIVE_MAP';
	Shader.DEPTH_MAP = 'DEPTH_MAP';

	Shader.DEFAULT_AMBIENT = [0.1, 0.1, 0.1, 1.0];
	Shader.DEFAULT_EMISSIVE = [0, 0, 0, 0];
	Shader.DEFAULT_DIFFUSE = [0.8, 0.8, 0.8, 1.0];
	Shader.DEFAULT_SPECULAR = [0.6, 0.6, 0.6, 64.0];
	Shader.DEFAULT_SHININESS = 64.0;

	Shader.prototype.defaultCallbacks = {};
	setupDefaultCallbacks(Shader.prototype.defaultCallbacks);

module.exports = Shader;

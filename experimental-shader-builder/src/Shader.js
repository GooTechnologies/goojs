define([
	'shader-bits/data/VertexContext',
	'shader-bits/data/FragmentContext',
	'shader-bits/core/ShaderBuilder'
], function (
	VertexContext,
	FragmentContext,
	ShaderBuilder
) {
	'use strict';

	function Shader(typeDefinitions) {
		this.typeDefinitions = typeDefinitions;

		this.vertexContext = new VertexContext(this.typeDefinitions);
		this.vertexContext.contextPair = this;

		this.fragmentContext = new FragmentContext(this.typeDefinitions);
		this.fragmentContext.contextPair = this;

		this._attributes = new Map();
		this._uniforms = new Map();
	}

	/**
	 * Binds a shader attribute name to a mesh attribute name and
	 * creates a vertex shader attribute node for it.
	 * @param {string} shaderAttributeName
	 * @param {string} type
	 * @param {string} meshAttributeName
	 */
	Shader.prototype.setAttribute = function (shaderAttributeName, type, meshAttributeName) {
		// remove any previously existing node
		if (this._attributes.has(shaderAttributeName)) {
			var entry = this._attributes.get(shaderAttributeName);
			this.vertexContext.structure.removeNode(entry.node);
		}

		// create a new attribute, both in the context and in the externals
		var node = this.vertexContext.createAttribute(shaderAttributeName, type);

		this._attributes.set(shaderAttributeName, {
			node: node,
			meshAttributeName: meshAttributeName
		});

		return node;
	};

	function setUniform(contextName) {
		return function(uniformName, type, valueOrCallback) {
			var context = this[contextName];

			// remove any previously existing node
			if (this._uniforms.has(uniformName)) {
				var entry = this._uniforms.get(uniformName);
				context.structure.removeNode(entry.node);
			}

			// create a new attribute, both in the context and in the externals
			var node = context.createUniform(uniformName, type);

			this._uniforms.set(uniformName, {
				node: node,
				valueOrCallback: valueOrCallback
			});

			return node;
		};
	}

	/**
	 * Binds a shader uniform name to a default value or callback and
	 * creates a vertex shader uniform node for it.
	 * @param {string} shaderAttributeName
	 * @param {string} type
	 * @param {string} meshAttributeName
	 */
	Shader.prototype.setVertexUniform = setUniform('vertexContext');

	/**
	 * Binds a shader uniform name to a default value or callback and
	 * creates a fragment shader uniform node for it.
	 * @param {string} shaderAttributeName
	 * @param {string} type
	 * @param {string} meshAttributeName
	 */
	Shader.prototype.setFragmentUniform = setUniform('fragmentContext');

	// verify if there already is one... follow the same pattern as for set uniform and co
	Shader.prototype.setVertexVarying = function (name, type) {
		return this.vertexContext.createVarying(name, type);
	};

	Shader.prototype.setFragmentVarying = function (name, type) {
		return this.fragmentContext.createVarying(name, type);
	};

	function extract(map) {
		var obj = {};

		map.forEach(function (value, key) {
			obj[key] = value.meshAttributeName ? value.meshAttributeName : value.valueOrCallback;
		});

		return obj;
	}

	/**
	 * Outputs the shader definition comprising of the source of the vertex and fragment shader
	 * and mappings for attributes and uniforms.
	 * @returns {{vshader: string, fshader: string, attributes: *, uniforms: *}}
	 */
	Shader.prototype.compileDefinition = function () {
		var vshader = ShaderBuilder.buildShader(
			this.vertexContext.typesToJson(),
			this.vertexContext.structureToJson()
		);

		var fshader = ShaderBuilder.buildShader(
			this.fragmentContext.typesToJson(),
			this.fragmentContext.structureToJson()
		);

		return {
			attributes: extract(this._attributes),
			uniforms: extract(this._uniforms),
			vshader: vshader,
			fshader: fshader
		};
	};

	return Shader;
});

define([
	'shader-bits/data/ContextPair',
	'shader-bits/core/ShaderBuilder'
], function (
	ContextPair,
	ShaderBuilder
) {
	'use strict';

	function Shader(typeDefinitions) {
		this.contextPair = new ContextPair(typeDefinitions);
		this._attributes = new Map();
		this._uniforms = new Map();
	}

	/**
	 * Binds a shader attribute name to a mesh attribute name
	 * @param {string} shaderAttributeName
	 * @param {string} type
	 * @param {string} meshAttributeName
	 */
	Shader.prototype.setAttribute = function (shaderAttributeName, type, meshAttributeName) {
		// remove any previously existing node
		if (this._attributes.has(shaderAttributeName)) {
			var entry = this._attributes.get(shaderAttributeName);
			this.contextPair.vertexContext.structure.removeNode(entry.node);
		}

		// create a new attribute, both in the context and in the externals
		var node = this.contextPair.vertexContext.createAttribute(shaderAttributeName, type);

		this._attributes.set(shaderAttributeName, {
			node: node,
			meshAttributeName: meshAttributeName
		});

		return node;
	};

	function setUniform(contextName) {
		return function(uniformName, type, valueOrCallback) {
			var context = this.contextPair[contextName];

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

	Shader.prototype.setVertexUniform = setUniform('vertexContext');

	Shader.prototype.setFragmentUniform = setUniform('fragmentContext');

	function extract(map) {
		var obj = {};

		map.forEach(function (name, entry) {
			obj[name] = entry.value;
		});

		return obj;
	}

	Shader.prototype.compileDefinition = function () {
		var vshader = ShaderBuilder.buildShader(
			this.contextPair.vertexContext.typesToJson(),
			this.contextPair.vertexContext.structureToJson()
		);

		var fshader = ShaderBuilder.buildShader(
			this.contextPair.fragmentContext.typesToJson(),
			this.contextPair.fragmentContext.structureToJson()
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

define([
	'goo/renderer/Shader'
],
/** @lends Material */
function(
	Shader
) {
	"use strict";

	/**
	 * @class A Material defines the look of an object
	 * @param {String} name Material name
	 * @property {String} name Material name
	 * @property {Shader} shader Shader to use when rendering
	 * @property {Texture[]} textures Array of textures in use
	 */
	function Material(name) {
		this.name = name;

		this.shader = null;
		this.uniforms = {}; //possible overrides on shader uniforms
		this.textures = [];
		this._originalTextureCount = -1;
		this.materialState = undefined;
		// {
		// ambient: [0.1, 0.1, 0.1, 1.0],
		// diffuse: [1.0, 1.0, 1.0, 1.0],
		// emissive: [0.0, 0.0, 0.0, 1.0],
		// specular: [0.7, 0.7, 0.7, 1.0],
		// shininess: 16.0
		// };
		this.cullState = {
			enabled: true,
			cullFace: 'Back', // Front, Back, FrontAndBack
			frontFace: 'CCW' // CW, CCW
		};
		this.blendState = {
			// 'NoBlending', 'AdditiveBlending', 'SubtractiveBlending', 'MultiplyBlending', 'CustomBlending'
			blending: 'NoBlending',

			// 'AddEquation', 'SubtractEquation', 'ReverseSubtractEquation'
			blendEquation: 'AddEquation',

			// 'SrcAlphaFactor', 'ZeroFactor', 'OneFactor', 'SrcColorFactor', 'OneMinusSrcColorFactor', 'OneMinusSrcAlphaFactor',
			// 'OneMinusDstAlphaFactor''DstColorFactor', 'OneMinusDstColorFactor', 'SrcAlphaSaturateFactor', 'DstAlphaFactor'
			blendSrc: 'SrcAlphaFactor',
			blendDst: 'OneMinusSrcAlphaFactor'
		};
		this.depthState = {
			enabled: true,
			write: true
		};
		this.offsetState = {
			enabled: false,
			factor: 1,
			units: 1
		};

		this.wireframe = false;

		this.renderQueue = null;
	}

	Material.prototype.getRenderQueue = function () {
		if (this.renderQueue !== null) {
			return this.renderQueue;
		}
		return this.shader.renderQueue;
	};

	Material.prototype.setRenderQueue = function (queue) {
		this.renderQueue = queue;
	};

	Material.store = [];
	Material.hash = [];
	Material.createShader = function (shaderDefinition, name) {
		var index = Material.store.indexOf(shaderDefinition);
		if (index !== -1) {
			return Material.hash[index];
		}
		var shader = new Shader(name || 'DefaultShader', shaderDefinition);
		Material.store.push(shaderDefinition);
		Material.hash.push(shader);
		return shader;
	};

	Material.clearShaderCache = function () {
		Material.store.length = 0;
		Material.hash.length = 0;
	};

	Material.createMaterial = function (shaderDefinition, name) {
		var material = new Material(name || 'DefaultMaterial');

		material.shader = Material.createShader(shaderDefinition);

		return material;
	};

	return Material;
});

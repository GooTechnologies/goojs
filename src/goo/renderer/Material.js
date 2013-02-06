define(['goo/renderer/Shader', 'goo/renderer/TextureCreator', 'goo/renderer/MeshData', 'goo/renderer/shaders/ShaderFragments'],
/** @lends Material */
function(Shader, TextureCreator, MeshData, ShaderFragments) {
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
		this.textures = [];
		this.materialState = undefined;
		// {
		// ambient : {r : 0.1, g : 0.1, b : 0.1, a : 1.0},
		// diffuse : {r : 1.0, g : 1.0, b : 1.0, a : 1.0},
		// emissive : {r : 0.1, g : 0.0, b : 0.0, a : 1.0},
		// specular : {r : 0.7, g : 0.7, b : 0.7, a : 1.0},
		// shininess: 16.0
		// };
		this.cullState = {
			enabled : true,
			cullFace : 'Back', // Front, Back, FrontAndBack
			frontFace : 'CCW' // CW, CCW
		};
		this.blendState = {
			blending : 'NoBlending' // , NoBlending, AdditiveBlending, SubtractiveBlending,
		// MultiplyBlending, CustomBlending
		// blendEquation : 'AddEquation', 'SubtractEquation', 'ReverseSubtractEquation'
		// blendSrc : 'ZeroFactor', 'OneFactor', 'SrcColorFactor', 'OneMinusSrcColorFactor',
		// 'SrcAlphaFactor', 'OneMinusSrcAlphaFactor', 'DstAlphaFactor', 'OneMinusDstAlphaFactor'
		// blendDst : 'DstColorFactor', 'OneMinusDstColorFactor', 'SrcAlphaSaturateFactor'
		};
		this.depthState = {
			enabled : true,
			write : true
		};
		this.offsetState = {
			enabled : false,
			factor : 1,
			units : 1
		};

		this.wireframe = false;

		this.renderQueue = null;
	}

	Material.prototype.getRenderQueue = function() {
		if (this.renderQueue !== null) {
			return this.renderQueue;
		}
		return this.shader.renderQueue;
	};

	Material.prototype.setRenderQueue = function(queue) {
		this.renderQueue = queue;
	};

	Material.store = [];
	Material.hash = [];
	Material.createShader = function(shaderDefinition, name) {
		var index = Material.store.indexOf(shaderDefinition);
		if (index !== -1) {
			return Material.hash[index];
		}
		var shader = new Shader(name || 'DefaultShader', shaderDefinition);
		Material.store.push(shaderDefinition);
		Material.hash.push(shader);
		return shader;
	};

	Material.clearShaderCache = function() {
		Material.store.length = 0;
		Material.hash.length = 0;
	};

	Material.createMaterial = function(shaderDefinition, name) {
		var material = new Material(name || 'DefaultMaterial');

		material.shader = Material.createShader(shaderDefinition);

		return material;
	};

	return Material;
});

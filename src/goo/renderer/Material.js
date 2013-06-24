define([
	'goo/renderer/Shader'
],
/** @lends */
function(
	Shader
) {
	"use strict";

	/**
	 * @class A Material defines the look of an object
	 * @param {String} name Material name
	 */
	function Material(name) {
		/**
		 * @type {String}
		 */
		this.name = name;

		/** Shader to use when rendering
		 * @type {Shader}
		 */
		this.shader = null;
		/** Possible overrides for shader uniforms
		 * @type {Object}
		 * @default
		 */
		this.uniforms = {};
		/** Array of textures in use
		 * @type {Texture[]}
		 */
		this.textures = [];
		this._originalTextureCount = -1;
		/** @type {object} */
		this.materialState = undefined;
		// {
		// ambient: [0.1, 0.1, 0.1, 1.0],
		// diffuse: [1.0, 1.0, 1.0, 1.0],
		// emissive: [0.0, 0.0, 0.0, 1.0],
		// specular: [0.7, 0.7, 0.7, 1.0],
		// shininess: 16.0
		// };
		/** Specification of culling for this Material.
		 * @type {Object}
		 * @property {boolean} enabled
		 * @property {String} cullFace possible values: 'Front', 'Back', 'FrontAndBack', default 'Back'
		 * @property {String} frontFace possible values: 'CW' (clockwise) and 'CCW' (counterclockwise - default)
		 */
		this.cullState = {
			enabled: true,
			cullFace: 'Back', // Front, Back, FrontAndBack
			frontFace: 'CCW' // CW, CCW
		};
		/**
		 * @type {Object}
		 * @property {String} blending possible values: <strong>'NoBlending'</strong>, 'AdditiveBlending', 'SubtractiveBlending', 'MultiplyBlending', 'CustomBlending'
		 * @property {String} blendEquation possible values: <strong>'AddEquation'</strong>, 'SubtractEquation', 'ReverseSubtractEquation'
		 * @property {String} blendSrc possible values: <strong>'SrcAlphaFactor'</strong>, 'ZeroFactor', 'OneFactor', 'SrcColorFactor', 'OneMinusSrcColorFactor', 'OneMinusSrcAlphaFactor', 'OneMinusDstAlphaFactor''DstColorFactor', 'OneMinusDstColorFactor', 'SrcAlphaSaturateFactor', 'DstAlphaFactor'
		 * @property {String} blendDst possible values: 'SrcAlphaFactor', 'ZeroFactor', 'OneFactor', 'SrcColorFactor', 'OneMinusSrcColorFactor', <strong>'OneMinusSrcAlphaFactor'</strong>, 'OneMinusDstAlphaFactor''DstColorFactor', 'OneMinusDstColorFactor', 'SrcAlphaSaturateFactor', 'DstAlphaFactor'
		 */
		this.blendState = {
			blending: 'NoBlending',
			blendEquation: 'AddEquation',
			blendSrc: 'SrcAlphaFactor',
			blendDst: 'OneMinusSrcAlphaFactor'
		};
		/**
		 * @type {Object}
		 * @property {boolean} enabled default: true
		 * @property {boolean} write default: true
		 */
		this.depthState = {
			enabled: true,
			write: true
		};
		/**
		 * @type {Object}
		 * @property {boolean} enabled
		 * @property {number} factor default: 1
		 * @property {number} units default: 1
		 */
		this.offsetState = {
			enabled: false,
			factor: 1,
			units: 1
		};

		/** Show wireframe on this material
		 * @type {boolean}
		 * @default
		 */
		this.wireframe = false;

		/** Determines the order in which an object is drawn. There are four pre-defined render queues:
		 *		<ul>
		 *			<li>RenderQueue.BACKGROUND = Rendered before any other objects. Commonly used for skyboxes and the likes (0-999)
		 *			<li>RenderQueue.OPAQUE = Used for most objects, typically opaque geometry. Rendered front to back (1000-1999)
		 *			<li>RenderQueue.TRANSPARENT = For all alpha-blended objects. Rendered back to front (2000-2999)
		 *			<li>RenderQueue.OVERLAY = For overlay effects like lens-flares etc (3000+)
		 *		</ul>
		 * By default materials use the render queue of the shader. See {@link Shader} or {@link RenderQueue} for more info
		 * @type {number}
		 */
		this.renderQueue = null;
	}

	/**
	 * @returns {number}
	 */
	Material.prototype.getRenderQueue = function () {
		if (this.renderQueue !== null) {
			return this.renderQueue;
		} else if (this.shader !== null) {
			return this.shader.renderQueue;
		}
		return 1000;
	};

	/**
	 * @param {number} queue See {@link RenderQueue} for options
	 */
	Material.prototype.setRenderQueue = function (queue) {
		this.renderQueue = queue;
	};

	Material.store = [];
	Material.hash = [];

	/**
	 * Creates a new or finds an existing, cached Shader object
	 *
	 * @param {ShaderDefinition} shaderDefinition see {@link Shader}
	 * @param {String} [name=DefaultShader]
	 * @return {Shader}
	 */
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

	/** Clears the shader cache.
	 */
	Material.clearShaderCache = function () {
		Material.store.length = 0;
		Material.hash.length = 0;
	};

	/**
	 * Creates a new Material object and sets the shader by calling createShader with the shaderDefinition
	 *
	 * @param {ShaderDefinition} shaderDefinition see {@link Shader}
	 * @param {String} [name=DefaultMaterial]
	 * @return {Material}
	 */
	Material.createMaterial = function (shaderDefinition, name) {
		var material = new Material(name || 'DefaultMaterial');

		material.shader = Material.createShader(shaderDefinition);

		return material;
	};

	return Material;
});

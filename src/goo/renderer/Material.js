define([
	'goo/renderer/Shader'
],
/** @lends */
function(
	Shader
) {
	'use strict';

	/**
	 * @class A Material defines the look of an object.
	 * @param {string} name Material name.
	 * @param {{ vshader, fshader }} shaderDefinition
	 */
	function Material(name, shaderDefinition) {
		/** Material name.
		 * @type {string}
		 */
		this.name = null;
		/** [Shader]{@link Shader} to use when rendering.
		 * @type {Shader}
		 */
		this.shader = null;

		//! AT: horrendous type checking follows
		// function has 2 signatures because the deprecated .createMaterial had parameters in inverse order
		if (typeof name === 'string') {
			this.name = name;
		} else if (name && name.vshader && name.fshader) {
			this.shader = Material.createShader(name);
		}

		if (shaderDefinition && shaderDefinition.vshader && shaderDefinition.fshader) {
			this.shader = Material.createShader(shaderDefinition);
		} else if (typeof shaderDefinition === 'string') {
			this.name = shaderDefinition;
		}

		this.name = this.name || 'Default Material';

		/** Possible overrides for shader uniforms
		 * @type {Object}
		 * @default
		 */
		this.uniforms = {};

		// Texture storage
		this._textureMaps = {};

		/** @type {object}
		 * @property {Array<Number>} ambient The ambient color, [r,g,b,a]
		 * @property {Array<Number>} diffuse The diffuse color, [r,g,b,a]
		 * @property {Array<Number>} emissive The emissive color, [r,g,b,a]
		 * @property {Array<Number>} specular The specular color, [r,g,b,a]
		 * @property {Number} shininess The shininess exponent.
		 * */
		this.materialState = {
			ambient: Shader.DEFAULT_AMBIENT,
			diffuse: Shader.DEFAULT_DIFFUSE,
			emissive: Shader.DEFAULT_EMISSIVE,
			specular: Shader.DEFAULT_SPECULAR,
			shininess: Shader.DEFAULT_SHININESS
		};
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
		 * @property {String} blendDst possible values: 'SrcAlphaFactor', 'ZeroFactor', 'OneFactor', 'SrcColorFactor', 'OneMinusSrcColorFactor', <strong>'OneMinusSrcAlphaFactor'</strong>, 'OneMinusDstAlphaFactor''DstColorFactor', 'OneMinusDstColorFactor', 'DstAlphaFactor'
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

		/** Render the mesh twice with front/back-facing for double transparency rendering
		 * @type {boolean}
		 * @default
		 */
		this.dualTransparency = false;

		/** Show wireframe on this material
		 * @type {boolean}
		 * @default
		 */
		this.wireframe = false;
		this.flat = false;

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
	 * Sets a texture in a specific slot
	 *
	 * @param {String} name Name of texture slot
	 * @param {Texture} texture Texture to set
	 */
	Material.prototype.setTexture = function (name, texture) {
		this._textureMaps[name] = texture;
	};

	/**
	 * Gets a texture in a specific slot
	 *
	 * @param {String} name Name of texture slot to retrieve texture from
	 * @return {Texture} Texture if found, or undefined if not in slot
	 */
	Material.prototype.getTexture = function (name) {
		return this._textureMaps[name];
	};

	/**
	 * Removes a texture in a specific slot
	 *
	 * @param {String} name Name of texture slot to remove
	 */
	Material.prototype.removeTexture = function (name) {
		delete this._textureMaps[name];
	};

	/**
	 * Get all textures as an array
	 *
	 * @return {Texture[]} Array containing all set textures
	 */
	Material.prototype.getTextures = function () {
		var textures = [];
		for (var key in this._textureMaps) {
			textures.push(this._textureMaps[key]);
		}
		return textures;
	};

	/**
	 * Get the map of [slot_name]: [Texture]
	 *
	 * @return {Object} Mapping of slot - textures
	 */
	Material.prototype.getTextureEntries = function () {
		return this._textureMaps;
	};

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
		var shader = new Shader(name || null, shaderDefinition);
		if (shader.name === null) {
			shader.name = 'DefaultShader' + shader._id;
		}
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
	 * @deprecated Use new Material() instead
	 * @param {ShaderDefinition} shaderDefinition see {@link Shader}
	 * @param {String} [name=DefaultMaterial]
	 * @return {Material}
	 */

	//! AT: this method has the parameters in the wrong order!!! // or the old constructor signature was
	Material.createMaterial = function (shaderDefinition, name) {
		var material = new Material(name || 'DefaultMaterial');

		material.shader = Material.createShader(shaderDefinition);

		return material;
	};

	Material.createEmptyMaterial = function(shaderDefinition, name) {
		var material = new Material(name || 'Empty Material');
		material.empty();
		if (shaderDefinition) {
			material.shader = Material.createShader(shaderDefinition);
		} else {
			material.shader = undefined;
		}
		return material;
	};

	//! AT: how about a immutable material named EMPTY and a clone method for materials instead of this mutable madness?
	Material.prototype.empty = function() {
		this.cullState = {};
		this.blendState = {};
		this.depthState = {};
		this.offsetState = {};
		this.wireframe = undefined;
		this.renderQueue = undefined;
		this.flat = undefined;
		this._textureMaps = {};
		this.shader = undefined;
		this.uniforms = {};
	};

	return Material;
});

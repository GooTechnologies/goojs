define([
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderLib',
	'goo/util/ObjectUtil',
	'goo/renderer/TextureCreator'
],
/** @lends */
function(
	Shader,
	ShaderLib,
	_,
	TextureCreator
) {
	"use strict";

	var uniqueId = 0;

	/**
	 * @class A Material defines the look of an object. Takes either a string or an object with settings for the Material
	 * @param {String|Object} parameters If a string it becomes the Material name, if Object it carries all the setting of the Material.
	 * @param {String} [parameters.name="materialXYZ"] Name of the material. Default to a unique name.
	 * @param {Shader|String} [parameters.shader=undefined] The Shader or the name of the Shader to be used.
	 * @param {Object} [parameters.textures={}] Textures to load
	 * @param {String} [parameters.textures.DIFFUSE_MAP] Path to DIFFUSE_MAP. This is an example and is Shader specific. Other possible keys are NORMAL_MAP, SPECULAR_MAP, LIGHT_MAP, SHADOW_MAP, AO_MAP, EMISSIVE_MAP, DEPTH_MAP
	 * @param {Function} [parameters.onLoad] Callback function for when all textures have been loaded. Note that this isn't called if any of the texture loads fail.
	 * @param {Object} [parameters.uniforms={}] Uniform overrides
	 * @param {Object} [parameters.materialState={}] Material State. Possible object keys include ambient, diffuse, emissive and specular (Vector4 color) but are Shader specific
	 * @param {Object} [parameters.culling={}] Culling for the Material.
	 * @param {Bool} [parameters.culling.enabled=true] Culling enabled.
	 * @param {String} [parameters.culling.cullFace="back"] Which side to cull. Possible values are "back", "front" and "FrontAndBack".
	 * @param {String} [parameters.culling.frontFace="CCW"] Polygon winding order. Possiblie values are "CCW" and "CW".
	 * @param {Object} [parameters.blending={}] Blending for the Material.
	 * @param {String} [parameters.blending.blending="NoBlending"] Blending for the Material.
	 * @param {String} [parameters.blending.blendEquation="AddEquation"] Blending equation for the Material.
	 * @param {String} [parameters.blending.blendSrc="SrcAlphaFactor"] Source blending factor for the Material.
	 * @param {String} [parameters.blending.blendDst="OneMinusSrcAlphaFactor"] Destination blending factor for the Material.
	 * @param {Object} [parameters.depth={}] Depth options for the Material
	 * @param {Bool} [parameters.depth.enabled=true] Depth test for Material 
	 * @param {Bool} [parameters.depth.write=true] Depth write for Material 
	 * @param {Object} [parameters.offset={}] Offset options for Material 
	 * @param {Bool} [parameters.offset.enabled=false] Offset enabled for Material 
	 * @param {Number} [parameters.offset.factor=1.0] Offset factor for Material 
	 * @param {Number} [parameters.offset.units=1.0] Offset units for Material 
	 * @param {Bool} [parameters.dualTransparency=false] Render the mesh twice (back and forth) if transparent
	 * @param {Bool} [parameters.flat=false] Flat shading
	 * @param {Bool} [parameters.wireframe=false] Wireframe shading
	 * @param {Number} [parameters.renderQueue=null] Render queue
	 */
	function Material(parameters) {
		/**
		 * @type {String}
		 */

		 // REVIEW: This is here for backwards compability and maybe that's fine...
		 if( typeof( parameters ) === "string" ) {
			this.name = parameters;
			parameters = {};
		 }

		_.defaults( parameters, {
			name            : ( this.name !== undefined ? this.name : ( "material" + (uniqueId++))),
			shader          : undefined,
			textures        : {},
			uniforms        : {},
			materialState   : {},
			culling         : {},
			blending        : {},
			depth 	     	: {},
			offset 		    : {},
			dualTransparency: false,
			flat            : false,
			wireframe       : false,
			renderQueue     : null,
		});
		_.defaults( parameters.materialState, {
			ambient  : Shader.DEFAULT_AMBIENT,
			diffuse  : Shader.DEFAULT_DIFFUSE,
			emissive : Shader.DEFAULT_EMISSIVE,
			specular : Shader.DEFAULT_SPECULAR,
			shininess: Shader.DEFAULT_SHININESS
		} );
		_.defaults( parameters.culling, {
			enabled: true,
			cullFace: 'Back', 	// Front, Back, FrontAndBack
			frontFace: 'CCW' 	// CW, CCW
		});

		// REVIEW: Exchange strings for definitions (like Shader.DEFAULT_XYZ above)
		// REVIEW: Might be nice to send in .blending .blendEquation etc in parameters object
		_.defaults( parameters.blending, {
			blending     : 'NoBlending',
			blendEquation: 'AddEquation',
			blendSrc     : 'SrcAlphaFactor',
			blendDst     : 'OneMinusSrcAlphaFactor'
		});
		_.defaults( parameters.depth, {
			enabled: parameters.depthTest  !== undefined ? parameters.depthTest  : true,
			write  : parameters.depthWrite !== undefined ? parameters.depthWrite : true
		});
		_.defaults( parameters.offset, {
			enabled: false,
			factor: 1,
			units: 1
		});

		/** Shader to use when rendering
		 * @type {Shader}
		 */
		if( parameters.shader !== undefined ) {
			if( parameters.shader instanceof Shader ) {
				this.shader = parameters.shader;
			} else if( ShaderLib[ parameters.shader ] !== undefined ) {
				this.shader = Material.createShader( ShaderLib[ parameters.shader ] );
			} else {
				console.warn( "Material.construct: " + shader + " is not a Shader nor an ID of ShaderLib. Ignoring!" );
			}
		} else { 
			this.shader = null;
		}
		/** Possible overrides for shader uniforms
		 * @type {Object}
		 * @default
		 */
		this.uniforms = parameters.uniforms;

		// Texture storage
		this._textureMaps = {};

		// load textures
		var numTexturesToLoad = 0;
		_.each( parameters.textures, function() {
			numTexturesToLoad++;
		});
		if( numTexturesToLoad > 0 ) {
			_.each( parameters.textures, function( pathOrTexture, textureId ) {
				if( typeof( pathOrTexture ) === "string" ) {
					parameters[ textureId ] = new TextureCreator().loadTexture2D( pathOrTexture, undefined, function() {
						numTexturesToLoad--;
						if( parameters.onLoad ) {
							parameters.onLoad();
						}
					} );
					this.setTexture( textureId, parameters[ textureId ] );
				} else {
					this.setTexture( textureId, pathOrTexture )
				}
			}, this );
		} else if( parameters.onLoad ) {
			parameters.onLoad();
		}

		/** @type {object}
		 * @property {Array<Number>} ambient The ambient color, [r,g,b,a]
		 * @property {Array<Number>} diffuse The diffuse color, [r,g,b,a]
		 * @property {Array<Number>} emissive The emissive color, [r,g,b,a]
		 * @property {Array<Number>} specular The specular color, [r,g,b,a]
		 * @property {Number} shininess The shininess exponent.
		 * */
		this.materialState = parameters.materialState;

		/** Specification of culling for this Material.
		 * @type {Object}
		 * @property {boolean} enabled
		 * @property {String} cullFace possible values: 'Front', 'Back', 'FrontAndBack', default 'Back'
		 * @property {String} frontFace possible values: 'CW' (clockwise) and 'CCW' (counterclockwise - default)
		 */
		this.cullState = parameters.culling;
		/**
		 * @type {Object}
		 * @property {String} blending possible values: <strong>'NoBlending'</strong>, 'AdditiveBlending', 'SubtractiveBlending', 'MultiplyBlending', 'CustomBlending'
		 * @property {String} blendEquation possible values: <strong>'AddEquation'</strong>, 'SubtractEquation', 'ReverseSubtractEquation'
		 * @property {String} blendSrc possible values: <strong>'SrcAlphaFactor'</strong>, 'ZeroFactor', 'OneFactor', 'SrcColorFactor', 'OneMinusSrcColorFactor', 'OneMinusSrcAlphaFactor', 'OneMinusDstAlphaFactor''DstColorFactor', 'OneMinusDstColorFactor', 'SrcAlphaSaturateFactor', 'DstAlphaFactor'
		 * @property {String} blendDst possible values: 'SrcAlphaFactor', 'ZeroFactor', 'OneFactor', 'SrcColorFactor', 'OneMinusSrcColorFactor', <strong>'OneMinusSrcAlphaFactor'</strong>, 'OneMinusDstAlphaFactor''DstColorFactor', 'OneMinusDstColorFactor', 'DstAlphaFactor'
		 */
		this.blendState = parameters.blending;
		/**
		 * @type {Object}
		 * @property {boolean} enabled default: true
		 * @property {boolean} write default: true
		 */
		this.depthState = parameters.depth;
		/**
		 * @type {Object}
		 * @property {boolean} enabled
		 * @property {number} factor default: 1
		 * @property {number} units default: 1
		 */
		this.offsetState = parameters.offset;

		/** Render the mesh twice with front/back-facing for double transparency rendering
		 * @type {boolean}
		 * @default
		 */
		this.dualTransparency = parameters.dualTransparency;

		/** Show wireframe on this material
		 * @type {boolean}
		 * @default
		 */
		this.wireframe = parameters.wireframe;
		this.flat = parameters.flat;

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
		this.renderQueue = parameters.renderQueue;
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
	 * @param {ShaderDefinition} shaderDefinition see {@link Shader}
	 * @param {String} [name=DefaultMaterial]
	 * @return {Material}
	 */
	Material.createMaterial = function (shaderDefinition, name) {
		var material = new Material(name || 'DefaultMaterial');

		material.shader = Material.createShader(shaderDefinition);

		return material;
	};

	Material.createEmptyMaterial = function(shaderDefinition, name) {
		var material = new Material(name || 'Empty Material');
		material.empty();
		if(shaderDefinition) {
			material.shader = Material.createShader(shaderDefinition);
		} else {
			material.shader = undefined;
		}
		return material;
	};

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

define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/RenderQueue',
	'goo/util/rsvp',
	'goo/util/ObjectUtils'
], function (
	ConfigHandler,
	Material,
	ShaderLib,
	RenderQueue,
	RSVP,
	ObjectUtils
) {
	'use strict';

	/**
	 * Handler for loading materials into engine
	 * @extends ConfigHandler
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 * @private
	 */
	function MaterialHandler() {
		ConfigHandler.apply(this, arguments);
	}

	MaterialHandler.prototype = Object.create(ConfigHandler.prototype);
	MaterialHandler.prototype.constructor = MaterialHandler;
	ConfigHandler._registerClass('material', MaterialHandler);

	MaterialHandler.ENGINE_SHADER_PREFIX = 'GOO_ENGINE_SHADERS/';

	/**
	 * Preparing material config by populating it with defaults.
	 * @param {Object} config
	 * @private
	 */
	MaterialHandler.prototype._prepare = function (config) {
		ObjectUtils.defaults(config, {
			blendState: {},
			cullState: {},
			depthState: {},
			renderQueue: -1,
			dualTransparency: false,
			wireframe: false,
			flat: false
		});

		ObjectUtils.defaults(config.blendState, {
			blending: 'NoBlending',
			blendEquation: 'AddEquation',
			blendSrc: 'SrcAlphaFactor',
			blendDst: 'OneMinusSrcAlphaFactor'
		});

		ObjectUtils.defaults(config.cullState, {
			enabled: true,
			cullFace: 'Back',
			frontFace: 'CCW'
		});

		ObjectUtils.defaults(config.depthState, {
			enabled: true,
			write: true
		});
	};

	/**
	 * Creates a (somewhat) empty material.
	 * @returns {Material}
	 * @private
	 */
	MaterialHandler.prototype._create = function () {
		return new Material();
	};

	MaterialHandler.prototype._remove = function (ref) {
		var material = this._objects.get(ref);
		if (!material) {
			return;
		}
		// material.shader.destroy(); // don't destroy the shader; it may be used by some other material
		material.empty();
		this._objects.delete(ref);
	};

	/**
	 * Adds/updates/removes a a material
	 * @param {string} ref
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} Resolves with the updated material or null if removed
	 */
	MaterialHandler.prototype._update = function (ref, config, options) {
		var that = this;
		return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (material) {
			if (!material) { return; }

			var promises = [];

			// Material settings
			ObjectUtils.extend(material.blendState, config.blendState);
			ObjectUtils.extend(material.cullState, config.cullState);
			ObjectUtils.extend(material.depthState, config.depthState);

			material.id = config.id;
			material.name = config.name;
			material.wireframe = config.wireframe;
			material.flat = config.flat;
			material.dualTransparency = config.dualTransparency;

			if (config.renderQueue === -1) {
				if (config.blendState.blending !== 'NoBlending') {
					material.renderQueue = RenderQueue.TRANSPARENT;
				} else {
					material.renderQueue = null;
				}
			} else {
				material.renderQueue = config.renderQueue;
			}

			material.uniforms = {};
			for (var name in config.uniforms) {
				if (config.uniforms[name].enabled === undefined) {
					material.uniforms[name] = ObjectUtils.clone(config.uniforms[name]);
				} else if (config.uniforms[name].enabled) {
					material.uniforms[name] = ObjectUtils.clone(config.uniforms[name].value);
				}
			}

			// Patch color uniforms
			if (material.uniforms.materialDiffuse !== undefined) {
				material.uniforms.materialDiffuse[3] = 1;
			}
			if (material.uniforms.materialAmbient !== undefined) {
				material.uniforms.materialAmbient[3] = 1;
			}
			if (material.uniforms.materialEmissive !== undefined) {
				material.uniforms.materialEmissive[3] = 1;
			}

			// TODO: This is a temporary hack until we fully moved shininess into the last entry of specular [r, g, b, spec_power]
			if (material.uniforms.materialSpecular !== undefined && material.uniforms.materialSpecularPower !== undefined) {
				material.uniforms.materialSpecular[3] = material.uniforms.materialSpecularPower;
			}

			// Shader
			var shaderRef = config.shaderRef;
			if (!shaderRef) {
				material.shader = Material.createShader(ShaderLib.texturedLit, 'DefaultShader');
			}
			else if (shaderRef.indexOf(MaterialHandler.ENGINE_SHADER_PREFIX) === 0) {
				var shaderName = shaderRef.slice(MaterialHandler.ENGINE_SHADER_PREFIX.length);
				material.shader = Material.createShader(ShaderLib[shaderName]);
			} else {
				var p = that._load(shaderRef, options).then(function (shader) {
					material.shader = shader;
				}).then(null, function (err) {
					throw new Error('Error loading shader: ' + err);
				});
				promises.push(p);
			}

			// Textures
			function addTexture(type, ref, options) {
				return that._load(ref, options).then(function (texture) {
					material.setTexture(type, texture);
				}).then(null, function (err) {
					throw new Error('Error loading texture: ' + ref + ' - ' + err);
				});
			}
			var textureRef;
			for (var type in config.texturesMapping) {
				textureRef = config.texturesMapping[type];
				if (!textureRef || !textureRef.textureRef || textureRef.enabled === false) {
					material.removeTexture(type);
				} else {
					promises.push(addTexture(type, textureRef.textureRef, options));
				}
			}
			for (var type in material._textureMaps) {
				if (!config.texturesMapping[type]) {
					material.removeTexture(type);
				}
			}
			return RSVP.all(promises).then(function () {
				return material;
			});
		});
	};

	return MaterialHandler;
});

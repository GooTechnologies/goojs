define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/renderer/Material',
	'goo/renderer/Util',
	'goo/renderer/shaders/ShaderLib',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
],
/** @lends */
function(
	ConfigHandler,
	Material,
	Util,
	ShaderLib,
	RSVP,
	PromiseUtil,
	_
) {
	"use strict";

	/**
	* @class
	* @private
	*/
	function MaterialHandler() {
		ConfigHandler.apply(this, arguments);
		this._objects = {};
	}

	MaterialHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('material', MaterialHandler);

	MaterialHandler.ENGINE_SHADER_PREFIX = "GOO_ENGINE_SHADERS/";

	MaterialHandler.prototype._prepare = function(config) {
		if (!config.blendState) {
			config.blendState = {};
		}
		_.defaults(config.blendState, {
			blending: 'NoBlending',
			blendEquation: 'AddEquation',
			blendSrc: 'SrcAlphaFactor',
			blendDst: 'OneMinusSrcAlphaFactor'
		});
		if (!config.cullState) {
			config.cullState = {};
		}
		_.defaults(config.cullState, {
			enabled: true,
			cullFace: 'Back',
			frontFace: 'CCW'
		});
		if (!config.depthState) {
			config.depthState = {};
		}
		_.defaults(config.depthState, {
			enabled: true,
			write: true
		});
		/*jshint eqeqeq: false, -W041*/
		if (config.renderQueue == null) {
			config.renderQueue = -1;
		}
	};

	MaterialHandler.prototype._create = function(ref) {
		if (!this._objects) {
			this._objects = {};
		}
		return this._objects[ref] = new Material(ref);
	};

	MaterialHandler.prototype.update = function(ref, config) {
		var that = this;
		var object = this._objects[ref] || this._create(ref);
		this._prepare(config);

		return this._getShaderObject(config.shaderRef, config.wireframe).then(function(shader) {
			if (!shader) {
				console.warn('Unknown shader', config.shaderRef, '- not updating material', ref);
				return;
			}
			if (config.wireframe) {
				object.wireframe = config.wireframe;
			}

			object.blendState = Util.clone(config.blendState);
			object.cullState = Util.clone(config.cullState);
			object.depthState = Util.clone(config.depthState);
			object.dualTransparency = config.dualTransparency || false;
			if (config.renderQueue === -1) {
				object.renderQueue = null;
			} else {
				object.renderQueue = config.renderQueue;
			}
			object.shader = shader;
			object.uniforms = {};
			for (var name in config.uniforms) {
				if (typeof config.uniforms[name].enabled === 'undefined') {
					object.uniforms[name] = _.clone(config.uniforms[name]);
				} else {
					if (config.uniforms[name].enabled) {
						object.uniforms[name] = _.clone(config.uniforms[name].value);
					} else {
						delete object.uniforms[name];
					}
				}

			}

			var promises = [];

			var updateTexture = function(textureType, textureRef) {
				return promises.push(that.getConfig(textureRef).then(function(textureConfig) {
					return that.updateObject(textureRef, textureConfig, that.options).then(function(texture) {
						return {
							type: textureType,
							ref: textureRef,
							texture: texture
						};
					});
				}));
			};
			for (var textureType in config.texturesMapping) {
				var textureRef = config.texturesMapping[textureType];
				if (typeof textureRef === 'string') {
					updateTexture(textureType, textureRef);
				} else {
					if (textureRef && textureRef.enabled) {
						updateTexture(textureType, textureRef.textureRef);
					} else {
						object.removeTexture(textureType);
					}
				}
				for (var type in object._textureMaps) {
					if (!config.texturesMapping[type]) {
						object.removeTexture(type);
					}
				}
			}
			if (promises.length) {
				return RSVP.all(promises).then(function(textures) {
					for (var i = 0; i < textures.length;  i++) {
						var texture = textures[i];
						if (texture.texture) {
							object.setTexture(texture.type, texture.texture);
						}
					}
					return object;
				}).then(null, function(err) {
					return console.error("Error loading textures: " + err);
				});
			} else {
				return object;
			}
		});
	};

	MaterialHandler.prototype.remove = function(ref) {
		return delete this._objects[ref];
	};

	MaterialHandler.prototype._getShaderObject = function(ref, wireframe) {
		var that = this;
		if (wireframe) {
			var promise = new RSVP.Promise();
			var shader = Material.createShader(ShaderLib.simple);
			promise.resolve(shader);
			return promise;
		} else if (ref) {
			if (ref.indexOf(MaterialHandler.ENGINE_SHADER_PREFIX) === 0) {
				// The shader is set to load from the engine's shader library.
				// The shader reference is in the form <ENGINE_SHADER_PREFIX>shaderName,
				// slicing the reference to get the shaderName.
				var shaderName = ref.slice(MaterialHandler.ENGINE_SHADER_PREFIX.length);
				var shader = Material.createShader(ShaderLib[shaderName]);
				return PromiseUtil.createDummyPromise(shader);
			} else {
				return this.getConfig(ref).then(function(config) {
					return that.updateObject(ref, config, that.options);
				});
			}
		} else {
			var defaultShader = Material.createShader(ShaderLib.texturedLit, 'DefaultShader');
			return PromiseUtil.createDummyPromise(defaultShader);
		}
	};

	return MaterialHandler;

});
